/**
 * Canvas Renderer for Timeline
 * Handles all canvas drawing operations
 */

import moment from 'moment';
import { DATE_FORMATS } from '../constants';
import { isMilestone } from './itemUtils';

/**
 * Draw timeline on canvas
 * PERFORMANCE: Optimized drawing with viewport culling and batch operations
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} options - Drawing options
 */
export const drawTimeline = (ctx, options) => {
  const {
    timelineData,
    layoutItems,
    currentDatePosition,
    getItemStyle,
    rowHeight,
    enableGrid,
    enableCurrentDate,
    hoveredItem,
    animationProgress,
    isZooming,
    horizontalPadding
  } = options;
  
  const progress = animationProgress !== undefined ? animationProgress : 1;
  const hPadding = horizontalPadding || 0;

  // OPTIMIZATION: Skip animations during zoom for better performance
  const effectiveProgress = isZooming ? 1 : progress;

  // OPTIMIZATION: Batch draw operations to minimize context state changes
  ctx.save();
  
  // Apply horizontal padding offset
  if (hPadding > 0) {
    ctx.translate(hPadding, 0);
  }

  // PERFORMANCE: Get zoom level for LOD decisions
  const zoomLevel = options.zoomLevel || 1;

  // Draw timeline items with LOD optimization (no scroll-based viewport culling)
  // PERFORMANCE: Canvas draws FULL timeline once, scroll is pure CSS
  drawTimelineItems(ctx, layoutItems, getItemStyle, hoveredItem, effectiveProgress, {
    zoomLevel: options.zoomLevel,
    isZooming: isZooming,
    dpr: options.dpr,
    horizontalPadding: hPadding
  });

  // Draw current date line
  if (enableCurrentDate && currentDatePosition !== null) {
    drawCurrentDateLine(ctx, currentDatePosition, timelineData, options);
  }
  
  // IMPORTANT: Draw grid lines LAST so they appear on top of milestone labels
  if (enableGrid && zoomLevel >= 0.6) {
    drawGridLines(ctx, timelineData, layoutItems, rowHeight);
  }
  
  ctx.restore();
};

/**
 * Draw grid lines
 * PERFORMANCE: Optimized loop with cached calculations
 */
const drawGridLines = (ctx, timelineData, layoutItems, rowHeight) => {
  const { periods, start, baseWidth, totalDays } = timelineData;

  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 1;

  // OPTIMIZATION: Cache division result
  const widthPerDay = baseWidth / totalDays;
  const periodCount = periods.length;
  const canvasHeight = ctx.canvas.height;

  // Vertical grid lines - batch drawing
  ctx.beginPath();
  
  for (let i = 0; i < periodCount; i++) {
    const period = periods[i];
    const periodStart = period.start;
    const daysFromStart = periodStart.diff(start, 'days', true);
    const left = daysFromStart * widthPerDay;

    ctx.moveTo(left, 0);
    ctx.lineTo(left, canvasHeight);
  }
  
  // Single stroke for all lines
  ctx.stroke();
  ctx.restore();
};

/**
 * Draw timeline items
 * PERFORMANCE: Optimized loop with viewport culling and LOD
 * NOTE: Canvas renders FULL timeline, scroll is pure CSS (no redraw needed)
 * Viewport culling based on canvas dimensions, not scroll position
 */
const drawTimelineItems = (ctx, layoutItems, getItemStyle, hoveredItem, animationProgress, options) => {
  const progress = animationProgress !== undefined ? animationProgress : 1;
  const itemCount = layoutItems.length;
  const hoveredId = hoveredItem ? hoveredItem.id : null;
  
  // OPTIMIZATION: Progressive Level of Detail (3 levels)
  const zoomLevel = options.zoomLevel || 1;
  const detailLevel = zoomLevel >= 0.9 ? 'normal' : zoomLevel >= 0.7 ? 'medium' : 'ultra-low';
  
  // IMPORTANT: Draw in two passes to ensure milestones are on top
  // Pass 1: Draw all ranges/task bars
  for (let i = 0; i < itemCount; i++) {
    const item = layoutItems[i];
    if (!isMilestone(item)) {
      const style = getItemStyle(item);
      const isHovered = hoveredId !== null && hoveredId === item.id;
      drawTaskBar(ctx, item, style, isHovered, progress, detailLevel, options);
    }
  }
  
  // Pass 2: Draw all milestones (will appear on top with labels)
  for (let i = 0; i < itemCount; i++) {
    const item = layoutItems[i];
    if (isMilestone(item)) {
      const style = getItemStyle(item);
      const isHovered = hoveredId !== null && hoveredId === item.id;
      drawMilestone(ctx, item, style, isHovered, progress, options, detailLevel);
    }
  }
};

/**
 * Draw task bar with progressive LOD (Level of Detail)
 * PERFORMANCE: 3 detail levels - normal, medium (no shadow), ultra-low (simple rect only)
 */
const drawTaskBar = (ctx, item, style, isHovered, animationProgress, detailLevel, options) => {
  const effectiveProgress = options && options.isZooming ? 1 : animationProgress !== undefined ? animationProgress : 1;
  
  const left = parseFloat(style.left);
  const top = parseFloat(style.top);
  const fullWidth = parseFloat(style.width);
  const height = parseFloat(style.height);
  
  // Animate width from 0 to 100%
  const width = fullWidth * effectiveProgress;

  ctx.save();

  // OPTIMIZATION: Progressive LOD for shadows
  // normal: full shadow, medium: no shadow, ultra-low: no shadow
  if (detailLevel === 'normal') {
    if (isHovered) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;
    }
  }

  // Draw bar
  ctx.fillStyle = style.backgroundColor || item.color || '#1890ff';
  
  // OPTIMIZATION: Use simple rect for ultra-low detail (faster than roundRect)
  if (detailLevel === 'ultra-low') {
    ctx.fillRect(left, top, width, height);
  } else {
    ctx.beginPath();
    ctx.roundRect(left, top, width, height, 4);
    ctx.fill();
  }

  // OPTIMIZATION: Skip text and warning in ultra-low detail
  if (detailLevel !== 'ultra-low') {
    // Reset shadow
    if (detailLevel === 'normal') {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textBaseline = 'middle';
    
    const textX = left + 12;
    const textY = top + height / 2;
    
    // Check if warning will be displayed - always show if task is late
    const hasWarning = item.lateTime && item.lateTime < 0;
    const warningWidth = hasWarning ? 18 : 0; // Reserve space for corner badge
    
    const maxTextWidth = width - 24 - warningWidth;

    if (maxTextWidth > 30) {
      const text = item.name || '';
      const metrics = ctx.measureText(text);
      
      if (metrics.width > maxTextWidth) {
        // Truncate text
        let truncated = text;
        while (ctx.measureText(truncated + '...').width > maxTextWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1);
        }
        ctx.fillText(truncated + '...', textX, textY);
      } else {
        ctx.fillText(text, textX, textY);
      }
    }

    // Draw warning indicator for late tasks (corner badge)
    // lateTime = dueDate - resolvedDate, so lateTime < 0 means late
    if (hasWarning) {
      drawWarningIndicator(ctx, left + width, top, height, width);
    }
  }

  ctx.restore();
};

/**
 * Draw warning indicator for late tasks - Corner Badge pattern
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} right - Right edge of task bar
 * @param {number} top - Top position of task bar
 * @param {number} height - Height of task bar
 * @param {number} barWidth - Width of task bar for scaling
 */
const drawWarningIndicator = (ctx, right, top, height, barWidth) => {
  // Always draw warning, but scale proportionally to bar width
  // For very small bars, triangle will be tiny but still visible
  const MAX_SIZE = 16; // Maximum size for large bars
  const SCALE_FACTOR = 0.4; // 40% of bar width
  const MIN_SIZE = 4; // Very small minimum to ensure visibility
  
  // Scale based on bar width, proportional scaling
  const scaledSize = barWidth ? Math.min(MAX_SIZE, Math.max(MIN_SIZE, barWidth * SCALE_FACTOR)) : MAX_SIZE;
  const size = Math.floor(scaledSize);
  const radius = Math.min(4, size / 2); // Scale radius proportionally too
  
  ctx.save();
  
  // Draw red corner triangle with rounded inner corner at top-right
  ctx.fillStyle = '#f5222d'; // Red error color
  ctx.beginPath();
  ctx.moveTo(right - size, top); // Left point on top edge
  ctx.lineTo(right - radius, top); // Move to start of top-right curve
  ctx.quadraticCurveTo(right, top, right, top + radius); // Rounded top-right corner
  ctx.lineTo(right, top + size); // Bottom point on right edge
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
};

/**
 * Draw milestone with progressive LOD
 * PERFORMANCE: normal (full), medium (no shadow), ultra-low (simple diamond, no label)
 */
const drawMilestone = (ctx, item, style, isHovered, animationProgress, options, detailLevel) => {
  // Milestones use scale animation instead of width
  const progress = animationProgress !== undefined ? animationProgress : 1;
  const left = parseFloat(style.left);
  const top = parseFloat(style.top);
  const size = 20;
  const centerX = left;
  const centerY = top + 15;

  ctx.save();

  // OPTIMIZATION: Skip shadow in medium and ultra-low detail
  if (detailLevel === 'normal') {
    if (isHovered) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
    }
  }

  // Animate scale for milestone (pop-in effect)
  const scale = 0.3 + (progress * 0.7); // Scale from 0.3 to 1.0
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);

  // Draw diamond
  ctx.fillStyle = item.color || '#722ed1';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size / 2);
  ctx.lineTo(centerX + size / 2, centerY);
  ctx.lineTo(centerX, centerY + size / 2);
  ctx.lineTo(centerX - size / 2, centerY);
  ctx.closePath();
  ctx.fill();

  // OPTIMIZATION: Skip inner circle and label in ultra-low detail
  if (detailLevel !== 'ultra-low') {
    // Inner circle
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Save current transform before resetting for label
    ctx.save();
    
    // Reset transform for label (don't scale text)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // dpr is passed from options
    const dpr = options && options.dpr ? options.dpr : 1;
    ctx.scale(dpr, dpr);
    
    // Re-apply horizontal padding after transform reset
    const hPadding = options && options.horizontalPadding ? options.horizontalPadding : 0;
    if (hPadding > 0) {
      ctx.translate(hPadding, 0);
    }

    // Label with background pill (always below diamond)
    ctx.globalAlpha = progress;
    const text = item.name || '';
    const labelY = centerY + size / 2 + 18; // Increased from 12 to 18 for more spacing
    
    // Set font
    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textBaseline = 'top';
  
  // Measure full text
  const textMetrics = ctx.measureText(text);
  const fullTextWidth = textMetrics.width;
  
  // IMPORTANT: Always center align labels under icon, allow overflow beyond canvas
  const maxWidth = 150;
  let displayText = text;
  let displayWidth = fullTextWidth;
  
  // Truncate text only if exceeds maxWidth
  if (fullTextWidth > maxWidth) {
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 3) {
      truncated = truncated.slice(0, -1);
    }
    displayText = truncated + '...';
    displayWidth = ctx.measureText(displayText).width;
  }
  
  // Calculate pill dimensions - always centered under icon
  const padding = 6;
  const pillHeight = 18;
  const pillWidth = displayWidth + padding * 2;
  const textX = centerX; // Always center
  const pillX = textX - pillWidth / 2;
  const pillY = labelY - 2;
  
  // Draw background pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 9);
  ctx.fill();
  
  // Reset shadow for text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Draw text in the SAME transform context as pill (for perfect alignment)
  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#262626';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(displayText, textX, labelY);
  
  ctx.globalAlpha = 1;
  
  // Restore transform after both pill and text are drawn
  ctx.restore();
  }

  ctx.restore();
};

/**
 * Draw current date line
 */
const drawCurrentDateLine = (ctx, currentDatePosition, timelineData, options) => {
  const dpr = options?.dpr || 1;
  const height = ctx.canvas.height / dpr;

  ctx.save();

  // Line
  ctx.strokeStyle = '#e44258';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(currentDatePosition, 0);
  ctx.lineTo(currentDatePosition, height);
  ctx.stroke();

  // Marker circle
  ctx.fillStyle = '#e44258';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(currentDatePosition, -6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Label
  const label = moment().format(DATE_FORMATS.dayMonth);
  ctx.fillStyle = '#e44258';
  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  
  const labelWidth = ctx.measureText(label).width + 24;
  const labelX = currentDatePosition;
  const labelY = -30;

  // Label background
  ctx.beginPath();
  ctx.roundRect(labelX - labelWidth / 2, labelY - 20, labelWidth, 20, 4);
  ctx.fill();

  // Label text
  ctx.fillStyle = 'white';
  ctx.fillText(label, labelX, labelY - 5);

  // Arrow
  ctx.fillStyle = '#e44258';
  ctx.beginPath();
  ctx.moveTo(labelX - 5, labelY);
  ctx.lineTo(labelX + 5, labelY);
  ctx.lineTo(labelX, labelY + 5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

/**
 * Polyfill for roundRect if not available
 */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    return this;
  };
}
