import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card, Spin, Alert, Icon, Badge, Button, Popconfirm, Tooltip,
  Input, Pagination, Empty, notification,
} from 'antd'
import {
  fetchCIClasses,
  createCIClass,
  updateCIClass,
  deleteCIClass,
  fetchAttributeDefinitions,
  createAttributeDefinition,
  updateAttributeDefinition,
  deleteAttributeDefinition,
  selectCIClasses,
  selectCIClassesLoading,
  selectCIClassesSubmitting,
  selectAllAttributeDefinitions,
  selectAttrDefsLoading,
  selectAttrDefsGroupedByClass,
  fetchCIRuleConfigs,
  selectCIRuleConfigs,
} from '../../store/cmplan'
import AttributeDefinitionTable from '../../components/CMPlan/AttributeSettings/AttributeDefinitionTable'
import AttributeFormModal from '../../components/CMPlan/AttributeSettings/AttributeFormModal'
import CIClassFormModal from '../../components/CMPlan/AttributeSettings/CIClassFormModal'
import './CMPlan.css'

const CLASS_PAGE_SIZE = 12

const AttributeSettingsPage = () => {
  const dispatch = useDispatch()

  const ciClasses = useSelector(selectCIClasses)
  const ciClassesLoading = useSelector(selectCIClassesLoading)
  const ciClassesSubmitting = useSelector(selectCIClassesSubmitting)
  const allAttrDefs = useSelector(selectAllAttributeDefinitions)
  const attrDefsLoading = useSelector(selectAttrDefsLoading)
  const groupedAttrDefs = useSelector(selectAttrDefsGroupedByClass)
  const allRuleConfigs = useSelector(selectCIRuleConfigs)
  const validationRules = allRuleConfigs.filter((r) => r.category === 'validation_rule')

  // Master-detail selection
  const [selectedId, setSelectedId] = useState('global')
  const [classSearch, setClassSearch] = useState('')
  const [classPage, setClassPage] = useState(1)

  // Attribute definition modal
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // CI Class CRUD modal
  const [classModalVisible, setClassModalVisible] = useState(false)
  const [editingClass, setEditingClass] = useState(null)

  useEffect(() => {
    dispatch(fetchCIClasses())
    dispatch(fetchAttributeDefinitions())
    dispatch(fetchCIRuleConfigs())
  }, [dispatch])

  const handleAdd = useCallback(() => {
    setEditingRecord(null)
    setModalVisible(true)
  }, [])

  const handleEdit = useCallback((record) => {
    setEditingRecord(record)
    setModalVisible(true)
  }, [])

  const handleDelete = useCallback(
    async (id) => {
      const result = await dispatch(deleteAttributeDefinition(id))
      if (deleteAttributeDefinition.fulfilled.match(result)) {
        notification.success({ message: 'Attribute definition deleted.' })
      } else {
        notification.error({
          message: 'Delete failed',
          description: result.payload && result.payload.message,
        })
      }
    },
    [dispatch]
  )

  const handleToggleActive = useCallback(
    async (id, isActive) => {
      const result = await dispatch(
        updateAttributeDefinition({ id, payload: { isActive } })
      )
      if (updateAttributeDefinition.fulfilled.match(result)) {
        notification.success({
          message: `Attribute ${isActive ? 'activated' : 'deactivated'}.`,
          duration: 2,
        })
      }
    },
    [dispatch]
  )

  const handleModalSubmit = useCallback(
    async (values) => {
      setSubmitting(true)
      try {
        let result
        if (values.id) {
          const { id, ...payload } = values
          result = await dispatch(updateAttributeDefinition({ id, payload }))
          if (updateAttributeDefinition.fulfilled.match(result)) {
            notification.success({ message: 'Attribute definition updated.' })
            setModalVisible(false)
          } else {
            notification.error({
              message: 'Update failed',
              description: result.payload && result.payload.message,
            })
          }
        } else {
          result = await dispatch(createAttributeDefinition(values))
          if (createAttributeDefinition.fulfilled.match(result)) {
            notification.success({ message: 'Attribute definition created.' })
            setModalVisible(false)
          } else {
            notification.error({
              message: 'Create failed',
              description: result.payload && result.payload.message,
            })
          }
        }
      } finally {
        setSubmitting(false)
      }
    },
    [dispatch]
  )

  const handleModalCancel = useCallback(() => {
    setModalVisible(false)
    setEditingRecord(null)
  }, [])

  // ── CI Class CRUD handlers ──────────────────────────────────────────────────
  const handleOpenNewClass = useCallback(() => {
    setEditingClass(null)
    setClassModalVisible(true)
  }, [])

  const handleOpenEditClass = useCallback((cls, e) => {
    e.stopPropagation()
    setEditingClass(cls)
    setClassModalVisible(true)
  }, [])

  const handleDeleteClass = useCallback(
    async (id, e) => {
      e.stopPropagation()
      const result = await dispatch(deleteCIClass(id))
      if (deleteCIClass.fulfilled.match(result)) {
        notification.success({ message: 'CI class deleted.' })
        setSelectedId((prev) => (prev === id ? 'global' : prev))
      } else {
        notification.error({
          message: 'Delete failed',
          description: result.payload && result.payload.message,
        })
      }
    },
    [dispatch]
  )

  const handleClassModalSubmit = useCallback(
    async (values) => {
      let result
      if (editingClass) {
        const { name, ...payload } = values // name (slug) cannot be changed
        result = await dispatch(updateCIClass({ id: editingClass.id, payload }))
        if (updateCIClass.fulfilled.match(result)) {
          notification.success({ message: 'CI class updated.' })
          setClassModalVisible(false)
        } else {
          notification.error({
            message: 'Update failed',
            description: result.payload && result.payload.message,
          })
        }
      } else {
        result = await dispatch(createCIClass(values))
        if (createCIClass.fulfilled.match(result)) {
          notification.success({ message: 'CI class created.' })
          setClassModalVisible(false)
          setSelectedId(result.payload.id)
        } else {
          notification.error({
            message: 'Create failed',
            description: result.payload && result.payload.message,
          })
        }
      }
    },
    [dispatch, editingClass]
  )

  const handleClassModalCancel = useCallback(() => {
    setClassModalVisible(false)
    setEditingClass(null)
  }, [])

  // Derived values for the selected class
  const selectedClass = selectedId === 'global' ? null : ciClasses.find((c) => c.id === selectedId)
  const modalCiClassId = selectedId === 'global' ? null : selectedId
  const modalCiClassLabel = selectedId === 'global' ? 'Global' : (selectedClass && selectedClass.label)

  // Filtered + paginated class list for the left panel
  const filteredClasses = useMemo(() => {
    const q = classSearch.trim().toLowerCase()
    return q ? ciClasses.filter((c) => c.label.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) : ciClasses
  }, [ciClasses, classSearch])

  const pagedClasses = useMemo(() => {
    const start = (classPage - 1) * CLASS_PAGE_SIZE
    return filteredClasses.slice(start, start + CLASS_PAGE_SIZE)
  }, [filteredClasses, classPage])

  if (ciClassesLoading) {
    return (
      <div className="cmplan-loading-center">
        <Spin size="large" tip="Loading CI classes..." />
      </div>
    )
  }

  return (
    <div className="cmplan-page">
      {/* Page Header */}
      <div className="cmplan-page-header">
        <div className="cmplan-page-header-left">
          <Icon type="setting" className="cmplan-page-header-icon" />
          <div>
            <h2 className="cmplan-page-title">Extensible Attribute Settings</h2>
            <p className="cmplan-page-subtitle">
              Define custom attributes per CI class. These fields appear dynamically
              when creating or editing Configuration Items.
            </p>
          </div>
        </div>
        <div className="cmplan-page-header-stats">
          <div className="cmplan-stat-pill">
            <span className="cmplan-stat-pill-value">{ciClasses.length}</span>
            <span className="cmplan-stat-pill-label">CI Classes</span>
          </div>
          <div className="cmplan-stat-pill">
            <span className="cmplan-stat-pill-value">{allAttrDefs.length}</span>
            <span className="cmplan-stat-pill-label">Total Attributes</span>
          </div>
          <div className="cmplan-stat-pill">
            <span className="cmplan-stat-pill-value">
              {allAttrDefs.filter((a) => a.ciClassId === null).length}
            </span>
            <span className="cmplan-stat-pill-label">Global</span>
          </div>
          <div className="cmplan-stat-pill">
            <span className="cmplan-stat-pill-value">
              {allAttrDefs.filter((a) => a.isActive).length}
            </span>
            <span className="cmplan-stat-pill-label">Active</span>
          </div>
        </div>
      </div>

      {/* Master-Detail Card */}
      <Card className="cmplan-card" bodyStyle={{ padding: 0 }}>
        <div className="attr-settings-layout">

          {/* ── LEFT: Class List Panel ── */}
          <div className="attr-settings-left">
            <div className="attr-settings-left-header">
              <span className="attr-settings-left-title">CI Classes</span>
              <Tooltip title="New CI Class">
                <Button
                  type="primary"
                  icon="plus"
                  size="small"
                  onClick={handleOpenNewClass}
                />
              </Tooltip>
            </div>

            <div className="attr-settings-left-search">
              <Input
                prefix={<Icon type="search" style={{ color: '#bfbfbf' }} />}
                placeholder="Search classes..."
                value={classSearch}
                onChange={(e) => { setClassSearch(e.target.value); setClassPage(1) }}
                allowClear
                size="small"
              />
            </div>

            <div className="attr-settings-class-list">
              {/* Global — always first, never deletable */}
              <div
                className={`attr-class-item ${selectedId === 'global' ? 'attr-class-item--selected' : ''}`}
                onClick={() => setSelectedId('global')}
              >
                <span className="attr-class-item-icon" style={{ color: '#faad14', background: '#faad1420' }}>
                  <Icon type="global" />
                </span>
                <span className="attr-class-item-label">Global</span>
                <Badge
                  count={(groupedAttrDefs.global && groupedAttrDefs.global.length) || 0}
                  style={{ backgroundColor: '#faad14' }}
                />
              </div>

              {/* Filtered class rows */}
              {pagedClasses.length === 0 && classSearch && (
                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No classes found" />
                </div>
              )}

              {pagedClasses.map((cls) => (
                <div
                  key={cls.id}
                  className={`attr-class-item ${selectedId === cls.id ? 'attr-class-item--selected' : ''} ${!cls.isActive ? 'attr-class-item--inactive' : ''}`}
                  onClick={() => setSelectedId(cls.id)}
                >
                  <span
                    className="attr-class-item-icon"
                    style={{ color: cls.color, background: cls.color + '20' }}
                  >
                    <Icon type={cls.icon} />
                  </span>
                  <span className="attr-class-item-label">{cls.label}</span>
                  <Badge
                    count={(groupedAttrDefs[cls.id] && groupedAttrDefs[cls.id].length) || 0}
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="attr-class-item-actions">
                    <Tooltip title="Edit class">
                      <Icon
                        type="edit"
                        className="attr-class-action-btn"
                        onClick={(e) => handleOpenEditClass(cls, e)}
                      />
                    </Tooltip>
                    <Popconfirm
                      title={
                        <span>
                          Delete <strong>{cls.label}</strong>?<br />
                          <span style={{ color: '#ff4d4f', fontSize: 12 }}>
                            {(groupedAttrDefs[cls.id] && groupedAttrDefs[cls.id].length) || 0} attribute(s) will also be removed.
                          </span>
                        </span>
                      }
                      onConfirm={(e) => handleDeleteClass(cls.id, e)}
                      okText="Delete"
                      okType="danger"
                      cancelText="Cancel"
                      placement="right"
                    >
                      <Tooltip title="Delete class">
                        <Icon
                          type="delete"
                          className="attr-class-action-btn attr-class-action-btn--danger"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Tooltip>
                    </Popconfirm>
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination — only shown when needed */}
            {filteredClasses.length > CLASS_PAGE_SIZE && (
              <div className="attr-settings-left-pagination">
                <Pagination
                  simple
                  size="small"
                  current={classPage}
                  total={filteredClasses.length}
                  pageSize={CLASS_PAGE_SIZE}
                  onChange={(p) => setClassPage(p)}
                />
              </div>
            )}
          </div>

          {/* ── RIGHT: Attribute Detail Panel ── */}
          <div className="attr-settings-right">
            {selectedId === 'global' ? (
              <div className="attr-settings-right-inner">
                {/* Global header */}
                <div className="attr-settings-detail-header">
                  <span className="attr-settings-detail-icon" style={{ color: '#faad14', background: '#faad1420' }}>
                    <Icon type="global" style={{ fontSize: 18 }} />
                  </span>
                  <div>
                    <div className="attr-settings-detail-title">Global Attributes</div>
                    <div className="attr-settings-detail-sub">
                      Applied to every CI class
                    </div>
                  </div>
                  <Badge
                    count={(groupedAttrDefs.global && groupedAttrDefs.global.length) || 0}
                    style={{ backgroundColor: '#faad14', fontSize: 13, height: 22, lineHeight: '22px', borderRadius: 11, padding: '0 9px' }}
                  />
                </div>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message="Global attributes"
                  description="These attributes appear in the CI form for every CI class. Use them for universal fields like owner, SLA tier, or cost center."
                />
                <AttributeDefinitionTable
                  dataSource={groupedAttrDefs.global || []}
                  loading={attrDefsLoading}
                  isGlobal
                  validationRules={validationRules}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              </div>
            ) : selectedClass ? (
              <div className="attr-settings-right-inner">
                {/* Class header */}
                <div className="attr-settings-detail-header">
                  <span
                    className="attr-settings-detail-icon"
                    style={{ color: selectedClass.color, background: selectedClass.color + '20' }}
                  >
                    <Icon type={selectedClass.icon} style={{ fontSize: 18 }} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="attr-settings-detail-title">
                      {selectedClass.label}
                      {!selectedClass.isActive && (
                        <span style={{ marginLeft: 8, fontSize: 11, color: '#8c8c8c', fontWeight: 400 }}>
                          (inactive)
                        </span>
                      )}
                    </div>
                    <div className="attr-settings-detail-sub">
                      <code style={{ fontSize: 11, background: '#f5f5f5', padding: '1px 6px', borderRadius: 3 }}>
                        {selectedClass.name}
                      </code>
                      {selectedClass.description && (
                        <span style={{ marginLeft: 8, color: '#8c8c8c' }}>{selectedClass.description}</span>
                      )}
                    </div>
                  </div>
                  <Badge
                    count={(groupedAttrDefs[selectedClass.id] && groupedAttrDefs[selectedClass.id].length) || 0}
                    style={{
                      backgroundColor: selectedClass.color,
                      fontSize: 13, height: 22, lineHeight: '22px',
                      borderRadius: 11, padding: '0 9px',
                    }}
                  />
                  <Tooltip title="Edit this class">
                    <Button
                      icon="edit"
                      size="small"
                      style={{ marginLeft: 8 }}
                      onClick={(e) => handleOpenEditClass(selectedClass, e)}
                    >
                      Edit Class
                    </Button>
                  </Tooltip>
                </div>
                <AttributeDefinitionTable
                  dataSource={groupedAttrDefs[selectedClass.id] || []}
                  loading={attrDefsLoading}
                  ciClassLabel={selectedClass.label}
                  validationRules={validationRules}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
                <Empty description="Select a CI class from the left panel" />
              </div>
            )}
          </div>
        </div>
      </Card>

      <AttributeFormModal
        visible={modalVisible}
        editingRecord={editingRecord}
        ciClassId={modalCiClassId}
        ciClassLabel={modalCiClassLabel}
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        submitting={submitting}
        validationRules={validationRules}
      />

      <CIClassFormModal
        visible={classModalVisible}
        editingRecord={editingClass}
        submitting={ciClassesSubmitting}
        onSubmit={handleClassModalSubmit}
        onCancel={handleClassModalCancel}
      />
    </div>
  )
}

export default AttributeSettingsPage
