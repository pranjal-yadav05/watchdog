import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ForceGraph2D from "react-force-graph-2d";
import {
  isSuspiciousByScore,
  SUSPICIOUS_SCORE_THRESHOLD,
} from "../constants/fraudThreshold";
import "./GraphView.css";

const ROOT = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

function GraphView() {
  const { accountNumber, level: initialLevel } = useParams();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(initialLevel || "2");
  const [linkDistance, setLinkDistance] = useState(150);
  const [selectedNode, setSelectedNode] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [maxTransactionAmount, setMaxTransactionAmount] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const graphRef = useRef();
  const containerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(0, Math.floor(width)),
          height: Math.max(0, Math.floor(height)),
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        const graphUrl = `${ROOT}/api/graph/${accountNumber}/${level}`;
        const accountsUrl = `${ROOT}/api/accounts`;

        const [graphRes, accRes] = await Promise.all([
          axios.get(graphUrl),
          axios.get(accountsUrl).catch(() => ({ data: [] })),
        ]);

        const scoreByAccount = new Map();
        const list = Array.isArray(accRes.data) ? accRes.data : [];
        list.forEach((a) => {
          if (a.accountNumber != null) {
            scoreByAccount.set(a.accountNumber, a.suspiciousScore);
          }
        });

        const nodes = graphRes.data.nodes.map((node) => {
          const accNum = node.accountNumber;
          const score = scoreByAccount.has(accNum)
            ? scoreByAccount.get(accNum)
            : undefined;
          const fromGraph = Boolean(node.suspicious);
          const fromScore =
            score !== undefined ? isSuspiciousByScore(score) : false;
          return {
            id: accNum,
            accountNumber: accNum,
            type: node.type || "Unknown",
            balance: node.balance || 0,
            suspiciousScore: score,
            isSuspicious: fromScore || fromGraph,
          };
        });

        const nodeMap = {};
        nodes.forEach((node) => {
          nodeMap[node.id] = node;
        });

        const links = [];
        let maxAmount = 0;
        graphRes.data.links.forEach((link) => {
          if (nodeMap[link.source] && nodeMap[link.target]) {
            const linkAmount = Math.abs(link.amount || 0);
            maxAmount = Math.max(maxAmount, linkAmount);

            links.push({
              source: nodeMap[link.source],
              target: nodeMap[link.target],
              amount: link.amount || 0,
              type: link.type || "Unknown",
              date: link.date || new Date().toISOString(),
            });
          }
        });

        setMaxTransactionAmount(maxAmount);

        const linkGroups = {};
        links.forEach((link) => {
          const key = `${link.source.id}-${link.target.id}`;
          if (!linkGroups[key]) {
            linkGroups[key] = [];
          }
          linkGroups[key].push(link);
        });

        const curvatureFactor = 2.0;
        Object.keys(linkGroups).forEach((key) => {
          const group = linkGroups[key];
          if (group.length > 1) {
            group.forEach((link, index) => {
              link.curvature =
                ((index - (group.length - 1) / 2) / group.length) *
                curvatureFactor;
            });
          } else {
            group[0].curvature = 0;
          }
        });

        setGraphData({ nodes, links });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch graph data. Please try again later.");
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [accountNumber, level]);

  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || graphData.nodes.length === 0) return;
    const linkForce = fg.d3Force("link");
    if (linkForce && linkForce.distance) {
      linkForce.distance(linkDistance);
      fg.d3ReheatSimulation();
    }
  }, [linkDistance, graphData.nodes.length]);

  const suspiciousInView = useMemo(
    () => graphData.nodes.filter((n) => n.isSuspicious).length,
    [graphData.nodes]
  );

  const graphWidth = dimensions.width || 800;
  const graphHeight = dimensions.height || 480;

  const handleBackClick = () => {
    navigate("/trackaccount");
  };

  const getNodeColor = (node) => {
    if (node.id === accountNumber) return "#E4D00A";
    if (node.isSuspicious) return "#f44336";
    return "#2196f3";
  };

  const getLinkWidth = (link) => {
    const maxWidth = 10;
    const minWidth = 1;
    const normalizedWidth =
      Math.abs(link.amount) / (maxTransactionAmount || 1);
    return minWidth + normalizedWidth * (maxWidth - minWidth);
  };

  const handleGraphReady = () => {
    if (graphRef.current) {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 50);
      }, 500);
    }
  };

  const handleNodeClick = (node, event) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
    setSelectedNode(node);
  };

  const closeTooltip = () => {
    setSelectedNode(null);
  };

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    navigate(`/graph/${accountNumber}/${newLevel}`);
  };

  const formatScore = (node) => {
    if (node.suspiciousScore == null || Number.isNaN(node.suspiciousScore)) {
      return "N/A";
    }
    return Number(node.suspiciousScore).toFixed(3);
  };

  if (loading) return <div className="loading">Loading network graph...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="graph-container">
      <div className="graph-header">
        <button type="button" className="back-btn" onClick={handleBackClick}>
          &larr; Back to Accounts
        </button>
        <h1>Account Network for {accountNumber}</h1>
        <div className="graph-info">
          <div className="level-selector">
            <label htmlFor="level">Network Depth Level:</label>
            <select
              id="level"
              value={level}
              onChange={(e) => handleLevelChange(e.target.value)}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <p>Total Accounts: {graphData.nodes.length}</p>
          <p>Total Transactions: {graphData.links.length}</p>
          <p className="graph-suspicious-count">
            Suspicious nodes (score &gt; {SUSPICIOUS_SCORE_THRESHOLD}):{" "}
            {suspiciousInView}
          </p>
        </div>
      </div>

      <div className="control-panel">
        <label>
          Link Distance:
          <input
            type="range"
            min="50"
            max="300"
            value={linkDistance}
            onChange={(e) => setLinkDistance(Number(e.target.value))}
          />
          {linkDistance}px
        </label>
      </div>

      <div className="graph-legend">
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#E4D00A" }}
          ></span>
          <span>Selected Account</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#f44336" }}
          ></span>
          <span>Suspicious Account</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#2196f3" }}
          ></span>
          <span>Normal Account</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-thickness"
            style={{
              width: "10px",
              height: "2px",
              backgroundColor: "#999",
              marginRight: "5px",
            }}
          ></span>
          <span>Link Thickness: Transaction Amount</span>
        </div>
        <p className="graph-legend-note">
          Suspicious coloring matches MongoDB fraud scores (threshold{" "}
          {SUSPICIOUS_SCORE_THRESHOLD}), not only the graph database.
        </p>
      </div>

      <div className="graph-view" ref={containerRef}>
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={graphWidth}
            height={graphHeight}
            nodeColor={getNodeColor}
            nodeLabel={(node) =>
              `Account: ${node.accountNumber}\nType: ${node.type}\nBalance: $${node.balance.toFixed(2)}\nScore: ${formatScore(node)}`
            }
            linkLabel={(link) =>
              `Amount: $${link.amount.toFixed(2)}\nType: ${link.type}\nDate: ${new Date(
                link.date
              ).toLocaleDateString()}`
            }
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            linkWidth={getLinkWidth}
            nodeRelSize={6}
            linkCurvature={(link) => link.curvature || 0}
            onEngineStop={handleGraphReady}
            onNodeClick={handleNodeClick}
            linkColor={() => "#999"}
            cooldownTime={3000}
          />
        ) : (
          <div className="no-data">
            No network data found for this account at level {level}
          </div>
        )}

        {selectedNode && (
          <div
            className="node-tooltip"
            style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
          >
            <button type="button" className="close-tooltip" onClick={closeTooltip}>
              x
            </button>
            <p>
              <strong>Account:</strong> {selectedNode.accountNumber}
            </p>
            <p>
              <strong>Type:</strong> {selectedNode.type}
            </p>
            <p>
              <strong>Balance:</strong> ${selectedNode.balance.toFixed(2)}
            </p>
            <p>
              <strong>Fraud score:</strong> {formatScore(selectedNode)}
            </p>
            <p>
              <strong>Suspicious:</strong>{" "}
              {selectedNode.isSuspicious ? "Yes" : "No"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GraphView;
