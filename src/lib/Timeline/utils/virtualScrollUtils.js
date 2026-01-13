/**
 * Virtual Scrolling Manager
 * Handles viewport calculation and visible items detection
 * Optimized for million-scale datasets
 */

/**
 * Calculate visible range based on viewport
 * @param {Object} params - Configuration parameters
 * @param {number} params.scrollTop - Current scroll position
 * @param {number} params.containerHeight - Viewport height
 * @param {number} params.rowHeight - Height of each row
 * @param {number} params.totalRows - Total number of rows
 * @param {number} params.overscan - Number of extra rows to render (default: 5)
 * @returns {Object} {startRow, endRow, visibleRows}
 */
export const calculateVisibleRange = (params) => {
  const scrollTop = params.scrollTop || 0;
  const containerHeight = params.containerHeight || 600;
  const rowHeight = params.rowHeight || 40;
  const totalRows = params.totalRows || 0;
  const overscan = params.overscan || 5;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleRowCount = Math.ceil(containerHeight / rowHeight);
  const endRow = Math.min(totalRows, startRow + visibleRowCount + overscan * 2);

  return {
    startRow,
    endRow,
    visibleRows: endRow - startRow
  };
};

/**
 * Filter items within visible rows
 * @param {Array} items - All timeline items with row property
 * @param {number} startRow - First visible row
 * @param {number} endRow - Last visible row
 * @returns {Array} Filtered items within visible range
 */
export const getVisibleItems = (items, startRow, endRow) => {
  if (!items || items.length === 0) {
    return [];
  }

  const visibleItems = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const row = item.row;
    
    if (typeof row === 'number' && row >= startRow && row < endRow) {
      visibleItems.push(item);
    }
  }

  return visibleItems;
};

/**
 * Calculate horizontal visible range based on scroll position
 * @param {Object} params - Configuration parameters
 * @param {number} params.scrollLeft - Horizontal scroll position
 * @param {number} params.containerWidth - Viewport width
 * @param {number} params.totalWidth - Total timeline width
 * @param {number} params.pixelsPerDay - Pixels per day
 * @returns {Object} {startPixel, endPixel}
 */
export const calculateHorizontalRange = (params) => {
  const scrollLeft = params.scrollLeft || 0;
  const containerWidth = params.containerWidth || 1200;
  const totalWidth = params.totalWidth || 0;
  const overscanPixels = (params.pixelsPerDay || 40) * 30; // 30 days overscan

  const startPixel = Math.max(0, scrollLeft - overscanPixels);
  const endPixel = Math.min(totalWidth, scrollLeft + containerWidth + overscanPixels);

  return {
    startPixel,
    endPixel
  };
};

/**
 * Filter items within horizontal viewport
 * @param {Array} items - Timeline items
 * @param {number} startPixel - Start of visible range
 * @param {number} endPixel - End of visible range
 * @param {Function} getItemPosition - Function to get item's left position
 * @param {Function} getItemWidth - Function to get item's width
 * @returns {Array} Items within horizontal range
 */
export const getHorizontallyVisibleItems = (items, startPixel, endPixel, getItemPosition, getItemWidth) => {
  if (!items || items.length === 0) {
    return items;
  }

  const visibleItems = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemLeft = getItemPosition(item);
    const itemWidth = getItemWidth(item);
    const itemRight = itemLeft + itemWidth;

    // Check if item overlaps with visible range
    if (itemRight >= startPixel && itemLeft <= endPixel) {
      visibleItems.push(item);
    }
  }

  return visibleItems;
};

/**
 * Chunk array into smaller pieces for processing
 * @param {Array} array - Array to chunk
 * @param {number} chunkSize - Size of each chunk
 * @returns {Array} Array of chunks
 */
export const chunkArray = (array, chunkSize) => {
  if (!array || array.length === 0) {
    return [];
  }

  const chunks = [];
  const size = Math.max(1, chunkSize || 1000);

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
};

/**
 * Process large dataset in chunks with callback
 * @param {Array} data - Large dataset
 * @param {number} chunkSize - Size of each chunk
 * @param {Function} processor - Function to process each chunk
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise} Resolves with processed results
 */
export const processInChunks = async (data, chunkSize, processor, onProgress) => {
  if (!data || data.length === 0) {
    return [];
  }

  const chunks = chunkArray(data, chunkSize);
  const results = [];
  const totalChunks = chunks.length;

  for (let i = 0; i < totalChunks; i++) {
    const chunk = chunks[i];
    const chunkResult = processor(chunk, i);
    
    if (Array.isArray(chunkResult)) {
      results.push(...chunkResult);
    } else {
      results.push(chunkResult);
    }

    if (onProgress && typeof onProgress === 'function') {
      onProgress({
        current: i + 1,
        total: totalChunks,
        percentage: ((i + 1) / totalChunks) * 100
      });
    }

    // Allow UI to breathe between chunks
    if (i < totalChunks - 1) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return results;
};

/**
 * Estimate memory usage for dataset
 * @param {Array} items - Timeline items
 * @returns {Object} Memory estimate in bytes and MB
 */
export const estimateMemoryUsage = (items) => {
  if (!items || items.length === 0) {
    return { bytes: 0, megabytes: 0 };
  }

  // Rough estimate: 1KB per item (includes object overhead)
  const bytesPerItem = 1024;
  const totalBytes = items.length * bytesPerItem;
  const totalMB = totalBytes / (1024 * 1024);

  return {
    bytes: totalBytes,
    megabytes: Math.round(totalMB * 100) / 100
  };
};
