import React, { useCallback } from 'react'
import { Table, Button, Tag, Popconfirm, Tooltip, Switch, Badge } from 'antd'
import { Icon } from 'antd'
import AttributeTypeTag from './AttributeTypeTag'

/**
 * Table showing all attribute definitions for a given CI class tab.
 * Includes inline activate/deactivate toggle and row-level edit/delete.
 */
const AttributeDefinitionTable = ({
  dataSource,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  ciClassLabel,
  isGlobal = false,
  validationRules = [],
}) => {
  const handleDelete = useCallback(
    (id) => {
      onDelete(id)
    },
    [onDelete]
  )

  const handleToggle = useCallback(
    (record, checked) => {
      onToggleActive(record.id, checked)
    },
    [onToggleActive]
  )

  const columns = [
    {
      title: 'Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
      align: 'center',
      render: (v) => (
        <span style={{ color: '#8c8c8c', fontWeight: 500 }}>{v}</span>
      ),
    },
    {
      title: 'Attribute Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name, record) => (
        <div>
          <code
            style={{
              background: '#f5f5f5',
              padding: '2px 6px',
              borderRadius: 3,
              fontSize: 12,
              color: '#1890ff',
              fontFamily: 'monospace',
            }}
          >
            {name}
          </code>
          {record.isRequired && (
            <Tag color="red" style={{ marginLeft: 6, fontSize: 10 }}>
              Required
            </Tag>
          )}
          {isGlobal && (
            <Tooltip title="This attribute is applied to all CI classes">
              <Tag color="gold" style={{ marginLeft: 2, fontSize: 10 }}>
                Global
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Display Label',
      dataIndex: 'label',
      key: 'label',
      width: 180,
      render: (label, record) => (
        <div>
          <span style={{ fontWeight: 500 }}>{label}</span>
          {record.placeholder && (
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              {record.placeholder}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type) => <AttributeTypeTag type={type} />,
    },
    {
      title: 'Validation Rule',
      dataIndex: 'validationRuleId',
      key: 'validationRuleId',
      width: 180,
      render: (ruleId) => {
        if (!ruleId) return <span style={{ color: '#bfbfbf' }}>—</span>
        const rule = validationRules.find((r) => r.id === ruleId)
        if (!rule) return <span style={{ color: '#bfbfbf' }}>—</span>
        return (
          <Tooltip title={rule.value}>
            <Tag color="geekblue" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {rule.name}
            </Tag>
          </Tooltip>
        )
      },
    },
    {
      title: 'Default',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 120,
      ellipsis: true,
      render: (v) =>
        v ? (
          <code style={{ fontSize: 11, color: '#595959' }}>{v}</code>
        ) : (
          <span style={{ color: '#bfbfbf' }}>—</span>
        ),
    },
    {
      title: 'Options',
      dataIndex: 'options',
      key: 'options',
      width: 160,
      render: (options) => {
        if (!options || !options.length) return <span style={{ color: '#bfbfbf' }}>—</span>
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {options.slice(0, 3).map((o) => (
              <Tag key={o.value} style={{ fontSize: 10, margin: 1 }}>
                {o.label}
              </Tag>
            ))}
            {options.length > 3 && (
              <Tooltip
                title={options
                  .slice(3)
                  .map((o) => o.label)
                  .join(', ')}
              >
                <Tag style={{ fontSize: 10, margin: 1 }}>+{options.length - 3} more</Tag>
              </Tooltip>
            )}
          </div>
        )
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v) =>
        v ? (
          <Tooltip title={v}>
            <span style={{ color: '#595959', fontSize: 12 }}>{v}</span>
          </Tooltip>
        ) : (
          <span style={{ color: '#bfbfbf' }}>—</span>
        ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      align: 'center',
      render: (isActive, record) => (
        <Switch
          size="small"
          checked={isActive}
          onChange={(checked) => handleToggle(record, checked)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Tooltip title="Edit attribute">
            <Button
              type="link"
              size="small"
              icon="edit"
              onClick={() => onEdit(record)}
              style={{ padding: 0 }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this attribute definition?"
            description="Existing CI attribute values using this key will remain but the field will no longer appear in forms."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
            icon={<Icon type="warning" style={{ color: '#faad14' }} />}
          >
            <Tooltip title="Delete attribute">
              <Button
                type="link"
                size="small"
                icon="delete"
                style={{ padding: 0, color: '#f5222d' }}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div>
          <span style={{ fontSize: 14, color: '#595959' }}>
            {isGlobal ? (
              <>
                <Icon type="global" style={{ marginRight: 6, color: '#faad14' }} />
                Global attributes apply to <strong>all CI classes</strong>
              </>
            ) : (
              <>
                <Icon type="profile" style={{ marginRight: 6, color: '#1890ff' }} />
                Attributes specific to <strong>{ciClassLabel}</strong>
              </>
            )}
          </span>
          <Badge
            count={dataSource.length}
            style={{ backgroundColor: '#108ee9', marginLeft: 8 }}
          />
        </div>
        <Button type="primary" icon="plus" onClick={onAdd}>
          Add Attribute
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        size="small"
        pagination={false}
        scroll={{ x: 900 }}
        rowClassName={(record) => (!record.isActive ? 'row-disabled' : '')}
        locale={{
          emptyText: (
            <div style={{ padding: '24px 0', color: '#8c8c8c' }}>
              <Icon type="inbox" style={{ fontSize: 32, marginBottom: 8 }} />
              <div>No attributes defined.</div>
              <div style={{ fontSize: 12 }}>Click &quot;Add Attribute&quot; to get started.</div>
            </div>
          ),
        }}
      />
    </div>
  )
}

export default AttributeDefinitionTable
