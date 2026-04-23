import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { Icon, Modal, Spin, notification } from 'antd'
import useBulkRelationshipForm from '../../hooks/cmplan/useBulkRelationshipForm'
import {
  buildConfirmContent,
  buildSuccessDescription,
} from '../../utils/cmplan/bulkRelationshipUtils'
import CISelectionPanel from '../../components/CMPlan/Relationships/CISelectionPanel'
import RelationshipRulesSection from '../../components/CMPlan/Relationships/RelationshipRulesSection'
import RelationshipPreview from '../../components/CMPlan/Relationships/RelationshipPreview'
import BulkRelationshipHeader from '../../components/CMPlan/Relationships/BulkRelationshipHeader'
import BulkRelationshipFooter from '../../components/CMPlan/Relationships/BulkRelationshipFooter'
import {
  InvalidRelTypeWarning,
  ValidationErrorList,
} from '../../components/CMPlan/Relationships/BulkRelationshipMessages'
import './CMPlan.css'
import './BulkAddRelationship.css'

const RELATIONSHIP_MAP_PATH = '/cmplan/relationship-map'

const BulkAddRelationshipPage = () => {
  const history = useHistory()
  const form = useBulkRelationshipForm()

  const navigateBack = useCallback(() => {
    history.push(RELATIONSHIP_MAP_PATH)
  }, [history])

  const confirmAndSubmit = useCallback(() => {
    if (form.validationErrors.length > 0) {
      notification.error({
        message: 'Validation Failed',
        description: form.validationErrors[0],
      })
      return
    }

    Modal.confirm({
      title: 'Confirm Bulk Create',
      content: buildConfirmContent(form.newItems.length, form.duplicateCount),
      okText: 'Apply Relationships',
      okType: 'primary',
      cancelText: 'Cancel',
      icon: <Icon type="exclamation-circle" style={{ color: '#722ed1' }} />,
      onOk: () =>
        form.submitBulkRelationships().then((action) => {
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
          history.push(RELATIONSHIP_MAP_PATH)
        }),
    })
  }, [form, history])

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
          />
        </div>

        <RelationshipRulesSection
          rules={form.rules}
          relTypeOptions={form.relTypeOptions}
          validRelTypes={form.validRelTypes}
          sourceType={form.sourceType}
          targetType={form.targetType}
          onUpdateRule={form.updateRule}
          onRemoveRule={form.removeRule}
          onAddRule={form.addRule}
        />

        <RelationshipPreview
          previewItems={form.previewItems}
          totalCount={form.newItems.length}
          relTypeOptions={form.relTypeOptions}
        />

        <BulkRelationshipFooter
          summaryParts={form.summaryParts}
          duplicateCount={form.duplicateCount}
          onReset={form.resetForm}
          onApply={confirmAndSubmit}
          applyDisabled={form.applyDisabled}
          submitting={form.submitting}
        />

        <ValidationErrorList errors={form.validationErrors} />
      </Spin>
    </div>
  )
}

export default BulkAddRelationshipPage
