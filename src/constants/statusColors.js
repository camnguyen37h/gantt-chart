/**
 * Status Color Palette
 * Optimized: 11 completely distinct hues, modern, vibrant
 * Based on popular chart libraries + modern design trends
 * No color family repetition, high visual contrast
 * Avoids red/pink tones to prevent confusion with error/late status indicators
 */

export const STATUS_COLORS = [
  // Top 11: DISTINCT HUES - Each color family appears only once
  '#2196F3', // 1. Blue (most popular)
  '#4CAF50', // 2. Green (success)
  '#FF9800', // 3. Orange (attention)
  '#9C27B0', // 4. Purple (premium)
  '#00BCD4', // 5. Cyan (modern)
  '#FFEB3B', // 6. Yellow (optimistic - brighter than amber)
  '#607D8B', // 7. Blue Gray (neutral)
  '#00897B', // 8. Teal (balanced - darker, distinct from cyan)
  '#FFA000', // 9. Amber (warm gold - between orange and yellow)
  '#CDDC39', // 10. Lime (energetic - distinct from green/yellow)
  '#FF6F00', // 11. Deep Orange (bold - distinct from orange)
  
  // 12-20: Darker variants (700 level) - same order as top 11
  '#1976D2', // Blue 700
  '#388E3C', // Green 700
  '#F57C00', // Orange 700
  '#7B1FA2', // Purple 700
  '#0097A7', // Cyan 700
  '#FBC02D', // Yellow 700
  '#546E7A', // Blue Gray 700
  '#00695C', // Teal 700
  '#FF8F00', // Amber 700 (darker gold)
  '#AFB42B', // Lime 700
  '#E65100', // Deep Orange 700
  
  // 21-30: Lighter variants (600/400 level) - same order as top 11
  '#0288D1', // Blue 600
  '#43A047', // Green 600
  '#FB8C00', // Orange 600
  '#8E24AA', // Purple 600
  '#00ACC1', // Cyan 600
  '#FDD835', // Yellow 600
  '#78909C', // Blue Gray 400
  '#26A69A', // Teal 400
  '#FFB300', // Amber 600 (light gold)
  '#D4E157', // Lime 400
  '#F4511E', // Deep Orange 600
];

export const DEFAULT_STATUS_COLOR = '#bfbfbf'; // Gray for > 30 statuses

/**
 * Get color for status
 * @param {string} status - Status name
 * @param {Object} statusColorMap - Map of status to color index
 * @returns {string} Hex color
 */
export const getStatusColor = (status, statusColorMap) => {
  if (!status) {
    return DEFAULT_STATUS_COLOR;
  }
  
  if (statusColorMap && statusColorMap[status] !== undefined) {
    const colorIndex = statusColorMap[status];
    if (colorIndex < STATUS_COLORS.length) {
      return STATUS_COLORS[colorIndex];
    }
  }
  
  return DEFAULT_STATUS_COLOR;
};

/**
 * Build status to color index map
 * @param {Array} statuses - Array of unique status strings
 * @returns {Object} Map of status to color index
 */
export const buildStatusColorMap = (statuses) => {
  const map = {};
  
  if (!statuses || !Array.isArray(statuses)) {
    return map;
  }
  
  statuses.forEach((status, index) => {
    if (status && typeof status === 'string') {
      map[status] = index;
    }
  });
  
  return map;
};
