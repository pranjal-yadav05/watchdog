import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./LandingPage.css";

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(".hero-badge", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.2 });
      gsap.fromTo(".hero-title", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.3 });
      gsap.fromTo(".hero-desc", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.6 });
      gsap.fromTo(".hero-buttons", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.8 });

      // Scroll-triggered sections
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.fromTo(el,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" }
          }
        );
      });

      // Staggered cards
      gsap.utils.toArray(".stagger-parent").forEach((parent) => {
        const children = parent.querySelectorAll(".stagger-child");
        gsap.fromTo(children,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out",
            scrollTrigger: { trigger: parent, start: "top 85%", toggleActions: "play none none reverse" }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="wd-landing" ref={containerRef}>
      {/* Ambient background */}
      <div className="wd-bg-glow wd-glow-1" />
      <div className="wd-bg-glow wd-glow-2" />
      <div className="wd-bg-glow wd-glow-3" />

      {/* ── Hero ── */}
      <section className="wd-hero">
        <div className="wd-container wd-hero-inner">
          <span className="hero-badge">REAL-TIME FRAUD DETECTION</span>
          <h1 className="hero-title">
            Stop fraud at scale.
            <br />
            <span className="hero-title-sub">Before it spreads.</span>
          </h1>
          <p className="hero-desc">
            Enterprise-grade fraud detection built on distributed systems, graph intelligence, and machine learning. Detect sophisticated fraud networks in milliseconds, not days.
          </p>
          <div className="hero-buttons">
            <Link to="/overview" className="wd-btn wd-btn-primary">
              Get Started
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/trackaccount" className="wd-btn wd-btn-ghost">
              View Demo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Problem & Solution ── */}
      <section className="wd-section reveal">
        <div className="wd-container">
          <div className="wd-grid-2">
            <div className="wd-glass-card wd-card-problem">
              <h2><span className="wd-emoji">🚨</span> The Problem</h2>
              <p>
                Legacy fraud detection fails against sophisticated attacks. Fraudsters operate across distributed networks, exploit circular flows, and coordinate through multiple accounts—bypassing every static rule.
              </p>
              <ul className="wd-list-cross">
                <li>Rule-based systems blindly miss complex patterns</li>
                <li>Delayed detection (days, not milliseconds)</li>
                <li>Cannot see cross-service fraud networks</li>
                <li>High false positives paralyze operations</li>
              </ul>
              <div className="wd-callout wd-callout-red">
                The cost of fraud: $10B+ annually in US fintech alone.
              </div>
            </div>

            <div className="wd-glass-card wd-card-solution">
              <h2><span className="wd-emoji">⚡</span> The Answer</h2>
              <p>
                A distributed intelligence system that sees what fraudsters see—the whole network. Combines real-time data processing, graph analysis, and adaptive ML to catch coordinated fraud before it completes.
              </p>
              <div className="wd-equation">
                <span>Real-Time Processing</span>
                <span className="wd-eq-plus">+</span>
                <span>Graph Intelligence</span>
                <span className="wd-eq-plus">+</span>
                <span>Adaptive ML</span>
              </div>
              <p>
                <strong>Sub-millisecond detection</strong> of suspicious networks, anomalous patterns, and coordinated attacks across your entire transaction fabric.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture Flow ── */}
      <section className="wd-section reveal">
        <div className="wd-container">
          <h2 className="wd-section-title">⚙️ System Architecture Flow</h2>
          <div className="wd-flow-panel stagger-parent">
            {[
              { label: "Distributed Microservices", type: "" },
              { label: "Transaction Ingestion Layer", type: "" },
              { label: "Data Normalization Engine", type: "" },
              { label: "Parallel Processing Pipeline", type: "" },
              { label: "Redis (Low-latency store)", type: "highlight" },
              { label: "Neo4j Graph Engine", type: "highlight" },
              { label: "ML Anomaly Detection (Isolation Forest)", type: "highlight" },
              { label: "Insights & Alert System", type: "focus" },
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div className={`wd-flow-step stagger-child ${step.type}`}>{step.label}</div>
                {i < arr.length - 1 && <div className="wd-flow-arrow">↓</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="wd-section reveal">
        <div className="wd-container">
          <h2 className="wd-section-title">How It Works</h2>
          <p className="wd-section-subtitle">Seven layers of distributed intelligence working in perfect harmony.</p>
          <div className="wd-grid-3 stagger-parent">
            {[
              { num: "01", title: "Multi-Source Ingestion", desc: "Simultaneously processes transaction streams from multiple banking networks. Handles millions of events per second with zero loss.", icon: "📥" },
              { num: "02", title: "Unified Schema Engine", desc: "Normalizes fragmented data formats into a consistent transaction model instantly. Schema agnostic—works with any financial data source.", icon: "🔄" },
              { num: "03", title: "Distributed Processing", desc: "Lock-free parallel execution across multiple cores. Optimized for sub-millisecond processing latency while maintaining ACID consistency.", icon: "⚡" },
              { num: "04", title: "Velocity Cache Layer", desc: "Redis-backed ultra-fast lookup for transaction context, account history, and pattern cache. Sub-1ms query response.", icon: "🔴", accent: "red" },
              { num: "05", title: "Graph Intelligence", desc: "Neo4j-powered relationship analysis. Detects fraudster networks through centrality measures, community detection, and temporal analysis.", icon: "🔵", accent: "blue" },
              { num: "06", title: "Anomaly Detection", desc: "Unsupervised ML using Isolation Forest. Catches novel fraud patterns without labeled training data—adapts in real-time.", icon: "🟣", accent: "purple" },
              { num: "07", title: "Risk & Response", desc: "Instant flagging with risk scoring. Integrates with existing workflows via webhooks, APIs, or direct incident feeds.", icon: "🔔" },
            ].map((c) => (
              <div key={c.num} className={`wd-glass-card wd-comp-card stagger-child ${c.accent ? "wd-accent-" + c.accent : ""}`}>
                <div className="wd-comp-num-row">
                  <span className="wd-comp-icon">{c.icon}</span>
                  <span className="wd-comp-num">{c.num}</span>
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Innovations & Performance ── */}
      <section className="wd-section wd-section-alt reveal">
        <div className="wd-container">
          <div className="wd-grid-2">
            <div>
              <h2 className="wd-section-title wd-text-left">Why We Win</h2>
              <div className="wd-innovation-list">
                <div className="wd-innovation-item">
                  <div className="wd-inno-icon wd-icon-blue">⚡</div>
                  <div>
                    <h4>Network Vision</h4>
                    <p>See the complete fraud network, not just individual transactions. Graph intelligence reveals coordinated attacks that traditional systems miss entirely.</p>
                  </div>
                </div>
                <div className="wd-innovation-item">
                  <div className="wd-inno-icon wd-icon-purple">🔄</div>
                  <div>
                    <h4>True Real-Time</h4>
                    <p>Millisecond latency from transaction to detection. Not batch processing at midnight—immediate identification and response during the fraud attempt.</p>
                  </div>
                </div>
                <div className="wd-innovation-item">
                  <div className="wd-inno-icon wd-icon-green">🌐</div>
                  <div>
                    <h4>Zero Configuration ML</h4>
                    <p>Unsupervised learning that adapts to your fraud landscape automatically. No need for historical fraud labels—catches novel attacks on day one.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="wd-perf-col">
              <div className="wd-glass-card wd-perf-card">
                <h3>⚡ Performance Specs</h3>
                <ul className="wd-list-check">
                  <li>Millions of TPS throughput</li>
                  <li>&lt;1ms end-to-end latency</li>
                  <li>99.99% uptime guarantee</li>
                  <li>Linear scaling with load</li>
                </ul>
              </div>
              <div className="wd-glass-card wd-perf-card">
                <h3>🎯 Detects</h3>
                <div className="wd-pill-group">
                  <span className="wd-pill">Circular Flows</span>
                  <span className="wd-pill">Money Mules</span>
                  <span className="wd-pill">Account Clusters</span>
                  <span className="wd-pill">Velocity Abuse</span>
                  <span className="wd-pill">Coordinated Rings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack / Use Cases / Why ── */}
      <section className="wd-section reveal">
        <div className="wd-container">
          <div className="wd-grid-3 stagger-parent">
            {/* Tech Stack */}
            <div className="wd-glass-card wd-info-card stagger-child">
              <h3>🛠️ Tech Stack</h3>
              <table className="wd-stack-table">
                <tbody>
                  <tr><td>Backend</td><td>Node.js / Spring Boot</td></tr>
                  <tr><td>Databases</td><td>MongoDB / MySQL</td></tr>
                  <tr><td>Caching</td><td className="wd-accent-text-red">Redis</td></tr>
                  <tr><td>Graph DB</td><td className="wd-accent-text-blue">Neo4j</td></tr>
                  <tr><td>ML</td><td className="wd-accent-text-purple">Isolation Forest</td></tr>
                  <tr><td>Architecture</td><td>Multithreaded + Synced</td></tr>
                </tbody>
              </table>
            </div>

            {/* Use Cases */}
            <div className="wd-glass-card wd-info-card stagger-child">
              <h3>🚀 Future & Use Cases</h3>
              <div className="wd-info-section">
                <h5 className="wd-label-blue">Target Use Cases</h5>
                <p>Banking fraud detection, Fintech platforms, Blockchain tx monitoring, Compliance systems, and Anti-money laundering (AML).</p>
              </div>
              <div className="wd-info-section">
                <h5 className="wd-label-green">Potential Extensions</h5>
                <p>Real-time streaming via Kafka, Advanced ML integration (GNNs), Blockchain analytics, Risk scoring APIs, Visual dashboards.</p>
              </div>
            </div>

            {/* Why Strong */}
            <div className="wd-glass-card wd-info-card wd-why-card stagger-child">
              <h3>🎯 Why This Stands Out</h3>
              <p className="wd-why-quote">"This is NOT a basic application. It is a highly fault-tolerant engine."</p>
              <div className="wd-why-stack">
                <div className="wd-why-item">Distributed Systems Thinking</div>
                <span className="wd-why-plus">+</span>
                <div className="wd-why-item">Real-time Architecture</div>
                <span className="wd-why-plus">+</span>
                <div className="wd-why-item">Graph & Applied ML</div>
              </div>
              <p className="wd-why-tagline">The architecture startups scale with and fintechs demand.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="wd-section reveal">
        <div className="wd-container">
          <div className="wd-cta-panel">
            <h2>Stop the next fraud ring before it costs millions.</h2>
            <p>See exactly how Watchdog's distributed intelligence catches what others miss. Try the live demo with real fraud data.</p>
            <Link to="/trackaccount" className="wd-btn wd-btn-primary wd-btn-lg">
              Launch Demo →
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <div className="wd-footer-spacer" />
    </div>
  );
}

export default LandingPage;
