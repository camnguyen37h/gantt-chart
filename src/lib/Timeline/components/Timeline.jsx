/**
 * Timeline Component - Main Component
 * Complete, reusable timeline component with all features
 */

import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTimeline } from '../hooks/useTimeline';
import TimelineToolbar from './TimelineToolbar';
import TimelineGrid from './TimelineGrid';
import TimelineCanvas from './TimelineCanvas';
import TimelineLegend from './TimelineLegend';
import { VIEW_MODES, RENDER_MODES } from '../constants';
import './Timeline.css';

const Timeline = memo(({
  items,
  config,
  showLegend,
  toolbarProps,
  legendProps,
  onItemClick,
  onItemDoubleClick,
  onItemHover,
  renderItem,
  className,
  loading
}) => {
  const timeline = useTimeline(items, config);

  const {
    searchQuery,
    timelineData,
    layoutItems,
    gridHeight,
    currentDatePosition,
    containerRef,
    setSearchQuery,
    getItemStyle,
    scrollToToday,
    handleZoom,
    zoomLevel,
    config: finalConfig
  } = timeline;

  // Handle mouse wheel zoom (Direct scroll with smooth debouncing)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event) => {
      event.preventDefault();
      
      // Smoother zoom based on scroll delta
      const delta = -event.deltaY;
      handleZoom(delta);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [containerRef, handleZoom]);

  return (
    <div className={`timeline ${className || ''}`}>
      {/* Toolbar - Only Today button */}
      <TimelineToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onTodayClick={scrollToToday}
        showNewButton={false}
        showSearch={false}
        showFilters={false}
        showTodayButton={true}
        {...toolbarProps}
      />

      {/* Scrollable Timeline Container */}
      <div className="timeline-scroll-container" ref={containerRef}>
        <div className="timeline-content">
          {finalConfig.renderMode === 'canvas' ? (
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
          ) : (
            <TimelineGrid
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
              renderItem={renderItem}
              loading={loading}
            />
          )}
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
    viewMode: PropTypes.oneOf(Object.values(VIEW_MODES)),
    rowHeight: PropTypes.number,
    itemHeight: PropTypes.number,
    itemPadding: PropTypes.number,
    pixelsPerDay: PropTypes.number,
    enableAutoScroll: PropTypes.bool,
    enableCurrentDate: PropTypes.bool,
    enableGrid: PropTypes.bool
  }),
  showLegend: PropTypes.bool,
  toolbarProps: PropTypes.object,
  legendProps: PropTypes.object,
  onItemClick: PropTypes.func,
  onItemDoubleClick: PropTypes.func,
  onItemHover: PropTypes.func,
  renderItem: PropTypes.func,
  className: PropTypes.string
};

Timeline.defaultProps = {
  items: [],
  showLegend: false,
  toolbarProps: {},
  legendProps: {}
};

export default Timeline;
