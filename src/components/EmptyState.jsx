import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmptyState.css';

function EmptyState({ 
  icon = 'fa-inbox',
  title = 'No Data Available',
  description = '',
  actions = []
}) {
  const navigate = useNavigate();

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={`fas ${icon}`}></i>
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      
      {actions.length > 0 && (
        <div className="empty-state-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`empty-state-button ${action.variant || 'primary'}`}
              onClick={() => action.path ? navigate(action.path) : action.onClick?.()}
            >
              {action.icon && <i className={`fas ${action.icon}`}></i>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
