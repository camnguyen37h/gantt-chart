/**
 * View Mode Selector Component
 * Allows switching between different time scales
 */

import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { VIEW_MODES } from '../constants';
import './ViewModeSelector.css';

const VIEW_MODE_LABELS = {
  [VIEW_MODES.DAYS]: 'Days',
  [VIEW_MODES.WEEKS]: 'Weeks',
  [VIEW_MODES.MONTHS]: 'Months',
  [VIEW_MODES.QUARTERS]: 'Quarters',
  [VIEW_MODES.YEARS]: 'Years'
};

const ViewModeSelector = memo(({
  viewMode,
  onChange,
  availableModes,
  className
}) => {
  const modes = useMemo(() => 
    availableModes || Object.values(VIEW_MODES), 
    [availableModes]
  );

  return (
    <div className={`timeline-view-selector ${className || ''}`}>
      {modes.map(mode => (
        <button
          key={mode}
          className={`view-mode-btn ${viewMode === mode ? 'active' : ''}`}
          onClick={() => onChange(mode)}
        >
          {VIEW_MODE_LABELS[mode] || mode}
        </button>
      ))}
    </div>
  );
});

ViewModeSelector.propTypes = {
  viewMode: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  availableModes: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string
};

export default ViewModeSelector;
