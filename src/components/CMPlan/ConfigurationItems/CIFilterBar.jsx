import React from 'react'
import { Input, Select, Button, Row, Col, Icon } from 'antd'
import {
  CI_STATUS_LABELS,
  CI_CRITICALITY_LABELS,
  CI_ENVIRONMENT_LABELS,
} from '../../../utils/cmplan/cmplanConstants'

const { Option } = Select
const { Search } = Input

/**
 * Filter bar for the Configuration Items listing page.
 * Calls onFilterChange with updated filter key-value pairs.
 */
const CIFilterBar = ({
  filters,
  ciTypes,
  onFilterChange,
  onReset,
  total,
  loading,
}) => {
  const hasActiveFilters =
    filters.ciTypeId ||
    filters.status ||
    filters.criticality ||
    filters.environment ||
    filters.search

  return (
    <div
      style={{
        background: '#fafafa',
        border: '1px solid #f0f0f0',
        borderRadius: 6,
        padding: '12px 16px',
        marginBottom: 16,
      }}
    >
      <Row gutter={[12, 8]} type="flex" align="middle">
        {/* Search */}
        <Col xs={24} md={7}>
          <Search
            placeholder="Search by name, owner, tag..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            onSearch={(v) => onFilterChange({ search: v })}
            allowClear
            loading={loading}
          />
        </Col>

        {/* CI Class */}
        <Col xs={12} md={4}>
          <Select
            placeholder="All Classes"
            value={filters.ciTypeId || undefined}
            onChange={(v) => onFilterChange({ ciTypeId: v })}
            allowClear
            style={{ width: '100%' }}
          >
            {ciTypes.map((cls) => (
              <Option key={cls.id} value={cls.id}>
                <Icon
                  type={cls.icon}
                  style={{ color: cls.color, marginRight: 4 }}
                />
                {cls.label}
              </Option>
            ))}
          </Select>
        </Col>

        {/* Status */}
        <Col xs={12} md={3}>
          <Select
            placeholder="All Status"
            value={filters.status || undefined}
            onChange={(v) => onFilterChange({ status: v })}
            allowClear
            style={{ width: '100%' }}
          >
            {Object.entries(CI_STATUS_LABELS).map(([v, l]) => (
              <Option key={v} value={v}>
                {l}
              </Option>
            ))}
          </Select>
        </Col>

        {/* Criticality */}
        <Col xs={12} md={3}>
          <Select
            placeholder="All Criticality"
            value={filters.criticality || undefined}
            onChange={(v) => onFilterChange({ criticality: v })}
            allowClear
            style={{ width: '100%' }}
          >
            {Object.entries(CI_CRITICALITY_LABELS).map(([v, l]) => (
              <Option key={v} value={v}>
                {l}
              </Option>
            ))}
          </Select>
        </Col>

        {/* Environment */}
        <Col xs={12} md={3}>
          <Select
            placeholder="All Environments"
            value={filters.environment || undefined}
            onChange={(v) => onFilterChange({ environment: v })}
            allowClear
            style={{ width: '100%' }}
          >
            {Object.entries(CI_ENVIRONMENT_LABELS).map(([v, l]) => (
              <Option key={v} value={v}>
                {l}
              </Option>
            ))}
          </Select>
        </Col>

        {/* Reset + total count */}
        <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasActiveFilters && (
            <Button size="small" onClick={onReset} icon="close-circle">
              Reset
            </Button>
          )}
          {total !== undefined && (
            <span style={{ fontSize: 12, color: '#8c8c8c', whiteSpace: 'nowrap' }}>
              {total} result{total !== 1 ? 's' : ''}
            </span>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default CIFilterBar
