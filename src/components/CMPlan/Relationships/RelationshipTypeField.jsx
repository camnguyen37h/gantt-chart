import React from 'react'
import PropTypes from 'prop-types'
import { Select, Icon } from 'antd'
import { buildOptionDisabledReason } from './RelationshipRulesSection.helpers'
import RelationshipTypeOptionLabel from './RelationshipTypeOptionLabel'

const { Option } = Select

const FULL_WIDTH_STYLE = { width: '100%' }
const WARNING_ICON_STYLE = { marginRight: 4 }

const renderOption = ({
  option, rule, sourceType, targetType, validRelTypes, usedTypes,
}) => {
  const reason = buildOptionDisabledReason({
    optionValue:   option.value,
    ruleRelType:   rule.relationshipType,
    sourceType,
    targetType,
    validRelTypes,
    isUsedByOther: usedTypes.has(option.value) && option.value !== rule.relationshipType,
  })
  return (
    <Option key={option.value} value={option.value} disabled={Boolean(reason)}>
      <RelationshipTypeOptionLabel option={option} disabledReason={reason} />
    </Option>
  )
}

const RelationshipTypeField = ({
  rule,
  relTypeOptions,
  validRelTypes,
  usedTypes,
  sourceType,
  targetType,
  showRequiredError,
  isCurrentInvalid,
  onChange,
  onBlur,
}) => (
  <div className="bulk-rel-rule-field">
    <span className="bulk-rel-rule-field-label">
      Relationship Type
      <span className="bulk-rel-rule-required">*</span>
    </span>
    <Select
      value={rule.relationshipType || undefined}
      onChange={onChange}
      onBlur={onBlur}
      style={FULL_WIDTH_STYLE}
      placeholder="Select relationship type..."
      allowClear
      className={showRequiredError ? 'bulk-rel-rule-select--error' : undefined}
    >
      {relTypeOptions.map((option) =>
        renderOption({ option, rule, sourceType, targetType, validRelTypes, usedTypes })
      )}
    </Select>
    {showRequiredError && (
      <span className="bulk-rel-rule-warning">Relationship Type is required.</span>
    )}
    {isCurrentInvalid && (
      <span className="bulk-rel-rule-warning">
        <Icon type="warning" style={WARNING_ICON_STYLE} />
        This relationship type is not valid for the selected CI Types.
      </span>
    )}
  </div>
)

RelationshipTypeField.propTypes = {
  rule: PropTypes.shape({
    relationshipType: PropTypes.string,
  }).isRequired,
  relTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  validRelTypes:     PropTypes.instanceOf(Set).isRequired,
  usedTypes:         PropTypes.instanceOf(Set).isRequired,
  sourceType:        PropTypes.string,
  targetType:        PropTypes.string,
  showRequiredError: PropTypes.bool.isRequired,
  isCurrentInvalid:  PropTypes.bool.isRequired,
  onChange:          PropTypes.func.isRequired,
  onBlur:            PropTypes.func.isRequired,
}

RelationshipTypeField.defaultProps = {
  sourceType: undefined,
  targetType: undefined,
}

export default React.memo(RelationshipTypeField)
