/**
 * Timeline Legend Component
 * Shows status legend with toggle functionality
 */

import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import './TimelineLegend.css';

const TimelineLegend = memo(({ 
  items = [],
  visibleStatuses = {},
  onStatusToggle
}) => {
  // Status color mapping - always show all statuses
  const statusColors = useMemo(() => ({
    'Planning': '#69c0ff',
    'Finalized': '#597ef7',
    'Implementing': '#ffa940',
    'Resolved': '#95de64',
    'Released': '#b37feb',
    'No Start': '#bfbfbf',
    'No Plan': '#ff4d4f'  // Milestones
  }), []);

  // Always show all statuses
  const statuses = useMemo(() => Object.keys(statusColors), [statusColors]);

  const handleStatusClick = (status) => {
    onStatusToggle?.(status);
  };

  return (
    <div className="timeline-legend">
      {statuses.map(status => {
        const isVisible = visibleStatuses[status] !== false;
        return (
          <div
            key={status}
            className={`timeline-legend-item ${!isVisible ? 'hidden' : ''}`}
            onClick={() => handleStatusClick(status)}
          >
            <span 
              className="timeline-legend-color"
              style={{ backgroundColor: statusColors[status] || '#5559df' }}
            />
            <span className="timeline-legend-label">{status}</span>
          </div>
        );
      })}
    </div>
  );
});

TimelineLegend.propTypes = {
  items: PropTypes.array,
  visibleStatuses: PropTypes.object,
  onStatusToggle: PropTypes.func
};

export default TimelineLegend;
