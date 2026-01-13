/**
 * Timeline Component - Main Component
 * Complete, reusable timeline component with all features
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useTimeline } from '../hooks/useTimeline';
import TimelineToolbar from './TimelineToolbar';
import TimelineGrid from './TimelineGrid';
import TimelineLegend from './TimelineLegend';
import LoadingIndicator from './LoadingIndicator';
import { VIEW_MODES } from '../constants';
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
    visibleItems,
    layoutItems,
    gridHeight,
    currentDatePosition,
    containerRef,
    handleScroll,
    isCalculating,
    calculationProgress,
    setSearchQuery,
    getItemStyle,
    scrollToToday,
    config: finalConfig
  } = timeline;

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
      <div 
        className="timeline-scroll-container" 
        ref={containerRef}
        onScroll={handleScroll}
      >
        <div className="timeline-content">
          <TimelineGrid
            timelineData={timelineData}
            layoutItems={visibleItems}
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
            loading={loading || isCalculating}
          />
        </div>
        
        {/* Loading Indicator for Large Datasets */}
        <LoadingIndicator 
          isVisible={isCalculating} 
          progress={calculationProgress}
          message="Calculating timeline layout..."
        />
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
