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
  const animationProgressRef = useRef(0);
  const animationStartTimeRef = useRef(null);

  // Calculate canvas dimensions
  const canvasWidth = timelineData?.totalWidth || 1000;
  const canvasHeight = Math.max(gridHeight, 400);
  const dpr = window.devicePixelRatio || 1;
  const hasItems = layoutItems && layoutItems.length > 0;

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
      dpr,
      hoveredItem: hoveredItemRef.current,
      animationProgress: animationProgressRef.current
    });
  }, [timelineData, layoutItems, currentDatePosition, getItemStyle, rowHeight, enableGrid, enableCurrentDate, config, dpr]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size accounting for device pixel ratio
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Initial draw with animation
    animationStartTimeRef.current = Date.now();
    animationProgressRef.current = 0;
    
    const animate = () => {
      const elapsed = Date.now() - animationStartTimeRef.current;
      const duration = 800; // 800ms animation
      
      if (elapsed < duration) {
        // Easing function: easeOutCubic
        const progress = elapsed / duration;
        animationProgressRef.current = 1 - Math.pow(1 - progress, 3);
        draw();
        requestAnimationFrame(animate);
      } else {
        animationProgressRef.current = 1;
        draw();
      }
    };
    
    animate();
  }, [canvasWidth, canvasHeight, dpr, draw]);

  // Redraw on data change
  useEffect(() => {
    if (loading) return;
    
    // Use RAF for smooth rendering
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      draw();
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw, loading]);

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
      }
    });

    return cleanup;
  }, [layoutItems, getItemStyle, onItemClick, onItemDoubleClick, onItemHover, draw]);

  return (
    <div 
      ref={containerRef}
      className={`timeline-canvas-container ${loading ? 'timeline-loading' : 'timeline-loaded'}`}
    >
      {!timelineData ? (
        /* Empty state if no timeline data */
        <div className="timeline-canvas-empty">
          <div className="empty-state-icon">📅</div>
          <h3>No Timeline Available</h3>
          <p>Unable to generate timeline. Please check your data.</p>
        </div>
      ) : (
        <>
          {/* Canvas Grid Area (wrapped for scrolling) */}
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
        <div ref={tooltipRef} className="timeline-canvas-tooltip">
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

        {/* Empty State Overlay (when no items) */}
        {!hasItems && (
          <div className="timeline-empty-overlay">
            <div className="empty-state-content">
              <div className="empty-state-icon">📆</div>
              <h3 className="empty-state-title">No Timeline Items</h3>
              <p className="empty-state-message">There are no tasks or milestones to display in this timeline view.</p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Header (DOM for better text rendering) */}
      {timelineData && timelineData.periods && (
        <div className="timeline-header" style={{ width: `${timelineData.baseWidth}px` }}>
          <div className="timeline-axis-line" />
          
          {timelineData.periods.map((period, index) => (
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
      )}
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
