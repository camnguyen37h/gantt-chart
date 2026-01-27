import {
  DEFAULT_CONFIG,
  DEFAULT_STATUS_CONFIG,
  NOT_AVAILABLE,
  CANVAS_RENDERING,
  STATUS_CONFIG,
} from '../constants'
import { isMilestone } from './itemUtils'

const { MILESTONE_SIZE, MILESTONE_CENTER_DOT_RADIUS, MILESTONE_LABEL_HEIGHT } =
  CANVAS_RENDERING

/**
 * Get text color for a given status
 *
 * @param {string} status - Status name
 *
 * @return {string} Hex color code for text
 */
const getStatusTextColor = status => {
  if (!status) {
    return DEFAULT_STATUS_CONFIG.color
  }

  const config = STATUS_CONFIG[status]
  if (config) {
    return config.color
  }

  return DEFAULT_STATUS_CONFIG.color
}

/**
 * Draw timeline on canvas with items and grid lines
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} options - Drawing configuration options
 *
 * @return {void}
 */
export const drawTimeline = (ctx, options) => {
  const {
    timelineData,
    layoutItems,
    getItemStyle,
    enableGrid,
    hoveredItem,
    animationProgress,
    isZooming,
    horizontalPadding,
  } = options

  const hPadding = horizontalPadding || 0
  const progress = animationProgress !== undefined ? animationProgress : 1
  const effectiveProgress = isZooming ? 1 : progress

  ctx.save()

  if (hPadding > 0) {
    ctx.translate(hPadding, 0)
  }

  const zoomLevel = options.zoomLevel || 1
  if (enableGrid && zoomLevel >= 0.6) {
    drawGridLines(ctx, timelineData)
  }

  if (layoutItems.length > 0) {
    drawTimelineItems(
      ctx,
      layoutItems,
      getItemStyle,
      hoveredItem,
      effectiveProgress,
      {
        zoomLevel: options.zoomLevel,
        isZooming: isZooming,
        dpr: options.dpr,
        horizontalPadding: hPadding,
      }
    )
  }

  ctx.restore()
}

/**
 * Draw vertical grid lines for timeline periods
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} timelineData - Timeline data containing periods and dimensions
 *
 * @return {void}
 */
const drawGridLines = (ctx, timelineData) => {
  const { periods, start, baseWidth, totalDays } = timelineData

  ctx.save()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)'
  ctx.lineWidth = 1

  const widthPerDay = baseWidth / totalDays
  const periodCount = periods.length
  const canvasHeight = ctx.canvas.height

  ctx.beginPath()

  for (let i = 0; i < periodCount; i++) {
    const period = periods[i]
    const periodStart = period.start
    const daysFromStart = periodStart.diff(start, 'days')
    const left = daysFromStart * widthPerDay

    ctx.moveTo(left, 0)
    ctx.lineTo(left, canvasHeight)
  }

  ctx.stroke()
  ctx.restore()
}

/**
 * Determine rendering detail level based on zoom level
 *
 * @param {number} zoomLevel - Current zoom level
 *
 * @return {string} Detail level: 'normal', 'medium', or 'ultra-low'
 */
const getDetailLevel = zoomLevel => {
  if (zoomLevel >= 0.9) return 'normal'
  if (zoomLevel >= 0.7) return 'medium'

  return 'ultra-low'
}

/**
 * Draw all timeline items (tasks and milestones)
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Array} layoutItems - Array of layout items with positions
 * @param {Function} getItemStyle - Function to get item style
 * @param {Object} hoveredItem - Currently hovered item
 * @param {number} animationProgress - Animation progress (0-1)
 * @param {Object} options - Rendering options
 *
 * @return {void}
 */
const drawTimelineItems = (
  ctx,
  layoutItems,
  getItemStyle,
  hoveredItem,
  animationProgress,
  options
) => {
  const progress = animationProgress !== undefined ? animationProgress : 1
  const itemCount = layoutItems.length
  const hoveredId = hoveredItem ? hoveredItem.id : null
  const zoomLevel = options.zoomLevel || 1
  const detailLevel = getDetailLevel(zoomLevel)

  // Draw hover background first (behind all items)
  if (hoveredId !== null) {
    for (let i = 0; i < itemCount; i++) {
      const item = layoutItems[i]
      if (item.id === hoveredId) {
        const style = getItemStyle(item)
        const top = Number.parseFloat(style.top)
        const height = Number.parseFloat(style.height)

        const padding = 8

        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
        // Fill entire row width
        ctx.fillRect(0, top - padding, ctx.canvas.width, height + padding * 2)
        break
      }
    }
  }

  for (let i = 0; i < itemCount; i++) {
    const item = layoutItems[i]
    const style = getItemStyle(item)
    const isHovered = hoveredId !== null && hoveredId === item.id
    const renderState = { isHovered, animationProgress: progress, detailLevel }

    if (isMilestone(item)) {
      drawMilestone(ctx, item, style, renderState, options)
    } else {
      drawTaskBar(ctx, item, style, renderState, options)
    }
  }
}

/**
 * Calculate effective animation progress considering zoom state
 *
 * @param {number} animationProgress - Raw animation progress (0-1)
 * @param {Object} options - Rendering options containing isZooming flag
 *
 * @return {number} Effective progress value
 */
const getEffectiveProgress = (animationProgress, options) => {
  if (options && options.isZooming) return 1

  return animationProgress || 1
}

/**
 * Clear all shadow effects from canvas context
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 *
 * @return {void}
 */
const clearShadow = ctx => {
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
}

/**
 * Draw task bar background with rounded corners
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} bounds - Bounding box {left, top, width, height}
 * @param {string} color - Fill color
 * @param {string} detailLevel - Current detail level
 *
 * @return {void}
 */
const drawBarBackground = (ctx, bounds, color, detailLevel) => {
  ctx.fillStyle = color

  //TODO: Border radius for ultra-low detail level can be optimized
  if (detailLevel === 'ultra-low') {
    ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height)
    ctx.strokeStyle = '#0052cc'
    ctx.lineWidth = 1
    ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height)
  } else {
    ctx.beginPath()
    ctx.roundRect(bounds.left, bounds.top, bounds.width, bounds.height, 4)
    ctx.fill()
    ctx.strokeStyle = '#0052cc'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

/**
 * Truncate text with ellipsis to fit within maximum width
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {string} text - Text to truncate
 * @param {number} maxWidth - Maximum width in pixels
 *
 * @return {string} Truncated text with ellipsis if needed
 */
const truncateText = (ctx, text, maxWidth) => {
  const metrics = ctx.measureText(text)

  if (metrics.width <= maxWidth) {
    return text
  }

  let truncated = text
  while (
    ctx.measureText(truncated + '...').width > maxWidth &&
    truncated.length > 0
  ) {
    truncated = truncated.slice(0, -1)
  }

  return truncated + '...'
}

/**
 * Configure canvas context for text rendering
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {string} textColor - Text color to use
 *
 * @return {void}
 */
const setupTextContext = (ctx, textColor = 'white') => {
  ctx.fillStyle = textColor
  ctx.font =
    "500 13px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
  ctx.textBaseline = 'middle'
}

/**
 * Draw text label inside task bar
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} item - Timeline item data
 * @param {Object} bounds - Bounding box {left, top, width, height}
 * @param {number} warningWidth - Width reserved for warning indicator
 *
 * @return {void}
 */
const drawTaskBarText = (ctx, item, bounds, warningWidth = 0) => {
  const textColor = getStatusTextColor(item.status)
  setupTextContext(ctx, textColor)

  const textX = bounds.left + 12
  const textY = bounds.top + bounds.height / 2
  const maxTextWidth = bounds.width - 24 - warningWidth

  if (maxTextWidth <= 30) return

  const text =
    [item.issueKey, item.name].filter(Boolean).join(': ') || NOT_AVAILABLE
  const displayText = truncateText(ctx, text, maxTextWidth)

  ctx.fillText(displayText, textX, textY)
}

/**
 * Check if item is on-time (resolved before due date or still has time)
 *
 * @param {Object} item - Timeline item
 *
 * @return {boolean} True if on-time
 */
const isOnTime = item => {
  // Only show success indicator if actually resolved on-time
  // lateTime > 0 means resolved before due date
  return item.lateTime !== undefined && item.lateTime > 0
}

/**
 * Check if item is late
 *
 * @param {Object} item - Timeline item
 *
 * @return {boolean} True if late
 */
const isLate = item => {
  return item.lateTime !== undefined && item.lateTime < 0
}

/**
 * Draw task bar content including text and warning indicator
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} item - Timeline item data
 * @param {Object} bounds - Bounding box {left, top, width, height}
 * @param {string} detailLevel - Current detail level
 * @param {Object} options - Rendering options
 *
 * @return {void}
 */
const drawTaskBarContent = (ctx, item, bounds, detailLevel, options) => {
  if (detailLevel === 'ultra-low') return

  if (detailLevel === 'normal') {
    clearShadow(ctx)
  }

  const hasWarning = isLate(item)
  const hasSuccess = isOnTime(item)
  const indicatorWidth = hasWarning || hasSuccess ? 12 : 0

  drawTaskBarText(ctx, item, bounds, indicatorWidth)

  if (hasWarning) {
    drawWarningIndicator(
      ctx,
      bounds.left + bounds.width,
      bounds.top,
      bounds.height,
      bounds.width,
      options.zoomLevel
    )
  } else if (hasSuccess) {
    drawSuccessIndicator(
      ctx,
      bounds.left + bounds.width,
      bounds.top,
      bounds.height,
      bounds.width,
      options.zoomLevel
    )
  }
}

/**
 * Render a complete task bar with a background, text, and effects
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} item - Timeline item data
 * @param {Object} style - CSS style properties
 * @param {Object} renderState - State {isHovered, animationProgress, detailLevel}
 * @param {Object} options - Rendering options
 *
 * @return {void}
 */
const drawTaskBar = (ctx, item, style, renderState, options) => {
  const { isHovered, animationProgress, detailLevel } = renderState
  const effectiveProgress = getEffectiveProgress(animationProgress, options)

  const left = Number.parseFloat(style.left)
  const top = Number.parseFloat(style.top)
  const fullWidth = Number.parseFloat(style.width)
  const height = Number.parseFloat(style.height)
  const width = fullWidth * effectiveProgress

  ctx.save()

  if (isHovered) {
    ctx.globalAlpha = 0.7
  }

  const bounds = { left, top, width, height }
  const barColor =
    style.backgroundColor || item.color || DEFAULT_STATUS_CONFIG.backgroundColor
  drawBarBackground(ctx, bounds, barColor, detailLevel)

  drawTaskBarContent(ctx, item, bounds, detailLevel, options)

  ctx.restore()
}

/**
 * Draw warning indicator triangle for late tasks
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} right - Right edge x-coordinate
 * @param {number} top - Top edge y-coordinate
 * @param {number} height - Bar height
 * @param {number} barWidth - Bar width for scaling
 * @param {number} zoomLevel - Current zoom level
 *
 * @return {void}
 */
const drawWarningIndicator = (ctx, right, top, height, barWidth, zoomLevel) => {
  const MAX_SIZE = 12
  const SCALE_FACTOR = 0.4
  const MIN_SIZE = (DEFAULT_CONFIG.pixelsPerDay - 1) * zoomLevel

  const scaledSize = barWidth
    ? Math.min(MAX_SIZE, Math.max(MIN_SIZE, barWidth * SCALE_FACTOR))
    : MAX_SIZE
  const size = Math.floor(scaledSize)
  const radius = Math.min(4, size / 2)

  ctx.save()
  ctx.fillStyle = '#f5222d'
  ctx.beginPath()
  ctx.moveTo(right - size, top)
  ctx.lineTo(right - radius, top)
  ctx.quadraticCurveTo(right, top, right, top + radius)
  ctx.lineTo(right, top + size)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/**
 * Draw success indicator checkmark for on-time tasks
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} right - Right edge x-coordinate
 * @param {number} top - Top edge y-coordinate
 * @param {number} height - Bar height
 * @param {number} barWidth - Bar width for scaling
 * @param {number} zoomLevel - Current zoom level
 *
 * @return {void}
 */
const drawSuccessIndicator = (ctx, right, top, height, barWidth, zoomLevel) => {
  const MAX_SIZE = 12
  const SCALE_FACTOR = 0.4
  const MIN_SIZE = (DEFAULT_CONFIG.pixelsPerDay - 1) * zoomLevel

  const scaledSize = barWidth
    ? Math.min(MAX_SIZE, Math.max(MIN_SIZE, barWidth * SCALE_FACTOR))
    : MAX_SIZE
  const size = Math.floor(scaledSize)
  const radius = Math.min(4, size / 2)

  ctx.save()
  ctx.fillStyle = '#52c41a'
  ctx.beginPath()
  ctx.moveTo(right - size, top)
  ctx.lineTo(right - radius, top)
  ctx.quadraticCurveTo(right, top, right, top + radius)
  ctx.lineTo(right, top + size)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/**
 * Calculate animation scale factor for milestone entrance
 *
 * @param {number} progress - Animation progress (0-1)
 *
 * @return {number} Scale factor (0.3-1.0)
 */
const getAnimationScale = progress => 0.3 + progress * 0.7

/**
 * Apply transformation matrix for milestone scaling animation
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} centerX - Center x-coordinate
 * @param {number} centerY - Center y-coordinate
 * @param {number} scale - Scale factor
 *
 * @return {void}
 */
const applyMilestoneTransform = (ctx, centerX, centerY, scale) => {
  ctx.translate(centerX, centerY)
  ctx.scale(scale, scale)
  ctx.translate(-centerX, -centerY)
}

/**
 * Draw a diamond shape for milestone marker
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} centerX - Center x-coordinate
 * @param {number} centerY - Center y-coordinate
 * @param {string} color - Fill color
 *
 * @return {void}
 */
const drawMilestoneDiamond = (ctx, centerX, centerY, color) => {
  const halfSize = MILESTONE_SIZE / 2

  ctx.fillStyle = color || DEFAULT_STATUS_CONFIG.backgroundColor
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - halfSize)
  ctx.lineTo(centerX + halfSize, centerY)
  ctx.lineTo(centerX, centerY + halfSize)
  ctx.lineTo(centerX - halfSize, centerY)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#0052cc'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

/**
 * Draw white center dot on milestone diamond
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} centerX - Center x-coordinate
 * @param {number} centerY - Center y-coordinate
 *
 * @return {void}
 */
const drawMilestoneCenter = (ctx, centerX, centerY) => {
  clearShadow(ctx)
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(centerX, centerY, MILESTONE_CENTER_DOT_RADIUS, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Generate display text for milestone label
 *
 * @param {Object} item - Timeline item data
 *
 * @return {string} Formatted text
 */
const getMilestoneText = item => {
  return [item.issueKey, item.name].filter(Boolean).join(': ') || NOT_AVAILABLE
}

/**
 * Configure canvas context for milestone label rendering
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} options - Options containing dpr and horizontalPadding
 *
 * @return {void}
 */
const setupLabelContext = (ctx, options) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  const dpr = options && options.dpr ? options.dpr : 1
  ctx.scale(dpr, dpr)

  const hPadding =
    options && options.horizontalPadding ? options.horizontalPadding : 0
  if (hPadding > 0) {
    ctx.translate(hPadding, 0)
  }
}

/**
 * Draw rounded background pill for milestone label
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} pillX - Pill x-coordinate
 * @param {number} pillY - Pill y-coordinate
 * @param {number} pillWidth - Pill width
 *
 * @return {void}
 */
const drawLabelPill = (ctx, pillX, pillY, pillWidth) => {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 1
  ctx.beginPath()
  ctx.roundRect(pillX, pillY, pillWidth, MILESTONE_LABEL_HEIGHT, 4)
  ctx.fill()
  clearShadow(ctx)
}

/**
 * Render a complete milestone with diamond, center dot, and label
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} item - Timeline item data
 * @param {Object} style - CSS style properties
 * @param {Object} renderState - State {isHovered, animationProgress, detailLevel}
 * @param {Object} options - Rendering options
 *
 * @return {void}
 */
const drawMilestone = (ctx, item, style, renderState, options) => {
  const { isHovered, animationProgress, detailLevel } = renderState
  const progress = animationProgress !== undefined ? animationProgress : 1
  const left = Number.parseFloat(style.left)
  const top = Number.parseFloat(style.top)
  const centerX = left
  const centerY = top + 15

  ctx.save()

  if (isHovered) {
    ctx.globalAlpha = 0.7
  }

  const scale = getAnimationScale(progress)
  applyMilestoneTransform(ctx, centerX, centerY, scale)

  drawMilestoneDiamond(ctx, centerX, centerY, item.color)

  if (detailLevel !== 'ultra-low') {
    drawMilestoneCenter(ctx, centerX, centerY)
  }

  ctx.restore()
}

/**
 * Polyfill for roundRect if not available
 */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (
    x,
    y,
    width,
    height,
    radius
  ) {
    this.moveTo(x + radius, y)
    this.lineTo(x + width - radius, y)
    this.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.lineTo(x + width, y + height - radius)
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.lineTo(x + radius, y + height)
    this.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.lineTo(x, y + radius)
    this.quadraticCurveTo(x, y, x + radius, y)
    return this
  }
}
