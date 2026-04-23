import React, { useState, useCallback, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  Drawer,
  Descriptions,
  Tag,
  Divider,
  Badge,
  Button,
  Icon,
  Tooltip,
  Popconfirm,
  notification,
  Spin,
  Tabs,
  Table,
  Empty,
}  from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import {
  createRelationship,
  deleteRelationship,
  fetchAuditLogByCI,
} from '../../../store/cmplan'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'
import CIStatusBadge from './CIStatusBadge'
import AddRelationshipModal from '../Relationships/AddRelationshipModal'
import {
  CI_CRITICALITY_LABELS,
  CI_CRITICALITY_COLORS,
  CI_ENVIRONMENT_LABELS,
  CI_ENVIRONMENT_COLORS,
  COMPLIANCE_STATUS_LABELS,
  COMPLIANCE_STATUS_COLORS,
  RELATIONSHIP_TYPES,
} from '../../../utils/cmplan/cmplanConstants'

const { TabPane } = Tabs

const relTypeMap = Object.fromEntries(
  RELATIONSHIP_TYPES.map((r) => [r.value, r.label])
)

// ── Audit helpers ─────────────────────────────────────────────────────────────
const AUDIT_CONFIG = {
  ci_created:        { color: '#52c41a', icon: 'plus-circle',     label: 'CI Created' },
  ci_updated:        { color: '#1890ff', icon: 'edit',            label: 'CI Updated' },
  ci_status_changed: { color: '#fa8c16', icon: 'swap',            label: 'Status Changed' },
  ci_type_changed:  { color: '#722ed1', icon: 'deployment-unit', label: 'Type Changed' },
  ci_attr_updated:   { color: '#13c2c2', icon: 'tool',            label: 'Attr Updated' },
  rel_added:         { color: '#52c41a', icon: 'link',            label: 'Rel Added' },
  rel_updated:       { color: '#fa8c16', icon: 'edit',            label: 'Rel Updated' },
  rel_removed:       { color: '#ff4d4f', icon: 'disconnect',      label: 'Rel Removed' },
}

const FIELD_LABELS = {
  status: 'Status', criticality: 'Criticality', owner: 'Owner',
  department: 'Department', environment: 'Environment',
  location: 'Location', name: 'Name', shortDescription: 'Description',
  expiredDate: 'Expired Date', ciType: 'CI Type',
}

const HISTORY_FILTERS = [
  { label: 'All',           value: null },
  { label: 'CI Info',       value: ['ci_created', 'ci_updated', 'ci_status_changed', 'ci_type_changed'] },
  { label: 'Attributes',    value: ['ci_attr_updated'] },
  { label: 'Relationships', value: ['rel_added', 'rel_updated', 'rel_removed'] },
]

function formatVal(v) {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (Array.isArray(v)) return v.join(', ')
  return String(v)
}

// One row per audit entry; changes[] is used in the expandable sub-table
function buildAuditRows(entries) {
  return entries.map((entry) => {
    const cfg = AUDIT_CONFIG[entry.action] || { color: '#8c8c8c', icon: 'info-circle', label: entry.action }
    const { meta, action } = entry
    let changes = []

    if (action === 'ci_type_changed') {
      changes = [{ field: 'CI Type', from: meta.fromTypeName, to: meta.toTypeName }]
    } else if (action === 'ci_updated' || action === 'ci_status_changed') {
      changes = ((meta && meta.changes) || []).map((c) => ({
        field: FIELD_LABELS[c.field] || c.field, from: formatVal(c.from), to: formatVal(c.to),
      }))
    } else if (action === 'ci_attr_updated') {
      changes = ((meta && meta.changes) || []).map((c) => ({
        field: c.label || c.field, from: formatVal(c.from), to: formatVal(c.to),
      }))
    } else if (action === 'rel_updated') {
      changes = ((meta && meta.changes) || []).map((c) => ({
        field: FIELD_LABELS[c.field] || c.field,
        from: c.field === 'expiredDate' ? (c.from ? new Date(c.from).toLocaleDateString('en-GB') : 'No expiry') : formatVal(c.from),
        to:   c.field === 'expiredDate' ? (c.to   ? new Date(c.to).toLocaleDateString('en-GB')   : 'No expiry') : formatVal(c.to),
      }))
    }

    return { key: entry.id, entry, cfg, changes }
  })
}

const DIFF_COLUMNS = [
  {
    title: 'Field',
    dataIndex: 'field',
    width: 140,
    render: (v) => <span style={{ fontSize: 11, fontWeight: 500, color: '#595959' }}>{v}</span>,
  },
  {
    title: <span style={{ color: '#cf1322' }}>Old value</span>,
    dataIndex: 'from',
    render: (v) => (
      <span style={{ fontSize: 11, color: '#cf1322', textDecoration: 'line-through' }}>{v}</span>
    ),
  },
  {
    title: <span style={{ color: '#389e0d' }}>New value</span>,
    dataIndex: 'to',
    render: (v) => (
      <span style={{ fontSize: 11, color: '#389e0d', fontWeight: 500 }}>{v}</span>
    ),
  },
]

const HISTORY_COLUMNS = [
  {
    title: 'Date / Time',
    width: 110,
    render: (_, row) => {
      const ts = new Date(row.entry.timestamp)
      return (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#262626', lineHeight: 1.4 }}>
            {ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: 10, color: '#bfbfbf', marginTop: 2 }}>by {row.entry.actor}</div>
        </div>
      )
    },
  },
  {
    title: 'Action',
    width: 170,
    render: (_, row) => {
      const { entry, cfg } = row
      const { action, meta } = entry
      const isRel = ['rel_added', 'rel_updated', 'rel_removed'].includes(action)
      const dirColor = action === 'rel_removed' ? '#ff4d4f' : action === 'rel_updated' ? '#fa8c16' : '#52c41a'
      return (
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon type={cfg.icon} style={{ color: cfg.color, fontSize: 11 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
          </div>
          {isRel && (
            <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <span style={{ color: dirColor, fontWeight: 700, fontSize: 12 }}>
                {meta.direction === 'outbound' ? '→' : '←'}
              </span>
              <Tag style={{ fontSize: 9, marginBottom: 0, padding: '0 4px' }}>
                {relTypeMap[meta.relType] || meta.relType}
              </Tag>
              <span style={{
                fontSize: 11, color: action === 'rel_removed' ? '#8c8c8c' : '#595959',
                textDecoration: action === 'rel_removed' ? 'line-through' : 'none',
                maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block',
              }}>
                {meta.peerName}
              </span>
            </div>
          )}
          {action === 'ci_attr_updated' && meta.typeLabel && (
            <Tag style={{ marginTop: 2, fontSize: 9, marginBottom: 0, padding: '0 4px' }}>{meta.typeLabel}</Tag>
          )}
        </div>
      )
    },
  },
  {
    title: 'Summary',
    render: (_, row) => {
      const { changes, entry: { action, meta } } = row
      if (changes.length === 0) {
        // ci_created, rel_added, rel_removed — no diff
        if (action === 'ci_created') return <span style={{ fontSize: 11, color: '#52c41a' }}>CI created in the system</span>
        if (action === 'rel_added') {
          return (
            <span style={{ fontSize: 11, color: '#595959' }}>
              Relationship established
              {meta.expiredDate && (
                <Tag color="warning" style={{ marginLeft: 6, fontSize: 10, marginBottom: 0, padding: '0 4px' }}>
                  expires {new Date(meta.expiredDate).toLocaleDateString('en-GB')}
                </Tag>
              )}
            </span>
          )
        }
        if (action === 'rel_removed') return <span style={{ fontSize: 11, color: '#ff4d4f' }}>Relationship removed</span>
        return <span style={{ fontSize: 11, color: '#bfbfbf' }}>—</span>
      }
      // Has diffs — show field list as a hint
      return (
        <span style={{ fontSize: 11, color: '#8c8c8c' }}>
          {changes.map((c) => c.field).join(', ')}
          <span style={{
            marginLeft: 6, fontSize: 10, background: '#f0f0f0',
            borderRadius: 8, padding: '1px 6px', color: '#595959',
          }}>
            {changes.length} field{changes.length !== 1 ? 's' : ''}
          </span>
        </span>
      )
    },
  },
]

// ── Main Component ────────────────────────────────────────────────────────────
const CIDetailDrawer = ({ ci, visible, onClose, onEdit, attrDefs = [] }) => {
  const dispatch = useDispatch()
  const ciId = (ci && ci.id) || ''
  const ciTypes = useSelector(state => state.cmplan.ciTypes.items)
  const allRelationships = useSelector(state => state.cmplan.ciRelationships.items)
  const submitting = useSelector(state => state.cmplan.ciRelationships.submitting)
  const auditByCI = useSelector(state => state.cmplan.ciAuditLog.byCI)
  const auditLoadingMap = useSelector(state => state.cmplan.ciAuditLog.loading)

  const relations = useMemo(
    () => allRelationships.filter((r) => r.sourceId === ciId || r.targetId === ciId),
    [allRelationships, ciId]
  )
  const auditEntries = auditByCI[ciId] || []
  const auditLoading = auditLoadingMap[ciId] || false

  const [drawerTab, setDrawerTab] = useState('overview')
  const [historyFilter, setHistoryFilter] = useState(null)
  const [addRelVisible, setAddRelVisible] = useState(false)
  const [allCIsForSelect, setAllCIsForSelect] = useState([])
  const [loadingCIs, setLoadingCIs] = useState(false)

  const handleTabChange = useCallback(
    (key) => {
      setDrawerTab(key)
    },
    []
  )

  const handleOpenAddRel = useCallback(async () => {
    if (allCIsForSelect.length === 0) {
      setLoadingCIs(true)
      const res = await cmplanApi.configurationItems.getAll({ page: 1, pageSize: 200 })
      if (res.success) setAllCIsForSelect(res.data)
      setLoadingCIs(false)
    }
    setAddRelVisible(true)
  }, [allCIsForSelect.length])

  const handleAddRelSubmit = useCallback(
    async (payload) => {
      const result = await dispatch(createRelationship(payload))
      if (createRelationship.fulfilled.match(result)) {
        notification.success({ message: 'Relationship added.' })
        setAddRelVisible(false)
        if (auditEntries.length > 0) dispatch(fetchAuditLogByCI(ci.id))
      } else {
        notification.error({ message: 'Failed to add relationship.' })
      }
    },
    [dispatch, ci, auditEntries.length]
  )

  const handleDeleteRel = useCallback(
    async (relId) => {
      const result = await dispatch(deleteRelationship(relId))
      if (deleteRelationship.fulfilled.match(result)) {
        notification.success({ message: 'Relationship removed.' })
        if (auditEntries.length > 0) dispatch(fetchAuditLogByCI(ci.id))
      } else {
        notification.error({ message: 'Failed to remove relationship.' })
      }
    },
    [dispatch, ci, auditEntries.length]
  )

  // Pre-load CI list (for peer-name display) and audit log whenever this drawer opens for a CI
  useEffect(() => {
    if (!visible || !ci) return
    setDrawerTab('overview')
    setHistoryFilter(null)
    cmplanApi.configurationItems.getAll({ page: 1, pageSize: 500 }).then((res) => {
      if (res.success) setAllCIsForSelect(res.data)
    })
    dispatch(fetchAuditLogByCI(ci.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, ci ? ci.id : null])

  const ciType = ci ? ciTypes.find((c) => c.id === ci.ciTypeId) : null
  const attrDefMap = Object.fromEntries((ci ? attrDefs : []).map((a) => [a.name, a]))

  // ── History table rows ───────────────────────────────────────────────────────
  const filteredAudit = historyFilter
    ? auditEntries.filter((e) => historyFilter.includes(e.action))
    : auditEntries
  const historyRows = buildAuditRows(filteredAudit)
  const renderHistoryContent = (
    <Table
      size="small"
      bordered
      dataSource={historyRows}
      columns={HISTORY_COLUMNS}
      rowKey="key"
      pagination={historyRows.length > 25 ? { pageSize: 25, size: 'small', showSizeChanger: false } : false}
      expandedRowRender={(row) => (
        <Table
          size="small"
          dataSource={row.changes.map((c, i) => ({ ...c, key: i }))}
          columns={DIFF_COLUMNS}
          pagination={false}
          showHeader
          style={{ margin: 0 }}
        />
      )}
      rowExpandable={(row) => row.changes.length > 0}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={auditEntries.length === 0 ? 'No history recorded yet' : 'No events match this filter'}
            style={{ padding: '20px 0' }}
          />
        ),
      }}
    />
  )

  const renderAttrValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '—'
    const def = attrDefMap[key]
    if (!def) return String(value)
    switch (def.type) {
      case 'checkbox':
        return <Badge status={value ? 'success' : 'default'} text={value ? 'Yes' : 'No'} />
      case 'url':
        return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
      case 'email':
        return <a href={`mailto:${value}`}>{value}</a>
      case 'multiselect':
        if (Array.isArray(value)) {
          const optionMap = Object.fromEntries((def.options || []).map((o) => [o.value, o.label]))
          return value.map((v) => <Tag key={v} style={{ margin: '1px 4px 1px 0' }}>{optionMap[v] || v}</Tag>)
        }
        return String(value)
      case 'select': {
        const optionMap = Object.fromEntries((def.options || []).map((o) => [o.value, o.label]))
        return optionMap[value] || value
      }
      default:
        return String(value)
    }
  }

  return (
    <>
      <Drawer
        visible={visible}
        onClose={onClose}
        width={580}
        bodyStyle={{ padding: 0 }}
        title={
          ci ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon
              type={(ciType && ciType.icon) || 'profile'}
              style={{
                fontSize: 20, color: (ciType && ciType.color) || '#1890ff',
                backgroundColor: `${(ciType && ciType.color) || '#1890ff'}15`,
                  padding: 6, borderRadius: 6,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{ci.name}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>{ciType && ciType.label}</div>
              </div>
            </div>
          ) : (
            <span style={{ color: '#bfbfbf' }}>Loading...</span>
          )
        }
        extra={
          ci ? (
            <Button type="primary" size="small" icon="edit" onClick={() => onEdit(ci)}>
              Edit
            </Button>
          ) : null
        }
      >
        {!ci ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Spin size="large" />
          </div>
        ) : (
        <>
        {/* Status row — always visible */}
        <div style={{
          padding: '12px 24px',
          display: 'flex', gap: 8, flexWrap: 'wrap',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <CIStatusBadge status={ci.status} />
          <Tag color={CI_CRITICALITY_COLORS[ci.criticality]} style={{ fontWeight: 500 }}>
            {CI_CRITICALITY_LABELS[ci.criticality] || ci.criticality}
          </Tag>
          <Tag color={CI_ENVIRONMENT_COLORS[ci.environment]} style={{ fontWeight: 500 }}>
            {CI_ENVIRONMENT_LABELS[ci.environment] || ci.environment}
          </Tag>
          {ci.complianceStatus && (
            <Tag color={COMPLIANCE_STATUS_COLORS[ci.complianceStatus]} style={{ fontWeight: 500 }}>
              <Icon type="safety-certificate" style={{ marginRight: 4 }} />
              {COMPLIANCE_STATUS_LABELS[ci.complianceStatus]}
              {ci.complianceScore != null && ` (${ci.complianceScore}%)`}
            </Tag>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={drawerTab}
          onChange={handleTabChange}
          size="small"
          animated={false}
          tabBarStyle={{ margin: '0 24px', borderBottom: '1px solid #f0f0f0' }}
        >
          {/* ── Overview ──────────────────────────────────── */}
          <TabPane tab={<span><Icon type="profile" />Overview</span>} key="overview">
            <div style={{ padding: '16px 24px' }}>
              <Descriptions column={1} size="small" bordered>
                {ci.shortDescription && (
                  <Descriptions.Item label="Description">{ci.shortDescription}</Descriptions.Item>
                )}
                <Descriptions.Item label="Owner">{ci.owner || '—'}</Descriptions.Item>
                <Descriptions.Item label="Department">{ci.department || '—'}</Descriptions.Item>
                <Descriptions.Item label="Location">{ci.location || '—'}</Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(ci.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {new Date(ci.updatedAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>

              {ci.tags && ci.tags.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Tags
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {ci.tags.map((tag) => <Tag key={tag} color="blue">{tag}</Tag>)}
                  </div>
                </div>
              )}

              {ci.attributes && Object.keys(ci.attributes).length > 0 && (
                <>
                  <Divider orientation="left" style={{ fontSize: 12, marginTop: 20 }}>
                    <Icon type={(ciType && ciType.icon) || 'profile'} style={{ color: ciType && ciType.color, marginRight: 4 }} />
                    {ciType && ciType.label} Attributes
                  </Divider>
                  <Descriptions column={1} size="small" bordered>
                    {Object.entries(ci.attributes).map(([key, value]) => {
                      const def = attrDefMap[key]
                      return (
                        <Descriptions.Item
                          key={key}
                          label={<Tooltip title={`key: ${key}`}>{(def && def.label) || key}</Tooltip>}
                        >
                          {renderAttrValue(key, value)}
                        </Descriptions.Item>
                      )
                    })}
                  </Descriptions>
                </>
              )}
            </div>
          </TabPane>

          {/* ── Relationships ──────────────────────────────── */}
          <TabPane
            tab={
              <span>
                <Icon type="share-alt" />
                Relationships
                {relations.length > 0 && (
                  <Badge count={relations.length} style={{ backgroundColor: '#722ed1', marginLeft: 6 }} />
                )}
              </span>
            }
            key="relationships"
          >
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#8c8c8c' }}>
                  {relations.length} relationship{relations.length !== 1 ? 's' : ''}
                </span>
                <Button
                  type="primary"
                  ghost
                  size="small"
                  icon={loadingCIs ? 'loading' : 'plus'}
                  onClick={handleOpenAddRel}
                  disabled={loadingCIs}
                >
                  Add
                </Button>
              </div>

              {relations.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No relationships defined yet"
                  style={{ padding: '24px 0' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {relations.map((rel) => {
                    const isSource = rel.sourceId === ci.id
                    const peerId = isSource ? rel.targetId : rel.sourceId
                    const peerCI = allCIsForSelect.find((c) => c.id === peerId)
                    const peerName = (peerCI && peerCI.name) || peerId
                    const isExpired = rel.expiredDate && new Date(rel.expiredDate) < new Date()

                    return (
                      <div
                        key={rel.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', background: isExpired ? '#fff1f0' : '#fafafa',
                          borderRadius: 6,
                          border: `1px solid ${isExpired ? '#ffccc7' : '#f0f0f0'}`,
                          fontSize: 13,
                        }}
                      >
                        <Icon
                          type={isSource ? 'arrow-right' : 'arrow-left'}
                          style={{ color: isSource ? '#1890ff' : '#52c41a', flexShrink: 0 }}
                        />
                        <Tag color="geekblue" style={{ fontWeight: 500, marginBottom: 0 }}>
                          {relTypeMap[rel.relationshipType] || rel.relationshipType}
                        </Tag>
                        <span style={{ color: '#595959', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {peerName}
                        </span>
                        {rel.expiredDate && (
                          <Tooltip title={isExpired ? 'This relationship has expired' : `Expires ${new Date(rel.expiredDate).toLocaleDateString('en-GB')}`}>
                            <Tag
                              color={isExpired ? 'error' : 'warning'}
                              style={{ marginBottom: 0, fontSize: 11, flexShrink: 0 }}
                            >
                              <Icon type="clock-circle" style={{ marginRight: 3 }} />
                              {isExpired ? 'Expired' : new Date(rel.expiredDate).toLocaleDateString('en-GB')}
                            </Tag>
                          </Tooltip>
                        )}
                        {rel.description && (
                          <Tooltip title={rel.description}>
                            <Icon type="info-circle" style={{ color: '#bfbfbf' }} />
                          </Tooltip>
                        )}
                        <Popconfirm
                          title="Remove this relationship?"
                          onConfirm={() => handleDeleteRel(rel.id)}
                          okType="danger"
                          okText="Remove"
                          cancelText="Cancel"
                          placement="topRight"
                        >
                          <Button
                            shape="circle"
                            size="small"
                            icon="delete"
                            type="danger"
                            ghost
                            style={{ flexShrink: 0, border: 'none' }}
                          />
                        </Popconfirm>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </TabPane>

          {/* ── History ───────────────────────────────────── */}
          <TabPane
            tab={
              <span>
                <Icon type="history" />
                History
                {auditEntries.length > 0 && (
                  <Badge count={auditEntries.length} style={{ backgroundColor: '#8c8c8c', marginLeft: 6 }} />
                )}
              </span>
            }
            key="history"
          >
            <div style={{ padding: '12px 16px 16px' }}>
              {/* Filter chips + refresh */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
                {HISTORY_FILTERS.map((f) => (
                  <Tag
                    key={String(f.value)}
                    color={historyFilter === f.value ? 'blue' : undefined}
                    onClick={() => setHistoryFilter(f.value)}
                    style={{ cursor: 'pointer', userSelect: 'none', marginBottom: 0 }}
                  >
                    {f.label}
                  </Tag>
                ))}
                <Button
                  icon="reload"
                  size="small"
                  loading={auditLoading}
                  onClick={() => dispatch(fetchAuditLogByCI(ci.id))}
                  style={{ marginLeft: 'auto' }}
                >
                  Refresh
                </Button>
              </div>

              {auditLoading && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <Spin tip="Loading history..." />
                </div>
              )}

              {!auditLoading && renderHistoryContent}
            </div>
          </TabPane>
        </Tabs>
        </>
        )}
      </Drawer>

      {ci && (
        <AddRelationshipModal
          visible={addRelVisible}
          sourceCI={{
            id: ci.id,
            name: ci.name,
            typeIcon: ciType && ciType.icon,
            typeColor: ciType && ciType.color,
          }}
          allCIs={allCIsForSelect}
          submitting={submitting}
          onSubmit={handleAddRelSubmit}
          onClose={() => setAddRelVisible(false)}
        />
      )}
    </>
  )
}

CIDetailDrawer.propTypes = {
  ci: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    ciTypeId: PropTypes.string,
    status: PropTypes.string,
    criticality: PropTypes.string,
    owner: PropTypes.string,
    department: PropTypes.string,
    environment: PropTypes.string,
    location: PropTypes.string,
    shortDescription: PropTypes.string,
    complianceStatus: PropTypes.string,
    createdBy: PropTypes.string,
    updatedBy: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    attributes: PropTypes.object,
  }),
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  attrDefs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      key: PropTypes.string,
      name: PropTypes.string,
      type: PropTypes.string,
      options: PropTypes.array,
    })
  ),
}

CIDetailDrawer.defaultProps = {
  ci: null,
  attrDefs: [],
}

export default CIDetailDrawer
