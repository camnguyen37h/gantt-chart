import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Table, Button, Input, Select, Card,
  Popconfirm, notification, Tag, Icon,
  Spin, Tooltip,
} from 'antd'
import { useHistory } from 'react-router-dom'
import {
  fetchAllRelationships,
  deleteRelationship,
  fetchConfigurationItems,
} from '../../store/cmplan'
import {
  RELATIONSHIP_TYPES,
} from '../../utils/cmplan/cmplanConstants'
import { RELATIONSHIP_TYPE_COLORS } from '../../utils/cmplan/bulkRelationshipConstants'
import './CMPlan.css'

const { Option } = Select

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const FILTER_TYPE = {
  SELECT: 'select',
  INPUT: 'input',
}

const MATCH_MODE = {
  EXACT: 'exact',
  INCLUDES: 'includes',
}

const COLUMN_WIDTH = {
  TYPE: 140,
  CI_NAME: 180,
  DESCRIPTION: 260,
  EXPIRED: 120,
  CREATED: 120,
  ACTION: 80,
}

const STAT_COLORS = {
  DEPENDS_ON: '#f5222d',
  RUNS_ON: '#fa8c16',
  HOSTS: '#52c41a',
}

// ── Filter config (declarative) ──────────────────────────────────────────────

const FILTER_CONFIG = [
  {
    key: 'relationshipType',
    dataIndex: 'relationshipType',
    type: FILTER_TYPE.SELECT,
    controlProps: { placeholder: 'Relationship Type', allowClear: true },
    options: RELATIONSHIP_TYPES,
    matchMode: MATCH_MODE.EXACT,
  },
  {
    key: 'ciName',
    dataIndex: '_ciName',
    type: FILTER_TYPE.INPUT,
    controlProps: {
      placeholder: 'Search CI name...',
      prefix: <Icon type="search" style={{ color: '#bfbfbf' }} />,
      allowClear: true,
    },
    matchMode: MATCH_MODE.INCLUDES,
  },
]

const INITIAL_FILTER_VALUES = FILTER_CONFIG.reduce((result, filter) => {
  result[filter.key] = filter.type === FILTER_TYPE.SELECT ? undefined : ''
  return result
}, {})

// ── Helpers ──────────────────────────────────────────────────────────────────

const getRelTypeLabel = (value) => {
  const found = RELATIONSHIP_TYPES.find((t) => t.value === value)
  return found ? found.label : value
}

const buildCIMap = (ciItems) => {
  const map = {}
  ciItems.forEach((ci) => {
    map[ci.id] = ci
  })
  return map
}

const enrichRelationships = (items, ciMap) => {
  return items.map((rel) => {
    const srcCI = ciMap[rel.sourceId]
    const tgtCI = ciMap[rel.targetId]
    return {
      id: rel.id,
      sourceId: rel.sourceId,
      targetId: rel.targetId,
      sourceName: (srcCI && srcCI.name) || rel.sourceId,
      targetName: (tgtCI && tgtCI.name) || rel.targetId,
      relationshipType: rel.relationshipType,
      description: rel.description || '',
      expiredDate: rel.expiredDate || null,
      createdBy: rel.createdBy || '',
      createdAt: rel.createdAt || '',
      _ciName: ((srcCI && srcCI.name) || '') + ' ' + ((tgtCI && tgtCI.name) || ''),
    }
  })
}

const countActiveFilters = (filterValues) => {
  return FILTER_CONFIG.filter((filter) => {
    const currentValue = filterValues[filter.key]
    return currentValue !== undefined && currentValue !== ''
  }).length
}

const applyFilters = (items, filterValues) => {
  return items.filter((item) => {
    return FILTER_CONFIG.every((filter) => {
      const filterValue = filterValues[filter.key]
      if (filterValue === undefined || filterValue === null || filterValue === '') return true
      if (filter.matchMode === MATCH_MODE.EXACT) return item[filter.dataIndex] === filterValue
      const fieldText = String(item[filter.dataIndex] || '').toLowerCase()
      return fieldText.includes(String(filterValue).toLowerCase())
    })
  })
}

const paginateData = (data, currentPage, pageSize) => {
  return data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
}

const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

const isExpired = (expiredDate) => {
  if (!expiredDate) return false
  return new Date(expiredDate) < new Date()
}

// ── Column definitions ───────────────────────────────────────────────────────

const buildColumns = (onDelete) => [
  {
    title: 'Type',
    dataIndex: 'relationshipType',
    width: COLUMN_WIDTH.TYPE,
    sorter: (a, b) => a.relationshipType.localeCompare(b.relationshipType),
    render: (value) => (
      <Tag color={RELATIONSHIP_TYPE_COLORS[value] || '#1890ff'} style={{ fontSize: 11, margin: 0 }}>
        {getRelTypeLabel(value)}
      </Tag>
    ),
  },
  {
    title: 'Source CI',
    dataIndex: 'sourceName',
    width: COLUMN_WIDTH.CI_NAME,
    sorter: (a, b) => a.sourceName.localeCompare(b.sourceName),
    render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
  },
  {
    title: '',
    width: 40,
    align: 'center',
    render: () => <Icon type="arrow-right" style={{ color: '#bfbfbf' }} />,
  },
  {
    title: 'Target CI',
    dataIndex: 'targetName',
    width: COLUMN_WIDTH.CI_NAME,
    sorter: (a, b) => a.targetName.localeCompare(b.targetName),
    render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    width: COLUMN_WIDTH.DESCRIPTION,
    render: (text) => {
      if (!text) return <span style={{ color: '#d9d9d9' }}>—</span>
      return (
        <Tooltip title={text} placement="topLeft">
          <span style={{
            color: '#8c8c8c',
            fontSize: 12,
            display: 'inline-block',
            maxWidth: COLUMN_WIDTH.DESCRIPTION - 16,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle',
          }}>
            {text}
          </span>
        </Tooltip>
      )
    },
  },
  {
    title: 'Expired',
    dataIndex: 'expiredDate',
    width: COLUMN_WIDTH.EXPIRED,
    sorter: (a, b) => {
      if (!a.expiredDate && !b.expiredDate) return 0
      if (!a.expiredDate) return 1
      if (!b.expiredDate) return -1
      return a.expiredDate.localeCompare(b.expiredDate)
    },
    render: (value) => {
      if (!value) return <span style={{ color: '#d9d9d9' }}>—</span>
      const expired = isExpired(value)
      return (
        <span style={{ color: expired ? '#f5222d' : '#8c8c8c', fontSize: 12 }}>
          {formatDate(value)}
          {expired && (
            <Tag color="red" style={{ marginLeft: 6, fontSize: 10 }}>Expired</Tag>
          )}
        </span>
      )
    },
  },
  {
    title: 'Created',
    dataIndex: 'createdAt',
    width: COLUMN_WIDTH.CREATED,
    sorter: (a, b) => {
      if (!a.createdAt && !b.createdAt) return 0
      if (!a.createdAt) return 1
      if (!b.createdAt) return -1
      return a.createdAt.localeCompare(b.createdAt)
    },
    render: (value) => {
      if (!value) return <span style={{ color: '#d9d9d9' }}>—</span>
      return <span style={{ color: '#8c8c8c', fontSize: 12 }}>{formatDate(value)}</span>
    },
  },
  {
    title: 'Action',
    width: COLUMN_WIDTH.ACTION,
    align: 'center',
    render: (_, record) => (
      <Popconfirm
        title="Delete this relationship?"
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        onConfirm={() => onDelete(record.id)}
      >
        <Tooltip title="Delete">
          <Button
            type="link"
            size="small"
            icon="delete"
            style={{ padding: '0 4px', color: '#ff4d4f' }}
          />
        </Tooltip>
      </Popconfirm>
    ),
  },
]

// ── Page Component ───────────────────────────────────────────────────────────

const RelationshipListPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const allRelationships = useSelector(state => state.cmplan.ciRelationships.items)
  const ciItems = useSelector(state => state.cmplan.configurationItems.items)
  const loading = useSelector(state => state.cmplan.ciRelationships.loading)

  const [filterValues, setFilterValues] = useState(INITIAL_FILTER_VALUES)
  const [pendingFilters, setPendingFilters] = useState(INITIAL_FILTER_VALUES)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchAllRelationships())
    dispatch(fetchConfigurationItems({ pageSize: 9999 }))
  }, [dispatch])

  // ── Derived data ─────────────────────────────────────────────────────────

  const ciMap = useMemo(() => buildCIMap(ciItems), [ciItems])

  const enrichedItems = useMemo(
    () => enrichRelationships(allRelationships, ciMap),
    [allRelationships, ciMap]
  )

  const activeFilterCount = countActiveFilters(filterValues)

  const stats = useMemo(() => {
    const typeCounts = {}
    for (let i = 0; i < enrichedItems.length; i++) {
      const type = enrichedItems[i].relationshipType
      typeCounts[type] = (typeCounts[type] || 0) + 1
    }
    const expiredCount = enrichedItems.filter((r) => isExpired(r.expiredDate)).length
    return { total: enrichedItems.length, typeCounts, expiredCount }
  }, [enrichedItems])

  const topTypes = useMemo(() => {
    const entries = Object.keys(stats.typeCounts).map((type) => ({
      type,
      count: stats.typeCounts[type],
    }))
    entries.sort((a, b) => b.count - a.count)
    return entries.slice(0, 3)
  }, [stats.typeCounts])

  const filteredItems = useMemo(
    () => applyFilters(enrichedItems, filterValues),
    [enrichedItems, filterValues]
  )

  const paginatedItems = useMemo(
    () => paginateData(filteredItems, currentPage, PAGE_SIZE),
    [filteredItems, currentPage]
  )

  // ── Filter handlers ──────────────────────────────────────────────────────

  const handlePendingFilterChange = useCallback((filterKey, selectedValue) => {
    setPendingFilters((prevFilters) => {
      const nextFilters = {}
      Object.keys(prevFilters).forEach((key) => { nextFilters[key] = prevFilters[key] })
      nextFilters[filterKey] = selectedValue
      return nextFilters
    })
  }, [])

  const handleSearch = useCallback(() => {
    setFilterValues(pendingFilters)
    setCurrentPage(1)
  }, [pendingFilters])

  const handleReset = useCallback(() => {
    setPendingFilters(INITIAL_FILTER_VALUES)
    setFilterValues(INITIAL_FILTER_VALUES)
    setCurrentPage(1)
  }, [])

  // ── CRUD handlers ────────────────────────────────────────────────────────

  const handleDelete = useCallback((recordId) => {
    dispatch(deleteRelationship(recordId)).then((result) => {
      if (result.error) {
        notification.error({
          message: 'Delete failed',
          description: (result.payload && result.payload) || 'An error occurred.',
        })
      } else {
        notification.success({ message: 'Relationship deleted' })
      }
    })
  }, [dispatch])

  const handleNavigateToBulkAdd = useCallback(() => {
    history.push('/cmplan/bulk-add-relationships')
  }, [history])

  // ── Memoized columns ────────────────────────────────────────────────────

  const columns = useMemo(
    () => buildColumns(handleDelete),
    [handleDelete]
  )

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="cmplan-page">
      <div className="cmplan-page-header">
        <div className="cmplan-page-header-left">
          <Icon type="deployment-unit" className="cmplan-page-header-icon" />
          <div>
            <p className="cmplan-page-title">CI Relationships</p>
            <p className="cmplan-page-subtitle">
              View and manage all relationships between configuration items.
            </p>
          </div>
        </div>
        <div className="cmplan-page-header-stats">
          <div className="cmplan-stat-pill">
            <span className="cmplan-stat-pill-value">{stats.total}</span>
            <span className="cmplan-stat-pill-label">Total</span>
          </div>
          {topTypes.map((entry) => (
            <div key={entry.type} className="cmplan-stat-pill">
              <span
                className="cmplan-stat-pill-value"
                style={{ color: RELATIONSHIP_TYPE_COLORS[entry.type] || '#1890ff' }}
              >
                {entry.count}
              </span>
              <span className="cmplan-stat-pill-label">{getRelTypeLabel(entry.type)}</span>
            </div>
          ))}
          {stats.expiredCount > 0 && (
            <div className="cmplan-stat-pill">
              <span className="cmplan-stat-pill-value" style={{ color: '#f5222d' }}>
                {stats.expiredCount}
              </span>
              <span className="cmplan-stat-pill-label">Expired</span>
            </div>
          )}
        </div>
      </div>

      <Card bodyStyle={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap' }}>
            {FILTER_CONFIG.map((filter) => (
              <div key={filter.key} style={{ width: 200, marginRight: 8, marginBottom: 4 }}>
                {filter.type === FILTER_TYPE.SELECT ? (
                  <Select
                    {...filter.controlProps}
                    style={{ width: '100%' }}
                    value={pendingFilters[filter.key]}
                    onChange={(selectedValue) => handlePendingFilterChange(filter.key, selectedValue)}
                  >
                    {(filter.options || []).map((option) => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    {...filter.controlProps}
                    value={pendingFilters[filter.key]}
                    onChange={(event) => handlePendingFilterChange(filter.key, event.target.value)}
                    onPressEnter={handleSearch}
                  />
                )}
              </div>
            ))}
            <div style={{ whiteSpace: 'nowrap', marginBottom: 4 }}>
              <Button
                type="primary"
                icon="search"
                onClick={handleSearch}
                style={{ marginRight: 8, display: 'inline-flex', alignItems: 'center' }}
              >
                Search
              </Button>
              <Button
                icon="reload"
                onClick={handleReset}
                style={{ display: 'inline-flex', alignItems: 'center' }}
              >
                {activeFilterCount > 0 ? 'Reset (' + activeFilterCount + ')' : 'Reset'}
              </Button>
            </div>
          </div>
          <div style={{ whiteSpace: 'nowrap', marginBottom: 4 }}>
            <Button
              type="primary"
              icon="plus"
              onClick={handleNavigateToBulkAdd}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              Bulk Add
            </Button>
          </div>
        </div>

        <Spin spinning={loading}>
          <Table
            size="small"
            bordered
            rowKey="id"
            dataSource={paginatedItems}
            columns={columns}
            pagination={{
              current: currentPage,
              pageSize: PAGE_SIZE,
              total: filteredItems.length,
              onChange: setCurrentPage,
              showTotal: (total, range) =>
                activeFilterCount > 0
                  ? range[0] + '–' + range[1] + ' of ' + total + ' (filtered from ' + enrichedItems.length + ')'
                  : total + ' records',
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
      </Card>
    </div>
  )
}

export default RelationshipListPage
