import React from 'react'
import { Row, Col, Card, Icon, Spin } from 'antd'

const StatCard = ({ title, value, icon, color, subtitle, loading }) => (
  <Card
    bodyStyle={{ padding: '20px 24px' }}
    style={{
      borderRadius: 8,
      border: `1px solid ${color}30`,
      background: `linear-gradient(135deg, #ffffff 0%, ${color}08 100%)`,
      height: '100%',
    }}
  >
    {loading ? (
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <Spin size="small" />
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon type={icon} style={{ fontSize: 22, color }} />
        </div>
        <div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#262626',
            }}
          >
            {value ?? '—'}
          </div>
          <div style={{ fontSize: 13, color: '#595959', marginTop: 4 }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{subtitle}</div>
          )}
        </div>
      </div>
    )}
  </Card>
)

/**
 * Row of KPI stat cards for the CMPlan dashboard.
 */
const CIStatsCards = ({ stats, loading }) => {
  const total = stats?.total ?? 0
  const byStatus = Object.fromEntries((stats?.byStatus || []).map((s) => [s.status, s.count]))
  const byCriticality = Object.fromEntries(
    (stats?.byCriticality || []).map((s) => [s.criticality, s.count])
  )

  const cards = [
    {
      title: 'Total CIs',
      value: total,
      icon: 'database',
      color: '#1890ff',
      subtitle: 'All configuration items',
    },
    {
      title: 'Active CIs',
      value: byStatus.active ?? 0,
      icon: 'check-circle',
      color: '#52c41a',
      subtitle: `${total > 0 ? Math.round(((byStatus.active || 0) / total) * 100) : 0}% of total`,
    },
    {
      title: 'In Maintenance',
      value: byStatus.maintenance ?? 0,
      icon: 'tool',
      color: '#faad14',
      subtitle: 'Currently being serviced',
    },
    {
      title: 'Critical CIs',
      value: byCriticality.critical ?? 0,
      icon: 'warning',
      color: '#f5222d',
      subtitle: 'Highest priority items',
    },
  ]

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card) => (
        <Col key={card.title} xs={24} sm={12} xl={6}>
          <StatCard {...card} loading={loading} />
        </Col>
      ))}
    </Row>
  )
}

export default CIStatsCards
