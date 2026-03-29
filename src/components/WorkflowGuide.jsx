import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkflowProgress } from "../hooks/useWorkflowProgress";
import "./WorkflowGuide.css";

function WorkflowGuide({ variant = "full" }) {
  const [isExpanded, setIsExpanded] = useState(variant !== "inline");
  const {
    steps,
    activeStep,
    completedSteps,
    nextAction,
    loading,
  } = useWorkflowProgress();

  const guideSteps = steps.map((s, index) => ({
    ...s,
    completed: completedSteps[index],
    active: activeStep === s.number,
  }));

  if (variant === "inline") {
    return (
      <div className="workflow-inline">
        <div className="workflow-inline-inner">
          <i className="fas fa-route"></i>
          <span className="workflow-inline-label">Next step</span>
          <span className="workflow-inline-title">{nextAction.title}</span>
          <Link to={nextAction.path} className="workflow-inline-link">
            Continue
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <div className="workflow-guide collapsed">
        <button
          type="button"
          className="workflow-toggle"
          onClick={() => setIsExpanded(true)}
        >
          <i className="fas fa-route"></i>
          {activeStep == null
            ? "Workflow guide — all steps complete"
            : `Next: ${nextAction.title}`}
          <span className="workflow-toggle-hint">Open guide</span>
        </button>
      </div>
    );
  }

  const rootClass =
    variant === "compact"
      ? "workflow-guide workflow-guide--compact"
      : "workflow-guide";

  return (
    <div className={rootClass}>
      <div className="workflow-header">
        <div className="workflow-title">
          <i className="fas fa-route"></i>
          <h3>Workflow Guide</h3>
          {loading && (
            <span className="workflow-loading" aria-hidden>
              <i className="fas fa-circle-notch fa-spin"></i>
            </span>
          )}
        </div>
        <button
          type="button"
          className="workflow-close"
          onClick={() => setIsExpanded(false)}
          aria-label="Collapse guide"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="workflow-steps">
        {guideSteps.map((step, index) => (
          <div
            key={step.number}
            className={`workflow-step ${step.active ? "active" : ""} ${
              step.completed ? "completed" : ""
            }`}
          >
            <div className="step-indicator">
              <div className="step-number">
                {step.completed ? (
                  <i className="fas fa-check"></i>
                ) : (
                  step.number
                )}
              </div>
              {index < guideSteps.length - 1 && <div className="step-line"></div>}
            </div>

            <div className="step-content">
              <div className="step-header">
                <i className={`fas ${step.icon}`}></i>
                <h4>{step.title}</h4>
              </div>
              <p>{step.description}</p>
              {step.active && (
                <Link to={step.path} className="step-action">
                  Go to {step.title}
                  <i className="fas fa-arrow-right"></i>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="workflow-footer">
        <i className="fas fa-info-circle"></i>
        <p>
          {activeStep == null
            ? "You have completed the setup. Use the menu to revisit any screen."
            : "Follow these steps in order for the best experience."}
        </p>
      </div>
    </div>
  );
}

export default WorkflowGuide;
