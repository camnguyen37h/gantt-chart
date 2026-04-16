import React, { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card,
  Table,
  Button,
  Tag,
  Icon,
  Tooltip,
  Popconfirm,
  notification,
  Avatar,
  Drawer,
  Divider,
  Row,
  Col,
  Badge,
  Input,
} from 'antd'
import {
  fetchCIGroups,
  fetchConfigurationItems,
  createCIGroup,
  updateCIGroup,
  deleteCIGroup,
  selectCIGroups,
  selectCIGroupsLoading,
  selectCIGroupsSubmitting,
  selectCIItems,
} from '../../store/cmplan'
import { GROUP_TYPE_MAP } from '../../utils/cmplan/cmplanConstants'
import GroupFormModal from '../../components/CMPlan/Groups/GroupFormModal'
import './CMPlan.css'

const { Search } = Input

// ── Group detail drawer ───────────────────────────────────────────────────────
const GroupDetailDrawer = ({ group, visible, onClose, onEdit, allCIs }) => {
  if (!group) return null

  const typeInfo = GROUP_TYPE_MAP[group.groupType] || { icon: 'tag', color: '#8c8c8c', label: group.groupType }
  const memberCIs = allCIs.filter((ci) => (group.ciIds || []).includes(ci.id))

  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      width={480}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${group.color}20`,
              border: `2px solid ${group.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon type={typeInfo.icon} style={{ color: group.color, fontSize: 16 }} />
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{group.name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
              {typeInfo.label}
            </div>
          </div>
        </div>
      }
      extra={
        <Button type="primary" size="small" icon="edit" onClick={() => onEdit(group)}>
          Edit
        </Button>
      }
    >
      {/* Meta */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <div style={{ color: '#8c8c8c', fontSize: 11, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Owner</div>
          <div>{group.owner || '—'}</div>
        </Col>
        <Col span={12}>
          <div style={{ color: '#8c8c8c', fontSize: 11, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Updated</div>
          <div>{new Date(group.updatedAt).toLocaleDateString()}</div>
        </Col>
      </Row>

      {group.description && (
        <div style={{ marginBottom: 16, padding: '10px 12px', background: '#fafafa', borderRadius: 6, fontSize: 13, color: '#595959' }}>
          {group.description}
        </div>
      )}

      {/* CI Members */}
      <Divider orientation="left" style={{ fontSize: 12 }}>
        <Icon type="database" style={{ marginRight: 4 }} />
        Configuration Items ({memberCIs.length})
      </Divider>

      {memberCIs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '24px 0', fontSize: 13 }}>
          <Icon type="inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8 }} />
          No CIs assigned yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {memberCIs.map((ci) => (
            <div
              key={ci.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                background: '#fafafa',
                borderRadius: 6,
                border: '1px solid #f0f0f0',
                fontSize: 13,
              }}
            >
              <Badge
                status={
                  ci.status === 'active' ? 'success' :
                  ci.status === 'maintenance' ? 'warning' :
                  ci.status === 'retired' ? 'error' : 'default'
                }
              />
              <span style={{ fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ci.name}
              </span>
              <Tag style={{ marginBottom: 0, fontSize: 11 }}>{ci.status}</Tag>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const GroupsPage = () => {
  const dispatch = useDispatch()
  const groups = useSelector(selectCIGroups)
  const loading = useSelector(selectCIGroupsLoading)
  const submitting = useSelector(selectCIGroupsSubmitting)
  const allCIs = useSelector(selectCIItems)

  const [modalVisible, setModalVisible] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [viewingGroup, setViewingGroup] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState(null)

  useEffect(() => {
    dispatch(fetchCIGroups())
    dispatch(fetchConfigurationItems({ page: 1, pageSize: 200 }))
  }, [dispatch])

  const handleAdd = useCallback(() => {
    setEditingGroup(null)
    setModalVisible(true)
  }, [])

  const handleEdit = useCallback((group) => {
    setEditingGroup(group)
    setModalVisible(true)
    setDrawerVisible(false)
  }, [])

  const handleView = useCallback((group) => {
    setViewingGroup(group)
    setDrawerVisible(true)
  }, [])

  const handleDelete = useCallback(
    async (id) => {
      const result = await dispatch(deleteCIGroup(id))
      if (deleteCIGroup.fulfilled.match(result)) {
        notification.success({ message: 'Group deleted.' })
        if (viewingGroup && viewingGroup.id === id) setDrawerVisible(false)
      } else {
        notification.error({ message: 'Failed to delete group.' })
      }
    },
    [dispatch, viewingGroup]
  )

  const handleSubmit = useCallback(
    async (values) => {
      let result
      if (values.id) {
        const { id, ...payload } = values
        result = await dispatch(updateCIGroup({ id, payload }))
        if (updateCIGroup.fulfilled.match(result)) {
          notification.success({ message: 'Group updated.' })
          if (viewingGroup && viewingGroup.id === id) setViewingGroup(result.payload)
          setModalVisible(false)
        } else {
          notification.error({ message: 'Update failed.' })
        }
      } else {
        result = await dispatch(createCIGroup(values))
        if (createCIGroup.fulfilled.match(result)) {
          notification.success({ message: 'Group created.' })
          setModalVisible(false)
        } else {
          notification.error({ message: 'Create failed.' })
        }
      }
    },
    [dispatch, viewingGroup]
  )

  // Filter
  const filtered = groups.filter((g) => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || (g.owner || '').toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || g.groupType === typeFilter
    return matchSearch && matchType
  })

  const uniqueTypes = [...new Set(groups.map((g) => g.groupType))]

  const columns = [
    {
      title: 'Group',
      key: 'group',
      render: (_, g) => {
        const typeInfo = GROUP_TYPE_MAP[g.groupType] || { icon: 'tag', color: '#8c8c8c' }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              size={36}
              style={{ background: `${g.color}20`, flexShrink: 0, border: `2px solid ${g.color}` }}
              icon={<Icon type={typeInfo.icon} style={{ color: g.color }} />}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#262626' }}>{g.name}</div>
              {g.description && (
                <div style={{ fontSize: 11, color: '#8c8c8c', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.description}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      title: 'Type',
      dataIndex: 'groupType',
      key: 'groupType',
      width: 140,
      render: (type) => {
        const t = GROUP_TYPE_MAP[type] || { icon: 'tag', color: '#8c8c8c', label: type }
        return (
          <Tag color={t.color} style={{ fontWeight: 500 }}>
            <Icon type={t.icon} style={{ marginRight: 4 }} />
            {t.label}
          </Tag>
        )
      },
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      width: 140,
      render: (owner) => owner || <span style={{ color: '#bfbfbf' }}>—</span>,
    },
    {
      title: 'CIs',
      key: 'ciCount',
      width: 80,
      align: 'center',
      render: (_, g) => (
        <Tag color="blue" style={{ fontWeight: 600, minWidth: 32, textAlign: 'center' }}>
          {(g.ciIds || []).length}
        </Tag>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 130,
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, g) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="View">
            <Button shape="circle" size="small" icon="eye" onClick={() => handleView(g)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button shape="circle" size="small" icon="edit" type="primary" ghost onClick={() => handleEdit(g)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title={`Delete group "${g.name}"?`}
              onConfirm={() => handleDelete(g.id)}
              okType="danger"
              okText="Delete"
              cancelText="Cancel"
            >
              <Button shape="circle" size="small" icon="delete" type="danger" ghost />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <div className="cmplan-page">
      {/* Header */}
      <div className="cmplan-page-header">
        <div className="cmplan-page-header-left">
          <Icon type="cluster" className="cmplan-page-header-icon" style={{ color: '#722ed1' }} />
          <div>
            <h2 className="cmplan-page-title">CI Groups</h2>
            <p className="cmplan-page-subtitle">
              Organize Configuration Items into groups by service, team, environment,
              or any custom criteria.
            </p>
          </div>
        </div>
        <Button type="primary" icon="plus" size="large" onClick={handleAdd}>
          New Group
        </Button>
      </div>

      {/* Stats pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="cmplan-stat-pill">
          <Icon type="cluster" style={{ marginRight: 4 }} />
          {groups.length} Total Groups
        </span>
        {uniqueTypes.map((type) => {
          const t = GROUP_TYPE_MAP[type] || { icon: 'tag', color: '#8c8c8c', label: type }
          const count = groups.filter((g) => g.groupType === type).length
          return (
            <span
              key={type}
              className="cmplan-stat-pill"
              style={{ cursor: 'pointer', border: typeFilter === type ? `1.5px solid ${t.color}` : undefined, color: typeFilter === type ? t.color : undefined }}
              onClick={() => setTypeFilter(typeFilter === type ? null : type)}
            >
              <Icon type={t.icon} style={{ marginRight: 4 }} />
              {t.label}: {count}
            </span>
          )
        })}
        {typeFilter && (
          <span
            className="cmplan-stat-pill"
            style={{ cursor: 'pointer', color: '#f5222d' }}
            onClick={() => setTypeFilter(null)}
          >
            <Icon type="close" style={{ marginRight: 4 }} />
            Clear filter
          </span>
        )}
      </div>

      <Card className="cmplan-card" bodyStyle={{ padding: '16px 20px' }}>
        {/* Search bar */}
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search by name or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 820 }}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} groups` }}
          locale={{ emptyText: (
            <div style={{ padding: '40px 0', color: '#bfbfbf' }}>
              <Icon type="cluster" style={{ fontSize: 32, display: 'block', margin: '0 auto 12px' }} />
              No groups found. Create your first group.
            </div>
          )}}
        />
      </Card>

      {/* Form modal */}
      <GroupFormModal
        visible={modalVisible}
        editingRecord={editingGroup}
        allCIs={allCIs}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => { setModalVisible(false); setEditingGroup(null) }}
      />

      {/* Detail drawer */}
      <GroupDetailDrawer
        visible={drawerVisible}
        group={viewingGroup}
        allCIs={allCIs}
        onClose={() => setDrawerVisible(false)}
        onEdit={handleEdit}
      />
    </div>
  )
}

export default GroupsPage
