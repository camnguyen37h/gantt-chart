/**
 * Timeline Library - Main Export
 * Central export point for the timeline library
 */

// Main Component
export { default as Timeline } from './components/Timeline';

// Sub-components
export { default as TimelineLegend } from './components/TimelineLegend';

// Hooks
export { useTimeline } from './hooks/useTimeline';

// Utils
export * from './utils/dateUtils';
export * from './utils/layoutUtils';
export * from './utils/itemUtils';

// Constants
export * from './constants';
