import { NOT_AVAILABLE, TOOLTIP_FIELDS } from '../constants'

/**
 * Check if point is inside rectangular bounds
 *
 * @param {number} x - X-coordinate
 * @param {number} y - Y-coordinate
 * @param {Object} rect - Rectangle {left, top, width, height}
 * @return {boolean} True if point is inside rectangle
 */
const isPointInRect = (x, y, rect) => {
  const left = Number.parseFloat(rect.left)
  const top = Number.parseFloat(rect.top)
  const width = Number.parseFloat(rect.width)
  const height = Number.parseFloat(rect.height)

  return x >= left && x <= left + width && y >= top && y <= top + height
}

/**
 * Check if point is inside milestone diamond or label area
 *
 * @param {number} x - X-coordinate
 * @param {number} y - Y-coordinate
 * @param {Object} style - Milestone style properties
 * @return {boolean} True if point is inside milestone
 */
const isPointInMilestone = (x, y, style) => {
  const left = Number.parseFloat(style.left)
  const top = Number.parseFloat(style.top)
  const size = 20
  const centerX = left
  const centerY = top + 15

  const inDiamond = Math.abs(x - centerX) + Math.abs(y - centerY) <= size / 2

  if (inDiamond) {
    return true
  }

  const labelY = centerY + size / 2 + 18
  const labelHeight = 18
  const labelWidth = 120

  const labelLeft = centerX - labelWidth / 2
  const labelRight = centerX + labelWidth / 2
  const labelTop = labelY - 2
  const labelBottom = labelTop + labelHeight

  return x >= labelLeft && x <= labelRight && y >= labelTop && y <= labelBottom
}

/**
 * Check if item is at the specified position
 *
 * @param {Object} item - Timeline item
 * @param {number} x - X-coordinate
 * @param {number} y - Y-coordinate
 * @param {Object} style - Item style properties
 * @return {boolean} True if item is at position
 */
const isItemAtPosition = (item, x, y, style) => {
  return item._originallyMilestone
    ? isPointInMilestone(x, y, style)
    : isPointInRect(x, y, style)
}

/**
 * Find timeline item at the specified position
 *
 * @param {number} x - X-coordinate
 * @param {number} y - Y-coordinate
 * @param {Array} layoutItems - Array of layout items
 * @param {Function} getItemStyle - Function to get item style
 * @return {Object|null} Found item or null
 */
const findItemAtPosition = (x, y, layoutItems, getItemStyle) => {
  for (let i = layoutItems.length - 1; i >= 0; i--) {
    const item = layoutItems[i]
    const style = getItemStyle(item)

    if (!style) {
      continue
    }

    if (isItemAtPosition(item, x, y, style)) {
      return item
    }
  }

  return null
}

/**
 * Setup event handlers for canvas interactions (hover, tooltip, scroll)
 *
 * @param {Object} options - Event handler configuration
 * @return {Function} Cleanup function to remove event listeners
 */
export const handleCanvasEvents = options => {
  const {
    overlay,
    container,
    tooltip,
    layoutItems,
    getItemStyle,
    onItemHover,
    onMouseLeave,
    onScrollStart,
  } = options

  let currentHoveredItem = null
  let clickTimeout = null

  /**
   * Get mouse position relative to scrollable container
   *
   * @param {MouseEvent} event - Mouse event
   * @return {Object} Position {x, y}
   */
  const getMousePosition = event => {
    const rect = overlay.getBoundingClientRect()
    const scrollLeft = container.scrollLeft || 0
    const scrollTop = container.scrollTop || 0

    return {
      x: event.clientX - rect.left + scrollLeft,
      y: event.clientY - rect.top + scrollTop,
    }
  }

  /**
   * Display tooltip with item details at mouse position
   *
   * @param {Object} item - Timeline item data
   * @param {MouseEvent} event - Mouse event
   * @return {void}
   */
  const showTooltip = (item, event) => {
    if (!tooltip) return

    const rect = container.getBoundingClientRect()
    const scrollLeft = container.scrollLeft || 0
    const scrollTop = container.scrollTop || 0
    const mouseX = event.clientX - rect.left + scrollLeft
    const mouseY = event.clientY - rect.top + scrollTop

    const titleEl = tooltip.querySelector('.tooltip-title')
    const detailsEl = tooltip.querySelector('.tooltip-details')

    if (titleEl) {
      titleEl.textContent = item.name || NOT_AVAILABLE
    }

    if (detailsEl) {
      detailsEl.innerHTML = TOOLTIP_FIELDS.map(
        ({ label, getValue, getColor }) => {
          const value = getValue(item)
          const colorClass = getColor ? getColor(item) : ''

          return `<div class="tooltip-row">
            <span class="tooltip-label">${label}:</span>
            <span class="tooltip-value ${colorClass}">${value}</span>
          </div>`
        }
      ).join('')
    }

    tooltip.style.display = 'block'
    tooltip.style.opacity = '0'

    requestAnimationFrame(() => {
      const tooltipRect = tooltip.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      const clientX = event.clientX - containerRect.left
      const clientY = event.clientY - containerRect.top
      let left = mouseX + 15
      let top = mouseY + 10

      if (clientX + 15 + tooltipRect.width > containerRect.width) {
        left = mouseX - tooltipRect.width - 15
      }

      if (clientY + 10 + tooltipRect.height > containerRect.height) {
        top = mouseY - tooltipRect.height - 10
      }

      tooltip.style.left = `${left}px`
      tooltip.style.top = `${top}px`
      tooltip.style.opacity = '1'
    })
  }

  /**
   * Hide tooltip by setting display to none
   *
   * @return {void}
   */
  const hideTooltip = () => {
    if (!tooltip) return
    tooltip.style.display = 'none'
    tooltip.style.opacity = '0'
  }

  /**
 * Calculate tooltip position with boundary checking to prevent overflow
 *
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLElement} container - Container element
 * @param {HTMLElement} tooltip - Tooltip element
 * @param {number} mouseX - Mouse X in container coordinates
 * @param {number} mouseY - Mouse Y in container coordinates
 * @return {Object} Position {left, top}
 */
const calculateTooltipPosition = (event, container, tooltip, mouseX, mouseY) => {
  const tooltipRect = tooltip.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  
  const clientX = event.clientX - containerRect.left
  const clientY = event.clientY - containerRect.top
  
  let left = mouseX + 15
  let top = mouseY + 10
  
  if (clientX + 15 + tooltipRect.width > containerRect.width) {
    left = mouseX - tooltipRect.width - 15
  }
  
  if (clientY + 10 + tooltipRect.height > containerRect.height) {
    top = mouseY - tooltipRect.height - 10
  }
  
  return { left, top }
}

/**
 * Update tooltip position following mouse movement
 *
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLElement} container - Container element
 * @param {HTMLElement} tooltip - Tooltip element
 * @return {void}
 */
const updateTooltipPosition = (event, container, tooltip) => {
  if (!tooltip || tooltip.style.display !== 'block') return
  
  const rect = container.getBoundingClientRect()
  const scrollLeft = container.scrollLeft || 0
  const scrollTop = container.scrollTop || 0
  const mouseX = event.clientX - rect.left + scrollLeft
  const mouseY = event.clientY - rect.top + scrollTop
  
  const { left, top } = calculateTooltipPosition(event, container, tooltip, mouseX, mouseY)
  
  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
}

/**
 * Handle mouse entering an item (show tooltip and cursor)
 *
 * @param {Object} item - Timeline item
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLElement} overlay - Overlay element
 * @param {Function} showTooltip - Function to show tooltip
 * @param {Function} onItemHover - Hover callback
 * @return {void}
 */
const handleItemEnter = (item, event, overlay, showTooltip, onItemHover) => {
  overlay.style.cursor = 'pointer'
  showTooltip(item, event)
  onItemHover?.(item, event)
}

/**
 * Handle mouse leaving an item (hide tooltip and reset cursor)
 *
 * @param {HTMLElement} overlay - Overlay element
 * @param {Function} hideTooltip - Function to hide tooltip
 * @param {Function} onMouseLeave - Leave callback
 * @return {void}
 */
const handleItemLeave = (overlay, hideTooltip, onMouseLeave) => {
  overlay.style.cursor = 'default'
  hideTooltip()
  onMouseLeave && onMouseLeave()
}

/**
 * Handle mouse movement over canvas to detect item hover
 *
 * @param {MouseEvent} event - Mouse event
 * @return {void}
 */
const handleMouseMove = event => {
  const { x, y } = getMousePosition(event)
  const item = findItemAtPosition(x, y, layoutItems, getItemStyle)
  
  const itemChanged = item !== currentHoveredItem
  
  if (itemChanged) {
    currentHoveredItem = item
    
    if (item) {
      handleItemEnter(item, event, overlay, showTooltip, onItemHover)
    } else {
      handleItemLeave(overlay, hideTooltip, onMouseLeave)
    }
    return
  }
  
  if (item) {
    updateTooltipPosition(event, container, tooltip)
  }
}

  /**
   * Handle mouse leaving canvas area
   *
   * @return {void}
   */
  const handleMouseLeave = () => {
    if (currentHoveredItem) {
      currentHoveredItem = null
      overlay.style.cursor = 'default'
      hideTooltip()

      if (onMouseLeave) {
        onMouseLeave()
      }
    }
  }

  let scrollThrottleTimer = null
  let isScrolling = false

  const handleScrollThrottled = () => {
    if (isScrolling) {
      return
    }

    isScrolling = true

    if (onScrollStart) {
      onScrollStart()
    }

    requestAnimationFrame(() => {
      if (currentHoveredItem) {
        hideTooltip()
        currentHoveredItem = null
        overlay.style.cursor = 'default'

        if (onMouseLeave) {
          onMouseLeave()
        }
      }

      isScrolling = false
    })
  }

  overlay.addEventListener('mousemove', handleMouseMove)
  overlay.addEventListener('mouseleave', handleMouseLeave)
  container.addEventListener('scroll', handleScrollThrottled, { passive: true })
  container.addEventListener('wheel', handleScrollThrottled, { passive: true })

  return () => {
    overlay.removeEventListener('mousemove', handleMouseMove)
    overlay.removeEventListener('mouseleave', handleMouseLeave)
    container.removeEventListener('scroll', handleScrollThrottled)
    container.removeEventListener('wheel', handleScrollThrottled)

    if (clickTimeout) {
      clearTimeout(clickTimeout)
    }

    if (scrollThrottleTimer) {
      cancelAnimationFrame(scrollThrottleTimer)
    }

    hideTooltip()
  }
}
