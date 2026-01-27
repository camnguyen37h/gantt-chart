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

const DEFAULT_CONFIG = {
  rowHeight: 80,
  itemHeight: 34,
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

const STATUS_COLORS = [
  '#2196F3',
  '#4CAF50',
  '#FF9800',
  '#9C27B0',
  '#00BCD4',
  '#FFEB3B',
  '#607D8B',
  '#00897B',
  '#FFA000',
  '#CDDC39',
  '#FF6F00',
  '#1976D2',
  '#388E3C',
  '#F57C00',
  '#7B1FA2',
  '#0097A7',
  '#FBC02D',
  '#546E7A',
  '#00695C',
  '#FF8F00',
  '#AFB42B',
  '#E65100',
  '#0288D1',
  '#43A047',
  '#FB8C00',
  '#8E24AA',
  '#00ACC1',
  '#FDD835',
  '#78909C',
  '#26A69A',
  '#FFB300',
  '#D4E157',
  '#F4511E',
]

const DEFAULT_STATUS_COLOR = '#bfbfbf'

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
}

export {
  NOT_AVAILABLE,
  PROJECT_CHARTS,
  ITEM_TYPES,
  DEFAULT_CONFIG,
  STATUS_COLORS,
  DEFAULT_STATUS_COLOR,
  TOOLTIP_FIELDS,
  ALL_PROJECTS,
  CHART_WORKLOAD_MODES,
  MODE_CONFIG,
  CHART_COLORS,
  CANVAS_RENDERING,
}
