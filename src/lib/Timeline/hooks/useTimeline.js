/**
 * Timeline Hook - Core Timeline Logic
 * Centralizes all timeline calculations and state management
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generatePeriods, getDateRangeFromItems } from '../utils/dateUtils';
import {
  calculateAdvancedLayout,
  calculateGridHeight,
  filterItems,
  searchItems,
} from '../utils/layoutUtils';
import {
  getItemDate,
  getItemEndDate,
  isMilestone,
  normalizeItem,
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
  
  const [zoomLevel, setZoomLevel] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [searchQuery] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [filters] = useState({});
  const [containerWidth, setContainerWidth] = useState(null);
  const [isZooming, setIsZooming] = useState(false); // Track zoom state
  
  const containerRef = useRef(null);
  const hasAutoScrolledRef = useRef(false); // Track if already scrolled once
  const zoomTimeoutRef = useRef(null); // Debounce zoom updates
  const zoomRAFRef = useRef(null); // RAF for smooth zoom

  // Track container width for auto-scaling using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    // Initial width
    updateWidth();

    // Use ResizeObserver to watch only the timeline container
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Normalize items (add helper properties)
  // PERFORMANCE: Memoized to prevent re-normalization on every render
  const normalizedItems = useMemo(() => {
    const itemCount = items.length;
    const result = new Array(itemCount);
    
    for (let i = 0; i < itemCount; i++) {
      result[i] = normalizeItem(items[i]);
    }
    
    return result;
  }, [items]);

  // Filter and search items
  // PERFORMANCE: Chain operations efficiently without intermediate arrays
  const filteredItems = useMemo(() => {
    // First filter: valid items only
    let result = normalizedItems.filter(item => item._isValid);
    
    // Apply filters if provided
    result = filterItems(result, filters);
    
    // Apply search if provided
    result = searchItems(result, searchQuery);
    
    return result;
  }, [normalizedItems, filters, searchQuery]);

  // Calculate date range
  const dateRange = useMemo(() => {
    return getDateRangeFromItems(filteredItems);
  }, [filteredItems]);

  // Generate timeline data
  // PERFORMANCE: Optimized calculations, avoid spread operators
  const timelineData = useMemo(() => {
    if (!dateRange) {
      return null;
    }

    const { start, end } = dateRange;
    const totalDays = end.diff(start, 'days', true);
    
    // Apply zoomLevel to pixelsPerDay
    const zoomedPixelsPerDay = finalConfig.pixelsPerDay * zoomLevel;
    let periods = generatePeriods(start, end, zoomedPixelsPerDay);
    let baseWidth = totalDays * zoomedPixelsPerDay;
    let scaleFactor = zoomLevel;
    
    // Auto-scale if timeline is shorter than container
    const minContainerWidth = containerWidth || 800;
    const availableWidth = minContainerWidth - 120; // Subtract padding (60px left + 60px right)
    
    if (baseWidth < availableWidth && baseWidth > 0) {
      const autoScaleFactor = availableWidth / baseWidth;
      scaleFactor = zoomLevel * autoScaleFactor;
      
      // OPTIMIZATION: Scale periods in-place instead of creating new array
      const periodCount = periods.length;
      const scaledPeriods = new Array(periodCount);
      
      for (let i = 0; i < periodCount; i++) {
        const period = periods[i];
        scaledPeriods[i] = {
          label: period.label,
          width: period.width * autoScaleFactor,
          days: period.days,
          start: period.start,
          end: period.end,
          type: period.type
        };
      }
      
      periods = scaledPeriods;
      baseWidth = availableWidth;
    }
    
    const totalWidth = baseWidth + 60; // Add padding

    return {
      start: start,
      end: end,
      totalDays: totalDays,
      totalWidth: totalWidth,
      baseWidth: baseWidth,
      periods: periods,
      pixelsPerDay: finalConfig.pixelsPerDay * scaleFactor,
      scaleFactor: scaleFactor
    };
  }, [dateRange, finalConfig.pixelsPerDay, containerWidth, zoomLevel]);

  // Calculate current date position
  // PERFORMANCE: Only recalculate when timeline changes
  const currentDatePosition = useMemo(() => {
    if (!timelineData) {
      return null;
    }
    
    const moment = require('moment');
    const now = moment();
    
    // Check if current date is within timeline range
    if (now.isBefore(timelineData.start) || now.isAfter(timelineData.end)) {
      return null;
    }
    
    const daysFromStart = now.diff(timelineData.start, 'days', true);
    return daysFromStart * timelineData.pixelsPerDay;
  }, [timelineData]);

  // Layout items with auto-positioning
  // PERFORMANCE: Only recalculate when filtered items change
  const layoutItems = useMemo(() => {
    if (!filteredItems || filteredItems.length === 0) {
      return [];
    }
    
    return calculateAdvancedLayout(filteredItems);
  }, [filteredItems]);

  // Calculate grid height
  const gridHeight = useMemo(() => {
    return calculateGridHeight(layoutItems, finalConfig.rowHeight);
  }, [layoutItems, finalConfig.rowHeight]);

  // Calculate item positions and dimensions
  // PERFORMANCE: Optimized calculations, cached in useCallback
  const getItemStyle = useCallback((item) => {
    if (!timelineData) {
      return {};
    }

    const pixelsPerDay = timelineData.pixelsPerDay;

    // Handle milestones - position at startDate or createdDate
    if (isMilestone(item)) {
      const milestoneDate = getItemDate(item);
      
      if (!milestoneDate) {
        return {};
      }
      
      const daysFromStart = milestoneDate.diff(timelineData.start, 'days', true);
      const left = daysFromStart * pixelsPerDay;
      const top = item.row * finalConfig.rowHeight + finalConfig.itemPadding;

      return {
        left: left + 'px',
        top: top + 'px'
      };
    }

    // Handle range items
    const startDate = getItemDate(item);
    
    if (!startDate) {
      return {};
    }
    
    const endDate = getItemEndDate(item);
    const daysFromStart = startDate.diff(timelineData.start, 'days', true);
    const duration = endDate.diff(startDate, 'days', true);
    
    const left = daysFromStart * pixelsPerDay;
    const width = duration * pixelsPerDay;
    const top = item.row * finalConfig.rowHeight + finalConfig.itemPadding;

    return {
      left: left + 'px',
      width: width + 'px',
      top: top + 'px',
      height: finalConfig.itemHeight + 'px',
      backgroundColor: item.color
    };
  }, [timelineData, finalConfig]);

  // Scroll to today
  // PERFORMANCE: Cached callback with minimal dependencies
  const scrollToToday = useCallback(() => {
    if (!containerRef.current || currentDatePosition === null) {
      return;
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    
    // Adjust for container padding (60px left)
    const scrollLeft = currentDatePosition - (containerWidth / 2) + 60;

    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth'
    });
  }, [currentDatePosition]);

  // Auto-scroll to current date on mount (only once)
  // PERFORMANCE: Debounced with RAF for smooth initial positioning
  useEffect(() => {
    if (!finalConfig.enableAutoScroll) {
      return;
    }
    
    if (hasAutoScrolledRef.current) {
      return; // Already scrolled
    }
    
    if (!containerRef.current || currentDatePosition === null || !timelineData) {
      return;
    }

    // Use RAF and timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToToday();
        hasAutoScrolledRef.current = true;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [timelineData, currentDatePosition, finalConfig.enableAutoScroll, scrollToToday]);

  // Zoom controls with smooth transitions and RAF optimization
  const zoomIn = useCallback(() => {
    // PERFORMANCE: Skip if already at max zoom to prevent unnecessary updates
    if (zoomLevel >= finalConfig.maxZoomLevel) {
      return;
    }
    
    if (zoomRAFRef.current) {
      cancelAnimationFrame(zoomRAFRef.current);
    }
    
    setIsZooming(true);
    
    zoomRAFRef.current = requestAnimationFrame(() => {
      setZoomLevel(prev => {
        const newZoom = Math.min(prev * 1.15, finalConfig.maxZoomLevel);
        return Math.round(newZoom * 100) / 100;
      });
      
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
      zoomTimeoutRef.current = setTimeout(() => {
        setIsZooming(false);
      }, 150);
    });
  }, [finalConfig.maxZoomLevel, zoomLevel]);

  const zoomOut = useCallback(() => {
    // PERFORMANCE: Skip if already at min zoom to prevent unnecessary updates
    if (zoomLevel <= finalConfig.minZoomLevel) {
      return;
    }
    
    if (zoomRAFRef.current) {
      cancelAnimationFrame(zoomRAFRef.current);
    }
    
    setIsZooming(true);
    
    zoomRAFRef.current = requestAnimationFrame(() => {
      setZoomLevel(prev => {
        const newZoom = Math.max(prev / 1.15, finalConfig.minZoomLevel);
        return Math.round(newZoom * 100) / 100;
      });
      
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
      zoomTimeoutRef.current = setTimeout(() => {
        setIsZooming(false);
      }, 150);
    });
  }, [finalConfig.minZoomLevel, zoomLevel]);

  const resetZoom = useCallback(() => {
    if (zoomRAFRef.current) {
      cancelAnimationFrame(zoomRAFRef.current);
    }
    
    setIsZooming(true);
    setZoomLevel(1);
    
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZooming(false);
    }, 150);
  }, []);

  // Smooth zoom with debounce and RAF for continuous scrolling
  const handleZoom = useCallback((direction) => {
    if (direction > 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }, [zoomIn, zoomOut]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
      if (zoomRAFRef.current) {
        cancelAnimationFrame(zoomRAFRef.current);
      }
    };
  }, []);

  return {
    // State
    zoomLevel,
    isZooming,
    
    // Data
    timelineData,
    layoutItems,
    gridHeight,
    currentDatePosition,
    
    // Refs
    containerRef,
    
    // Methods
    getItemStyle,
    scrollToToday,
    zoomIn,
    zoomOut,
    resetZoom,
    handleZoom,
    
    // Config
    config: finalConfig
  };
};

export default useTimeline;
