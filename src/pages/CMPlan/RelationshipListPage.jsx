import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Table, Button, Input, Select, Modal, Tag, Icon, Spin, Tooltip, DatePicker,
} from 'antd'
import { useHistory } from 'react-router-dom'
import {
  fetchRelationships,
  deleteRelationship,
  updateRelationship,
  fetchConfigurationItems,
  fetchCITypes,
} from '../../store/cmplan'
import { RELATIONSHIP_TYPES } from '../../utils/cmplan/cmplanConstants'
import { RELATIONSHIP_TYPE_COLORS } from '../../utils/cmplan/bulkRelationshipConstants'
import EditRelationshipModal from '../../components/CMPlan/Relationships/EditRelationshipModal'
import './CMPlan.css'

const { Option } = Select

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

const RL_STATUS_OPTIONS = [
  { value: 'Active',   label: 'Active' },
  { value: 'Draft',    label: 'Draft' },
  { value: 'Updated',  label: 'Updated' },
  { value: 'Renew',    label: 'Renew' },
  { value: 'Expired',  label: 'Expired' },
]

const APPROVAL_STATUS_OPTIONS = [
  { value: 'Approved', label: 'Approved' },
  { value: 'Pending',  label: 'Pending' },
  { value: 'N/A',      label: 'N/A' },
]

// Deterministic mock values assigned per relationship index
const MOCK_ACCESS   = ['Allow', 'Allow', 'Allow', 'Deny',    'Allow', 'Allow', 'Deny',    'Allow']
const MOCK_STATUS   = ['Active', 'Draft', 'Updated', 'Active', 'Renew', 'Expired', 'Active', 'Draft']
const MOCK_APPROVAL = ['Approved', 'Pending', 'N/A', 'Approved', 'Pending', 'N/A', 'Approved', 'Pending']
const MOCK_USERS    = ['admin', 'nguyenvana', 'trantib', 'levanc', 'ldquan', 'admin', 'ldquan', 'trantib']

const RL_STATUS_COLOR = {
  Active:  'green',
  Draft:   'default',
  Updated: 'blue',
  Renew:   'orange',
  Expired: 'red',
}

const APPROVAL_COLOR = {
  Approved: 'green',
  Pending:  'orange',
  'N/A':    'default',
}

const INITIAL_FILTERS = {
  sourceName:       '',
  targetName:       '',
  relationshipType: undefined,
  sourceCIType:     undefined,
  targetCIType:     undefined,
  rlStatus:         undefined,
  approvalStatus:   undefined,
  applyDateRange:   null,
  expiredDateRange: null,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return null
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}

const getCIKeyInfo = (ci) => {
  if (!ci || !ci.attributes) return '—'
  const { attributes: a, ciTypeId } = ci
  if (ciTypeId === 'server' || ciTypeId === 'virtual_machine') {
    const parts = [a.ip_address, a.os_type].filter(Boolean)
    return parts.join(', ') || ci.shortDescription || '—'
  }
  if (ciTypeId === 'database') {
    return [a.db_type, a.port ? String(a.port) : null].filter(Boolean).join(':') || '—'
  }
  if (ciTypeId === 'application' || ciTypeId === 'middleware') {
    const parts = [a.port ? String(a.port) : null, a.protocol, ci.environment].filter(Boolean)
    return parts.join(', ') || ci.shortDescription || '—'
  }
  if (ciTypeId === 'network_device') {
    return [a.ip_address, a.device_type].filter(Boolean).join(', ') || ci.shortDescription || '—'
  }
  if (ciTypeId === 'cloud_service') {
    return [a.region, a.service_type].filter(Boolean).join(', ') || ci.shortDescription || '—'
  }
  return ci.shortDescription || '—'
}

const buildCIMap = (ciItems) => {
  const map = {}
  ciItems.forEach((ci) => { map[ci.id] = ci })
  return map
}

const buildCITypeMap = (ciTypeItems) => {
  const labelMap = {}
  const colorMap = {}
  ciTypeItems.forEach((t) => {
    labelMap[t.name] = t.label
    colorMap[t.name] = t.color
  })
  return { labelMap, colorMap }
}

const getRelTypeLabel = (value) => {
  const found = RELATIONSHIP_TYPES.find((t) => t.value === value)
  return found ? found.label : value
}

const enrichRelationships = (items, ciMap, ciTypeLabelMap) => {
  return items.map((rel, index) => {
    const srcCI = ciMap[rel.sourceId]
    const tgtCI = ciMap[rel.targetId]
    const num = index + 1
    return {
      id:              rel.id,
      relationshipKey: `RLK-${String(num).padStart(3, '0')}`,
      sourceId:        rel.sourceId,
      targetId:        rel.targetId,
      sourceName:      srcCI ? srcCI.name : rel.sourceId,
      sourceCIType:    srcCI ? (ciTypeLabelMap[srcCI.ciTypeId] || srcCI.ciTypeId) : '',
      sourceCITypeKey: srcCI ? srcCI.ciTypeId : '',
      sourceKeyInfo:   getCIKeyInfo(srcCI),
      relationshipType: rel.relationshipType,
      targetName:      tgtCI ? tgtCI.name : rel.targetId,
      targetCIType:    tgtCI ? (ciTypeLabelMap[tgtCI.ciTypeId] || tgtCI.ciTypeId) : '',
      targetCITypeKey: tgtCI ? tgtCI.ciTypeId : '',
      targetKeyInfo:   getCIKeyInfo(tgtCI),
      applyDate:       rel.createdAt,
      expiredDate:     rel.expiredDate,
      accessType:      MOCK_ACCESS[index % MOCK_ACCESS.length],
      rlStatus:        MOCK_STATUS[index % MOCK_STATUS.length],
      approvalStatus:  MOCK_APPROVAL[index % MOCK_APPROVAL.length],
      modifyBy:        rel.createdBy || MOCK_USERS[index % MOCK_USERS.length],
    }
  })
}

const applyFilters = (items, f) => {
  // client-side fallback for rlStatus/approvalStatus/date ranges which are mock-enriched fields
  return items.filter((r) => {
    if (f.rlStatus       && r.rlStatus !== f.rlStatus) return false
    if (f.approvalStatus && r.approvalStatus !== f.approvalStatus) return false
    if (f.applyDateRange && f.applyDateRange[0] && f.applyDateRange[1]) {
      const from = f.applyDateRange[0].startOf('day').valueOf()
      const to   = f.applyDateRange[1].endOf('day').valueOf()
      const d    = r.applyDate ? new Date(r.applyDate).getTime() : null
      if (!d || d < from || d > to) return false
    }
    if (f.expiredDateRange && f.expiredDateRange[0] && f.expiredDateRange[1]) {
      const from = f.expiredDateRange[0].startOf('day').valueOf()
      const to   = f.expiredDateRange[1].endOf('day').valueOf()
      const d    = r.expiredDate ? new Date(r.expiredDate).getTime() : null
      if (!d || d < from || d > to) return false
    }
    return true
  })
}

const countActiveFilters = (f) =>
  Object.values(f).filter((v) => {
    if (v === undefined || v === null || v === '') return false
    if (Array.isArray(v)) return v.some(Boolean)
    return true
  }).length

// ── Column definitions ───────────────────────────────────────────────────────

const buildColumns = (ciTypeColorMap, onEdit) => [
  {
    title: 'Source CI',
    dataIndex: 'sourceName',
    width: 260,
    fixed: 'left',
    render: (name, record) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span>
        {record.sourceCIType && (
          <Tag
            color={ciTypeColorMap[record.sourceCITypeKey] || '#8c8c8c'}
            style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0 }}
          >
            {record.sourceCIType}
          </Tag>
        )}
      </span>
    ),
  },
  {
    title: 'Key Infor',
    dataIndex: 'sourceKeyInfo',
    width: 140,
    fixed: 'left',
    render: (val) => (
      <Tooltip title={val} placement="topLeft">
        <span style={{
          color: '#595959', fontSize: 12,
          display: 'block', maxWidth: 124,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {val}
        </span>
      </Tooltip>
    ),
  },
  {
    title: 'Relationship',
    dataIndex: 'relationshipType',
    width: 120,
    fixed: 'left',
    render: (val) => (
      <Tag color={RELATIONSHIP_TYPE_COLORS[val] || '#1890ff'} style={{ fontSize: 11, margin: 0 }}>
        {getRelTypeLabel(val)}
      </Tag>
    ),
  },
  {
    title: 'Destination CI',
    dataIndex: 'targetName',
    width: 260,
    fixed: 'left',
    render: (name, record) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span>
        {record.targetCIType && (
          <Tag
            color={ciTypeColorMap[record.targetCITypeKey] || '#8c8c8c'}
            style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0 }}
          >
            {record.targetCIType}
          </Tag>
        )}
      </span>
    ),
  },
  {
    title: 'Key Infor',
    dataIndex: 'targetKeyInfo',
    width: 300,
    render: (val) => (
      <Tooltip title={val} placement="topLeft">
        <span style={{
          color: '#595959', fontSize: 12,
          display: 'block', maxWidth: 124,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {val}
        </span>
      </Tooltip>
    ),
  },
  {
    title: 'Apply Date',
    dataIndex: 'applyDate',
    width: 100,
    render: (val) => val
      ? <span style={{ fontSize: 12, color: '#595959' }}>{formatDate(val)}</span>
      : <span style={{ color: '#d9d9d9' }}>—</span>,
  },
  {
    title: 'Expire Date',
    dataIndex: 'expiredDate',
    width: 100,
    render: (val) => {
      if (!val) return <span style={{ color: '#d9d9d9' }}>—</span>
      const expired = new Date(val) < new Date()
      return (
        <span style={{ fontSize: 12, color: expired ? '#f5222d' : '#595959' }}>
          {formatDate(val)}
        </span>
      )
    },
  },
  {
    title: 'Access Type',
    dataIndex: 'accessType',
    width: 100,
    render: (val) => (
      <Tag color={val === 'Allow' ? 'green' : 'red'} style={{ fontSize: 11, margin: 0 }}>
        {val}
      </Tag>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'rlStatus',
    width: 90,
    render: (val) => (
      <Tag color={RL_STATUS_COLOR[val] || 'default'} style={{ fontSize: 11, margin: 0 }}>
        {val}
      </Tag>
    ),
  },
  {
    title: 'Approval Status',
    dataIndex: 'approvalStatus',
    width: 130,
    render: (val) => (
      <Tag color={APPROVAL_COLOR[val] || 'default'} style={{ fontSize: 11, margin: 0 }}>
        {val}
      </Tag>
    ),
  },
  {
    title: 'Modify by',
    dataIndex: 'modifyBy',
    width: 100,
    render: (val) => <span style={{ fontSize: 12, color: '#595959' }}>{val || '—'}</span>,
  },
  {
    title: 'Action',
    width: 75,
    align: 'center',
    fixed: 'right',
    render: (_, record) => (
      <Button
        type="link"
        size="small"
        icon="edit"
        style={{ padding: '0 4px', color: '#1890ff' }}
        onClick={() => onEdit(record)}
      >
        Edit
      </Button>
    ),
  },
]

// ── Page Component ───────────────────────────────────────────────────────────

const RelationshipListPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const allRelationships = useSelector(state => state.cmplan.ciRelationships.items)
  const ciItems          = useSelector(state => state.cmplan.configurationItems.items)
  const ciTypeItems      = useSelector(state => state.cmplan.ciTypes.items)
  const loading          = useSelector(state => state.cmplan.ciRelationships.loading)
  const submitting       = useSelector(state => state.cmplan.ciRelationships.submitting)

  const [filters, setFilters]               = useState(INITIAL_FILTERS)
  const [currentPage, setCurrentPage]        = useState(1)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editRecord, setEditRecord]           = useState(null)

  useEffect(() => {
    dispatch(fetchRelationships({}))
    dispatch(fetchConfigurationItems({ pageSize: 9999 }))
    dispatch(fetchCITypes())
  }, [dispatch])

  // ── Derived data ─────────────────────────────────────────────────────────

  const ciMap = useMemo(() => buildCIMap(ciItems), [ciItems])

  const { labelMap: ciTypeLabelMap, colorMap: ciTypeColorMap } = useMemo(
    () => buildCITypeMap(ciTypeItems),
    [ciTypeItems]
  )

  const enrichedItems = useMemo(
    () => enrichRelationships(allRelationships, ciMap, ciTypeLabelMap),
    [allRelationships, ciMap, ciTypeLabelMap]
  )

  const ciTypeOptions = useMemo(
    () => ciTypeItems.map(t => ({ value: t.name, label: t.label })),
    [ciTypeItems]
  )

  const filteredItems = useMemo(
    () => applyFilters(enrichedItems, filters),
    [enrichedItems, filters]
  )

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters]
  )

  const handleEditOpen = useCallback((record) => {
    setEditRecord(record)
  }, [])

  const handleEditClose = useCallback(() => {
    setEditRecord(null)
  }, [])

  const handleEditSubmit = useCallback((payload) => {
    const { id, ...rest } = payload
    dispatch(updateRelationship({ id, payload: rest }))
      .then((action) => {
        if (!action.error) {
          setEditRecord(null)
        }
      })
  }, [dispatch])

  const columns = useMemo(
    () => buildColumns(ciTypeColorMap, handleEditOpen),
    [ciTypeColorMap, handleEditOpen]
  )

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handlePending = useCallback((key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleSearch = useCallback(() => {
    dispatch(fetchRelationships({
      sourceName:       filters.sourceName       || undefined,
      targetName:       filters.targetName       || undefined,
      relationshipType: filters.relationshipType || undefined,
      sourceCIType:     filters.sourceCIType     || undefined,
      targetCIType:     filters.targetCIType     || undefined,
    }))
    setCurrentPage(1)
  }, [dispatch, filters])

  const handleReset = useCallback(() => {
    setFilters(INITIAL_FILTERS)
    dispatch(fetchRelationships({}))
    setCurrentPage(1)
  }, [dispatch])

  const handleNavigateToBulkAdd = useCallback(() => {
    history.push('/cmplan/bulk-add-relationships')
  }, [history])

  const handleDeleteSelected = useCallback(() => {
    Modal.confirm({
      title: `Delete ${selectedRowKeys.length} relationship(s)?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      icon: <Icon type="exclamation-circle" style={{ color: '#ff4d4f' }} />,
      onOk: () => {
        selectedRowKeys.forEach(id => dispatch(deleteRelationship(id)))
        setSelectedRowKeys([])
      },
    })
  }, [dispatch, selectedRowKeys])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="cmplan-page">
      {/* Filter bar */}
      <div style={{
        background: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: 6,
        padding: '16px 24px',
        marginBottom: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {/* Row 1 */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
          <Input
            placeholder="Source CI"
            value={filters.sourceName}
            onChange={e => handlePending('sourceName', e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 180 }}
            prefix={<Icon type="search" style={{ color: '#bfbfbf' }} />}
          />
          <Input
            placeholder="Destination CI"
            value={filters.targetName}
            onChange={e => handlePending('targetName', e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 180 }}
            prefix={<Icon type="search" style={{ color: '#bfbfbf' }} />}
          />
          <Select
            placeholder="Choose relationship"
            allowClear
            value={filters.relationshipType}
            onChange={val => handlePending('relationshipType', val)}
            style={{ width: 200 }}
          >
            {RELATIONSHIP_TYPES.map(t => (
              <Option key={t.value} value={t.value}>{t.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Choose Source CI Type"
            allowClear
            value={filters.sourceCIType}
            onChange={val => handlePending('sourceCIType', val)}
            style={{ width: 210 }}
          >
            {ciTypeOptions.map(t => (
              <Option key={t.value} value={t.value}>{t.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Choose Destination CI Type"
            allowClear
            value={filters.targetCIType}
            onChange={val => handlePending('targetCIType', val)}
            style={{ width: 230 }}
          >
            {ciTypeOptions.map(t => (
              <Option key={t.value} value={t.value}>{t.label}</Option>
            ))}
          </Select>

          {/* action buttons flush right */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Tooltip title="Search">
              <Button
                shape="circle"
                icon="search"
                type="primary"
                onClick={handleSearch}
              />
            </Tooltip>
            <Tooltip title={activeFilterCount > 0 ? `Reset (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''})` : 'Reset filters'}>
              <Button
                shape="circle"
                icon="reload"
                onClick={handleReset}
              />
            </Tooltip>
            {selectedRowKeys.length > 0 && (
              <Tooltip title={`Delete selected (${selectedRowKeys.length})`}>
                <Button
                  shape="circle"
                  icon="delete"
                  style={{ color: '#ff4d4f' }}
                  onClick={handleDeleteSelected}
                />
              </Tooltip>
            )}
            <Button
              type="primary"
              icon="plus"
              onClick={handleNavigateToBulkAdd}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              Add Bulk Relationship
            </Button>
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            placeholder="Choose Status"
            allowClear
            value={filters.rlStatus}
            onChange={val => handlePending('rlStatus', val)}
            style={{ width: 180 }}
          >
            {RL_STATUS_OPTIONS.map(s => (
              <Option key={s.value} value={s.value}>{s.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Approval Status"
            allowClear
            value={filters.approvalStatus}
            onChange={val => handlePending('approvalStatus', val)}
            style={{ width: 180 }}
          >
            {APPROVAL_STATUS_OPTIONS.map(s => (
              <Option key={s.value} value={s.value}>{s.label}</Option>
            ))}
          </Select>
          <DatePicker.RangePicker
            placeholder={['Apply Date from', 'Apply Date to']}
            value={filters.applyDateRange}
            onChange={val => handlePending('applyDateRange', val || null)}
            format="MM/DD/YYYY"
            style={{ width: 280 }}
          />
          <DatePicker.RangePicker
            placeholder={['Expire Date from', 'Expire Date to']}
            value={filters.expiredDateRange}
            onChange={val => handlePending('expiredDateRange', val || null)}
            format="MM/DD/YYYY"
            style={{ width: 280 }}
          />
          {activeFilterCount > 0 && (
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              <Icon type="filter" style={{ marginRight: 4 }} />
              {filteredItems.length} / {enrichedItems.length} records
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <Spin spinning={loading}>
        <Table
          className="rel-list-table"
          size="small"
          bordered
          rowKey="id"
          dataSource={filteredItems}
          columns={columns}
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            total: filteredItems.length,
            onChange: setCurrentPage,
            showSizeChanger: false,
            showTotal: (total, range) =>
              activeFilterCount > 0
                ? `${range[0]}–${range[1]} of ${total} (filtered from ${enrichedItems.length})`
                : `${total} records`,
            size: 'small',
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '32px 0', color: '#bfbfbf' }}>
                <Icon type="inbox" style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
                {activeFilterCount > 0
                  ? 'No relationships match the current filters'
                  : 'No relationships yet'}
              </div>
            ),
          }}
        />
      </Spin>

      <EditRelationshipModal
        visible={!!editRecord}
        record={editRecord}
        submitting={submitting}
        onSubmit={handleEditSubmit}
        onClose={handleEditClose}
      />
    </div>
  )
}

export default RelationshipListPage

