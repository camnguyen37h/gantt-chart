/**
 * Canvas Renderer for Timeline
 * Handles all canvas drawing operations
 */

import moment from 'moment';
import { DATE_FORMATS } from '../constants';
import { isMilestone } from './itemUtils';

/**
 * Draw timeline on canvas
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
    animationProgress
  } = options;
  
  const progress = animationProgress !== undefined ? animationProgress : 1;

  // Draw grid lines
  if (enableGrid) {
    drawGridLines(ctx, timelineData, layoutItems, rowHeight);
  }

  // Draw timeline items with animation
  drawTimelineItems(ctx, layoutItems, getItemStyle, hoveredItem, progress);

  // Draw current date line
  if (enableCurrentDate && currentDatePosition !== null) {
    drawCurrentDateLine(ctx, currentDatePosition, timelineData);
  }
};

/**
 * Draw grid lines
 */
const drawGridLines = (ctx, timelineData, layoutItems, rowHeight) => {
  const { periods, start, baseWidth, totalDays } = timelineData;

  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 1;

  // Vertical grid lines
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    const periodStart = period.start;
    const daysFromStart = periodStart.diff(start, 'days', true);
    const left = daysFromStart * (baseWidth / totalDays);

    ctx.beginPath();
    ctx.moveTo(left, 0);
    ctx.lineTo(left, ctx.canvas.height);
    ctx.stroke();
  }

  // Horizontal grid lines
  if (layoutItems.length > 0) {
    const maxRow = Math.max(...layoutItems.map(i => i.row || 0));
    
    for (let i = 0; i <= maxRow; i++) {
      if (i === maxRow) continue; // Skip last line

      const top = i * rowHeight;
      ctx.beginPath();
      ctx.moveTo(0, top);
      ctx.lineTo(baseWidth, top);
      ctx.stroke();
    }
  }

  ctx.restore();
};

/**
 * Draw timeline items
 */
const drawTimelineItems = (ctx, layoutItems, getItemStyle, hoveredItem, animationProgress) => {
  const progress = animationProgress !== undefined ? animationProgress : 1;
  
  for (let i = 0; i < layoutItems.length; i++) {
    const item = layoutItems[i];
    const style = getItemStyle(item);
    const isHovered = hoveredItem && hoveredItem.id === item.id;

    if (isMilestone(item)) {
      drawMilestone(ctx, item, style, isHovered, progress);
    } else {
      drawRangeItem(ctx, item, style, isHovered, progress);
    }
  }
};

/**
 * Draw range item (bar)
 */
const drawRangeItem = (ctx, item, style, isHovered, animationProgress) => {
  const left = parseFloat(style.left);
  const top = parseFloat(style.top);
  const fullWidth = parseFloat(style.width);
  const height = parseFloat(style.height);
  
  // Animate width from 0 to 100%
  const progress = animationProgress !== undefined ? animationProgress : 1;
  const width = fullWidth * progress;

  ctx.save();

  // Shadow on hover
  if (isHovered) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
  }

  // Draw bar
  ctx.fillStyle = style.backgroundColor || item.color || '#1890ff';
  ctx.beginPath();
  ctx.roundRect(left, top, width, height, 4);
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textBaseline = 'middle';
  
  const textX = left + 12;
  const textY = top + height / 2;
  const maxTextWidth = width - 24;

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

    // Draw progress if exists
    if (item.progress !== undefined) {
      const progressText = `${item.progress}%`;
      const progressMetrics = ctx.measureText(progressText);
      const progressX = left + width - progressMetrics.width - 12;
      
      if (progressX > textX + metrics.width + 10) {
        ctx.fillText(progressText, progressX, textY);
      }
    }
  }

  // Draw progress bar
  if (item.progress !== undefined) {
    const progressWidth = (width * item.progress) / 100;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.roundRect(left, top, progressWidth, height, 4);
    ctx.fill();
  }

  ctx.restore();
};

/**
 * Draw milestone
 */
const drawMilestone = (ctx, item, style, isHovered, animationProgress) => {
  // Milestones use scale animation instead of width
  const progress = animationProgress !== undefined ? animationProgress : 1;
  const left = parseFloat(style.left);
  const top = parseFloat(style.top);
  const size = 20;
  const centerX = left;
  const centerY = top + 15;

  ctx.save();

  // Shadow
  if (isHovered) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
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

  // Inner circle
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Reset transform for label (don't scale text)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const dpr = window.devicePixelRatio || 1;
  ctx.scale(dpr, dpr);

  // Label with fade-in
  ctx.globalAlpha = progress;
  ctx.fillStyle = '#262626';
  ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  const labelY = centerY + size / 2 + 4;
  const text = item.name || '';
  const maxWidth = 120;
  
  ctx.fillText(text, centerX, labelY, maxWidth);
  ctx.globalAlpha = 1;

  ctx.restore();
};

/**
 * Draw current date line
 */
const drawCurrentDateLine = (ctx, currentDatePosition, timelineData) => {
  const height = ctx.canvas.height / (window.devicePixelRatio || 1);

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
