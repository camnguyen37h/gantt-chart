/**
 * Timeline Legend Component
 * Shows status legend with toggle functionality
 */

import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getStatusColor } from '../../../constants/statusColors';
import './TimelineLegend.css';

const TimelineLegend = memo(({ 
  statuses = [],
  statusColorMap = {},
  visibleStatuses = {},
  onStatusToggle
}) => {
  // Build status colors from map
  const statusColors = useMemo(() => {
    if (!statuses || statuses.length === 0) {
      return {};
    }
    
    const colors = {};
    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      colors[status] = getStatusColor(status, statusColorMap);
    }
    return colors;
  }, [statuses, statusColorMap]);

  // Get status list (already sorted A-Z from parent)
  const statusList = useMemo(() => {
    if (!statuses || statuses.length === 0) {
      return [];
    }
    return statuses;
  }, [statuses]);

  const handleStatusClick = (status) => {
    if (onStatusToggle) {
      onStatusToggle(status);
    }
  };

  return (
    <div className="timeline-legend">
      {statusList.map(status => {
        const isVisible = visibleStatuses[status] !== false;
        const color = statusColors[status];
        
        return (
          <div
            key={status}
            className={`timeline-legend-item ${!isVisible ? 'hidden' : ''}`}
            onClick={() => handleStatusClick(status)}
          >
            <span 
              className="timeline-legend-color"
              style={{ backgroundColor: color }}
            />
            <span className="timeline-legend-label">{status}</span>
          </div>
        );
      })}
    </div>
  );
});

TimelineLegend.propTypes = {
  statuses: PropTypes.arrayOf(PropTypes.string),
  statusColorMap: PropTypes.object,
  visibleStatuses: PropTypes.object,
  onStatusToggle: PropTypes.func
};

export default TimelineLegend;
