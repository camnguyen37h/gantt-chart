/**
 * Timeline Canvas Component - ECharts-style Canvas Rendering
 * High performance rendering using HTML5 Canvas
 */

import React, { useRef, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DATE_FORMATS } from '../constants';
import { drawTimeline } from '../utils/canvasRenderer';
import { handleCanvasEvents } from '../utils/canvasEventHandler';
import './TimelineCanvas.css';

const TimelineCanvas = ({
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
  loading,
  config
}) => {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const animationFrameRef = useRef(null);
  const hoveredItemRef = useRef(null);
  const animationProgressRef = useRef(0); // Start at 0 for initial animation
  const animationStartTimeRef = useRef(null);
  
  // Get DPR from canvas context (scoped to timeline only, no window API)
  const dprRef = useRef(1);
  
  // Calculate canvas dimensions
  const canvasWidth = timelineData && timelineData.totalWidth ? timelineData.totalWidth : 1000;
  const canvasHeight = Math.max(gridHeight, 450);

  // Draw timeline on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw timeline
    drawTimeline(ctx, {
      timelineData,
      layoutItems,
      currentDatePosition,
      getItemStyle,
      rowHeight,
      enableGrid,
      enableCurrentDate,
      config,
      dpr: dprRef.current,
      hoveredItem: hoveredItemRef.current,
      animationProgress: animationProgressRef.current
    });
  }, [timelineData, layoutItems, currentDatePosition, getItemStyle, rowHeight, enableGrid, enableCurrentDate, config]);

  // Setup canvas size and DPR (no animation here, just canvas config)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get DPR from canvas context (scoped to canvas only, no window API)
    // Use getContext backing store ratio as fallback
    const backingStoreRatio = 
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;
    
    // Calculate DPR based on canvas context (defaults to 2 for retina, 1 for standard)
    // This avoids window API while still supporting high-DPI displays
    const contextDPR = Math.max(1, 1 / backingStoreRatio);
    dprRef.current = contextDPR;

    // Set canvas size accounting for device pixel ratio
    canvas.width = canvasWidth * dprRef.current;
    canvas.height = canvasHeight * dprRef.current;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.scale(dprRef.current, dprRef.current);

    // Draw immediately without animation (canvas size changed)
    if (animationProgressRef.current === 1) {
      draw();
    }
  }, [canvasWidth, canvasHeight, draw]);

  // Animation effect: triggers on data change (legend filter, initial load)
  // PERFORMANCE: Smooth animation for data changes, skipped during scroll
  useEffect(() => {
    if (loading) {
      return;
    }

    // Cancel any running animation before starting new one
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Start animation from beginning
    animationStartTimeRef.current = Date.now();
    animationProgressRef.current = 0;
    
    const animate = () => {
      const elapsed = Date.now() - animationStartTimeRef.current;
      const duration = 500; // PERFORMANCE: 300ms smooth animation
      
      if (elapsed < duration) {
        // Easing function: easeOutCubic
        const progress = elapsed / duration;
        animationProgressRef.current = 1 - Math.pow(1 - progress, 3);
        draw();
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationProgressRef.current = 1;
        draw();
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup: Cancel animation on unmount or data change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [timelineData, layoutItems, loading, draw]);

  // Handle canvas events
  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    const tooltip = tooltipRef.current;

    const cleanup = handleCanvasEvents({
      overlay,
      container,
      tooltip,
      layoutItems,
      getItemStyle,
      onItemClick,
      onItemDoubleClick,
      onItemHover: (item, mouseEvent) => {
        hoveredItemRef.current = item;
        draw();
        if (onItemHover) {
          onItemHover(item);
        }
      },
      onMouseLeave: () => {
        if (hoveredItemRef.current) {
          hoveredItemRef.current = null;
          draw();
        }
      },
      // PERFORMANCE: Cancel animation when scroll starts to prevent stutter
      onScrollStart: () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        // Set animation to complete immediately
        animationProgressRef.current = 1;
      }
    });

    return cleanup;
  }, [layoutItems, getItemStyle, onItemClick, onItemDoubleClick, onItemHover, draw]);

  return (
    <div 
      ref={containerRef}
      className={`timeline-canvas-container ${loading ? 'timeline-loading' : 'timeline-loaded'}`}
    >
      {/* Canvas Grid Area (wrapped for scrolling) */}
      {timelineData && (
        <>
          <div className="timeline-canvas-wrapper" style={{ position: 'relative' }}>
            {/* Main Canvas Layer */}
            <canvas
              ref={canvasRef}
              className="timeline-canvas"
            />

            {/* Overlay for Events - Only over canvas */}
            <div
              ref={overlayRef}
              className="timeline-canvas-overlay"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`
              }}
            />

            {/* Tooltip */}
            <div 
              ref={tooltipRef} 
              className="timeline-canvas-tooltip"
              style={{ display: 'none', opacity: 0 }}
            >
              <div className="timeline-canvas-tooltip-content">
                <div className="tooltip-title"></div>
                <div className="tooltip-details"></div>
              </div>
            </div>

            {/* Current Date Marker (DOM Overlay) */}
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
          </div>

          {/* Timeline Header (DOM for better text rendering) */}
          <div className="timeline-header" style={{ width: `${timelineData.baseWidth}px` }}>
            <div className="timeline-axis-line" />
            
            {timelineData.periods && timelineData.periods.map((period, index) => (
              <div
                key={`period-${index}`}
                className="timeline-period"
                style={{ width: `${period.width}px` }}
              >
                <div className="timeline-tick-mark" />
                <div className="period-label-border">{period.label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

TimelineCanvas.propTypes = {
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
  loading: PropTypes.bool,
  config: PropTypes.object
};

TimelineCanvas.defaultProps = {
  enableGrid: true,
  enableCurrentDate: true,
  loading: false
};

export default memo(TimelineCanvas);
