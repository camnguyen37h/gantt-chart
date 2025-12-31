/**
 * Timeline Grid Component
 * Renders the timeline grid with periods, items, and current date line
 */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DATE_FORMATS } from '../constants';
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

  // Default item renderer
  const defaultRenderItem = (item, style) => (
    <div
      className="timeline-item"
      style={{
        ...style,
        backgroundColor: item.color || '#5559df'
      }}
      onClick={() => onItemClick?.(item)}
      onDoubleClick={() => onItemDoubleClick?.(item)}
      onMouseEnter={() => onItemHover?.(item)}
      title={`${item.name}\n${moment(item.startDate).format(DATE_FORMATS.short)} - ${moment(item.endDate).format(DATE_FORMATS.short)}`}
    >
      <div className="timeline-item-content">
        <span className="timeline-item-name">{item.name}</span>
      </div>
    </div>
  );

  const itemRenderer = renderItem || defaultRenderItem;

  return (
    <div className="timeline-grid-container">
      {/* Timeline Header */}
      <div className="timeline-header">
        {periods.map((period, index) => (
          <div
            key={`period-${index}`}
            className="timeline-period"
            style={{ width: `${period.width}%` }}
          >
            <div className="period-label">{period.label}</div>
            {period.sublabel && (
              <div className="period-sublabel">{period.sublabel}</div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline Grid */}
      <div className="timeline-grid" style={{ minHeight: `${gridHeight}px` }}>
        {/* Vertical Grid Lines */}
        {enableGrid && periods.map((period, index) => {
          const left = periods.slice(0, index).reduce((sum, p) => sum + p.width, 0);
          return (
            <div
              key={`vline-${index}`}
              className="timeline-grid-line"
              style={{ left: `${left}%` }}
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
            style={{ left: `${currentDatePosition}%` }}
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
          return (
            <React.Fragment key={item.id || index}>
              {itemRenderer(item, style)}
            </React.Fragment>
          );
        })}
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

export default TimelineGrid;
