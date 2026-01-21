import { CHART_COLORS } from './constants';
import { formatFloatNumber } from './utils';

/**
 * Get ECharts option configuration
 * @param {Object} params - Chart parameters
 * @param {Array} params.chartData - Chart data array
 * @param {boolean} params.isAllZero - Whether all data is zero
 * @param {string} params.actualKey - Key for actual data
 * @param {string} params.planKey - Key for plan data
 * @returns {Object} ECharts option object
 */
export const getChartOption = ({ chartData, isAllZero, actualKey, planKey }) => {
  return {
    title: {
      left: 'center',
      top: 10,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: value => formatFloatNumber(value),
    },
    legend: {
      data: ['Actual', 'Plan'],
      bottom: '0%',
      icon: 'rect',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        moveOnMouseWheel: true,
      },
    ],
    xAxis: {
      type: 'category',
      data: chartData.map(item => `${item.month} - ${item.year}`),
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: 'value',
      max: isAllZero ? 1000 : undefined,
      min: 0,
      axisLabel: {
        formatter: value => value.toLocaleString('en-US'),
        color: isAllZero ? '#ccc' : '#333',
      },
    },
    series: [
      {
        name: 'Actual',
        type: 'bar',
        data: chartData.map(item => formatFloatNumber(item[actualKey])),
        itemStyle: { color: CHART_COLORS.ACTUAL },
        barGap: '0%',
      },
      {
        name: 'Plan',
        type: 'bar',
        data: chartData.map(item => formatFloatNumber(item[planKey])),
        itemStyle: { color: CHART_COLORS.PLAN },
      },
    ],
    graphic: [],
  };
};
