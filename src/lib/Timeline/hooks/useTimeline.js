/**
 * Timeline Hook - Core Timeline Logic
 * Centralizes all timeline calculations and state management
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  getDateRangeFromItems,
  generatePeriods
} from '../utils/dateUtils';
import {
  calculateAdvancedLayout,
  calculateGridHeight,
  filterItems,
  searchItems
} from '../utils/layoutUtils';
import { 
  normalizeItem, 
  getItemDate, 
  getItemEndDate,
  isMilestone,
  formatItemInfo
} from '../utils/itemUtils';
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

  // Normalize items (add helper properties)
  const normalizedItems = useMemo(() => {
    return items.map(item => {
      const normalized = normalizeItem(item);
      const info = formatItemInfo(normalized);
      return { ...normalized, tooltip: info?.tooltip };
    });
  }, [items]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let result = normalizedItems.filter(item => item._isValid);
    result = filterItems(result, filters);
    result = searchItems(result, searchQuery);
    return result;
  }, [normalizedItems, filters, searchQuery]);

  // Calculate date range
  const dateRange = useMemo(() => {
    return getDateRangeFromItems(filteredItems);
  }, [filteredItems]);

  // Generate timeline data
  const timelineData = useMemo(() => {
    if (!dateRange) return null;

    const { start, end } = dateRange;
    const totalDays = end.diff(start, 'days', true);
    const periods = generatePeriods(start, end, viewMode, finalConfig.pixelsPerDay);
    const totalWidth = totalDays * finalConfig.pixelsPerDay; // Calculate total width in pixels

    return {
      start,
      end,
      totalDays,
      totalWidth,
      periods
    };
  }, [dateRange, viewMode, finalConfig.pixelsPerDay]);

  // Calculate current date position
  const currentDatePosition = useMemo(() => {
    if (!timelineData) return null;
    const moment = require('moment');
    const now = moment();
    if (now.isBefore(timelineData.start) || now.isAfter(timelineData.end)) return null;
    const daysFromStart = now.diff(timelineData.start, 'days', true);
    return daysFromStart * finalConfig.pixelsPerDay; // Return position in pixels
  }, [timelineData, finalConfig.pixelsPerDay]);

  // Layout items with auto-positioning
  const layoutItems = useMemo(() => {
    if (!filteredItems || !timelineData) return [];
    return calculateAdvancedLayout(filteredItems);
  }, [filteredItems, timelineData]);

  // Calculate grid height
  const gridHeight = useMemo(() => {
    return calculateGridHeight(layoutItems, finalConfig.rowHeight);
  }, [layoutItems, finalConfig.rowHeight]);

  // Calculate item positions and dimensions (optimized with useCallback)
  const getItemStyle = useCallback((item) => {
    if (!timelineData) return {};

    const moment = require('moment');
    const pixelsPerDay = finalConfig.pixelsPerDay * zoomLevel;

    // Handle milestones differently - position at createdDate (center)
    if (isMilestone(item)) {
      const milestoneDate = item.createdDate ? moment(item.createdDate) : moment(item.startDate);
      const daysFromStart = milestoneDate.diff(timelineData.start, 'days', true);
      const left = daysFromStart * pixelsPerDay;
      const top = item.row * finalConfig.rowHeight + finalConfig.itemPadding;

      return {
        left: `${left}px`,
        top: `${top}px`
      };
    }

    // Handle range items
    const startDate = getItemDate(item);
    if (!startDate) return {};
    
    const endDate = getItemEndDate(item);
    const daysFromStart = startDate.diff(timelineData.start, 'days', true);
    const duration = endDate.diff(startDate, 'days', true);
    
    const left = daysFromStart * pixelsPerDay;
    const width = duration * pixelsPerDay;
    const top = item.row * finalConfig.rowHeight + finalConfig.itemPadding;

    return {
      left: `${left}px`,
      width: `${width}px`,
      top: `${top}px`,
      height: `${finalConfig.itemHeight}px`,
      backgroundColor: item.color
    };
  }, [timelineData, finalConfig, zoomLevel]);

  // Scroll to today
  const scrollToToday = useCallback(() => {
    if (!containerRef.current || currentDatePosition === null) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const scrollLeft = currentDatePosition - containerWidth / 2;

    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth'
    });
  }, [currentDatePosition]);

  // Auto-scroll to current date on mount
  useEffect(() => {
    if (!finalConfig.enableAutoScroll) return;
    if (!containerRef.current || currentDatePosition === null) return;
    if (!timelineData) return;

    // Use RAF and timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToToday();
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [timelineData, currentDatePosition, finalConfig.enableAutoScroll, scrollToToday]);

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
