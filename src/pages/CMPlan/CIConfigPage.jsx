import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Table, Button, Input, Select, Card,
  Popconfirm, notification, Tag, Icon,
  Spin, Tooltip,
} from 'antd'
import {
  fetchCIRuleConfigs,
  createCIRuleConfig,
  updateCIRuleConfig,
  deleteCIRuleConfig,
} from '../../store/cmplan'
import {
  RULE_CONFIG_CATEGORIES,
  RULE_CONFIG_CATEGORY_COLORS,
  RULE_CONFIG_CATEGORY_VALUES,
} from '../../utils/cmplan/cmplanConstants'
import CIConfigFormModal from '../../components/CMPlan/CIConfig/CIConfigFormModal'
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
  CATEGORY: 155,
  NAME: 170,
  VALUE_CODE_MAX: 340,
  ACTION: 80,
}

const STAT_COLORS = {
  VALIDATION_RULE: '#52c41a',
  RELATIONSHIP_TYPE: '#722ed1',
}

// ── Filter config (declarative) ──────────────────────────────────────────────

const FILTER_CONFIG = [
  {
    key: 'category',
    dataIndex: 'category',
    type: FILTER_TYPE.SELECT,
    controlProps: { placeholder: 'Search Category', allowClear: true },
    options: RULE_CONFIG_CATEGORIES,
    matchMode: MATCH_MODE.EXACT,
  },
  {
    key: 'name',
    dataIndex: 'name',
    type: FILTER_TYPE.INPUT,
    controlProps: {
      placeholder: 'Name',
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

const getCategoryLabel = (categoryValue) => {
  const matched = RULE_CONFIG_CATEGORIES.find((category) => category.value === categoryValue)
  return matched ? matched.label : categoryValue
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

// ── Column definitions ───────────────────────────────────────────────────────

const buildColumns = (onEdit, onDelete) => [
  {
    title: 'Category',
    dataIndex: 'category',
    width: COLUMN_WIDTH.CATEGORY,
    render: (categoryValue) => (
      <Tag color={RULE_CONFIG_CATEGORY_COLORS[categoryValue]} style={{ fontSize: 11, margin: 0 }}>
        {getCategoryLabel(categoryValue)}
      </Tag>
    ),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    width: COLUMN_WIDTH.NAME,
    sorter: (rowA, rowB) => rowA.name.localeCompare(rowB.name),
    render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
  },
  {
    title: 'Value',
    dataIndex: 'value',
    render: (text, record) => {
      const isRegex = record.category === RULE_CONFIG_CATEGORY_VALUES.VALIDATION_RULE
      return (
        <Tooltip title={text} placement="topLeft">
          <code style={{
            display: 'inline-block',
            maxWidth: COLUMN_WIDTH.VALUE_CODE_MAX,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle',
            fontSize: 11,
            background: isRegex ? '#f6ffed' : '#f9f0ff',
            color: isRegex ? '#389e0d' : '#531dab',
            padding: '2px 8px',
            borderRadius: 3,
            border: '1px solid ' + (isRegex ? '#b7eb8f' : '#d3adf7'),
          }}>
            {text}
          </code>
        </Tooltip>
      )
    },
  },
  {
    title: 'Description',
    dataIndex: 'description',
    render: (text) => {
      if (!text) return <span style={{ color: '#d9d9d9' }}>—</span>
      return <span style={{ color: '#8c8c8c', fontSize: 12 }}>{text}</span>
    },
  },
  {
    title: 'Action',
    width: COLUMN_WIDTH.ACTION,
    align: 'center',
    render: (_, record) => (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Tooltip title="Edit">
          <Button
            type="link"
            size="small"
            icon="edit"
            style={{ padding: '0 4px', color: '#1890ff' }}
            onClick={() => onEdit(record)}
          />
        </Tooltip>
        <Popconfirm
          title="Delete this config?"
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
      </span>
    ),
  },
]

// ── Page Component ───────────────────────────────────────────────────────────

const CIConfigPage = () => {
  const dispatch = useDispatch()
  const allItems = useSelector(state => state.cmplan.ciRuleConfig.items)
  const loading = useSelector(state => state.cmplan.ciRuleConfig.loading)
  const submitting = useSelector(state => state.cmplan.ciRuleConfig.submitting)

  const [filterValues, setFilterValues] = useState(INITIAL_FILTER_VALUES)
  const [pendingFilters, setPendingFilters] = useState(INITIAL_FILTER_VALUES)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  useEffect(() => {
    dispatch(fetchCIRuleConfigs())
  }, [dispatch])

  // ── Derived data ─────────────────────────────────────────────────────────

  const activeFilterCount = countActiveFilters(filterValues)

  const stats = useMemo(() => {
    let validationRuleCount = 0
    let relationshipTypeCount = 0
    for (let index = 0; index < allItems.length; index++) {
      const category = allItems[index].category
      if (category === RULE_CONFIG_CATEGORY_VALUES.VALIDATION_RULE) validationRuleCount++
      else if (category === RULE_CONFIG_CATEGORY_VALUES.RELATIONSHIP_TYPE) relationshipTypeCount++
    }
    return { total: allItems.length, validationRuleCount, relationshipTypeCount }
  }, [allItems])

  const filteredItems = useMemo(
    () => applyFilters(allItems, filterValues),
    [allItems, filterValues]
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

  // ── Modal handlers ───────────────────────────────────────────────────────

  const handleOpenCreateModal = useCallback(() => {
    setEditingRecord(null)
    setModalVisible(true)
  }, [])

  const handleOpenEditModal = useCallback((record) => {
    setEditingRecord(record)
    setModalVisible(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalVisible(false)
    setEditingRecord(null)
  }, [])

  // ── CRUD handlers ────────────────────────────────────────────────────────

  const handleDelete = useCallback((recordId) => {
    dispatch(deleteCIRuleConfig(recordId)).then((result) => {
      if (result.error) {
        notification.error({
          message: 'Delete failed',
          description: result.payload && result.payload.message,
        })
      } else {
        notification.success({ message: 'Deleted successfully' })
      }
    })
  }, [dispatch])

  const handleSubmit = useCallback((formValues) => {
    const action = editingRecord
      ? updateCIRuleConfig({ id: editingRecord.id, payload: formValues })
      : createCIRuleConfig(formValues)

    dispatch(action).then((result) => {
      if (result.error) {
        notification.error({
          message: 'Save failed',
          description: result.payload && result.payload.message,
        })
        return
      }
      notification.success({
        message: editingRecord ? 'Updated successfully' : 'Created successfully',
      })
      handleCloseModal()
    })
  }, [dispatch, editingRecord, handleCloseModal])

  // ── Memoized columns ────────────────────────────────────────────────────

  const columns = useMemo(
    () => buildColumns(handleOpenEditModal, handleDelete),
    [handleOpenEditModal, handleDelete]
  )

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="cmplan-page">
      <div className="cmplan-page-header">
        <div className="cmplan-page-header-left">
          <Icon type="setting" className="cmplan-page-header-icon" />
          <div>
            <p className="cmplan-page-title">CI Rule Configuration</p>
            <p className="cmplan-page-subtitle">
              Manage validation rules and relationship types used across CI definitions.
            </p>
          </div>
        </div>
        <div className="cmplan-page-header-stats">
          <div className="cmplan-stat-pill">
            <span className="cmplan-stat-pill-value">{stats.total}</span>
            <span className="cmplan-stat-pill-label">Total</span>
          </div>
          <div className="cmplan-stat-pill">
            <span className="cmplan-stat-pill-value" style={{ color: STAT_COLORS.VALIDATION_RULE }}>
              {stats.validationRuleCount}
            </span>
            <span className="cmplan-stat-pill-label">Validation Rules</span>
          </div>
          <div className="cmplan-stat-pill">
            <span className="cmplan-stat-pill-value" style={{ color: STAT_COLORS.RELATIONSHIP_TYPE }}>
              {stats.relationshipTypeCount}
            </span>
            <span className="cmplan-stat-pill-label">Relationship Types</span>
          </div>
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
              onClick={handleOpenCreateModal}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              New CI RuleConfig
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
                  ? range[0] + '–' + range[1] + ' of ' + total + ' (filtered from ' + allItems.length + ')'
                  : total + ' records',
              size: 'small',
            }}
            locale={{
              emptyText: (
                <div style={{ padding: '32px 0', color: '#bfbfbf' }}>
                  <Icon type="inbox" style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
                  {activeFilterCount > 0
                    ? 'No records match the current filters'
                    : 'No CI rule configs yet'}
                </div>
              ),
            }}
          />
        </Spin>
      </Card>

      <CIConfigFormModal
        visible={modalVisible}
        editingRecord={editingRecord}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={handleCloseModal}
      />
    </div>
  )
}

export default CIConfigPage
