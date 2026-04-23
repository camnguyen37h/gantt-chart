import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Checkbox, Empty, Icon, Input, Select, Spin, Tag } from 'antd'
import { CI_ENVIRONMENT_LABELS } from '../../../utils/cmplan/cmplanConstants'

const { Option } = Select

const PANEL_LIST_HEIGHT = 320
const DEFAULT_ICON = 'profile'
const TRANSPARENT_BORDER = 'transparent'
const CI_ITEM_TAG_STYLE = {
  backgroundColor: '#deebff',
  color: '#0647a6',
}

// --- Pure helpers ---------------------------------------------------------

const matchesQuery = (ci, query) => {
  if (ci.name.toLowerCase().includes(query)) return true
  const description = ci.shortDescription || ''
  return description.toLowerCase().includes(query)
}

const filterCIs = (cis, searchText) => {
  const trimmed = searchText.trim()
  if (!trimmed) return cis
  const query = trimmed.toLowerCase()
  return cis.filter((ci) => matchesQuery(ci, query))
}

const computeSelectionState = (filteredCIs, selectedIdSet) => {
  if (filteredCIs.length === 0) return { allSelected: false, indeterminate: false }
  let selectedCount = 0
  for (let i = 0; i < filteredCIs.length; i += 1) {
    if (selectedIdSet.has(filteredCIs[i].id)) selectedCount += 1
  }
  return {
    allSelected: selectedCount === filteredCIs.length,
    indeterminate: selectedCount > 0 && selectedCount < filteredCIs.length,
  }
}

// --- Internal subcomponents ----------------------------------------------

const EnvironmentTag = ({ environment }) => {
  const label = CI_ENVIRONMENT_LABELS[environment]
  if (!label) return null
  return (
    <Tag
      style={{
        marginLeft: 'auto',
        marginBottom: 0,
        fontSize: 11,
        background: CI_ITEM_TAG_STYLE.backgroundColor,
        borderColor: TRANSPARENT_BORDER,
        color: CI_ITEM_TAG_STYLE.color,
      }}
    >
      {label}
    </Tag>
  )
}

EnvironmentTag.propTypes = { environment: PropTypes.string }
EnvironmentTag.defaultProps = { environment: undefined }

// --- Main component -------------------------------------------------------

const CISelectionPanel = ({
  title,
  ciType,
  availableTypes,
  onTypeChange,
  cis,
  loading,
  selectedIds,
  onSelectionChange,
}) => {
  const [searchText, setSearchText] = useState('')

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const filteredCIs = useMemo(() => filterCIs(cis, searchText), [cis, searchText])
  const selectionState = useMemo(
    () => computeSelectionState(filteredCIs, selectedIdSet),
    [filteredCIs, selectedIdSet]
  )

  const resolveTypeLabel = useCallback(
    (type) => {
      const found = availableTypes.find((t) => t.value === type)
      return found ? found.label : type
    },
    [availableTypes]
  )

  const handleSelectAll = useCallback(
    (event) => {
      const filteredIds = filteredCIs.map((ci) => ci.id)
      if (event.target.checked) {
        const merged = Array.from(new Set(selectedIds.concat(filteredIds)))
        onSelectionChange(merged)
        return
      }
      const filteredIdSet = new Set(filteredIds)
      onSelectionChange(selectedIds.filter((id) => !filteredIdSet.has(id)))
    },
    [filteredCIs, selectedIds, onSelectionChange]
  )

  const handleToggleCI = useCallback(
    (ciId) => {
      if (selectedIdSet.has(ciId)) {
        onSelectionChange(selectedIds.filter((id) => id !== ciId))
        return
      }
      onSelectionChange(selectedIds.concat(ciId))
    },
    [selectedIds, selectedIdSet, onSelectionChange]
  )

  const handleRemoveTag = useCallback(
    (ciId) => {
      onSelectionChange(selectedIds.filter((id) => id !== ciId))
    },
    [selectedIds, onSelectionChange]
  )

  const selectedCIs = useMemo(
    () => cis.filter((ci) => selectedIdSet.has(ci.id)),
    [cis, selectedIdSet]
  )

  const ciTypeLabel = resolveTypeLabel(ciType) || ''
  const emptyDescription = ciType
    ? 'No CIs found for this type'
    : 'Select a CI Type to load items'

  return (
    <div className="bulk-rel-panel">
      <div className="bulk-rel-panel-header">
        <span className="bulk-rel-panel-title">{title}</span>
        <span className="bulk-rel-panel-count">{selectedIds.length} selected</span>
      </div>

      <div className="bulk-rel-panel-toolbar">
        <Select
          value={ciType}
          onChange={onTypeChange}
          placeholder="Select CI Type"
          size="small"
          style={{ minWidth: 160 }}
          showSearch
          optionFilterProp="children"
        >
          {availableTypes.map((type) => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </Select>
        <Checkbox
          checked={selectionState.allSelected}
          indeterminate={selectionState.indeterminate}
          onChange={handleSelectAll}
          disabled={filteredCIs.length === 0}
        >
          Select all
        </Checkbox>
        <Input
          placeholder="Search CI name..."
          prefix={<Icon type="search" style={{ color: '#bfbfbf' }} />}
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          allowClear
          size="small"
          style={{ width: 180, marginLeft: 'auto' }}
        />
      </div>

      <div className="bulk-rel-panel-list" style={{ maxHeight: PANEL_LIST_HEIGHT }}>
        <Spin spinning={loading}>
          {filteredCIs.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyDescription}
              style={{ margin: '40px 0' }}
            />
          ) : (
            filteredCIs.map((ci) => {
              const isSelected = selectedIdSet.has(ci.id)
              return (
                <div
                  key={ci.id}
                  className={'bulk-rel-panel-item' + (isSelected ? ' bulk-rel-panel-item--selected' : '')}
                  onClick={() => handleToggleCI(ci.id)}
                >
                  <Checkbox checked={isSelected} style={{ marginRight: 10 }} />
                  <Icon type={DEFAULT_ICON} style={{ color: CI_ITEM_TAG_STYLE.color, fontSize: 16, marginRight: 8 }} />
                  <div className="bulk-rel-panel-item-info">
                    <span className="bulk-rel-panel-item-name">{ci.name}</span>
                    <span className="bulk-rel-panel-item-class">{ciTypeLabel}</span>
                  </div>
                  <EnvironmentTag environment={ci.environment} />
                </div>
              )
            })
          )}
        </Spin>
      </div>

      {selectedCIs.length > 0 && (
        <div className="bulk-rel-panel-tags">
          {selectedCIs.map((ci) => (
            <Tag
              key={ci.id}
              closable
              onClose={() => handleRemoveTag(ci.id)}
              style={{
                marginBottom: 4,
                background: CI_ITEM_TAG_STYLE.backgroundColor,
                borderColor: TRANSPARENT_BORDER,
                color: CI_ITEM_TAG_STYLE.color,
              }}
            >
              {ci.name}
            </Tag>
          ))}
        </div>
      )}
    </div>
  )
}

CISelectionPanel.propTypes = {
  title: PropTypes.string.isRequired,
  ciType: PropTypes.string,
  availableTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onTypeChange: PropTypes.func.isRequired,
  cis: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      shortDescription: PropTypes.string,
      environment: PropTypes.string,
    })
  ).isRequired,
  loading: PropTypes.bool,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectionChange: PropTypes.func.isRequired,
}

CISelectionPanel.defaultProps = {
  ciType: undefined,
  loading: false,
}

export default CISelectionPanel