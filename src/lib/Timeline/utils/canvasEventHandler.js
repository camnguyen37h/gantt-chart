/**
 * Canvas Event Handler
 * Handles mouse events for canvas timeline
 */

/**
 * Check if point is inside rectangle
 */
const isPointInRect = (x, y, rect) => {
  const left = parseFloat(rect.left);
  const top = parseFloat(rect.top);
  const width = parseFloat(rect.width);
  const height = parseFloat(rect.height);
  
  return x >= left && x <= left + width && y >= top && y <= top + height;
};

/**
 * Check if point is inside milestone diamond
 */
const isPointInMilestone = (x, y, style) => {
  const left = parseFloat(style.left);
  const top = parseFloat(style.top);
  const size = 20;
  const centerX = left;
  const centerY = top + 15;
  
  // Simple bounding box check for diamond
  return Math.abs(x - centerX) + Math.abs(y - centerY) <= size / 2;
};

/**
 * Find item at mouse position
 */
const findItemAtPosition = (x, y, layoutItems, getItemStyle) => {
  // Iterate in reverse to check top items first (higher z-index)
  for (let i = layoutItems.length - 1; i >= 0; i--) {
    const item = layoutItems[i];
    const style = getItemStyle(item);
    
    if (!style) continue;

    // Check milestone
    if (item._isMilestone || (!item.endDate && !item.end)) {
      if (isPointInMilestone(x, y, style)) {
        return item;
      }
    } else {
      // Check range item
      if (isPointInRect(x, y, style)) {
        return item;
      }
    }
  }
  
  return null;
};

/**
 * Setup canvas event handlers
 * @param {Object} options - Event handler options
 * @returns {Function} Cleanup function
 */
export const handleCanvasEvents = (options) => {
  const {
    overlay,
    container,
    tooltip,
    layoutItems,
    getItemStyle,
    onItemClick,
    onItemDoubleClick,
    onItemHover,
    onMouseLeave
  } = options;

  let currentHoveredItem = null;
  let clickTimeout = null;

  /**
   * Get mouse position relative to container
   */
  const getMousePosition = (event) => {
    const rect = overlay.getBoundingClientRect();
    const scrollLeft = container.scrollLeft || 0;
    const scrollTop = container.scrollTop || 0;
    
    return {
      x: event.clientX - rect.left + scrollLeft,
      y: event.clientY - rect.top + scrollTop
    };
  };

  /**
   * Show tooltip
   */
  const showTooltip = (item, event) => {
    if (!tooltip) return;

    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Update tooltip content
    const titleEl = tooltip.querySelector('.tooltip-title');
    const detailsEl = tooltip.querySelector('.tooltip-details');
    
    if (titleEl) {
      titleEl.textContent = item.name || 'Untitled';
    }
    
    if (detailsEl) {
      const moment = require('moment');
      const startDate = item.startDate ? moment(item.startDate).format('MMM DD, YYYY') : 'N/A';
      const endDate = item.endDate ? moment(item.endDate).format('MMM DD, YYYY') : 'N/A';
      const status = item.status || 'Unknown';
      const progress = item.progress !== undefined ? `${item.progress}%` : 'N/A';
      
      detailsEl.innerHTML = `
        <div class="tooltip-row"><span class="tooltip-label">Status:</span> <span class="tooltip-value">${status}</span></div>
        <div class="tooltip-row"><span class="tooltip-label">Start:</span> <span class="tooltip-value">${startDate}</span></div>
        <div class="tooltip-row"><span class="tooltip-label">End:</span> <span class="tooltip-value">${endDate}</span></div>
        <div class="tooltip-row"><span class="tooltip-label">Progress:</span> <span class="tooltip-value">${progress}</span></div>
      `;
    }

    // Position tooltip
    tooltip.style.display = 'block';
    tooltip.style.opacity = '0';

    // Wait for render to get dimensions
    requestAnimationFrame(() => {
      const tooltipRect = tooltip.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      let left = mouseX + 15;
      let top = mouseY + 10;

      // Adjust if tooltip goes off-screen to the right
      if (left + tooltipRect.width > containerRect.width) {
        left = mouseX - tooltipRect.width - 15;
      }

      // Adjust if tooltip goes off-screen to the bottom
      if (top + tooltipRect.height > containerRect.height) {
        top = mouseY - tooltipRect.height - 10;
      }

      // Keep tooltip within bounds
      left = Math.max(10, Math.min(left, containerRect.width - tooltipRect.width - 10));
      top = Math.max(10, Math.min(top, containerRect.height - tooltipRect.height - 10));

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      hideTooltip();
      tooltip.style.opacity = '1';
    });
  };

  /**
   * Hide tooltip
   */
  const hideTooltip = () => {
    if (!tooltip) return;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  };

  /**
   * Handle mouse move
   */
  const handleMouseMove = (event) => {
    const { x, y } = getMousePosition(event);
    const item = findItemAtPosition(x, y, layoutItems, getItemStyle);

    if (item !== currentHoveredItem) {
      currentHoveredItem = item;
      
      if (item) {
        overlay.style.cursor = 'pointer';
        showTooltip(item, event);
        if (onItemHover) {
          onItemHover(item, event);
        }
      } else {
        overlay.style.cursor = 'default';
        hideTooltip();
        if (onMouseLeave) {
          onMouseLeave();
        }
      }
    } else if (item) {
      // Update tooltip position on mouse move
      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      if (tooltip && tooltip.style.display === 'block') {
        const tooltipRect = tooltip.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        let left = mouseX + 15;
        let top = mouseY + 10;

        if (left + tooltipRect.width > containerRect.width) {
          left = mouseX - tooltipRect.width - 15;
        }
        if (top + tooltipRect.height > containerRect.height) {
          top = mouseY - tooltipRect.height - 10;
        }

        left = Math.max(10, Math.min(left, containerRect.width - tooltipRect.width - 10));
        top = Math.max(10, Math.min(top, containerRect.height - tooltipRect.height - 10));

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      }
    }
  };

  /**
   * Handle mouse click
   */
  const handleClick = (event) => {
    const { x, y } = getMousePosition(event);
    const item = findItemAtPosition(x, y, layoutItems, getItemStyle);

    if (!item) return;

    // Distinguish between single and double click
    if (clickTimeout) {
      // Double click
      clearTimeout(clickTimeout);
      clickTimeout = null;
      
      if (onItemDoubleClick) {
        onItemDoubleClick(item);
      }
    } else {
      // Potential single click - wait to see if double click follows
      clickTimeout = setTimeout(() => {
        clickTimeout = null;
        
        if (onItemClick) {
          onItemClick(item);
        }
      }, 250);
    }
  };

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = () => {
    if (currentHoveredItem) {
      currentHoveredItem = null;
      overlay.style.cursor = 'default';
      
      if (onMouseLeave) {
        onMouseLeave();
      }
    }
  };

  // Attach event listeners
  overlay.addEventListener('mousemove', handleMouseMove);
  overlay.addEventListener('click', handleClick);
  overlay.addEventListener('mouseleave', handleMouseLeave);

  // Cleanup function
  return () => {
    overlay.removeEventListener('mousemove', handleMouseMove);
    overlay.removeEventListener('click', handleClick);
    overlay.removeEventListener('mouseleave', handleMouseLeave);
    
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }
  };
};
