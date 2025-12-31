/**
 * Timeline Hook - Core Timeline Logic
 * Centralizes all timeline calculations and state management
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  getDateRangeFromItems,
  generatePeriods,
  calculatePosition,
  calculateWidth,
  getCurrentDatePosition
} from '../utils/dateUtils';
import {
  calculateAdvancedLayout,
  calculateGridHeight,
  filterItems,
  searchItems
} from '../utils/layoutUtils';
import { DEFAULT_CONFIG } from '../constants';

/**
 * useTimeline Hook
 * @param {Array} items - Timeline items
 * @param {Object} config - Configuration options
 * @returns {Object} Timeline state and methods
 */
export const useTimeline = (items = [], config = {}) => {
  // Memoize config to prevent re-renders
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  const [viewMode, setViewMode] = useState(finalConfig.viewMode);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  
  const containerRef = useRef(null);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let result = items;
    result = filterItems(result, filters);
    result = searchItems(result, searchQuery);
    return result;
  }, [items, filters, searchQuery]);

  // Calculate date range
  const dateRange = useMemo(() => {
    return getDateRangeFromItems(filteredItems);
  }, [filteredItems]);

  // Generate timeline data
  const timelineData = useMemo(() => {
    if (!dateRange) return null;

    const { start, end } = dateRange;
    const totalDays = end.diff(start, 'days');
    const periods = generatePeriods(start, end, viewMode);

    return {
      start,
      end,
      totalDays,
      periods
    };
  }, [dateRange, viewMode]);

  // Calculate current date position
  const currentDatePosition = useMemo(() => {
    if (!timelineData) return null;
    return getCurrentDatePosition(
      timelineData.start,
      timelineData.end,
      timelineData.totalDays
    );
  }, [timelineData]);

  // Layout items with auto-positioning
  const layoutItems = useMemo(() => {
    if (!filteredItems || !timelineData) return [];
    return calculateAdvancedLayout(filteredItems);
  }, [filteredItems, timelineData]);

  // Calculate grid height
  const gridHeight = useMemo(() => {
    return calculateGridHeight(layoutItems, finalConfig.rowHeight);
  }, [layoutItems, finalConfig.rowHeight]);

  // Calculate item positions and dimensions
  const getItemStyle = useCallback((item) => {
    if (!timelineData) return {};

    const left = calculatePosition(
      item.startDate,
      timelineData.start,
      timelineData.totalDays
    );
    
    const width = calculateWidth(
      item.startDate,
      item.endDate,
      timelineData.totalDays
    );

    const top = item.row * finalConfig.rowHeight + finalConfig.itemPadding;

    return {
      left: `${left}%`,
      width: `${width * zoomLevel}%`,
      top: `${top}px`,
      height: `${finalConfig.itemHeight}px`
    };
  }, [timelineData, finalConfig, zoomLevel]);

  // Scroll to today
  const scrollToToday = useCallback(() => {
    if (!containerRef.current || currentDatePosition === null) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const contentWidth = container.scrollWidth;
    const targetPosition = (currentDatePosition / 100) * contentWidth;
    const scrollLeft = targetPosition - containerWidth / 2;

    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth'
    });
  }, [currentDatePosition]);

  // Auto-scroll to current date on mount
  useEffect(() => {
    if (!finalConfig.enableAutoScroll) return;
    if (!containerRef.current || currentDatePosition === null) return;

    const timer = setTimeout(() => {
      scrollToToday();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentDatePosition, finalConfig.enableAutoScroll, scrollToToday]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.2, finalConfig.maxZoomLevel));
  }, [finalConfig.maxZoomLevel]);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.2, finalConfig.minZoomLevel));
  }, [finalConfig.minZoomLevel]);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  return {
    // State
    viewMode,
    zoomLevel,
    searchQuery,
    filters,
    
    // Data
    timelineData,
    layoutItems,
    gridHeight,
    currentDatePosition,
    
    // Refs
    containerRef,
    
    // Methods
    setViewMode,
    setSearchQuery,
    setFilters,
    getItemStyle,
    scrollToToday,
    zoomIn,
    zoomOut,
    resetZoom,
    
    // Config
    config: finalConfig
  };
};

export default useTimeline;
