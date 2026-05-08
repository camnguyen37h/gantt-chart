import React from 'react'
import {
  Button, Input, Select, Tooltip, Icon, DatePicker, Row, Col,
} from 'antd'

const { Option } = Select

const RL_STATUS_OPTIONS = [
  { value: 'Active',   label: 'Active' },
  { value: 'Draft',    label: 'Draft' },
  { value: 'Updated',  label: 'Updated' },
  { value: 'Renew',    label: 'Renew' },
  { value: 'Expired',  label: 'Expired' },
]

const APPROVAL_STATUS_OPTIONS = [
  { value: 'Approved', label: 'Approved' },
  { value: 'Pending',  label: 'Pending' },
  { value: 'N/A',      label: 'N/A' },
]

const filterOption = (input, option) =>
  option.props.children.toLowerCase().includes(input.toLowerCase())

const RelationshipFilterBar = ({
  filters,
  relTypeOptions,
  sourceTypeOptions,
  targetTypeOptions,
  filteredCount,
  totalCount,
  activeFilterCount,
  selectedRowKeys,
  onFilterChange,
  onSearch,
  onReset,
  onDeleteSelected,
  onNavigateToBulkAdd,
}) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: 6,
    padding: '16px 24px',
    marginBottom: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  }}>
    <Row gutter={[16, 10]}>
      <Col span={8} xl={4}>
        <Input
          placeholder="Source CI"
          value={filters.sourceName}
          onChange={e => onFilterChange('sourceName', e.target.value)}
          onPressEnter={onSearch}
          style={{ width: '100%' }}
          prefix={<Icon type="search" style={{ color: '#bfbfbf' }} />}
        />
      </Col>
      <Col span={8} xl={4}>
        <Input
          placeholder="Destination CI"
          value={filters.targetName}
          onChange={e => onFilterChange('targetName', e.target.value)}
          onPressEnter={onSearch}
          style={{ width: '100%' }}
          prefix={<Icon type="search" style={{ color: '#bfbfbf' }} />}
        />
      </Col>
      <Col span={8} xl={4}>
        <Select
          placeholder="Choose relationship"
          allowClear
          showSearch
          filterOption={filterOption}
          value={filters.relationshipType}
          onChange={val => onFilterChange('relationshipType', val)}
          style={{ width: '100%' }}
        >
          {relTypeOptions.map(t => (
            <Option key={t.value} value={t.value}>{t.label}</Option>
          ))}
        </Select>
      </Col>
      <Col span={8} xl={4}>
        <Select
          placeholder="Choose Source CI Type"
          allowClear
          showSearch
          filterOption={filterOption}
          value={filters.sourceCIType}
          onChange={val => onFilterChange('sourceCIType', val)}
          style={{ width: '100%' }}
        >
          {sourceTypeOptions.map(t => (
            <Option key={t.value} value={t.value}>{t.label}</Option>
          ))}
        </Select>
      </Col>
      <Col span={8} xl={4}>
        <Select
          placeholder="Choose Destination CI Type"
          allowClear
          showSearch
          filterOption={filterOption}
          value={filters.targetCIType}
          onChange={val => onFilterChange('targetCIType', val)}
          style={{ width: '100%' }}
        >
          {targetTypeOptions.map(t => (
            <Option key={t.value} value={t.value}>{t.label}</Option>
          ))}
        </Select>
      </Col>
      <Col span={8} xl={4}>
        <Select
          placeholder="Choose Status"
          allowClear
          showSearch
          filterOption={filterOption}
          value={filters.rlStatus}
          onChange={val => onFilterChange('rlStatus', val)}
          style={{ width: '100%' }}
        >
          {RL_STATUS_OPTIONS.map(s => (
            <Option key={s.value} value={s.value}>{s.label}</Option>
          ))}
        </Select>
      </Col>
      <Col span={8} xl={4}>
        <Select
          placeholder="Approval Status"
          allowClear
          showSearch
          filterOption={filterOption}
          value={filters.approvalStatus}
          onChange={val => onFilterChange('approvalStatus', val)}
          style={{ width: '100%' }}
        >
          {APPROVAL_STATUS_OPTIONS.map(s => (
            <Option key={s.value} value={s.value}>{s.label}</Option>
          ))}
        </Select>
      </Col>
      <Col span={8} xl={4}>
        <DatePicker.RangePicker
          placeholder={['Expire Date from', 'Expire Date to']}
          value={filters.expiredDateRange}
          onChange={val => onFilterChange('expiredDateRange', val || null)}
          format="MM/DD/YYYY"
          style={{ width: '100%' }}
        />
      </Col>
      <Col span={24} xl={{ span: 4, offset: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
          {activeFilterCount > 0 && (
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              <Icon type="filter" style={{ marginRight: 4 }} />
              {filteredCount} / {totalCount}
            </span>
          )}
          <Tooltip title="Search">
            <Button
              shape="circle"
              icon="search"
              type="primary"
              onClick={onSearch}
            />
          </Tooltip>
          <Tooltip title={activeFilterCount > 0 ? `Reset (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''})` : 'Reset filters'}>
            <Button
              shape="circle"
              icon="reload"
              onClick={onReset}
            />
          </Tooltip>
          {selectedRowKeys.length > 0 && (
            <Tooltip title={`Delete selected (${selectedRowKeys.length})`}>
              <Button
                shape="circle"
                icon="delete"
                style={{ color: '#ff4d4f' }}
                onClick={onDeleteSelected}
              />
            </Tooltip>
          )}
          <Button
            type="primary"
            icon="plus"
            onClick={onNavigateToBulkAdd}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            Add Bulk Relationship
          </Button>
        </div>
      </Col>
    </Row>
  </div>
)

export default RelationshipFilterBar
