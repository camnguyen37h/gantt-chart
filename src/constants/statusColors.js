/**
 * Status Color Palette
 * 30 predefined colors based on international chart color standards
 * Optimized for visibility, accessibility, and color-blind friendly
 * Sources: Material Design, D3.js Category schemes, Chart.js defaults
 */

export const STATUS_COLORS = [
  // Primary vibrant colors (Material Design + Chart.js)
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#F44336', // Red
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#E91E63', // Pink
  '#FF5722', // Deep Orange
  '#3F51B5', // Indigo
  '#8BC34A', // Light Green
  
  // Secondary balanced colors (D3 Category)
  '#1f77b4', // D3 Blue
  '#ff7f0e', // D3 Orange
  '#2ca02c', // D3 Green
  '#d62728', // D3 Red
  '#9467bd', // D3 Purple
  '#8c564b', // D3 Brown
  '#e377c2', // D3 Pink
  '#7f7f7f', // D3 Gray
  '#bcbd22', // D3 Olive
  '#17becf', // D3 Cyan
  
  // Tertiary soft colors (Material lighter tones)
  '#64B5F6', // Light Blue
  '#81C784', // Light Green
  '#FFB74D', // Light Orange
  '#E57373', // Light Red
  '#BA68C8', // Light Purple
  '#4DB6AC', // Light Teal
  '#F06292', // Light Pink
  '#FFD54F', // Amber
  '#7986CB', // Light Indigo
  '#AED581', // Lime
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
