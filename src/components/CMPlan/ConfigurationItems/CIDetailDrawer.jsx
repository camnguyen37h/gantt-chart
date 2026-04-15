import React, { useState, useCallback, useEffect } from 'react'
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
  Timeline,
  Empty,
}  from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCIClasses,
  selectRelationshipsByCI,
  selectRelationshipsSubmitting,
  createRelationship,
  deleteRelationship,
  fetchAuditLogByCI,
  selectAuditLogByCI,
  selectAuditLogLoading,
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
  ci_created:        { color: 'green',   icon: 'plus-circle',     label: 'CI Created' },
  ci_updated:        { color: '#1890ff', icon: 'edit',            label: 'CI Updated' },
  ci_status_changed: { color: '#fa8c16', icon: 'swap',            label: 'Status Changed' },
  ci_class_changed:  { color: '#722ed1', icon: 'deployment-unit', label: 'Class Changed' },
  ci_attr_updated:   { color: '#13c2c2', icon: 'tool',            label: 'Attributes Updated' },
  rel_added:         { color: '#52c41a', icon: 'link',            label: 'Relationship Added' },
  rel_updated:       { color: '#fa8c16', icon: 'edit',            label: 'Relationship Updated' },
  rel_removed:       { color: '#ff4d4f', icon: 'disconnect',      label: 'Relationship Removed' },
}

const FIELD_LABELS = {
  status: 'Status', criticality: 'Criticality', owner: 'Owner',
  department: 'Department', environment: 'Environment',
  location: 'Location', name: 'Name', shortDescription: 'Description',
  expiredDate: 'Expired Date',
}

const HISTORY_FILTERS = [
  { label: 'All',           value: null },
  { label: 'CI Info',       value: ['ci_created', 'ci_updated', 'ci_status_changed', 'ci_class_changed'] },
  { label: 'Attributes',    value: ['ci_attr_updated'] },
  { label: 'Relationships', value: ['rel_added', 'rel_updated', 'rel_removed'] },
]

function groupByDate(entries) {
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const groups = new Map()
  entries.forEach((entry) => {
    const d = new Date(entry.timestamp)
    const key = d.toDateString()
    const label =
      key === today ? 'Today' :
      key === yesterday ? 'Yesterday' :
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push(entry)
  })
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
}

function formatCellValue(field, value) {
  if (value === null || value === undefined) return '—'
  if (field === 'expiredDate') return value ? new Date(value).toLocaleDateString('en-GB') : 'No expiry'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

const TABLE_TH = {
  padding: '4px 8px', fontSize: 11, fontWeight: 600, color: '#8c8c8c',
  background: '#fafafa', borderBottom: '1px solid #f0f0f0', textAlign: 'left',
  whiteSpace: 'nowrap',
}
const TABLE_TD = { padding: '4px 8px', fontSize: 11, borderBottom: '1px solid #f5f5f5', verticalAlign: 'top' }

function ChangesTable({ changes, getFieldLabel }) {
  const [open, setOpen] = React.useState(false)
  const count = changes.length
  return (
    <div style={{ marginTop: 5 }}>
      <span
        role="button"
        onClick={() => setOpen((o) => !o)}
        style={{ cursor: 'pointer', fontSize: 11, color: '#1890ff', userSelect: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
      >
        <Icon type={open ? 'caret-up' : 'caret-down'} />
        {count} field{count !== 1 ? 's' : ''} changed
      </span>
      {open && (
        <table style={{ width: '100%', marginTop: 6, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '32%' }} />
            <col style={{ width: '34%' }} />
            <col style={{ width: '34%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={TABLE_TH}>Field</th>
              <th style={{ ...TABLE_TH, color: '#cf1322' }}>Old value</th>
              <th style={{ ...TABLE_TH, color: '#389e0d' }}>New value</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((c, i) => (
              <tr key={i}>
                <td style={{ ...TABLE_TD, color: '#595959', fontWeight: 500 }}>
                  {getFieldLabel ? getFieldLabel(c) : (FIELD_LABELS[c.field] || c.field)}
                </td>
                <td style={{ ...TABLE_TD, color: '#cf1322', background: '#fff1f0', wordBreak: 'break-all' }}>
                  <span style={{ textDecoration: 'line-through', opacity: 0.85 }}>
                    {formatCellValue(c.field, c.from)}
                  </span>
                </td>
                <td style={{ ...TABLE_TD, color: '#389e0d', background: '#f6ffed', fontWeight: 500, wordBreak: 'break-all' }}>
                  {formatCellValue(c.field, c.to)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function AuditEntry({ entry }) {
  const cfg = AUDIT_CONFIG[entry.action] || { color: '#8c8c8c', icon: 'info-circle', label: entry.action }
  const ts = new Date(entry.timestamp)
  const timeStr = ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const { meta, action } = entry

  let summary = null   // always-visible one-liner
  let detail  = null   // collapsible table (if applicable)

  if (action === 'ci_created') {
    summary = <span style={{ color: '#52c41a', fontSize: 11 }}>CI was created in the system.</span>

  } else if (action === 'ci_updated' || action === 'ci_status_changed') {
    const changes = meta?.changes || []
    summary = (
      <span style={{ fontSize: 11, color: '#8c8c8c' }}>
        {changes.map((c) => FIELD_LABELS[c.field] || c.field).join(', ')}
      </span>
    )
    detail = <ChangesTable changes={changes} getFieldLabel={(c) => FIELD_LABELS[c.field] || c.field} />

  } else if (action === 'ci_class_changed') {
    summary = (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
        <Tag style={{ marginBottom: 0, fontSize: 11 }}>{meta.fromClassName}</Tag>
        <Icon type="arrow-right" style={{ color: '#722ed1', fontSize: 10 }} />
        <Tag color="purple" style={{ marginBottom: 0, fontSize: 11 }}>{meta.toClassName}</Tag>
      </span>
    )

  } else if (action === 'ci_attr_updated') {
    const changes = meta?.changes || []
    summary = (
      <span style={{ fontSize: 11, color: '#8c8c8c' }}>
        {meta.classLabel && <Tag style={{ fontSize: 10, marginBottom: 0, marginRight: 4 }}>{meta.classLabel}</Tag>}
        {changes.map((c) => c.label || c.field).join(', ')}
      </span>
    )
    detail = <ChangesTable changes={changes} getFieldLabel={(c) => c.label || c.field} />

  } else if (action === 'rel_added') {
    const dir = meta.direction === 'outbound' ? '→' : '←'
    summary = (
      <span style={{ fontSize: 11, color: '#595959', display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <span style={{ color: '#52c41a', fontWeight: 700 }}>{dir}</span>
        <Tag color="geekblue" style={{ marginBottom: 0, fontSize: 10 }}>{relTypeMap[meta.relType] || meta.relType}</Tag>
        <strong>{meta.peerName}</strong>
        {meta.expiredDate && (
          <Tag color="warning" style={{ fontSize: 10, marginBottom: 0 }}>
            expires {new Date(meta.expiredDate).toLocaleDateString('en-GB')}
          </Tag>
        )}
      </span>
    )

  } else if (action === 'rel_updated') {
    const dir = meta.direction === 'outbound' ? '→' : '←'
    const changes = meta?.changes || []
    summary = (
      <span style={{ fontSize: 11, color: '#595959', display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <span style={{ color: '#fa8c16', fontWeight: 700 }}>{dir}</span>
        <Tag color="orange" style={{ marginBottom: 0, fontSize: 10 }}>{relTypeMap[meta.relType] || meta.relType}</Tag>
        <strong>{meta.peerName}</strong>
      </span>
    )
    if (changes.length > 0) {
      detail = <ChangesTable changes={changes} getFieldLabel={(c) => FIELD_LABELS[c.field] || c.field} />
    }

  } else if (action === 'rel_removed') {
    const dir = meta.direction === 'outbound' ? '→' : '←'
    summary = (
      <span style={{ fontSize: 11, color: '#8c8c8c', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#ff4d4f', fontWeight: 700 }}>{dir}</span>
        <Tag color="error" style={{ marginBottom: 0, fontSize: 10 }}>{relTypeMap[meta.relType] || meta.relType}</Tag>
        <span style={{ textDecoration: 'line-through' }}>{meta.peerName}</span>
        <Tag color="error" style={{ fontSize: 10, marginBottom: 0 }}>removed</Tag>
      </span>
    )
  }

  return (
    <Timeline.Item
      color={cfg.color}
      dot={<Icon type={cfg.icon} style={{ fontSize: 13, color: cfg.color }} />}
    >
      <div style={{ paddingBottom: 2 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 12, color: '#262626' }}>{cfg.label}</span>
          <span style={{ fontSize: 11, color: '#bfbfbf' }}>by {entry.actor}</span>
          <Tooltip title={ts.toLocaleString('en-GB')}>
            <span style={{ fontSize: 11, color: '#bfbfbf', cursor: 'default' }}>{timeStr}</span>
          </Tooltip>
        </div>
        {/* Summary line */}
        {summary && <div style={{ marginTop: 3 }}>{summary}</div>}
        {/* Collapsible diff table */}
        {detail}
      </div>
    </Timeline.Item>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const CIDetailDrawer = ({ ci, visible, onClose, onEdit, attrDefs = [] }) => {
  const dispatch = useDispatch()
  const ciClasses = useSelector(selectCIClasses)
  const relations = useSelector(selectRelationshipsByCI(ci?.id || ''))
  const submitting = useSelector(selectRelationshipsSubmitting)
  const auditEntries = useSelector(selectAuditLogByCI(ci?.id || ''))
  const auditLoading = useSelector(selectAuditLogLoading(ci?.id || ''))

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
  }, [visible, ci?.id])

  const ciClass = ci ? ciClasses.find((c) => c.id === ci.ciClassId) : null
  const attrDefMap = Object.fromEntries((ci ? attrDefs : []).map((a) => [a.name, a]))

  // ── History content (computed pre-JSX to avoid IIFE in render) ──────────────
  const filteredAudit = historyFilter
    ? auditEntries.filter((e) => historyFilter.includes(e.action))
    : auditEntries
  const auditGroups = groupByDate(filteredAudit)
  const renderHistoryContent = filteredAudit.length === 0 ? (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={auditEntries.length === 0 ? 'No history recorded yet' : 'No events match this filter'}
      style={{ padding: '24px 0' }}
    />
  ) : (
    <div>
      {auditGroups.map(({ label, items }) => (
        <div key={label}>
          <Divider orientation="left" style={{ fontSize: 11, color: '#8c8c8c', margin: '12px 0 8px' }}>
            {label}
          </Divider>
          <Timeline style={{ paddingLeft: 4 }}>
            {items.map((entry) => (
              <AuditEntry key={entry.id} entry={entry} />
            ))}
          </Timeline>
        </div>
      ))}
    </div>
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
                type={ciClass?.icon || 'profile'}
                style={{
                  fontSize: 20, color: ciClass?.color || '#1890ff',
                  backgroundColor: `${ciClass?.color || '#1890ff'}15`,
                  padding: 6, borderRadius: 6,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{ci.name}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>{ciClass?.label}</div>
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
                    <Icon type={ciClass?.icon || 'profile'} style={{ color: ciClass?.color, marginRight: 4 }} />
                    {ciClass?.label} Attributes
                  </Divider>
                  <Descriptions column={1} size="small" bordered>
                    {Object.entries(ci.attributes).map(([key, value]) => {
                      const def = attrDefMap[key]
                      return (
                        <Descriptions.Item
                          key={key}
                          label={<Tooltip title={`key: ${key}`}>{def?.label || key}</Tooltip>}
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
                    const peerName = peerCI?.name || peerId
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
            <div style={{ padding: '12px 24px 24px' }}>
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
            classIcon: ciClass?.icon,
            classColor: ciClass?.color,
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

export default CIDetailDrawer
