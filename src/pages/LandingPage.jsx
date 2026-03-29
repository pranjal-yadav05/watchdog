import React from "react";
import { Link } from "react-router-dom";
import WorkflowGuide from "../components/WorkflowGuide";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-logo">
          <i className="fas fa-shield-alt"></i>
        </div>
        
        <h1 className="landing-title">Watchdog Fraud Detection</h1>
        
        <p className="landing-subtitle">
          Enterprise-grade fraud detection powered by distributed systems, graph intelligence, 
          and machine learning. Detect sophisticated fraud networks in real-time.
        </p>
        
        <div className="landing-actions">
          <Link to="/overview" className="landing-button primary">
            Get Started
            <i className="fas fa-arrow-right"></i>
          </Link>
          <Link to="/trackaccount" className="landing-button secondary">
            View Demo
            <i className="fas fa-play"></i>
          </Link>
        </div>
        
        <WorkflowGuide variant="full" />
        
        <div className="landing-features">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="feature-title">Real-Time Detection</div>
            <div className="feature-description">
              Sub-millisecond fraud detection across millions of transactions
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-project-diagram"></i>
            </div>
            <div className="feature-title">Graph Intelligence</div>
            <div className="feature-description">
              Uncover fraud networks through advanced relationship analysis
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-brain"></i>
            </div>
            <div className="feature-title">Machine Learning</div>
            <div className="feature-description">
              Adaptive anomaly detection that learns from your data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
