/**
 * Timeline Data Processing Utilities
 * High-performance data normalization and calculations
 */

import moment from 'moment';

/**
 * Normalize timeline item from API response
 * @param {Object} item - API response item
 * @returns {Object} Normalized item
 */
export const normalizeTimelineItem = (item) => {
  if (!item) {
    return null;
  }
  
  const { issueId, issueName, startDate, dueDate, resolvedDate, createdDate, status } = item;
  
  // Validate required fields
  if (!issueId || !issueName) {
    return null;
  }
  
  let normalizedStartDate = startDate;
  let normalizedDueDate = dueDate;
  
  // Case: both startDate and dueDate are null, but createdDate exists
  if (!startDate && !dueDate && createdDate) {
    const created = moment(createdDate);
    normalizedStartDate = created.clone().subtract(1, 'day').format('YYYY-MM-DD');
    normalizedDueDate = created.clone().add(1, 'day').format('YYYY-MM-DD');
  }
  
  // Validate we have dates
  if (!normalizedStartDate || !normalizedDueDate) {
    return null;
  }
  
  // Calculate duration (days between startDate and dueDate)
  const duration = calculateDuration(normalizedStartDate, normalizedDueDate);
  
  // Calculate lateTime (days late from dueDate to resolvedDate)
  const lateTime = calculateLateTime(normalizedDueDate, resolvedDate);
  
  return {
    id: issueId,
    name: issueName,
    startDate: normalizedStartDate,
    endDate: normalizedDueDate, // Use endDate for timeline consistency
    resolvedDate: resolvedDate || null,
    createdDate: createdDate || null,
    status: status || 'Unknown',
    duration: duration,
    lateTime: lateTime,
    progress: calculateProgress(normalizedStartDate, normalizedDueDate, resolvedDate)
  };
};

/**
 * Calculate duration between start and due date
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} dueDate - Due date (YYYY-MM-DD)
 * @returns {number} Duration in days
 */
export const calculateDuration = (startDate, dueDate) => {
  if (!startDate || !dueDate) {
    return 0;
  }
  
  const start = moment(startDate);
  const due = moment(dueDate);
  
  if (!start.isValid() || !due.isValid()) {
    return 0;
  }
  
  const duration = due.diff(start, 'days');
  return duration >= 0 ? duration : 0;
};

/**
 * Calculate late time (days overdue)
 * @param {string} dueDate - Due date (YYYY-MM-DD)
 * @param {string} resolvedDate - Resolved date (YYYY-MM-DD)
 * @returns {number} Late days (0 if not late or no resolvedDate)
 */
export const calculateLateTime = (dueDate, resolvedDate) => {
  if (!dueDate || !resolvedDate) {
    return 0;
  }
  
  const due = moment(dueDate);
  const resolved = moment(resolvedDate);
  
  if (!due.isValid() || !resolved.isValid()) {
    return 0;
  }
  
  const lateDays = resolved.diff(due, 'days');
  return lateDays > 0 ? lateDays : 0;
};

/**
 * Calculate progress percentage
 * @param {string} startDate - Start date
 * @param {string} dueDate - Due date
 * @param {string} resolvedDate - Resolved date (optional)
 * @returns {number} Progress 0-100
 */
export const calculateProgress = (startDate, dueDate, resolvedDate) => {
  if (!startDate || !dueDate) {
    return 0;
  }
  
  // If resolved, 100%
  if (resolvedDate) {
    return 100;
  }
  
  const start = moment(startDate);
  const due = moment(dueDate);
  const now = moment();
  
  if (!start.isValid() || !due.isValid()) {
    return 0;
  }
  
  // Not started yet
  if (now.isBefore(start)) {
    return 0;
  }
  
  // Overdue
  if (now.isAfter(due)) {
    return 100;
  }
  
  // In progress
  const total = due.diff(start, 'days');
  const elapsed = now.diff(start, 'days');
  
  if (total <= 0) {
    return 0;
  }
  
  const progress = Math.round((elapsed / total) * 100);
  return Math.min(100, Math.max(0, progress));
};

/**
 * Extract unique statuses from items and sort A-Z
 * @param {Array} items - Array of timeline items
 * @returns {Array} Sorted unique statuses
 */
export const extractUniqueStatuses = (items) => {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  const statusSet = new Set();
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.status && typeof item.status === 'string') {
      statusSet.add(item.status);
    }
  }
  
  const uniqueStatuses = Array.from(statusSet);
  uniqueStatuses.sort((a, b) => a.localeCompare(b));
  
  return uniqueStatuses;
};

/**
 * Normalize array of timeline items (performance optimized)
 * @param {Array} apiData - Array of API response items
 * @returns {Array} Array of normalized items
 */
export const normalizeTimelineData = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }
  
  const normalized = [];
  
  for (let i = 0; i < apiData.length; i++) {
    const item = normalizeTimelineItem(apiData[i]);
    if (item) {
      normalized.push(item);
    }
  }
  
  return normalized;
};

/**
 * Filter items by status
 * @param {Array} items - Timeline items
 * @param {string} status - Status to filter
 * @returns {Array} Filtered items
 */
export const filterByStatus = (items, status) => {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  if (!status || status === 'all') {
    return items;
  }
  
  const filtered = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.status === status) {
      filtered.push(item);
    }
  }
  
  return filtered;
};

/**
 * Filter items by visible statuses
 * @param {Array} items - Timeline items
 * @param {Object} visibleStatuses - Map of status visibility
 * @returns {Array} Filtered items
 */
export const filterByVisibleStatuses = (items, visibleStatuses) => {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  if (!visibleStatuses || typeof visibleStatuses !== 'object') {
    return items;
  }
  
  const hasHiddenStatus = Object.values(visibleStatuses).some(v => v === false);
  
  if (!hasHiddenStatus) {
    return items;
  }
  
  const filtered = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.status && visibleStatuses[item.status] !== false) {
      filtered.push(item);
    }
  }
  
  return filtered;
};
