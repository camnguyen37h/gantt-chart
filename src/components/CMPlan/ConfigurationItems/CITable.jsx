import React from 'react'
import {
  Table,
  Tag,
  Button,
  Tooltip,
  Popconfirm,
  Icon,
  Badge,
  Avatar,
} from 'antd'
import CIStatusBadge from './CIStatusBadge'
import {
  CI_CRITICALITY_LABELS,
  CI_CRITICALITY_COLORS,
  CI_ENVIRONMENT_LABELS,
  CI_ENVIRONMENT_COLORS,
  COMPLIANCE_STATUS_LABELS,
  COMPLIANCE_STATUS_COLORS,
} from '../../../utils/cmplan/cmplanConstants'

const CITable = ({
  dataSource,
  loading,
  total,
  pagination,
  ciTypes,
  onEdit,
  onDelete,
  onView,
  onPageChange,
}) => {
  const ciTypeMap = Object.fromEntries(ciTypes.map((c) => [c.id, c]))

  const columns = [
    {
      title: 'CI',
      key: 'name',
      fixed: 'left',
      width: 260,
      render: (_, record) => {
        const cls = ciTypeMap[record.ciTypeId]
        return (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => onView(record)}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: `${(cls && cls.color) || '#1890ff'}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon
                type={(cls && cls.icon) || 'profile'}
                style={{ color: (cls && cls.color) || '#1890ff', fontSize: 16 }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: '#1890ff',
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 160,
                }}
              >
                {record.name}
              </div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                {(cls && cls.label) || record.ciTypeId}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      title: 'Description',
      dataIndex: 'shortDescription',
      key: 'shortDescription',
      ellipsis: true,
      width: 200,
      render: (v) => v || <span style={{ color: '#bfbfbf' }}>—</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => <CIStatusBadge status={status} />,
    },
    {
      title: 'Criticality',
      dataIndex: 'criticality',
      key: 'criticality',
      width: 100,
      render: (v) => (
        <Tag color={CI_CRITICALITY_COLORS[v]} style={{ fontWeight: 500 }}>
          {CI_CRITICALITY_LABELS[v] || v}
        </Tag>
      ),
    },
    {
      title: 'Environment',
      dataIndex: 'environment',
      key: 'environment',
      width: 110,
      render: (v) => (
        <Tag color={CI_ENVIRONMENT_COLORS[v]} style={{ fontWeight: 500 }}>
          {CI_ENVIRONMENT_LABELS[v] || v}
        </Tag>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      width: 140,
      ellipsis: true,
      render: (v) =>
        v ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar
              size={20}
              style={{ backgroundColor: '#1890ff', fontSize: 10, flexShrink: 0 }}
            >
              {v.charAt(0).toUpperCase()}
            </Avatar>
            <span style={{ fontSize: 12 }}>{v}</span>
          </div>
        ) : (
          <span style={{ color: '#bfbfbf' }}>—</span>
        ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 160,
      render: (tags) => {
        if (!tags || tags.length === 0) return <span style={{ color: '#bfbfbf' }}>—</span>
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {tags.slice(0, 2).map((t) => (
              <Tag key={t} style={{ fontSize: 10, margin: '1px 0' }}>
                {t}
              </Tag>
            ))}
            {tags.length > 2 && (
              <Tooltip title={tags.slice(2).join(', ')}>
                <Tag style={{ fontSize: 10, margin: '1px 0' }}>
                  +{tags.length - 2}
                </Tag>
              </Tooltip>
            )}
          </div>
        )
      },
    },
    {
      title: 'Compliance',
      key: 'compliance',
      width: 120,
      render: (_, record) => {
        const { complianceStatus, complianceScore } = record
        if (!complianceStatus || complianceStatus === 'unknown') {
          return <span style={{ color: '#bfbfbf', fontSize: 11 }}>Unknown</span>
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Badge
              color={COMPLIANCE_STATUS_COLORS[complianceStatus] || '#bfbfbf'}
            />
            <span
              style={{
                fontSize: 11,
                color: COMPLIANCE_STATUS_COLORS[complianceStatus],
                fontWeight: 500,
              }}
            >
              {complianceScore != null ? `${complianceScore}%` : COMPLIANCE_STATUS_LABELS[complianceStatus]}
            </span>
          </div>
        )
      },
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      sorter: true,
      render: (v) => (
        <span style={{ fontSize: 11, color: '#8c8c8c' }}>
          {new Date(v).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 110,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <Button
              type="link"
              size="small"
              icon="eye"
              onClick={() => onView(record)}
              style={{ padding: '0 4px' }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              size="small"
              icon="edit"
              onClick={() => onEdit(record)}
              style={{ padding: '0 4px' }}
            />
          </Tooltip>
          <Popconfirm
            title="Retire this Configuration Item?"
            description="The CI will be marked as Retired (soft delete). This action can be reversed."
            onConfirm={() => onDelete(record.id)}
            okText="Retire"
            okType="danger"
            cancelText="Cancel"
            icon={<Icon type="warning" style={{ color: '#faad14' }} />}
          >
            <Tooltip title="Retire CI">
              <Button
                type="link"
                size="small"
                icon="delete"
                style={{ padding: '0 4px', color: '#f5222d' }}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <Table
      rowKey="id"
      dataSource={dataSource}
      columns={columns}
      loading={loading}
      size="small"
      scroll={{ x: 1300 }}
      pagination={{
        current: pagination.page,
        pageSize: pagination.pageSize,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (t, [s, e]) => `${s}–${e} of ${t} items`,
        onChange: (page, pageSize) => onPageChange({ page, pageSize }),
        onShowSizeChange: (_, pageSize) => onPageChange({ page: 1, pageSize }),
      }}
      locale={{
        emptyText: (
          <div style={{ padding: '48px 0', color: '#8c8c8c' }}>
            <Icon type="inbox" style={{ fontSize: 40, marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 500 }}>
              No Configuration Items found
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Try adjusting your filters or add a new CI.
            </div>
          </div>
        ),
      }}
      rowClassName={(record) =>
        record.status === 'retired' ? 'ci-row-retired' : ''
      }
    />
  )
}

export default CITable
