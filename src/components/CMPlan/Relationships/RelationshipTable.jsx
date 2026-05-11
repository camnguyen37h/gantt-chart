import React from 'react'
import { Table, Spin, Icon } from 'antd'

const PAGE_SIZE = 20

const RelationshipTable = ({
  loading,
  filteredItems,
  totalCount,
  columns,
  activeFilterCount,
  selectedRowKeys,
  onSelectionChange,
  currentPage,
  onPageChange,
}) => (
  <Spin spinning={loading}>
    <Table
      className="rel-list-table"
      size="small"
      bordered
      rowKey="id"
      dataSource={filteredItems}
      columns={columns}
      scroll={{ x: 'max-content' }}
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectionChange,
        getCheckboxProps: record => ({
          style: record.isDelete ? undefined : { display: 'none' },
        }),
      }}
      pagination={{
        current: currentPage,
        pageSize: PAGE_SIZE,
        total: totalCount,
        onChange: onPageChange,
        showSizeChanger: false,
        showTotal: (total, range) =>
          activeFilterCount > 0
            ? `${range[0]}–${range[1]} of ${total} (filtered from ${totalCount})`
            : `${total} records`,
        size: 'small',
      }}
      locale={{
        emptyText: (
          <div style={{ padding: '32px 0', color: '#bfbfbf' }}>
            <Icon
              type="inbox"
              style={{ fontSize: 32, marginBottom: 8, display: 'block' }}
            />
            {activeFilterCount > 0
              ? 'No relationships match the current filters'
              : 'No relationships yet'}
          </div>
        ),
      }}
    />
  </Spin>
)

export default RelationshipTable
