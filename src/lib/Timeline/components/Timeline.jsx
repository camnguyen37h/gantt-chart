/**
 * Timeline Component - Main Component
 * Complete, reusable timeline component with all features
 */

import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'antd';
import { useTimeline } from '../hooks/useTimeline';
import TimelineCanvas from './TimelineCanvas';
import TimelineLegend from './TimelineLegend';
import './Timeline.css';

const Timeline = memo(({
  items,
  config,
  showLegend,
  legendProps,
  onItemClick,
  onItemDoubleClick,
  onItemHover,
  className,
  loading
}) => {
  const timeline = useTimeline(items, config);

  const {
    timelineData,
    layoutItems,
    gridHeight,
    currentDatePosition,
    containerRef,
    getItemStyle,
    scrollToToday,
    handleZoom,
    config: finalConfig
  } = timeline;

  // Handle mouse wheel zoom with optimized throttling
  // PERFORMANCE: Prevent lag during continuous scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let rafId = null;
    let lastWheelTime = 0;
    const THROTTLE_MS = 16; // ~60fps

    const handleWheel = (event) => {
      event.preventDefault();
      
      const now = Date.now();
      
      // Throttle: Skip if called too frequently
      if (now - lastWheelTime < THROTTLE_MS) {
        return;
      }
      
      lastWheelTime = now;
      
      // Cancel previous RAF if still pending
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      
      // Use RAF for smooth rendering
      rafId = requestAnimationFrame(() => {
        const delta = -event.deltaY;
        handleZoom(delta);
        rafId = null;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [containerRef, handleZoom]);

  return (
    <div className={`timeline ${className || ''}`}>
      {/* Today Button */}
      <div style={{ 
        padding: '8px 16px', 
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <Button onClick={scrollToToday} type="default" size="small">
          <Icon type="calendar" /> Today
        </Button>
      </div>

      {/* Scrollable Timeline Container */}
      <div className="timeline-scroll-container" ref={containerRef}>
        <div className="timeline-content">
          <TimelineCanvas
            timelineData={timelineData}
            layoutItems={layoutItems}
            gridHeight={gridHeight}
            currentDatePosition={currentDatePosition}
            getItemStyle={getItemStyle}
            rowHeight={finalConfig.rowHeight}
            enableGrid={finalConfig.enableGrid}
            enableCurrentDate={finalConfig.enableCurrentDate}
            onItemClick={onItemClick}
            onItemDoubleClick={onItemDoubleClick}
            onItemHover={onItemHover}
            loading={loading}
            config={finalConfig}
          />
        </div>
      </div>

      {/* Timeline Legend */}
      {showLegend && (
        <TimelineLegend
          items={items}
          {...legendProps}
        />
      )}
    </div>
  );
});

Timeline.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    status: PropTypes.string,
    progress: PropTypes.number
  })).isRequired,
  config: PropTypes.shape({
    rowHeight: PropTypes.number,
    itemHeight: PropTypes.number,
    itemPadding: PropTypes.number,
    pixelsPerDay: PropTypes.number,
    enableAutoScroll: PropTypes.bool,
    enableCurrentDate: PropTypes.bool,
    enableGrid: PropTypes.bool
  }),
  showLegend: PropTypes.bool,
  legendProps: PropTypes.object,
  onItemClick: PropTypes.func,
  onItemDoubleClick: PropTypes.func,
  onItemHover: PropTypes.func,
  className: PropTypes.string
};

Timeline.defaultProps = {
  items: [],
  showLegend: false,
  legendProps: {}
};

export default Timeline;
