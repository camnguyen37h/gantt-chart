import React from 'react'
import { Card, Spin } from 'antd'
import ReactECharts from 'echarts-for-react'
import {
  CI_STATUS_LABELS,
  CI_STATUS_COLORS,
  CI_CRITICALITY_LABELS,
  CI_CRITICALITY_COLORS,
} from '../../../utils/cmplan/cmplanConstants'

/**
 * Grouped bar chart showing CI breakdown by status, criticality, environment.
 */
const CIStatusChart = ({ stats, loading }) => {
  const byStatus = stats?.byStatus || []
  const byCriticality = stats?.byCriticality || []

  const statusOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 16, right: 16, top: 10, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      data: byStatus.map((s) => CI_STATUS_LABELS[s.status] || s.status),
      axisLabel: { fontSize: 11 },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'bar',
        data: byStatus.map((s) => ({
          value: s.count,
          itemStyle: { color: CI_STATUS_COLORS[s.status] || '#bfbfbf', borderRadius: [4, 4, 0, 0] },
        })),
        barMaxWidth: 40,
        label: {
          show: true,
          position: 'top',
          fontSize: 11,
          formatter: ({ value }) => (value > 0 ? value : ''),
        },
      },
    ],
  }

  const critOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 16, right: 16, top: 10, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      data: byCriticality.map((c) => CI_CRITICALITY_LABELS[c.criticality] || c.criticality),
      axisLabel: { fontSize: 11 },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'bar',
        data: byCriticality.map((c) => ({
          value: c.count,
          itemStyle: {
            color: CI_CRITICALITY_COLORS[c.criticality] || '#bfbfbf',
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 40,
        label: {
          show: true,
          position: 'top',
          fontSize: 11,
          formatter: ({ value }) => (value > 0 ? value : ''),
        },
      },
    ],
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card
        title="By Status"
        size="small"
        style={{ borderRadius: 8 }}
        bodyStyle={{ padding: '8px 16px' }}
      >
        {loading ? (
          <div
            style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Spin />
          </div>
        ) : (
          <ReactECharts option={statusOption} style={{ height: 160 }} notMerge />
        )}
      </Card>

      <Card
        title="By Criticality"
        size="small"
        style={{ borderRadius: 8 }}
        bodyStyle={{ padding: '8px 16px' }}
      >
        {loading ? (
          <div
            style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Spin />
          </div>
        ) : (
          <ReactECharts option={critOption} style={{ height: 160 }} notMerge />
        )}
      </Card>
    </div>
  )
}

export default CIStatusChart
