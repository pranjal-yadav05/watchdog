import React, { useState, useEffect, useCallback } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import WorkflowGuide from "../components/WorkflowGuide";
import { useWorkflowProgress } from "../hooks/useWorkflowProgress";
import {
  isSuspiciousAccount,
  SUSPICIOUS_SCORE_THRESHOLD,
} from "../constants/fraudThreshold";
import "./FraudOverview.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function FraudOverview() {
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalSuspiciousAccounts: 0,
    totalTransactions: 0,
    totalSuspiciousTransactions: 0,
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState(new Date());

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const { markViewedOverview, refreshInference } = useWorkflowProgress();

  useEffect(() => {
    markViewedOverview();
  }, [markViewedOverview]);

  const fetchData = useCallback(async () => {
    if (!API_BASE_URL) {
      setError("API base URL is not configured.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [dashRes, accRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/dashboard`),
        fetch(`${API_BASE_URL}/api/accounts`),
      ]);
      if (!dashRes.ok) throw new Error("Dashboard request failed");
      const data = await dashRes.json();
      setStats(data);
      if (accRes.ok) {
        const accData = await accRes.json();
        setAccounts(Array.isArray(accData) ? accData : []);
      } else {
        setAccounts([]);
      }
      setTimestamp(new Date());
      setError(null);
      await refreshInference();
    } catch (err) {
      setError("Failed to fetch fraud statistics. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, refreshInference]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAccounts =
    accounts.length > 0 ? accounts.length : stats.totalAccounts;
  const suspiciousAccountsDerived =
    accounts.length > 0
      ? accounts.filter(isSuspiciousAccount).length
      : stats.totalSuspiciousAccounts;

  const suspiciousAccountsPercentage =
    totalAccounts > 0
      ? (suspiciousAccountsDerived / totalAccounts) * 100
      : 0;
  const suspiciousTransactionsPercentage =
    (stats.totalSuspiciousTransactions / stats.totalTransactions) * 100 || 0;

  const accountsCardClass =
    suspiciousAccountsPercentage > 10 ? "card danger" : "card safe";
  const transactionsCardClass =
    suspiciousTransactionsPercentage > 5 ? "card danger" : "card safe";

  const accountsChartData = {
    labels: ["Normal Accounts", "Suspicious Accounts"],
    datasets: [
      {
        data: [
          Math.max(0, totalAccounts - suspiciousAccountsDerived),
          suspiciousAccountsDerived,
        ],
        backgroundColor: ["#10b981", "#ef4444"],
        borderColor: ["#059669", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="loading">
        <i className="fas fa-circle-notch fa-spin"></i>
        <p>Loading fraud detection data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="fraud-overview-container">
      <div className="dashboard-header">
        <div className="header-content header-content--row">
          <div className="header-title">
            <h1>Fraud Overview</h1>
            <p className="header-subtitle">
              Monitor and analyze fraud detection metrics, suspicious
              activities, and system performance
            </p>
          </div>
          <button
            type="button"
            className="overview-refresh-btn"
            onClick={() => fetchData()}
          >
            <i className="fas fa-sync-alt"></i>
            Refresh data
          </button>
        </div>
      </div>

      <WorkflowGuide variant="compact" />

      <div className="overview-content">
        <div className="stats-grid">
          <div className="card">
            <div className="card-inner">
              <h3>Total Accounts</h3>
              <div className="stat-value">
                {totalAccounts.toLocaleString()}
              </div>
              <div className="stat-icon accounts-icon">
                <i className="fas fa-users"></i>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-inner">
              <h3>Suspicious Accounts</h3>
              <div className="stat-value">
                {suspiciousAccountsDerived.toLocaleString()}
              </div>
              <p className="metric-hint">
                Score &gt; {SUSPICIOUS_SCORE_THRESHOLD} (same as account list)
              </p>
              <div className="stat-icon suspicious-accounts-icon">
                <i className="fas fa-user-shield"></i>
              </div>
            </div>
          </div>

          <div className={accountsCardClass}>
            <div className="card-inner">
              <h3>% of Suspicious Accounts</h3>
              <div className="stat-value">
                {suspiciousAccountsPercentage.toFixed(2)}%
              </div>
              <div className="stat-icon percentage-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-inner">
              <h3>Total Transactions</h3>
              <div className="stat-value">
                {stats.totalTransactions.toLocaleString()}
              </div>
              <div className="stat-icon transactions-icon">
                <i className="fas fa-exchange-alt"></i>
              </div>
            </div>
          </div>

          <div className={transactionsCardClass}>
            <div className="card-inner">
              <h3>% of Suspicious Transactions</h3>
              <div className="stat-value">
                {suspiciousTransactionsPercentage.toFixed(2)}%
              </div>
              <p className="metric-hint">
                From stored transaction flags (may differ from ML scores)
              </p>
              <div className="stat-icon percentage-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-card">
            <h3>Account Distribution</h3>
            <p className="chart-caption">
              Based on fraud scores from the API (threshold {SUSPICIOUS_SCORE_THRESHOLD})
            </p>
            <div className="chart-wrapper">
              <Pie data={accountsChartData} options={chartOptions} />
            </div>
          </div>
          <div className="chart-card">
            <h3>Transaction Distribution</h3>
            <p className="chart-caption">
              Uses backend flags on transactions, not the ML test output
            </p>
            <div className="chart-wrapper">
              <Pie
                data={{
                  labels: ["Normal Transactions", "Suspicious Transactions"],
                  datasets: [
                    {
                      data: [
                        stats.totalTransactions -
                          stats.totalSuspiciousTransactions,
                        stats.totalSuspiciousTransactions,
                      ],
                      backgroundColor: ["#10b981", "#ef4444"],
                      borderColor: ["#059669", "#dc2626"],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        <footer className="dashboard-footer">
          <p>Data Updated: {timestamp.toLocaleString()}</p>
        </footer>
      </div>
    </div>
  );
}

export default FraudOverview;
