/**
 * Timeline Grid Component
 * Renders the timeline grid with periods, items, and current date line
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DATE_FORMATS } from '../constants';
import TimelineItem from './TimelineItem';
import './TimelineGrid.css';

const TimelineGrid = ({
  timelineData,
  layoutItems,
  gridHeight,
  currentDatePosition,
  getItemStyle,
  rowHeight,
  enableGrid,
  enableCurrentDate,
  onItemClick,
  onItemDoubleClick,
  onItemHover,
  renderItem
}) => {
  if (!timelineData) {
    return (
      <div className="timeline-grid-empty">
        <p>No data to display</p>
      </div>
    );
  }

  const { periods } = timelineData;

  // Render using custom renderer or default TimelineItem
  const renderTimelineItem = (item, style, index) => {
    if (renderItem) {
      return renderItem(item, style);
    }

    return (
      <TimelineItem
        key={item.id || index}
        item={item}
        style={style}
        onClick={onItemClick}
        onDoubleClick={onItemDoubleClick}
        onHover={onItemHover}
      />
    );
  };

  return (
    <div className="timeline-grid-container">
      {/* Timeline Grid */}
      <div className="timeline-grid" style={{ minHeight: `${gridHeight}px`, width: `${timelineData?.totalWidth || 0}px` }}>
        {/* Vertical Grid Lines */}
        {enableGrid && timelineData && periods.map((period, index) => {
          // Calculate position in pixels from timeline start
          const { start } = timelineData;
          const periodStart = period.start;
          const daysFromStart = periodStart.diff(start, 'days', true);
          const left = daysFromStart * (timelineData.totalWidth / timelineData.totalDays);
          return (
            <div
              key={`vline-${index}`}
              className="timeline-grid-line"
              style={{ left: `${left}px` }}
            />
          );
        })}

        {/* Horizontal Grid Lines */}
        {enableGrid && layoutItems.length > 0 && 
          Array.from({ 
            length: Math.max(...layoutItems.map(i => i.row || 0)) + 1 
          }).map((_, index) => (
            <div
              key={`hline-${index}`}
              className="timeline-horizontal-line"
              style={{ top: `${index * rowHeight}px` }}
            />
          ))
        }

        {/* Current Date Line */}
        {enableCurrentDate && currentDatePosition !== null && (
          <div
            className="timeline-current-date"
            style={{ left: `${currentDatePosition}px` }}
          >
            <div className="current-date-marker" />
            <div className="current-date-label">
              {moment().format(DATE_FORMATS.dayMonth)}
            </div>
          </div>
        )}

        {/* Timeline Items */}
        {layoutItems.map((item, index) => {
          const style = getItemStyle(item);
          return renderTimelineItem(item, style, index);
        })}
      </div>

      {/* Timeline Header - Below Grid */}
      <div className="timeline-header" style={{ width: `${timelineData?.totalWidth || 0}px` }}>
        {periods.map((period, index) => (
          <div
            key={`period-${index}`}
            className="timeline-period"
            style={{ width: `${period.width}px` }}
          >
            <div className="period-label">{period.label}</div>
            {period.sublabel && (
              <div className="period-sublabel">{period.sublabel}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

TimelineGrid.propTypes = {
  timelineData: PropTypes.object,
  layoutItems: PropTypes.array.isRequired,
  gridHeight: PropTypes.number.isRequired,
  currentDatePosition: PropTypes.number,
  getItemStyle: PropTypes.func.isRequired,
  rowHeight: PropTypes.number.isRequired,
  enableGrid: PropTypes.bool,
  enableCurrentDate: PropTypes.bool,
  onItemClick: PropTypes.func,
  onItemDoubleClick: PropTypes.func,
  onItemHover: PropTypes.func,
  renderItem: PropTypes.func
};

TimelineGrid.defaultProps = {
  enableGrid: true,
  enableCurrentDate: true
};

// Memoize for performance
export default memo(TimelineGrid);

