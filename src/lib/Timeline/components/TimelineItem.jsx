/**
 * Timeline Item Components
 * Renders different types of timeline items (range bars and milestones)
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { isMilestone } from '../utils/itemUtils';
import './TimelineItem.css';

/**
 * Timeline Range Item (bar with duration)
 */
export const TimelineRangeItem = memo(({ item, style, onClick, onDoubleClick, onHover }) => {
  return (
    <div
      className="timeline-item timeline-range-item"
      style={style}
      onClick={() => onClick?.(item)}
      onDoubleClick={() => onDoubleClick?.(item)}
      onMouseEnter={() => onHover?.(item)}
      title={item.tooltip}
    >
      <div className="timeline-item-content">
        <span className="timeline-item-name">{item.name}</span>
        {item.progress !== undefined && (
          <span className="timeline-item-progress">{item.progress}%</span>
        )}
      </div>
      {item.progress !== undefined && (
        <div 
          className="timeline-item-progress-bar"
          style={{ width: `${item.progress}%` }}
        />
      )}
    </div>
  );
});

/**
 * Timeline Milestone Item (circular marker)
 */
export const TimelineMilestoneItem = memo(({ item, style, onClick, onDoubleClick, onHover }) => {
  return (
    <div
      className="timeline-item timeline-milestone-item"
      style={{
        ...style,
        width: '20px', // Fixed width for milestones
        transform: 'translateX(-10px)' // Center on date
      }}
      onClick={() => onClick?.(item)}
      onDoubleClick={() => onDoubleClick?.(item)}
      onMouseEnter={() => onHover?.(item)}
      title={item.tooltip}
    >
      <div className="milestone-marker" style={{ backgroundColor: item.color }}>
        <div className="milestone-inner" />
      </div>
      <div className="milestone-label">{item.name}</div>
    </div>
  );
});

/**
 * Smart Timeline Item - automatically renders correct type
 */
export const TimelineItem = memo((props) => {
  const { item } = props;
  
  if (isMilestone(item)) {
    return <TimelineMilestoneItem {...props} />;
  }
  
  return <TimelineRangeItem {...props} />;
});

TimelineRangeItem.propTypes = {
  item: PropTypes.object.isRequired,
  style: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onHover: PropTypes.func
};

TimelineMilestoneItem.propTypes = {
  item: PropTypes.object.isRequired,
  style: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onHover: PropTypes.func
};

TimelineItem.propTypes = {
  item: PropTypes.object.isRequired,
  style: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onHover: PropTypes.func
};

export default TimelineItem;
