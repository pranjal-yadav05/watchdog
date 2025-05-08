import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Fraud Guard
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/overview" className="nav-links">
              Overview
            </Link>
            <Link to="/trackaccount" className="nav-links">
              TrackAccounts
            </Link>
            <Link to="/transactions" className="nav-links">
              Transactions
            </Link>
            <Link to="/accounts" className="nav-links">
              Suspicious Account
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
