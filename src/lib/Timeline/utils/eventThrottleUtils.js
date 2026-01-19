/**
 * Performance Utilities
 * Helper functions for performance optimization
 */

/**
 * Throttle function execution using requestAnimationFrame
 * PERFORMANCE: Limits function calls to animation frame rate (~60fps)
 * Better than setTimeout for visual updates
 * 
 * @param {Function} callback - Function to throttle
 * @returns {Function} Throttled function
 */
export const createRAFThrottle = (callback) => {
  let isScheduled = false;

  return function throttled(...args) {
    if (isScheduled) {
      return; // Skip if already scheduled
    }

    isScheduled = true;

    requestAnimationFrame(() => {
      callback.apply(this, args);
      isScheduled = false;
    });
  };
};

/**
 * Throttle function execution with time-based delay
 * PERFORMANCE: Limits function calls to once per specified milliseconds
 * 
 * @param {Function} callback - Function to throttle
 * @param {number} delay - Minimum milliseconds between calls
 * @returns {Function} Throttled function
 */
export const createThrottle = (callback, delay = 16) => {
  let lastTime = 0;
  let timeoutId = null;

  return function throttled(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastTime;

    if (timeSinceLastCall >= delay) {
      lastTime = now;
      callback.apply(this, args);
    } else {
      // Schedule for the remaining time
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        callback.apply(this, args);
        timeoutId = null;
      }, delay - timeSinceLastCall);
    }
  };
};

/**
 * Debounce function execution
 * PERFORMANCE: Delays function call until after specified quiet period
 * 
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export const createDebounce = (callback, delay = 300) => {
  let timeoutId = null;

  return function debounced(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback.apply(this, args);
      timeoutId = null;
    }, delay);
  };
};

/**
 * Batch multiple function calls into single execution
 * PERFORMANCE: Useful for batching multiple state updates
 * 
 * @param {Function} callback - Function to batch
 * @returns {Function} Batched function
 */
export const createBatch = (callback) => {
  let rafId = null;
  let calls = [];

  return function batched(...args) {
    calls.push(args);

    if (rafId !== null) {
      return; // Already scheduled
    }

    rafId = requestAnimationFrame(() => {
      const allCalls = calls;
      calls = [];
      rafId = null;

      // Execute with latest arguments
      if (allCalls.length > 0) {
        const latestArgs = allCalls[allCalls.length - 1];
        callback.apply(this, latestArgs);
      }
    });
  };
};

/**
 * Passive event listener options for better scroll performance
 * PERFORMANCE: Tells browser the listener won't call preventDefault()
 */
export const PASSIVE_LISTENER = { passive: true };

/**
 * Non-passive event listener options (for events that need preventDefault)
 */
export const ACTIVE_LISTENER = { passive: false };
