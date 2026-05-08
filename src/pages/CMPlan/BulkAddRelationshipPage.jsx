import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { Modal, Spin } from 'antd'
import { NotificationManager } from 'react-notifications'
import useBulkRelationshipForm from '../../hooks/cmplan/useBulkRelationshipForm'
import CISelectionPanel from '../../components/CMPlan/Relationships/CISelectionPanel'
import RelationshipRulesSection from '../../components/CMPlan/Relationships/RelationshipRulesSection'
import RelationshipPreview from '../../components/CMPlan/Relationships/RelationshipPreview'
import BulkRelationshipHeader from '../../components/CMPlan/Relationships/BulkRelationshipHeader'
import BulkRelationshipFooter from '../../components/CMPlan/Relationships/BulkRelationshipFooter'
import InvalidRelTypeWarning from '../../components/CMPlan/Relationships/InvalidRelTypeWarning'
import {
  buildConfirmContent,
} from '../../utils/cmplan/bulkRelationshipFormatters'
import './CMPlan.css'
import './BulkAddRelationship.css'

const RELATIONSHIP_MAP_PATH = '/cmplan/relationship-map'

const BulkAddRelationshipPage = () => {
  const history = useHistory()
  const navigateBack = useCallback(
    () => history.push(RELATIONSHIP_MAP_PATH),
    [history]
  )

  const form = useBulkRelationshipForm()
  const {
    validationErrors,
    newItems,
    duplicateCount,
    submitBulkRelationships,
    existingPairsLoading,
  } = form

  const confirmAndSubmit = useCallback(() => {
    if (validationErrors.length > 0) {
      NotificationManager.error(validationErrors[0], 'Validation Failed')
      return
    }
    Modal.confirm({
      title: 'Confirm Bulk Create',
      content: buildConfirmContent(newItems.length, duplicateCount),
      okText: 'Apply Relationships',
      okType: 'primary',
      cancelText: 'Cancel',
      icon: null,
      centered: true,
      onOk: () =>
        submitBulkRelationships().then((action) => {
          if (!action.error) navigateBack()
        }),
    })
  }, [validationErrors, newItems.length, duplicateCount, submitBulkRelationships, navigateBack])

  return (
    <div className="cmplan-page">
      <Spin spinning={form.isBootstrapping}>
        <BulkRelationshipHeader onBack={navigateBack} />

        {form.hasInvalidRelType && (
          <InvalidRelTypeWarning
            sourceType={form.sourceType}
            targetType={form.targetType}
          />
        )}

        <div className="bulk-rel-panels">
          <CISelectionPanel
            title="SOURCE CIS"
            ciType={form.sourceType}
            availableTypes={form.sourceTypes}
            onTypeChange={form.setSourceType}
            cis={form.sourceCIs}
            loading={form.sourceLoading}
            selectedIds={form.sourceIds}
            onSelectionChange={form.setSourceSelection}
            searchText={form.sourceSearch}
            onSearch={form.setSourceSearch}
          />
          <CISelectionPanel
            title="TARGET CIS"
            ciType={form.targetType}
            availableTypes={form.targetTypes}
            onTypeChange={form.setTargetType}
            cis={form.targetCIs}
            loading={form.targetLoading}
            selectedIds={form.targetIds}
            onSelectionChange={form.setTargetSelection}
            searchText={form.targetSearch}
            onSearch={form.setTargetSearch}
          />
        </div>

        <RelationshipRulesSection
          rules={form.rules}
          relTypeOptions={form.relTypeOptions}
          validRelTypes={form.validRelTypes}
          sourceType={form.sourceType}
          targetType={form.targetType}
          onUpdateRule={form.updateRule}
        />

        <RelationshipPreview
          previewItems={form.previewItems}
          totalCount={form.newItems.length}
          relTypeOptions={form.relTypeOptions}
          loading={existingPairsLoading}
        />

        <BulkRelationshipFooter
          summaryParts={form.summaryParts}
          duplicateCount={form.duplicateCount}
          onReset={form.resetForm}
          onApply={confirmAndSubmit}
          applyDisabled={form.applyDisabled}
          submitting={form.submitting}
        />
      </Spin>
    </div>
  )
}

export default BulkAddRelationshipPage
