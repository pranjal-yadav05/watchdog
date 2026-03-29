import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WorkflowGuide from "../components/WorkflowGuide";
import { useWorkflowProgress } from "../hooks/useWorkflowProgress";
import "./AddAccounts.css";

const FRAUD_SERVICE_URL = process.env.REACT_APP_FRAUD_SERVICE_URL || 'http://localhost:5005';

function AddAccounts() {
  const navigate = useNavigate();
  const { markVisitedAddAccounts } = useWorkflowProgress();

  useEffect(() => {
    markVisitedAddAccounts();
  }, [markVisitedAddAccounts]);

  const [formData, setFormData] = useState({
    num_accounts: 0,
    num_transactions: 0,
    num_fraud_accounts: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(false);

      const { num_accounts, num_transactions, num_fraud_accounts } = formData;

      // Validate minimum values
      if (num_accounts < 1) {
        setError("Number of accounts must be at least 1");
        setLoading(false);
        return;
      }
      if (num_transactions < 1) {
        setError("Number of transactions must be at least 1");
        setLoading(false);
        return;
      }
      if (num_fraud_accounts < 0) {
        setError("Number of fraud accounts cannot be negative");
        setLoading(false);
        return;
      }

      // Validate maximum values
      if (num_accounts > 50) {
        setError("Maximum number of accounts is 50");
        setLoading(false);
        return;
      }
      if (num_transactions > 150) {
        setError("Maximum number of transactions is 150");
        setLoading(false);
        return;
      }
      if (num_fraud_accounts > 30) {
        setError("Maximum number of fraud accounts is 30");
        setLoading(false);
        return;
      }
      if (num_fraud_accounts > num_accounts) {
        setError(
          "Number of fraud accounts cannot be greater than total accounts"
        );
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${FRAUD_SERVICE_URL}/api/bank/create-graph`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate accounts. Please ensure FraudService is running on port 5005.");
        }

        await response.json();
        setSuccess(true);

        // Show success message with next steps
        setTimeout(() => {
          navigate("/trackaccount");
        }, 2000);
      } catch (err) {
        let errorMessage = err.message;

        if (err.message.includes("Failed to fetch")) {
          errorMessage = "Cannot connect to FraudService. Please ensure it's running on port 5005.";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="add-accounts-container">
      <WorkflowGuide variant="compact" />
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Generate Accounts</h1>
            <p className="header-subtitle">
              Generate a set of accounts with transactions and fraud patterns
              for testing
            </p>
            <div className="note-text">
              ⚠ Warning: This will add dummy data to the bank microservice
            </div>
          </div>
        </div>
      </div>

      <div className="form-container">
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            Accounts generated successfully!
          </div>
        )}
        <form onSubmit={handleSubmit} className="add-accounts-form">
          <div className="form-section">
            <h2>Account Generation Parameters</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="num_accounts">
                  Number of Accounts (Max: 50)
                </label>
                <input
                  type="number"
                  id="num_accounts"
                  name="num_accounts"
                  value={formData.num_accounts}
                  onChange={handleChange}
                  required
                  placeholder="Enter number of accounts"
                />
              </div>

              <div className="form-group">
                <label htmlFor="num_transactions">
                  Number of Transactions (Max: 150)
                </label>
                <input
                  type="number"
                  id="num_transactions"
                  name="num_transactions"
                  value={formData.num_transactions}
                  onChange={handleChange}
                  required
                  placeholder="Enter number of transactions"
                />
              </div>

              <div className="form-group">
                <label htmlFor="num_fraud_accounts">
                  Number of Fraud Accounts (Max: 30)
                </label>
                <input
                  type="number"
                  id="num_fraud_accounts"
                  name="num_fraud_accounts"
                  value={formData.num_fraud_accounts}
                  onChange={handleChange}
                  required
                  placeholder="Enter number of fraud accounts"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Generating..." : "Generate Accounts"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAccounts;
