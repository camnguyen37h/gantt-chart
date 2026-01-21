/**
 * Timeline Library Constants
 * Centralized configuration for timeline components
 */
import { formatDate, formatDiffDate } from './utils/dateUtils';

export const PROJECT_CHARTS = {
  MILESTONE: 'Milestone',
  WORKLOAD: 'Workload',
}

export const DEFAULT_CONFIG = {
  rowHeight: 75,
  itemHeight: 34,
  itemPadding: 15,
  pixelsPerDay: 8, // Width in pixels per day for timeline (compact view)
  minZoomLevel: 0.5,
  maxZoomLevel: 3,
  scrollSensitivity: 1,
  enableAutoScroll: true,
  enableCurrentDate: true,
  enableGrid: true,
  enableTooltip: true,
  minContentWidth: 1200 // Minimum width for timeline content (px)
};

export const COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#13c2c2',
  purple: '#722ed1',
  magenta: '#eb2f96',
  
  // Status colors (phân biệt rõ với error/warning)
  planning: '#69c0ff',      // Blue light - Planning
  finalized: '#597ef7',     // Blue - Finalized/Approved
  implementing: '#ff9c6e',  // Orange coral - In Progress (tránh trùng warning)
  resolved: '#52c41a',      // Green - Completed/Resolved
  released: '#9254de',      // Purple - Released/Deployed (tránh trùng magenta)
  noStart: '#8c8c8c',       // Gray dark - Not Started (dễ phân biệt hơn)
  
  // UI colors
  currentDate: '#e44258',
  gridLine: '#f0f0f0',
  border: '#d9d9d9',
  background: '#ffffff',
  hover: '#e6f7ff'
};

export const DATE_FORMATS = {
  display: 'DD MMM YYYY',
  short: 'DD MMM',
  monthYear: 'MMMM YYYY',
  dayMonth: 'D MMM',
  input: 'YYYY-MM-DD',
  tooltip: 'ddd, DD MMM YYYY'
};

export const INTERACTIONS = {
  CLICK: 'click',
  DOUBLE_CLICK: 'doubleClick',
  DRAG: 'drag',
  RESIZE: 'resize',
  HOVER: 'hover',
  CONTEXT_MENU: 'contextMenu'
};

export const TOOLTIP_FIELDS = [
  { label: 'Start', getValue: item => formatDate(item.startDate) },
  { label: 'End', getValue: item => formatDate(item.dueDate) },
  { label: 'Status', getValue: item => item.status || 'N/A' },
  { label: 'Duration', getValue: item => formatDiffDate(item.duration, true) },
  { label: 'Resolved', getValue: item => formatDate(item.resolvedDate) },
  { label: 'Late time', getValue: item => formatDiffDate(item.lateTime) },
]
