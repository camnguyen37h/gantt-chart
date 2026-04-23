import React, { useEffect, useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Card, notification, Icon } from 'antd'
import {
  fetchCITypes,
  fetchAttributeDefinitions,
  fetchConfigurationItems,
  fetchCIRuleConfigs,
  createConfigurationItem,
  updateConfigurationItem,
  deleteConfigurationItem,
  fetchCIDetail,
  setFilters,
  resetFilters,
  setPagination,
  fetchAllRelationships,
  fetchAuditLogByCI,
} from '../../store/cmplan'
import CITable from '../../components/CMPlan/ConfigurationItems/CITable'
import CIFilterBar from '../../components/CMPlan/ConfigurationItems/CIFilterBar'
import CIFormModal from '../../components/CMPlan/ConfigurationItems/CIFormModal'
import CIDetailDrawer from '../../components/CMPlan/ConfigurationItems/CIDetailDrawer'
import './CMPlan.css'

const ConfigurationItemsPage = () => {
  const dispatch = useDispatch()

  // State
  const ciTypes = useSelector(state => state.cmplan.ciTypes.items)
  const items = useSelector(state => state.cmplan.configurationItems.items)
  const total = useSelector(state => state.cmplan.configurationItems.total)
  const loading = useSelector(state => state.cmplan.configurationItems.loading)
  const submitting = useSelector(state => state.cmplan.configurationItems.submitting)
  const filters = useSelector(state => state.cmplan.configurationItems.filters)
  const pagination = useSelector(state => state.cmplan.configurationItems.pagination)
  const allAttrDefs = useSelector(state => state.cmplan.attributeDefinitions.items)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCI, setEditingCI] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [viewingCI, setViewingCI] = useState(null)

  const viewingCITypeId = viewingCI ? viewingCI.ciTypeId : null
  // Attr defs for detail drawer (based on viewing CI class)
  const viewingCIAttrDefs = useMemo(
    () =>
      allAttrDefs
        .filter((a) => a.ciTypeId === viewingCITypeId || a.ciTypeId === null)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allAttrDefs, viewingCITypeId]
  )

  // Load initial data
  useEffect(() => {
    dispatch(fetchCITypes())
    dispatch(fetchAttributeDefinitions())
    dispatch(fetchCIRuleConfigs())
    dispatch(fetchAllRelationships())
  }, [dispatch])

  // Refetch CIs whenever filters / pagination change
  useEffect(() => {
    dispatch(
      fetchConfigurationItems({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
    )
  }, [dispatch, filters, pagination.page, pagination.pageSize])

  const handleFilterChange = useCallback(
    (updates) => {
      dispatch(setFilters(updates))
    },
    [dispatch]
  )

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters())
  }, [dispatch])

  const handlePageChange = useCallback(
    ({ page, pageSize }) => {
      dispatch(setPagination({ page, pageSize }))
    },
    [dispatch]
  )

  const handleAdd = useCallback(() => {
    setEditingCI(null)
    setModalVisible(true)
  }, [])

  const handleEdit = useCallback((record) => {
    setEditingCI(record)
    setModalVisible(true)
    // Close drawer if open
    setDrawerVisible(false)
  }, [])

  const handleView = useCallback(
    async (record) => {
      setViewingCI(null)
      setDrawerVisible(true)
      const result = await dispatch(fetchCIDetail(record.id))
      if (fetchCIDetail.fulfilled.match(result)) {
        setViewingCI(result.payload)
      } else {
        setViewingCI(record)
      }
    },
    [dispatch]
  )

  const handleDelete = useCallback(
    async (id) => {
      const result = await dispatch(deleteConfigurationItem(id))
      if (deleteConfigurationItem.fulfilled.match(result)) {
        notification.success({ message: 'Configuration Item retired successfully.' })
      } else {
        notification.error({ message: 'Failed to retire CI.' })
      }
    },
    [dispatch]
  )

  const handleModalSubmit = useCallback(
    async (values) => {
      let result
      if (values.id) {
        const { id, ...payload } = values
        result = await dispatch(updateConfigurationItem({ id, payload }))
        if (updateConfigurationItem.fulfilled.match(result)) {
          notification.success({ message: 'Configuration Item updated.' })
          setModalVisible(false)
          setEditingCI(null)
          // Refresh audit log if drawer will re-open for this CI
          if (viewingCI && viewingCI.id === id) {
            dispatch(fetchAuditLogByCI(id))
          }
        } else {
          notification.error({
            message: 'Update failed',
            description: result.payload && result.payload.message,
          })
        }
      } else {
        result = await dispatch(createConfigurationItem(values))
        if (createConfigurationItem.fulfilled.match(result)) {
          notification.success({ message: 'Configuration Item created.' })
          setModalVisible(false)
        } else {
          notification.error({
            message: 'Create failed',
            description: result.payload && result.payload.message,
          })
        }
      }
    },
    [dispatch, viewingCI ? viewingCI.id : null]
  )

  const handleModalCancel = useCallback(() => {
    setModalVisible(false)
    setEditingCI(null)
  }, [])

  return (
    <div className="cmplan-page">
      {/* Page Header */}
      <div className="cmplan-page-header">
        <div className="cmplan-page-header-left">
          <Icon type="database" className="cmplan-page-header-icon" />
          <div>
            <h2 className="cmplan-page-title">Configuration Items</h2>
            <p className="cmplan-page-subtitle">
              Manage all registered CIs across your infrastructure. Add, edit, and
              track configuration items with extensible attributes.
            </p>
          </div>
        </div>
        <Button type="primary" icon="plus" size="large" onClick={handleAdd}>
          Add CI
        </Button>
      </div>

      <Card className="cmplan-card" bodyStyle={{ padding: '16px 20px' }}>
        <CIFilterBar
          filters={filters}
          ciTypes={ciTypes}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          total={total}
          loading={loading}
        />

        <CITable
          dataSource={items}
          loading={loading}
          total={total}
          pagination={pagination}
          ciTypes={ciTypes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onPageChange={handlePageChange}
        />
      </Card>

      {/* Add / Edit Modal */}
      <CIFormModal
        visible={modalVisible}
        editingRecord={editingCI}
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        submitting={submitting}
      />

      {/* Detail Drawer */}
      <CIDetailDrawer
        visible={drawerVisible}
        ci={viewingCI}
        onClose={() => setDrawerVisible(false)}
        onEdit={handleEdit}
        attrDefs={viewingCIAttrDefs}
      />
    </div>
  )
}

export default ConfigurationItemsPage
