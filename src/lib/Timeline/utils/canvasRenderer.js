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
    isZooming
  } = options;
  
  const progress = animationProgress !== undefined ? animationProgress : 1;

  // OPTIMIZATION: Skip animations during zoom for better performance
  const effectiveProgress = isZooming ? 1 : progress;

  // OPTIMIZATION: Batch draw operations to minimize context state changes
  ctx.save();

  // PERFORMANCE: Get zoom level for LOD decisions
  const zoomLevel = options.zoomLevel || 1;

  // Draw grid lines (skip when zoomed out far for performance)
  if (enableGrid && zoomLevel >= 0.6) {
    drawGridLines(ctx, timelineData, layoutItems, rowHeight);
  }

  // Draw timeline items with LOD optimization (no scroll-based viewport culling)
  // PERFORMANCE: Canvas draws FULL timeline once, scroll is pure CSS
  drawTimelineItems(ctx, layoutItems, getItemStyle, hoveredItem, effectiveProgress, {
    zoomLevel: options.zoomLevel,
    isZooming: isZooming
  });

  // Draw current date line
  if (enableCurrentDate && currentDatePosition !== null) {
    drawCurrentDateLine(ctx, currentDatePosition, timelineData, options);
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
  
  for (let i = 0; i < itemCount; i++) {
    const item = layoutItems[i];
    const style = getItemStyle(item);
    const isHovered = hoveredId !== null && hoveredId === item.id;

    if (isMilestone(item)) {
      drawMilestone(ctx, item, style, isHovered, progress, options, detailLevel);
    } else {
      drawTaskBar(ctx, item, style, isHovered, progress, detailLevel, options);
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
      drawWarningIndicator(ctx, left + width, top, height);
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
 */
const drawWarningIndicator = (ctx, right, top, height) => {
  const size = 16; // Corner triangle size
  const radius = 4; // Border radius to match task bar
  
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

    // Reset transform for label (don't scale text)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // dpr is passed from options
    const dpr = options && options.dpr ? options.dpr : 1;
    ctx.scale(dpr, dpr);

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
  const canvasWidth = ctx.canvas.width / dpr;
  
  // Calculate max width based on position
  let maxWidth = 120;
  let textX = centerX;
  let alignment = 'center';
  
  // Only adjust alignment if text actually overflows
  const halfTextWidth = fullTextWidth / 2;
  const padding = 6; // Pill padding
  
  if (centerX + halfTextWidth + padding > canvasWidth - 10) {
    // Text overflows right edge
    alignment = 'right';
    textX = canvasWidth - 10;
    maxWidth = Math.min(120, textX - 10);
  } else if (centerX - halfTextWidth - padding < 10) {
    // Text overflows left edge
    alignment = 'left';
    textX = 10;
    maxWidth = Math.min(120, canvasWidth - textX - 10);
  }
  // Otherwise keep center alignment
  
  // Truncate text if needed
  let displayText = text;
  let displayWidth = fullTextWidth;
  
  if (fullTextWidth > maxWidth) {
    // Smart truncation - keep start and end visible
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 3) {
      truncated = truncated.slice(0, -1);
    }
    displayText = truncated + '...';
    displayWidth = ctx.measureText(displayText).width;
  }
  
  // Calculate background pill dimensions
  // padding already declared above (6px)
  const pillHeight = 18;
  let pillX, pillWidth;
  
  if (alignment === 'center') {
    pillWidth = displayWidth + padding * 2;
    pillX = textX - pillWidth / 2;
  } else if (alignment === 'left') {
    pillWidth = displayWidth + padding * 2;
    pillX = textX - padding;
  } else {
    pillWidth = displayWidth + padding * 2;
    pillX = textX - pillWidth + padding;
  }
  
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
  
  // Draw text
  ctx.fillStyle = '#262626';
  ctx.textAlign = alignment;
  ctx.textBaseline = 'top';
  ctx.fillText(displayText, textX, labelY);
  
  ctx.globalAlpha = 1;
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
