import React from 'react'
import { Card, Spin, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'

/**
 * Donut chart showing CI distribution by class.
 */
const CIClassDistributionChart = ({ stats, loading }) => {
  const byClass = ((stats && stats.byClass) || []).filter((c) => c.count > 0)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { fontSize: 12 },
    },
    series: [
      {
        name: 'CI Class',
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.15)',
          },
        },
        data: byClass.map((c) => ({
          name: c.className,
          value: c.count,
          itemStyle: { color: c.color },
        })),
      },
    ],
  }

  return (
    <Card
      title="CI by Class"
      size="small"
      style={{ height: '100%', borderRadius: 8 }}
      bodyStyle={{ padding: '8px 16px' }}
    >
      {loading ? (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : byClass.length === 0 ? (
        <Empty description="No data" style={{ padding: '48px 0' }} />
      ) : (
        <ReactECharts option={option} style={{ height: 220 }} notMerge />
      )}
    </Card>
  )
}

export default CIClassDistributionChart
