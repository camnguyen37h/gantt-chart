import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Table, Button, Select, Card,
  Popconfirm, notification, Tag, Icon,
  Spin, Tooltip,
} from 'antd'
import {
  fetchCRMDirections,
  createCRMDirection,
  updateCRMDirection,
  deleteCRMDirection,
} from '../../store/cmplan'
import {
  CRM_SOURCE_CI_TYPES,
  CRM_DESTINATION_CI_TYPES,
  CRM_JIRA_TYPES,
} from '../../utils/cmplan/cmplanConstants'
import CRMDirectionFormModal from '../../components/CMPlan/CRMConfig/CRMDirectionFormModal'
import './CMPlan.css'

const { Option } = Select

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const FILTER_TYPE = {
  SELECT: 'select',
}

const MATCH_MODE = {
  EXACT: 'exact',
}

const COLUMN_WIDTH = {
  SOURCE_CI_TYPE: 160,
  DESTINATION_CI_TYPE: 180,
  JIRA_TYPE: 130,
  UPDATED_AT: 150,
  UPDATED_BY: 120,
  ACTION: 100,
}

const TAG_COLORS = {
  SOURCE_CI: 'blue',
  DESTINATION_CI: 'green',
  JIRA: 'orange',
}

// ── Filter config (declarative) ──────────────────────────────────────────────

const FILTER_CONFIG = [
  {
    key: 'sourceCIType',
    dataIndex: 'sourceCIType',
    type: FILTER_TYPE.SELECT,
    controlProps: { placeholder: 'Source CI Type', allowClear: true },
    options: CRM_SOURCE_CI_TYPES,
    matchMode: MATCH_MODE.EXACT,
  },
  {
    key: 'destinationCIType',
    dataIndex: 'destinationCIType',
    type: FILTER_TYPE.SELECT,
    controlProps: { placeholder: 'Destination CI Type', allowClear: true },
    options: CRM_DESTINATION_CI_TYPES,
    matchMode: MATCH_MODE.EXACT,
  },
  {
    key: 'jiraType',
    dataIndex: 'jiraType',
    type: FILTER_TYPE.SELECT,
    controlProps: { placeholder: 'Jira Type', allowClear: true },
    options: CRM_JIRA_TYPES,
    matchMode: MATCH_MODE.EXACT,
  },
]

const INITIAL_FILTER_VALUES = FILTER_CONFIG.reduce((result, filter) => {
  result[filter.key] = undefined
  return result
}, {})

// ── Helpers ──────────────────────────────────────────────────────────────────

const getLabelFromOptions = (options, value) => {
  const matched = options.find((option) => option.value === value)
  return matched ? matched.label : value
}

const countActiveFilters = (filterValues) => {
  return FILTER_CONFIG.filter((filter) => {
    return filterValues[filter.key] !== undefined
  }).length
}

const applyFilters = (items, filterValues) => {
  return items.filter((item) => {
    return FILTER_CONFIG.every((filter) => {
      const filterValue = filterValues[filter.key]
      if (filterValue === undefined || filterValue === null) return true
      return item[filter.dataIndex] === filterValue
    })
  })
}

const paginateData = (data, currentPage, pageSize) => {
  return data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return day + '/' + month + '/' + year
}

// ── Column definitions ───────────────────────────────────────────────────────

const buildColumns = (onEdit, onDelete) => [
  {
    title: 'Source CI Type',
    dataIndex: 'sourceCIType',
    width: COLUMN_WIDTH.SOURCE_CI_TYPE,
    sorter: (rowA, rowB) => rowA.sourceCIType.localeCompare(rowB.sourceCIType),
    render: (value) => (
      <Tag color={TAG_COLORS.SOURCE_CI} style={{ margin: 0 }}>
        {getLabelFromOptions(CRM_SOURCE_CI_TYPES, value)}
      </Tag>
    ),
  },
  {
    title: 'Destination CI Type',
    dataIndex: 'destinationCIType',
    width: COLUMN_WIDTH.DESTINATION_CI_TYPE,
    sorter: (rowA, rowB) => rowA.destinationCIType.localeCompare(rowB.destinationCIType),
    render: (value) => (
      <Tag color={TAG_COLORS.DESTINATION_CI} style={{ margin: 0 }}>
        {getLabelFromOptions(CRM_DESTINATION_CI_TYPES, value)}
      </Tag>
    ),
  },
  {
    title: 'Jira Type',
    dataIndex: 'jiraType',
    width: COLUMN_WIDTH.JIRA_TYPE,
    render: (value) => (
      <Tag color={TAG_COLORS.JIRA} style={{ margin: 0 }}>
        {getLabelFromOptions(CRM_JIRA_TYPES, value)}
      </Tag>
    ),
  },
  {
    title: 'Update At',
    dataIndex: 'updatedAt',
    width: COLUMN_WIDTH.UPDATED_AT,
    sorter: (rowA, rowB) => rowA.updatedAt.localeCompare(rowB.updatedAt),
    render: (value) => <span style={{ color: '#8c8c8c', fontSize: 12 }}>{formatDate(value)}</span>,
  },
  {
    title: 'Update By',
    dataIndex: 'updatedBy',
    width: COLUMN_WIDTH.UPDATED_BY,
    render: (value) => {
      if (!value) return <span style={{ color: '#d9d9d9' }}>—</span>
      return <span style={{ fontWeight: 500 }}>{value}</span>
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
          title="Delete this direction?"
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

const CRMConfigPage = () => {
  const dispatch = useDispatch()
  const allItems = useSelector(state => state.cmplan.crmDirection.items)
  const loading = useSelector(state => state.cmplan.crmDirection.loading)
  const submitting = useSelector(state => state.cmplan.crmDirection.submitting)

  const [filterValues, setFilterValues] = useState(INITIAL_FILTER_VALUES)
  const [pendingFilters, setPendingFilters] = useState(INITIAL_FILTER_VALUES)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  useEffect(() => {
    dispatch(fetchCRMDirections())
  }, [dispatch])

  // ── Derived data ─────────────────────────────────────────────────────────

  const activeFilterCount = countActiveFilters(filterValues)

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
    dispatch(deleteCRMDirection(recordId)).then((result) => {
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
      ? updateCRMDirection({ id: editingRecord.id, payload: formValues })
      : createCRMDirection(formValues)

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
          <Icon type="api" className="cmplan-page-header-icon" />
          <div>
            <p className="cmplan-page-title">CRM Configuration</p>
            <p className="cmplan-page-subtitle">
              Manage direction mappings between Source CI, Destination CI, and Jira ticket types.
            </p>
          </div>
        </div>
        <div className="cmplan-page-header-stats">
          <div className="cmplan-stat-pill">
            <span className="cmplan-stat-pill-value">{allItems.length}</span>
            <span className="cmplan-stat-pill-label">Total Directions</span>
          </div>
        </div>
      </div>

      <Card bodyStyle={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap' }}>
            {FILTER_CONFIG.map((filter) => (
              <div key={filter.key} style={{ width: 200, marginRight: 8, marginBottom: 4 }}>
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
              Create Direction
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
                    ? 'No directions match the current filters'
                    : 'No CRM directions yet'}
                </div>
              ),
            }}
          />
        </Spin>
      </Card>

      <CRMDirectionFormModal
        visible={modalVisible}
        editingRecord={editingRecord}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={handleCloseModal}
      />
    </div>
  )
}

export default CRMConfigPage
