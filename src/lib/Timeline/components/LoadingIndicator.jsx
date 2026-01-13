/**
 * Loading Indicator Component
 * Shows progress during heavy layout calculations
 * Clean code for SonarQube compliance
 */

import React from 'react';
import '../styles/LoadingIndicator.css';

/**
 * LoadingIndicator component
 * @param {boolean} isVisible - Whether to show the indicator
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Optional message to display
 * @returns {JSX.Element|null} Loading indicator or null
 */
const LoadingIndicator = ({ isVisible, progress, message }) => {
  if (!isVisible) {
    return null;
  }

  const progressPercent = Math.min(100, Math.max(0, progress || 0));
  const displayMessage = message || 'Calculating timeline layout...';

  return (
    <div className="timeline-loading-overlay">
      <div className="timeline-loading-content">
        <div className="timeline-loading-spinner"></div>
        <p className="timeline-loading-message">{displayMessage}</p>
        <div className="timeline-progress-bar">
          <div 
            className="timeline-progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="timeline-progress-text">{progressPercent.toFixed(0)}%</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
