import { NOT_AVAILABLE, TOOLTIP_FIELDS, CANVAS_RENDERING } from '../constants'
import { isMilestone } from './itemUtils'

/**
 * Check if point is inside rectangular bounds
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} rect - Rectangle bounds
 *
 * @return {boolean} True if point is inside
 */
const isPointInRect = (x, y, rect) => {
  const left = Number.parseFloat(rect.left)
  const top = Number.parseFloat(rect.top)
  const width = Number.parseFloat(rect.width)
  const height = Number.parseFloat(rect.height)

  return x >= left && x <= left + width && y >= top && y <= top + height
}

/**
 * Check if point is inside milestone diamond
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} style - Milestone style properties
 *
 * @return {boolean} True if point is inside
 */
const isPointInMilestone = (x, y, style) => {
  const left = Number.parseFloat(style.left)
  const top = Number.parseFloat(style.top)
  const size = CANVAS_RENDERING.MILESTONE_SIZE
  const centerX = left
  const centerY = top + 15

  // Check diamond area using Manhattan distance
  return Math.abs(x - centerX) + Math.abs(y - centerY) <= size / 2
}

/**
 * Find timeline item at specified position
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array} layoutItems - Timeline items array
 * @param {Function} getItemStyle - Style retrieval function
 *
 * @return {Object|null} Found item or null
 */
const findItemAtPosition = (x, y, layoutItems, getItemStyle) => {
  // First pass: check for milestones (they should have priority)
  for (let i = 0; i < layoutItems.length; i++) {
    const item = layoutItems[i]
    if (!isMilestone(item)) continue
    
    const style = getItemStyle(item)
    if (!style) continue

    if (isPointInMilestone(x, y, style)) {
      return item
    }
  }

  // Second pass: check for ranges
  for (let i = 0; i < layoutItems.length; i++) {
    const item = layoutItems[i]
    if (isMilestone(item)) continue
    
    const style = getItemStyle(item)
    if (!style) continue

    if (isPointInRect(x, y, style)) {
      return item
    }
  }

  return null
}

/**
 * Initialize event handling for timeline canvas interactions
 *
 * @param {Object} options - Event handler configuration
 *
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
    horizontalPadding = 0,
    isDraggingRef,
    dragStartXRef,
    dragStartYRef,
    scrollLeftStartRef,
    scrollTopStartRef,
    handleZoom,
    zoomLevel,
    maxZoomLevel,
    minZoomLevel,
  } = options

  let currentHoveredItem = null
  let clickTimeout = null

  /**
   * Get mouse position relative to container
   *
   * @param {MouseEvent} event - Mouse event
   *
   * @return {Object} Position {x, y}
   */
  const getMousePosition = event => {
    const containerRect = container.getBoundingClientRect()
    const scrollLeft = container.scrollLeft || 0
    const scrollTop = container.scrollTop || 0
    
    // Get container's computed padding-top
    const containerPaddingTop = parseFloat(getComputedStyle(container).paddingTop) || 0    

    return {
      x: event.clientX - containerRect.left + scrollLeft - horizontalPadding,
      y: event.clientY - containerRect.top + scrollTop - containerPaddingTop,
    }
  }

  /**
   * Display tooltip with item details
   *
   * @param {Object} item - Timeline item data
   * @param {MouseEvent} event - Mouse event
   *
   * @return {void}
   */
  const showTooltip = (item, event) => {
    if (!tooltip) return

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
      
      // Use screen coordinates (fixed positioning)
      const mouseScreenX = event.clientX
      const mouseScreenY = event.clientY
      
      // Calculate space on both sides
      const spaceOnRight = window.innerWidth - mouseScreenX
      const spaceOnLeft = mouseScreenX
      const spaceBelow = window.innerHeight - mouseScreenY
      const spaceAbove = mouseScreenY
      const tooltipWidth = tooltipRect.width + 15
      const tooltipHeight = tooltipRect.height + 10
      
      let left, top
      
      // Show on side with more space (horizontal)
      if (spaceOnRight >= spaceOnLeft || spaceOnRight >= tooltipWidth) {
        // Show on right
        left = mouseScreenX + 15
      } else {
        // Show on left
        left = mouseScreenX - tooltipRect.width - 15
      }
      
      // Show on side with more space (vertical)
      if (spaceBelow >= spaceAbove || spaceBelow >= tooltipHeight) {
        // Show below
        top = mouseScreenY + 10
      } else {
        // Show above
        top = mouseScreenY - tooltipRect.height - 10
      }
      
      // Ensure tooltip doesn't go off screen
      left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10))
      top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10))

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
   * Calculate tooltip position with boundary checking
   *
   * @param {MouseEvent} event - Mouse event
   * @param {HTMLElement} container - Container element
   * @param {HTMLElement} tooltip - Tooltip element
   * @param {number} mouseX - Mouse X coordinate
   * @param {number} mouseY - Mouse Y coordinate
   *
   * @return {Object} Position {left, top}
   */
  const calculateTooltipPosition = (
    event,
    container,
    tooltip,
    mouseX,
    mouseY
  ) => {
    const tooltipRect = tooltip.getBoundingClientRect()
    
    // Use screen coordinates (fixed positioning)
    const mouseScreenX = event.clientX
    const mouseScreenY = event.clientY
    
    // Calculate space on both sides
    const spaceOnRight = window.innerWidth - mouseScreenX
    const spaceOnLeft = mouseScreenX
    const spaceBelow = window.innerHeight - mouseScreenY
    const spaceAbove = mouseScreenY
    const tooltipWidth = tooltipRect.width + 15
    const tooltipHeight = tooltipRect.height + 10
    
    let left, top
    
    // Show on side with more space (horizontal)
    if (spaceOnRight >= spaceOnLeft || spaceOnRight >= tooltipWidth) {
      left = mouseScreenX + 15
    } else {
      left = mouseScreenX - tooltipRect.width - 15
    }
    
    // Show on side with more space (vertical)
    if (spaceBelow >= spaceAbove || spaceBelow >= tooltipHeight) {
      // Show below
      top = mouseScreenY + 10
    } else {
      // Show above
      top = mouseScreenY - tooltipRect.height - 10
    }
    
    // Ensure tooltip doesn't go off screen
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10))
    top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10))

    return { left, top }
  }

  /**
   * Update tooltip position following mouse movement
   *
   * @param {MouseEvent} event - Mouse event
   * @param {HTMLElement} container - Container element
   * @param {HTMLElement} tooltip - Tooltip element
   *
   * @return {void}
   */
  const updateTooltipPosition = (event, container, tooltip) => {
    if (!tooltip || tooltip.style.display !== 'block') return

    const rect = container.getBoundingClientRect()
    const scrollLeft = container.scrollLeft || 0
    const scrollTop = container.scrollTop || 0
    const mouseX = event.clientX - rect.left + scrollLeft
    const mouseY = event.clientY - rect.top + scrollTop

    const { left, top } = calculateTooltipPosition(
      event,
      container,
      tooltip,
      mouseX,
      mouseY
    )

    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`
  }

  /**
   * Handle mouse entering an item
   *
   * @param {Object} item - Timeline item
   * @param {MouseEvent} event - Mouse event
   * @param {HTMLElement} overlay - Overlay element
   * @param {Function} showTooltip - Show tooltip function
   * @param {Function} onItemHover - Hover callback
   * @param {Object} isDraggingRef - Dragging state ref
   *
   * @return {void}
   */
  const handleItemEnter = (item, event, overlay, showTooltip, onItemHover, isDraggingRef) => {
    overlay.style.cursor = 'pointer'
    if (!isDraggingRef || !isDraggingRef.current) {
      showTooltip(item, event)
    }
    onItemHover && onItemHover(item, event)
  }

  /**
   * Handle mouse leaving an item (hide tooltip and reset cursor)
   *
   * @param {HTMLElement} overlay - Overlay element
   * @param {Function} hideTooltip - Function to hide tooltip
   * @param {Function} onMouseLeave - Leave callback
   *
   * @return {void}
   */
  const handleItemLeave = (overlay, hideTooltip, onMouseLeave, isDraggingRef) => {
    overlay.style.cursor = 'grab'
    if (!isDraggingRef || !isDraggingRef.current) {
      hideTooltip()
    }
    onMouseLeave && onMouseLeave()
  }

  /**
   * Handle mouse movement over canvas to detect item hover
   *
   * @param {MouseEvent} event - Mouse event
   *
   * @return {void}
   */
  const handleMouseMove = event => {
    // Don't show tooltip if dragging
    if (isDraggingRef && isDraggingRef.current) {
      return
    }
    
    const { x, y } = getMousePosition(event)
    const item = findItemAtPosition(x, y, layoutItems, getItemStyle)

    const itemChanged = item !== currentHoveredItem

    if (itemChanged) {
      currentHoveredItem = item

      if (item) {
        handleItemEnter(item, event, overlay, showTooltip, onItemHover, isDraggingRef)
      } else {
        handleItemLeave(overlay, hideTooltip, onMouseLeave, isDraggingRef)
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
      overlay.style.cursor = 'grab'
      if (!isDraggingRef || !isDraggingRef.current) {
        hideTooltip()
      }

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
        overlay.style.cursor = 'grab'

        if (onMouseLeave) {
          onMouseLeave()
        }
      }

      isScrolling = false
    })
  }

  /**
   * Handle mouse down to start drag-to-scroll
   *
   * @param {MouseEvent} e - Mouse event
   *
   * @return {void}
   */
  const handleDragMouseDown = (e) => {
    if (e.button !== 0) return
    
    isDraggingRef.current = true
    dragStartXRef.current = e.clientX
    dragStartYRef.current = e.clientY
    scrollLeftStartRef.current = container.scrollLeft
    scrollTopStartRef.current = container.scrollTop
    
    overlay.style.cursor = 'grabbing'
    overlay.style.userSelect = 'none'
    
    if (tooltip) {
      tooltip.style.display = 'none'
    }
  }

  /**
   * Handle mouse move during drag-to-scroll
   *
   * @param {MouseEvent} e - Mouse event
   *
   * @return {void}
   */
  const handleDragMouseMove = (e) => {
    if (!isDraggingRef.current) return
    
    const deltaX = e.clientX - dragStartXRef.current
    const deltaY = e.clientY - dragStartYRef.current
    
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      e.preventDefault()
      e.stopPropagation()
      
      container.scrollLeft = scrollLeftStartRef.current - deltaX
      container.scrollTop = scrollTopStartRef.current - deltaY
    }
  }

  /**
   * Handle mouse up to end drag-to-scroll
   *
   * @return {void}
   */
  const handleDragMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      overlay.style.cursor = 'grab'
      overlay.style.userSelect = ''
    }
  }

  /**
   * Create throttled wheel event handler for zoom
   *
   * @return {Function} Wheel event handler
   */
  const createWheelHandler = () => {
    const ZOOM_THROTTLE_MS = 16 // ~60fps
    let zoomRafId = null
    let lastZoomTime = 0

    return event => {
      // Skip if zoom handlers not available
      if (!handleZoom || typeof zoomLevel !== 'number' || 
          typeof maxZoomLevel !== 'number' || typeof minZoomLevel !== 'number') {
        return
      }

      event.preventDefault()

      const zoomDelta = -event.deltaY
      const isZoomingIn = zoomDelta > 0
      const isZoomingOut = zoomDelta < 0

      // Check zoom limits
      if ((isZoomingIn && zoomLevel >= maxZoomLevel) ||
          (isZoomingOut && zoomLevel <= minZoomLevel)) {
        return
      }

      // Throttle zoom calls
      const currentTime = Date.now()
      if (currentTime - lastZoomTime < ZOOM_THROTTLE_MS) {
        return
      }

      lastZoomTime = currentTime

      // Cancel previous animation frame if exists
      if (zoomRafId !== null) {
        cancelAnimationFrame(zoomRafId)
      }

      // Schedule zoom execution
      zoomRafId = requestAnimationFrame(() => {
        handleZoom(zoomDelta)
        zoomRafId = null
      })
    }
  }

  const handleWheel = createWheelHandler()

  overlay.addEventListener('mousemove', handleMouseMove)
  overlay.addEventListener('mouseleave', handleMouseLeave)
  overlay.addEventListener('mousedown', handleDragMouseDown)
  overlay.addEventListener('wheel', handleWheel, { passive: false })
  container.addEventListener('mousemove', handleDragMouseMove)
  container.addEventListener('mouseup', handleDragMouseUp)
  container.addEventListener('scroll', handleScrollThrottled, { passive: true })

  return () => {
    overlay.removeEventListener('mousemove', handleMouseMove)
    overlay.removeEventListener('mouseleave', handleMouseLeave)
    overlay.removeEventListener('mousedown', handleDragMouseDown)
    overlay.removeEventListener('wheel', handleWheel)
    container.removeEventListener('mousemove', handleDragMouseMove)
    container.removeEventListener('mouseup', handleDragMouseUp)
    container.removeEventListener('scroll', handleScrollThrottled)

    if (clickTimeout) {
      clearTimeout(clickTimeout)
    }

    if (scrollThrottleTimer) {
      cancelAnimationFrame(scrollThrottleTimer)
    }

    hideTooltip()
  }
}
