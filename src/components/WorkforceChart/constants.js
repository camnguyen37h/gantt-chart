export const CHART_WORKLOAD_MODES = {
  HEAD_COUNT: 'Head Count',
  MM: 'MM'
};

export const MODE_CONFIG = {
  'Head Count': {
    actualKey: 'actualHeadCount',
    planKey: 'planHeadCount'
  },
  'MM': {
    actualKey: 'actualManMonth',
    planKey: 'planManMonth'
  }
};

export const CHART_COLORS = {
  ACTUAL: '#689F38',
  PLAN: '#2196F3'
};

// Mock data với 10 tháng không liên tiếp
export const MOCK_CHART_DATA = [
  {
    year: 2025,
    month: 1,
    planHeadCount: 10,
    actualHeadCount: 8,
    planManMonth: 12,
    actualManMonth: 9.5
  },
  {
    year: 2025,
    month: 2,
    planHeadCount: 12,
    actualHeadCount: 10,
    planManMonth: 14,
    actualManMonth: 11.2
  },
  {
    year: 2025,
    month: 3,
    planHeadCount: 15,
    actualHeadCount: 14,
    planManMonth: 18,
    actualManMonth: 16.8
  },
  {
    year: 2025,
    month: 4,
    planHeadCount: 18,
    actualHeadCount: 16,
    planManMonth: 21,
    actualManMonth: 19.5
  },
  {
    year: 2025,
    month: 5,
    planHeadCount: 20,
    actualHeadCount: 18,
    planManMonth: 24,
    actualManMonth: 22.1
  },
  {
    year: 2025,
    month: 6,
    planHeadCount: 22,
    actualHeadCount: 20,
    planManMonth: 26.5,
    actualManMonth: 24.8
  },
  {
    year: 2025,
    month: 7,
    planHeadCount: 8,
    actualHeadCount: 10,
    planManMonth: 3,
    actualManMonth: 2.032608695652174
  },
  {
    year: 2025,
    month: 8,
    planHeadCount: 18,
    actualHeadCount: 16,
    planManMonth: 22,
    actualManMonth: 19.8
  },
  {
    year: 2025,
    month: 10,
    planHeadCount: 22,
    actualHeadCount: 20,
    planManMonth: 27,
    actualManMonth: 25.1
  }
];

export const MOCK_MVV_LIST = [
  { projectCode: 'GLB003223451' },
  { projectCode: 'GLB003223452' },
  { projectCode: 'GLB003223453' }
];
