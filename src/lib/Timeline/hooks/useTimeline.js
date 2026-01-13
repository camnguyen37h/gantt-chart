/**
 * Timeline Hook - Core Timeline Logic
 * Centralizes all timeline calculations and state management
 * Optimized for million-scale datasets with virtual scrolling and Web Workers
 * No optional chaining for SonarQube compliance
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
import {
  calculateVisibleRange,
  getVisibleItems,
  processInChunks
} from '../utils/virtualScrollUtils';
import {
  initWorker,
  calculateLayoutInWorker,
  isWorkerAvailable,
  terminateWorker
} from '../utils/workerManager';
import { DEFAULT_CONFIG } from '../constants';

// Large dataset threshold - use worker for datasets above this size
const WORKER_THRESHOLD = 10000;
const CHUNK_SIZE = 1000;

/**
 * useTimeline Hook
 * Optimized for million-scale datasets
 * @param {Array} items - Timeline items
 * @param {Object} config - Configuration options
 * @returns {Object} Timeline state and methods
 */
export const useTimeline = (items = [], config = {}) => {
  // Memoize config to prevent re-renders
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  
  // Virtual scrolling state
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  
  // Loading state for large datasets
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  
  const containerRef = useRef(null);
  const workerInitialized = useRef(false);

  // Normalize items (add helper properties)
  // Optimized: use for loop for large datasets
  const normalizedItems = useMemo(() => {
    const result = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const normalized = normalizeItem(item);
      
      if (!normalized) {
        continue;
      }
      
      const info = formatItemInfo(normalized);
      const tooltip = info ? info.tooltip : '';
      
      result.push({ 
        ...normalized, 
        tooltip: tooltip 
      });
    }
    
    return result;
  }, [items]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let result = [];
    
    // Filter valid items
    for (let i = 0; i < normalizedItems.length; i++) {
      const item = normalizedItems[i];
      if (item._isValid) {
        result.push(item);
      }
    }
    
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
    const periods = generatePeriods(start, end, finalConfig.pixelsPerDay);
    const totalWidth = totalDays * finalConfig.pixelsPerDay;

    return {
      start,
      end,
      totalDays,
      totalWidth,
      periods
    };
  }, [dateRange, finalConfig.pixelsPerDay]);

  // Calculate current date position
  const currentDatePosition = useMemo(() => {
    if (!timelineData) {
      return null;
    }
    
    const moment = require('moment');
    const now = moment();
    
    if (now.isBefore(timelineData.start) || now.isAfter(timelineData.end)) {
      return null;
    }
    
    const daysFromStart = now.diff(timelineData.start, 'days', true);
    // Add 40px to account for timeline-header padding-left
    return daysFromStart * finalConfig.pixelsPerDay + 40;
  }, [timelineData, finalConfig.pixelsPerDay]);

  // Layout items with auto-positioning
  // Use Web Worker for large datasets
  const [layoutItems, setLayoutItems] = useState([]);
  
  useEffect(() => {
    if (!filteredItems || filteredItems.length === 0 || !timelineData) {
      setLayoutItems([]);
      return;
    }
    
    const itemCount = filteredItems.length;
    
    // For small datasets, calculate synchronously
    if (itemCount < WORKER_THRESHOLD) {
      const result = calculateAdvancedLayout(filteredItems);
      setLayoutItems(result);
      return;
    }
    
    // For large datasets, use Web Worker
    setIsCalculating(true);
    setCalculationProgress(0);
    
    // Initialize worker if not already done
    if (!workerInitialized.current && isWorkerAvailable()) {
      initWorker();
      workerInitialized.current = true;
    }
    
    // Calculate layout in worker or fallback to main thread
    const calculateLayout = async () => {
      try {
        let result;
        
        if (workerInitialized.current) {
          // Use worker for heavy calculation
          result = await calculateLayoutInWorker(filteredItems);
        } else {
          // Fallback: process in chunks on main thread
          result = [];
          await processInChunks(
            filteredItems,
            CHUNK_SIZE,
            (chunk) => {
              const chunkResult = calculateAdvancedLayout(chunk);
              result.push(...chunkResult);
              return chunkResult;
            },
            (progress) => {
              setCalculationProgress(progress);
            }
          );
        }
        
        setLayoutItems(result);
      } catch (error) {
        console.error('Layout calculation failed:', error);
        // Fallback to sync calculation
        const result = calculateAdvancedLayout(filteredItems);
        setLayoutItems(result);
      } finally {
        setIsCalculating(false);
        setCalculationProgress(0);
      }
    };
    
    calculateLayout();
  }, [filteredItems, timelineData]);
  
  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerInitialized.current) {
        terminateWorker();
        workerInitialized.current = false;
      }
    };
  }, []);

  // Calculate visible items based on scroll position (virtual scrolling)
  const visibleItems = useMemo(() => {
    if (!layoutItems || layoutItems.length === 0) {
      return [];
    }
    
    // For small datasets, render all items (no virtual scrolling)
    if (layoutItems.length < WORKER_THRESHOLD) {
      return layoutItems;
    }
    
    // For large datasets, only render visible items
    try {
      const overscan = 5; // Rows to render outside viewport
      const maxRow = Math.max(...layoutItems.map(item => item.row || 0));
      const totalRows = maxRow + 1;
      
      const visibleRange = calculateVisibleRange({
        scrollTop: scrollTop,
        containerHeight: containerHeight,
        rowHeight: finalConfig.rowHeight,
        totalRows: totalRows,
        overscan: overscan
      });
      
      return getVisibleItems(layoutItems, visibleRange.startRow, visibleRange.endRow);
    } catch (error) {
      console.warn('Virtual scrolling calculation failed, rendering all items:', error);
      return layoutItems;
    }
  }, [layoutItems, scrollTop, containerHeight, finalConfig.rowHeight]);

  // Calculate grid height
  const gridHeight = useMemo(() => {
    return calculateGridHeight(layoutItems, finalConfig.rowHeight);
  }, [layoutItems, finalConfig.rowHeight]);
  
  // Handle scroll event for virtual scrolling
  const handleScroll = useCallback((event) => {
    const target = event.target;
    if (!target) {
      return;
    }
    
    setScrollTop(target.scrollTop);
  }, []);
  
  // Update container height on resize
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    
    updateHeight();
    
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate item positions and dimensions (optimized with useCallback)
  // No optional chaining for SonarQube compliance
  const getItemStyle = useCallback((item) => {
    if (!timelineData) {
      return {};
    }

    const moment = require('moment');
    const pixelsPerDay = finalConfig.pixelsPerDay * zoomLevel;

    // Handle milestones differently - position at createdDate (center)
    if (isMilestone(item)) {
      const dateValue = item.createdDate ? item.createdDate : item.startDate;
      if (!dateValue) {
        return {};
      }
      
      const milestoneDate = moment(dateValue);
      const daysFromStart = milestoneDate.diff(timelineData.start, 'days', true);
      const left = daysFromStart * pixelsPerDay;
      const row = typeof item.row === 'number' ? item.row : 0;
      const top = row * finalConfig.rowHeight + finalConfig.itemPadding;

      return {
        left: `${left}px`,
        top: `${top}px`
      };
    }

    // Handle range items
    const startDate = getItemDate(item);
    if (!startDate) {
      return {};
    }
    
    const endDate = getItemEndDate(item);
    if (!endDate) {
      return {};
    }
    
    const daysFromStart = startDate.diff(timelineData.start, 'days', true);
    const duration = endDate.diff(startDate, 'days', true);
    
    const left = daysFromStart * pixelsPerDay;
    const width = duration * pixelsPerDay;
    const row = typeof item.row === 'number' ? item.row : 0;
    const top = row * finalConfig.rowHeight + finalConfig.itemPadding;
    const itemColor = item.color || '#3498db';

    return {
      left: `${left}px`,
      width: `${width}px`,
      top: `${top}px`,
      height: `${finalConfig.itemHeight}px`,
      backgroundColor: itemColor
    };
  }, [timelineData, finalConfig, zoomLevel]);

  // Scroll to today
  const scrollToToday = useCallback(() => {
    if (!containerRef.current || currentDatePosition === null) {
      return;
    }

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
    if (!finalConfig.enableAutoScroll) {
      return;
    }
    
    if (!containerRef.current || currentDatePosition === null) {
      return;
    }
    
    if (!timelineData) {
      return;
    }

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
    zoomLevel,
    searchQuery,
    filters,
    
    // Virtual scrolling state
    scrollTop,
    containerHeight,
    
    // Loading state
    isCalculating,
    calculationProgress,
    
    // Data
    timelineData,
    layoutItems,
    visibleItems, // Only visible items for rendering
    gridHeight,
    currentDatePosition,
    
    // Refs
    containerRef,
    
    // Methods
    setSearchQuery,
    setFilters,
    getItemStyle,
    scrollToToday,
    handleScroll, // Scroll handler for virtual scrolling
    zoomIn,
    zoomOut,
    resetZoom,
    
    // Config
    config: finalConfig
  };
};

export default useTimeline;
