import React, { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Card, notification, Icon } from 'antd'
import {
  fetchCIClasses,
  fetchAttributeDefinitions,
  fetchConfigurationItems,
  createConfigurationItem,
  updateConfigurationItem,
  deleteConfigurationItem,
  fetchCIDetail,
  setFilters,
  resetFilters,
  setPagination,
  selectCIClasses,
  selectCIItems,
  selectCITotal,
  selectCILoading,
  selectCISubmitting,
  selectCIFilters,
  selectCIPagination,
  selectAttrDefsByClassId,
  fetchAllRelationships,
} from '../../store/cmplan'
import CITable from '../../components/CMPlan/ConfigurationItems/CITable'
import CIFilterBar from '../../components/CMPlan/ConfigurationItems/CIFilterBar'
import CIFormModal from '../../components/CMPlan/ConfigurationItems/CIFormModal'
import CIDetailDrawer from '../../components/CMPlan/ConfigurationItems/CIDetailDrawer'
import './CMPlan.css'

const ConfigurationItemsPage = () => {
  const dispatch = useDispatch()

  // State
  const ciClasses = useSelector(selectCIClasses)
  const items = useSelector(selectCIItems)
  const total = useSelector(selectCITotal)
  const loading = useSelector(selectCILoading)
  const submitting = useSelector(selectCISubmitting)
  const filters = useSelector(selectCIFilters)
  const pagination = useSelector(selectCIPagination)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCI, setEditingCI] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [viewingCI, setViewingCI] = useState(null)

  // Attr defs for detail drawer (based on viewing CI class)
  const viewingCIAttrDefs = useSelector(
    selectAttrDefsByClassId(viewingCI?.ciClassId || null)
  )

  // Load initial data
  useEffect(() => {
    dispatch(fetchCIClasses())
    dispatch(fetchAttributeDefinitions())
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
        } else {
          notification.error({
            message: 'Update failed',
            description: result.payload?.message,
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
            description: result.payload?.message,
          })
        }
      }
    },
    [dispatch]
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
          ciClasses={ciClasses}
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
          ciClasses={ciClasses}
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
