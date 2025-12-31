/**
 * Timeline Component - Main Component
 * Complete, reusable timeline component with all features
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useTimeline } from '../hooks/useTimeline';
import TimelineToolbar from './TimelineToolbar';
import ViewModeSelector from './ViewModeSelector';
import TimelineGrid from './TimelineGrid';
import { VIEW_MODES } from '../constants';
import './Timeline.css';

const Timeline = ({
  items,
  config,
  showToolbar,
  showViewSelector,
  toolbarProps,
  viewSelectorProps,
  onItemClick,
  onItemDoubleClick,
  onItemHover,
  onNewItem,
  renderItem,
  className
}) => {
  const timeline = useTimeline(items, config);

  const {
    viewMode,
    searchQuery,
    timelineData,
    layoutItems,
    gridHeight,
    currentDatePosition,
    containerRef,
    setViewMode,
    setSearchQuery,
    getItemStyle,
    scrollToToday,
    config: finalConfig
  } = timeline;

  return (
    <div className={`timeline ${className || ''}`}>
      {/* Toolbar */}
      {showToolbar && (
        <TimelineToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onTodayClick={scrollToToday}
          onNewItem={onNewItem}
          {...toolbarProps}
        />
      )}

      {/* View Mode Selector */}
      {showViewSelector && (
        <ViewModeSelector
          viewMode={viewMode}
          onChange={setViewMode}
          {...viewSelectorProps}
        />
      )}

      {/* Scrollable Timeline Container */}
      <div className="timeline-scroll-container" ref={containerRef}>
        <div className="timeline-content">
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
          />
        </div>
      </div>
    </div>
  );
};

Timeline.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    color: PropTypes.string,
    resource: PropTypes.string,
    status: PropTypes.string
  })).isRequired,
  config: PropTypes.shape({
    viewMode: PropTypes.oneOf(Object.values(VIEW_MODES)),
    rowHeight: PropTypes.number,
    itemHeight: PropTypes.number,
    itemPadding: PropTypes.number,
    enableAutoScroll: PropTypes.bool,
    enableCurrentDate: PropTypes.bool,
    enableGrid: PropTypes.bool
  }),
  showToolbar: PropTypes.bool,
  showViewSelector: PropTypes.bool,
  toolbarProps: PropTypes.object,
  viewSelectorProps: PropTypes.object,
  onItemClick: PropTypes.func,
  onItemDoubleClick: PropTypes.func,
  onItemHover: PropTypes.func,
  onNewItem: PropTypes.func,
  renderItem: PropTypes.func,
  className: PropTypes.string
};

Timeline.defaultProps = {
  items: [],
  showToolbar: true,
  showViewSelector: true,
  toolbarProps: {},
  viewSelectorProps: {}
};

export default Timeline;
