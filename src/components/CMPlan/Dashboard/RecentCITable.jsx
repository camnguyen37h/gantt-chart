import React from 'react'
import { Card, Table, Icon, Spin } from 'antd'
import { Link } from 'react-router-dom'
import CIStatusBadge from '../ConfigurationItems/CIStatusBadge'
import {
  CI_CRITICALITY_COLORS,
  CI_CRITICALITY_LABELS,
} from '../../../utils/cmplan/cmplanConstants'

/**
 * Shows the 5 most recently updated CIs on the Dashboard.
 */
const RecentCITable = ({ recentItems, ciTypes, loading }) => {
  const ciTypeMap = Object.fromEntries((ciTypes || []).map((c) => [c.id, c]))

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => {
        const cls = ciTypeMap[record.ciTypeId]
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: `${(cls && cls.color) || '#1890ff'}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon
                type={(cls && cls.icon) || 'profile'}
                style={{ color: (cls && cls.color) || '#1890ff', fontSize: 13 }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12, color: '#262626' }}>
                {record.name}
              </div>
              <div style={{ fontSize: 10, color: '#8c8c8c' }}>{cls && cls.label}</div>
            </div>
          </div>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <CIStatusBadge status={s} size="sm" />,
    },
    {
      title: 'Criticality',
      dataIndex: 'criticality',
      key: 'criticality',
      width: 90,
      render: (v) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: CI_CRITICALITY_COLORS[v],
          }}
        >
          {CI_CRITICALITY_LABELS[v] || v}
        </span>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 100,
      render: (v) => (
        <span style={{ fontSize: 11, color: '#8c8c8c' }}>
          {new Date(v).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <Card
      title={
        <span>
          <Icon type="clock-circle" style={{ marginRight: 6, color: '#1890ff' }} />
          Recently Updated
        </span>
      }
      size="small"
      style={{ borderRadius: 8 }}
      bodyStyle={{ padding: '0 0 4px' }}
      extra={
        <Link
          to="/cmplan/configuration-items"
          style={{ fontSize: 12, color: '#1890ff' }}
        >
          View all <Icon type="arrow-right" />
        </Link>
      }
    >
      {loading ? (
        <div
          style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Spin />
        </div>
      ) : (
        <Table
          rowKey="id"
          dataSource={recentItems || []}
          columns={columns}
          size="small"
          pagination={false}
          locale={{ emptyText: 'No recent items' }}
        />
      )}
    </Card>
  )
}

export default RecentCITable
