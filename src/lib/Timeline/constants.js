import { formatDate, formatDiffDate } from './utils/dateUtils'

const NOT_AVAILABLE = 'N/A'

const PROJECT_CHARTS = {
  MILESTONE: 'Milestone',
  WORKLOAD: 'Workload',
}

const ITEM_TYPES = {
  RANGE: 'range',
  MILESTONE: 'milestone',
}

const PROJECT_DETAIL_LEVEL = {
  NORMAL: 'normal',
  MEDIUM: 'medium',
  ULTRA_LOW: 'ultra-low',
}

const DEFAULT_CONFIG = {
  rowHeight: 44,
  itemHeight: 32,
  itemPadding: 16,
  pixelsPerDay: 4, // Width in pixels per day for timeline (compact view)
  minZoomLevel: 0.7,
  maxZoomLevel: 3,
  scrollSensitivity: 1,
  enableAutoScroll: true,
  enableCurrentDate: true,
  enableGrid: true,
  enableTooltip: true,
  minContentWidth: 800, // Minimum width for timeline content (px)
}

const STATUS_CONFIG = {
  'Delivery Planning': {
    backgroundColor: '#deebff',
    color: '#0647a6',
    order: 1,
  },
  'Delivery Finalized': {
    backgroundColor: '#deebff',
    color: '#0647a6',
    order: 2,
  },
  'Package Implementing': {
    backgroundColor: '#deebff',
    color: '#0647a6',
    order: 3,
  },
  'Package Resolved': {
    backgroundColor: '#deebff',
    color: '#0647a6',
    order: 4,
  },
  'Package Released': {
    backgroundColor: '#e3fcef',
    color: '#0b6644',
    order: 5,
  },
  Close: {
    backgroundColor: '#dfe1e5',
    color: '#42526e',
    order: 6,
  },
  Cancel: {
    backgroundColor: '#dfe1e5',
    color: '#42526e',
    order: 7,
  },
}

const DEFAULT_STATUS_CONFIG = {
  backgroundColor: '#dfe1e5',
  color: '#42526e',
}

const TOOLTIP_FIELDS = [
  { label: 'Start', getValue: item => formatDate(item.startDateBefore) },
  { label: 'End', getValue: item => formatDate(item.dueDateBefore) },
  { label: 'Status', getValue: item => item.status || NOT_AVAILABLE },
  { label: 'Duration', getValue: item => formatDiffDate(item.duration, true) },
  { label: 'Resolved', getValue: item => formatDate(item.resolvedDate) },
  {
    label: 'Late time',
    getValue: item => formatDiffDate(item.lateTime),
    getColor: item => {
      if (item.lateTime === undefined) return ''
      return item.lateTime < 0 ? 'text-danger' : 'text-success'
    },
  },
]

const ALL_PROJECTS = 'All'

const CHART_WORKLOAD_MODES = {
  HEAD_COUNT: 'Head Count',
  MM_MONTHS: 'MM',
}

const MODE_CONFIG = {
  [CHART_WORKLOAD_MODES.HEAD_COUNT]: {
    actualKey: 'actualHeadCount',
    planKey: 'planHeadCount',
  },
  [CHART_WORKLOAD_MODES.MM_MONTHS]: {
    actualKey: 'actualManMonth',
    planKey: 'planManMonth',
  },
}

const CHART_COLORS = {
  ACTUAL: '#629c44',
  PLAN: '#3d8af7',
}

const CANVAS_RENDERING = {
  MILESTONE_SIZE: 24,
  MILESTONE_CENTER_DOT_RADIUS: 4,
  MILESTONE_LABEL_MAX_WIDTH: 120,
  MILESTONE_LABEL_PADDING: 8,
  MILESTONE_LABEL_HEIGHT: 20,
  MILESTONE_LABEL_OFFSET: 18,
  FONT_FAMILY:
    "500 13px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  INDICATOR_MAX_SIZE: 12,
  INDICATOR_SCALE_FACTOR: 0.4,
}

export {
  NOT_AVAILABLE,
  PROJECT_CHARTS,
  PROJECT_DETAIL_LEVEL,
  ITEM_TYPES,
  DEFAULT_CONFIG,
  STATUS_CONFIG,
  DEFAULT_STATUS_CONFIG,
  TOOLTIP_FIELDS,
  ALL_PROJECTS,
  CHART_WORKLOAD_MODES,
  MODE_CONFIG,
  CHART_COLORS,
  CANVAS_RENDERING,
}
