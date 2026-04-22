import React, { useState, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Input, Select, Checkbox, Tag, Icon, Empty } from 'antd'
import {
  CI_ENVIRONMENT_LABELS,
  CI_ENVIRONMENT_COLORS,
} from '../../../utils/cmplan/cmplanConstants'

const { Option } = Select

// ── Constants ────────────────────────────────────────────────────────────────

const PANEL_LIST_HEIGHT = 320
const CI_STATUS_RETIRED = 'retired'

// ── Helpers ──────────────────────────────────────────────────────────────────

const filterCIs = (allCIs, classFilter, searchText) => {
  let result = allCIs.filter((ci) => ci.status !== CI_STATUS_RETIRED)
  if (classFilter) {
    result = result.filter((ci) => ci.ciClassId === classFilter)
  }
  if (searchText.trim()) {
    const query = searchText.toLowerCase().trim()
    result = result.filter(
      (ci) =>
        ci.name.toLowerCase().includes(query) ||
        (ci.shortDescription || '').toLowerCase().includes(query)
    )
  }
  return result
}

const computeSelectionState = (filteredCIs, selectedIdSet) => {
  if (filteredCIs.length === 0) return { allSelected: false, indeterminate: false }
  let selectedCount = 0
  for (let i = 0; i < filteredCIs.length; i++) {
    if (selectedIdSet.has(filteredCIs[i].id)) selectedCount++
  }
  return {
    allSelected: selectedCount === filteredCIs.length,
    indeterminate: selectedCount > 0 && selectedCount < filteredCIs.length,
  }
}

// ── Component ────────────────────────────────────────────────────────────────

const CISelectionPanel = ({
  title,
  allCIs,
  ciClasses,
  selectedIds,
  onSelectionChange,
}) => {
  const [searchText, setSearchText] = useState('')
  const [classFilter, setClassFilter] = useState(undefined)

  const classMap = useMemo(() => {
    const map = {}
    ciClasses.forEach((cls) => {
      map[cls.id] = cls
    })
    return map
  }, [ciClasses])

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const filteredCIs = useMemo(
    () => filterCIs(allCIs, classFilter, searchText),
    [allCIs, classFilter, searchText]
  )

  const selectionState = useMemo(
    () => computeSelectionState(filteredCIs, selectedIdSet),
    [filteredCIs, selectedIdSet]
  )

  const handleSelectAll = useCallback(
    (event) => {
      const checked = event.target.checked
      const filteredIds = filteredCIs.map((ci) => ci.id)
      if (checked) {
        const merged = Array.from(new Set([...selectedIds, ...filteredIds]))
        onSelectionChange(merged)
      } else {
        const filteredIdSet = new Set(filteredIds)
        const remaining = selectedIds.filter((id) => !filteredIdSet.has(id))
        onSelectionChange(remaining)
      }
    },
    [filteredCIs, selectedIds, onSelectionChange]
  )

  const handleToggleCI = useCallback(
    (ciId) => {
      if (selectedIdSet.has(ciId)) {
        onSelectionChange(selectedIds.filter((id) => id !== ciId))
      } else {
        onSelectionChange([...selectedIds, ciId])
      }
    },
    [selectedIds, selectedIdSet, onSelectionChange]
  )

  const handleRemoveTag = useCallback(
    (ciId) => {
      onSelectionChange(selectedIds.filter((id) => id !== ciId))
    },
    [selectedIds, onSelectionChange]
  )

  const selectedCIs = useMemo(() => {
    return allCIs.filter((ci) => selectedIdSet.has(ci.id))
  }, [allCIs, selectedIdSet])

  return (
    <div className="bulk-rel-panel">
      <div className="bulk-rel-panel-header">
        <span className="bulk-rel-panel-title">{title}</span>
        <span className="bulk-rel-panel-count">{selectedIds.length} selected</span>
      </div>

      <div className="bulk-rel-panel-toolbar">
        <Checkbox
          checked={selectionState.allSelected}
          indeterminate={selectionState.indeterminate}
          onChange={handleSelectAll}
        >
          Select all
        </Checkbox>
        <Input
          placeholder="Search CI name..."
          prefix={<Icon type="search" style={{ color: '#bfbfbf' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          size="small"
          style={{ width: 160 }}
        />
        <Select
          placeholder="All Classes"
          value={classFilter}
          onChange={(val) => setClassFilter(val)}
          allowClear
          size="small"
          style={{ width: 140 }}
        >
          {ciClasses.map((cls) => (
            <Option key={cls.id} value={cls.id}>
              {cls.label}
            </Option>
          ))}
        </Select>
      </div>

      <div className="bulk-rel-panel-list" style={{ maxHeight: PANEL_LIST_HEIGHT }}>
        {filteredCIs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No CIs found"
            style={{ margin: '40px 0' }}
          />
        ) : (
          filteredCIs.map((ci) => {
            const cls = classMap[ci.ciClassId]
            const isSelected = selectedIdSet.has(ci.id)
            const envLabel = CI_ENVIRONMENT_LABELS[ci.environment]
            const envColor = CI_ENVIRONMENT_COLORS[ci.environment]
            return (
              <div
                key={ci.id}
                className={'bulk-rel-panel-item' + (isSelected ? ' bulk-rel-panel-item--selected' : '')}
                onClick={() => handleToggleCI(ci.id)}
              >
                <Checkbox checked={isSelected} style={{ marginRight: 10 }} />
                <Icon
                  type={(cls && cls.icon) || 'profile'}
                  style={{
                    color: (cls && cls.color) || '#1890ff',
                    fontSize: 16,
                    marginRight: 8,
                  }}
                />
                <div className="bulk-rel-panel-item-info">
                  <span className="bulk-rel-panel-item-name">{ci.name}</span>
                  <span className="bulk-rel-panel-item-class">
                    {(cls && cls.name) || ci.ciClassId}
                  </span>
                </div>
                {envLabel && (
                  <Tag
                    color={envColor}
                    style={{ marginLeft: 'auto', marginBottom: 0, fontSize: 11 }}
                  >
                    {envLabel}
                  </Tag>
                )}
              </div>
            )
          })
        )}
      </div>

      {selectedCIs.length > 0 && (
        <div className="bulk-rel-panel-tags">
          {selectedCIs.map((ci) => (
            <Tag
              key={ci.id}
              closable
              onClose={() => handleRemoveTag(ci.id)}
              style={{ marginBottom: 4 }}
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
  allCIs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      ciClassId: PropTypes.string,
      status: PropTypes.string,
      shortDescription: PropTypes.string,
      environment: PropTypes.string,
    })
  ).isRequired,
  ciClasses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      name: PropTypes.string,
      icon: PropTypes.string,
      color: PropTypes.string,
    })
  ).isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectionChange: PropTypes.func.isRequired,
}

export default CISelectionPanel
