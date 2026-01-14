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
 * Check if point is inside milestone diamond or its label
 */
const isPointInMilestone = (x, y, style, item) => {
  const left = parseFloat(style.left);
  const top = parseFloat(style.top);
  const size = 20;
  const centerX = left;
  const centerY = top + 15;
  
  // Check diamond (simple bounding box)
  const inDiamond = Math.abs(x - centerX) + Math.abs(y - centerY) <= size / 2;
  
  if (inDiamond) return true;
  
  // Check label area below diamond (extended hit area)
  const labelY = centerY + size / 2 + 18; // Same as in renderer
  const labelHeight = 18; // Pill height
  const labelWidth = 120; // Max width
  
  const labelLeft = centerX - labelWidth / 2;
  const labelRight = centerX + labelWidth / 2;
  const labelTop = labelY - 2; // Pill top
  const labelBottom = labelTop + labelHeight;
  
  return x >= labelLeft && x <= labelRight && y >= labelTop && y <= labelBottom;
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

    // Check milestone (dùng _originallyMilestone từ normalizeTimelineItem)
    if (item._originallyMilestone) {
      if (isPointInMilestone(x, y, style, item)) {
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
    const scrollLeft = container.scrollLeft || 0;
    const scrollTop = container.scrollTop || 0;
    const mouseX = event.clientX - rect.left + scrollLeft;
    const mouseY = event.clientY - rect.top + scrollTop;

    // Update tooltip content
    const titleEl = tooltip.querySelector('.tooltip-title');
    const detailsEl = tooltip.querySelector('.tooltip-details');
    
    if (titleEl) {
      titleEl.textContent = item.name || 'Untitled';
    }
    
    if (detailsEl) {
      const moment = require('moment');
      const status = item.status || 'Unknown';
      const progress = item.progress !== undefined ? `${item.progress}%` : 'N/A';
      
      // Check if this is a milestone (originally missing dates)
      if (item._originallyMilestone) {
        const createdDate = item.createdDate ? moment(item.createdDate).format('MMM DD, YYYY') : 'N/A';
        detailsEl.innerHTML = `
          <div class="tooltip-row"><span class="tooltip-label">Type:</span> <span class="tooltip-value">Milestone</span></div>
          <div class="tooltip-row"><span class="tooltip-label">Status:</span> <span class="tooltip-value">${status}</span></div>
          <div class="tooltip-row"><span class="tooltip-label">Created:</span> <span class="tooltip-value">${createdDate}</span></div>
        `;
      } else {
        // Range item - show start and due dates
        const startDate = item.startDate ? moment(item.startDate).format('MMM DD, YYYY') : 'N/A';
        const dueDate = item.dueDate ? moment(item.dueDate).format('MMM DD, YYYY') : 'N/A';
        const duration = item.duration !== undefined ? `${item.duration} days` : 'N/A';
        
        detailsEl.innerHTML = `
          <div class="tooltip-row"><span class="tooltip-label">Type:</span> <span class="tooltip-value">Range</span></div>
          <div class="tooltip-row"><span class="tooltip-label">Status:</span> <span class="tooltip-value">${status}</span></div>
          <div class="tooltip-row"><span class="tooltip-label">Start:</span> <span class="tooltip-value">${startDate}</span></div>
          <div class="tooltip-row"><span class="tooltip-label">Due:</span> <span class="tooltip-value">${dueDate}</span></div>
          <div class="tooltip-row"><span class="tooltip-label">Duration:</span> <span class="tooltip-value">${duration}</span></div>
          <div class="tooltip-row"><span class="tooltip-label">Progress:</span> <span class="tooltip-value">${progress}</span></div>
        `;
      }
    }

    // Position tooltip
    tooltip.style.display = 'block';
    tooltip.style.opacity = '0';

    // Wait for render to get dimensions
    requestAnimationFrame(() => {
      const tooltipRect = tooltip.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate position relative to viewport (client coordinates)
      const clientX = event.clientX - containerRect.left;
      const clientY = event.clientY - containerRect.top;
      
      let left = mouseX + 15;
      let top = mouseY + 10;

      // Adjust if tooltip goes off-screen to the right (check against viewport)
      if (clientX + 15 + tooltipRect.width > containerRect.width) {
        left = mouseX - tooltipRect.width - 15;
      }

      // Adjust if tooltip goes off-screen to the bottom (check against viewport)
      if (clientY + 10 + tooltipRect.height > containerRect.height) {
        top = mouseY - tooltipRect.height - 10;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
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
      const scrollLeft = container.scrollLeft || 0;
      const scrollTop = container.scrollTop || 0;
      const mouseX = event.clientX - rect.left + scrollLeft;
      const mouseY = event.clientY - rect.top + scrollTop;
      
      if (tooltip && tooltip.style.display === 'block') {
        const tooltipRect = tooltip.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate position relative to viewport (client coordinates)
        const clientX = event.clientX - containerRect.left;
        const clientY = event.clientY - containerRect.top;
        
        let left = mouseX + 15;
        let top = mouseY + 10;

        if (clientX + 15 + tooltipRect.width > containerRect.width) {
          left = mouseX - tooltipRect.width - 15;
        }
        if (clientY + 10 + tooltipRect.height > containerRect.height) {
          top = mouseY - tooltipRect.height - 10;
        }

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
