import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Icon, notification, Spin, Modal } from 'antd'
import { useHistory } from 'react-router-dom'
import {
  fetchConfigurationItems,
  selectCIItems,
  selectCILoading,
  fetchExistingRelationshipPairs,
  selectExistingRelationshipPairs,
  selectRelationshipsLoading,
  selectRelationshipsSubmitting,
  bulkCreateRelationships,
  fetchCIClasses,
  selectCIClasses,
} from '../../store/cmplan'
import {
  MAX_SOURCE_CIS,
  MAX_TARGET_CIS,
  MAX_RULES,
} from '../../utils/cmplan/bulkRelationshipConstants'
import {
  createEmptyRule,
  generatePreviewItems,
  validateBulkRelationships,
  buildSummaryParts,
  buildConfirmContent,
  buildSuccessDescription,
} from '../../utils/cmplan/bulkRelationshipUtils'
import CISelectionPanel from '../../components/CMPlan/Relationships/CISelectionPanel'
import RelationshipRulesSection from '../../components/CMPlan/Relationships/RelationshipRulesSection'
import RelationshipPreview from '../../components/CMPlan/Relationships/RelationshipPreview'
import './CMPlan.css'
import './BulkAddRelationship.css'

const BulkAddRelationshipPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const allCIs = useSelector(selectCIItems)
  const ciClasses = useSelector(selectCIClasses)
  const cisLoading = useSelector(selectCILoading)
  const existingPairs = useSelector(selectExistingRelationshipPairs)
  const relsLoading = useSelector(selectRelationshipsLoading)
  const submitting = useSelector(selectRelationshipsSubmitting)

  const [sourceIds, setSourceIds] = useState([])
  const [targetIds, setTargetIds] = useState([])
  const [rules, setRules] = useState([createEmptyRule()])

  useEffect(() => {
    dispatch(fetchConfigurationItems({ pageSize: 9999 }))
    dispatch(fetchExistingRelationshipPairs())
    dispatch(fetchCIClasses())
  }, [dispatch])

  // ── Rule handlers ────────────────────────────────────────────────────────
  const handleUpdateRule = useCallback((ruleId, updates) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? Object.assign({}, r, updates) : r))
    )
  }, [])

  const handleRemoveRule = useCallback((ruleId) => {
    setRules((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((r) => r.id !== ruleId)
    })
  }, [])

  const handleAddRule = useCallback(() => {
    setRules((prev) => {
      if (prev.length >= MAX_RULES) {
        notification.warning({
          message: 'Rule Limit',
          description: 'Maximum ' + MAX_RULES + ' rules allowed per batch.',
        })
        return prev
      }
      return [...prev, createEmptyRule()]
    })
  }, [])

  // ── Preview computation ──────────────────────────────────────────────────
  const previewItems = useMemo(
    () => generatePreviewItems(sourceIds, targetIds, rules, existingPairs, allCIs),
    [sourceIds, targetIds, rules, existingPairs, allCIs]
  )

  const newItems = useMemo(
    () => previewItems.filter((item) => !item.isDuplicate),
    [previewItems]
  )

  const duplicateCount = useMemo(
    () => previewItems.filter((item) => item.isDuplicate).length,
    [previewItems]
  )

  // ── Validation ───────────────────────────────────────────────────────────
  const validationErrors = useMemo(
    () => validateBulkRelationships(sourceIds, targetIds, rules, newItems.length),
    [sourceIds, targetIds, rules, newItems]
  )

  // ── Derived data ─────────────────────────────────────────────────────────
  const targetCIObjects = useMemo(() => {
    return allCIs.filter((ci) => targetIds.includes(ci.id))
  }, [allCIs, targetIds])

  const handleSourceSelectionChange = useCallback(
    (ids) => {
      if (ids.length > MAX_SOURCE_CIS) {
        notification.warning({
          message: 'Selection Limit',
          description: 'Maximum ' + MAX_SOURCE_CIS + ' source CIs allowed.',
        })
        return
      }
      setSourceIds(ids)
    },
    []
  )

  const handleTargetSelectionChange = useCallback(
    (ids) => {
      if (ids.length > MAX_TARGET_CIS) {
        notification.warning({
          message: 'Selection Limit',
          description: 'Maximum ' + MAX_TARGET_CIS + ' target CIs allowed.',
        })
        return
      }
      setTargetIds(ids)
    },
    []
  )

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleApply = useCallback(() => {
    if (validationErrors.length > 0) {
      notification.error({
        message: 'Validation Failed',
        description: validationErrors[0],
      })
      return
    }

    const relationshipsToCreate = newItems.map((item) => ({
      sourceId: item.sourceId,
      targetId: item.targetId,
      relationshipType: item.relationshipType,
    }))

    Modal.confirm({
      title: 'Confirm Bulk Create',
      content: buildConfirmContent(relationshipsToCreate.length, duplicateCount),
      okText: 'Apply Relationships',
      okType: 'primary',
      cancelText: 'Cancel',
      icon: <Icon type="exclamation-circle" style={{ color: '#722ed1' }} />,
      onOk: () => {
        return dispatch(bulkCreateRelationships(relationshipsToCreate))
          .then((action) => {
            if (action.error) {
              notification.error({
                message: 'Bulk Create Failed',
                description: (action.payload && action.payload) || 'An error occurred.',
              })
              return
            }
            notification.success({
              message: 'Relationships Created',
              description: buildSuccessDescription(action.payload),
            })
            history.push('/cmplan/relationship-map')
          })
      },
    })
  }, [validationErrors, newItems, duplicateCount, dispatch, history])

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setSourceIds([])
    setTargetIds([])
    setRules([createEmptyRule()])
  }, [])

  const summaryParts = useMemo(
    () => buildSummaryParts(sourceIds, targetIds, rules, newItems.length),
    [sourceIds, targetIds, rules, newItems]
  )

  const isLoading = cisLoading || relsLoading

  const overlapIds = useMemo(() => {
    return sourceIds.filter((id) => targetIds.includes(id))
  }, [sourceIds, targetIds])

  return (
    <div className="cmplan-page">
      <Spin spinning={isLoading}>
        <div className="bulk-rel-page-header">
          <Button
            shape="circle"
            icon="arrow-left"
            onClick={() => history.push('/cmplan/relationship-map')}
            style={{ marginRight: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          />
          <div>
            <h2 className="bulk-rel-page-title">Bulk Add Relationships</h2>
            <p className="bulk-rel-page-subtitle">
              Add relationship rules from multiple source CIs to multiple target CIs
            </p>
          </div>
        </div>

        {overlapIds.length > 0 && (
          <div className="bulk-rel-warning">
            <Icon type="warning" style={{ marginRight: 8 }} />
            {overlapIds.length} CI{overlapIds.length !== 1 ? 's are' : ' is'} selected in both source and target.
            Self-referencing pairs will be automatically excluded.
          </div>
        )}

        <div className="bulk-rel-panels">
          <CISelectionPanel
            title="SOURCE CIS"
            allCIs={allCIs}
            ciClasses={ciClasses}
            selectedIds={sourceIds}
            onSelectionChange={handleSourceSelectionChange}
          />
          <CISelectionPanel
            title="TARGET CIS"
            allCIs={allCIs}
            ciClasses={ciClasses}
            selectedIds={targetIds}
            onSelectionChange={handleTargetSelectionChange}
          />
        </div>

        <RelationshipRulesSection
          rules={rules}
          targetCIs={targetCIObjects}
          onUpdateRule={handleUpdateRule}
          onRemoveRule={handleRemoveRule}
          onAddRule={handleAddRule}
        />

        <RelationshipPreview
          previewItems={previewItems}
          totalCount={newItems.length}
        />

        <div className="bulk-rel-footer">
          <div className="bulk-rel-footer-summary">
            <span>
              <strong>{summaryParts.srcCount}</strong> source CI{summaryParts.srcCount !== 1 ? 's' : ''}
              {' × '}
              <strong>{summaryParts.tgtCount}</strong> target CI{summaryParts.tgtCount !== 1 ? 's' : ''}
              {' × '}
              <strong>{summaryParts.ruleCount}</strong> rule{summaryParts.ruleCount !== 1 ? 's' : ''}
              {' = '}
              <strong>{summaryParts.total}</strong> relationship{summaryParts.total !== 1 ? 's' : ''}
            </span>
            {duplicateCount > 0 && (
              <span style={{ color: '#faad14', marginLeft: 12 }}>
                ({duplicateCount} existing will be skipped)
              </span>
            )}
          </div>
          <div className="bulk-rel-footer-actions">
            <Button
              icon="reload"
              onClick={handleReset}
              style={{ marginRight: 8, display: 'inline-flex', alignItems: 'center' }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              onClick={handleApply}
              loading={submitting}
              disabled={validationErrors.length > 0}
              className="bulk-rel-apply-btn"
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              Apply Relationships →
            </Button>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="bulk-rel-validation-errors">
            {validationErrors.map((error, index) => (
              <div key={index} className="bulk-rel-validation-error-item">
                <Icon type="close-circle" style={{ color: '#f5222d', marginRight: 6 }} />
                {error}
              </div>
            ))}
          </div>
        )}
      </Spin>
    </div>
  )
}

export default BulkAddRelationshipPage
