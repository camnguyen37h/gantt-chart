import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Checkbox, Empty, Icon, Input, Select, Spin } from 'antd'
import CIListItem from './CIListItem'
import SelectedCITagList from './SelectedCITagList'
import {
  computeSelectionState,
  mergeUniqueIds,
  removeIds,
} from './CISelectionPanel.helpers'

const { Option } = Select

const PANEL_LIST_HEIGHT = 320
const SEARCH_INPUT_STYLE = { width: 180, marginLeft: 'auto' }
const SEARCH_PREFIX_STYLE = { color: '#bfbfbf' }
const TYPE_SELECT_STYLE = { minWidth: 160 }

const resolveLabel = (types, value) => {
  const found = types.find((type) => type.value === value)
  return found ? found.label : value
}

const buildEmptyDescription = (ciType) =>
  ciType ? 'No CIs found for this type' : 'Select a CI Type to load items'

const CISelectionPanel = ({
  title,
  panel,
  ciType,
  availableTypes,
  onTypeChange,
  cis,
  loading,
  selectedIds,
  onSelectionChange,
  searchText,
  onSearch,
}) => {
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectionState = useMemo(
    () => computeSelectionState(cis, selectedIdSet),
    [cis, selectedIdSet]
  )
  const selectedCIs = useMemo(
    () => cis.filter((ci) => selectedIdSet.has(ci.id)),
    [cis, selectedIdSet]
  )

  const ciTypeLabel = ciType ? resolveLabel(availableTypes, ciType) : ''

  const handleSelectAll = useCallback(
    (event) => {
      const cisIds = cis.map((ci) => ci.id)
      if (event.target.checked) {
        onSelectionChange(mergeUniqueIds(selectedIds, cisIds))
        return
      }
      onSelectionChange(removeIds(selectedIds, cisIds))
    },
    [cis, selectedIds, onSelectionChange]
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
    (ciId) => onSelectionChange(selectedIds.filter((id) => id !== ciId)),
    [selectedIds, onSelectionChange]
  )

  const handleSearchChange = useCallback(
    (event) => onSearch(event.target.value),
    [onSearch]
  )

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
          style={TYPE_SELECT_STYLE}
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
          disabled={cis.length === 0}
        >
          Select all
        </Checkbox>
        <Input
          placeholder="Search CI name..."
          prefix={<Icon type="search" style={SEARCH_PREFIX_STYLE} />}
          value={searchText}
          onChange={handleSearchChange}
          allowClear
          size="small"
          style={SEARCH_INPUT_STYLE}
        />
      </div>

      <div className="bulk-rel-panel-list" style={{ height: PANEL_LIST_HEIGHT }}>
        <Spin spinning={loading}>
          {cis.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={buildEmptyDescription(ciType)}
              style={{ margin: '40px 0' }}
            />
          ) : (
            cis.map((ci) => (
              <CIListItem
                key={ci.id}
                ci={ci}
                ciTypeLabel={ciTypeLabel}
                isSelected={selectedIdSet.has(ci.id)}
                onToggle={handleToggleCI}
              />
            ))
          )}
        </Spin>
      </div>

      <SelectedCITagList selectedCIs={selectedCIs} onRemove={handleRemoveTag} />
    </div>
  )
}

CISelectionPanel.propTypes = {
  title: PropTypes.string.isRequired,
  panel: PropTypes.string.isRequired,
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
  searchText: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
}

CISelectionPanel.defaultProps = {
  ciType: undefined,
  loading: false,
  searchText: '',
}

export default CISelectionPanel
