import React, { useState, useCallback } from 'react'
import {
  Drawer,
  Descriptions,
  Tag,
  Divider,
  Badge,
  Button,
  Icon,
  Tooltip,
  Popconfirm,
  notification,
  Spin,
} from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCIClasses,
  selectRelationshipsByCI,
  selectRelationshipsSubmitting,
  createRelationship,
  deleteRelationship,
} from '../../../store/cmplan'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'
import CIStatusBadge from './CIStatusBadge'
import AddRelationshipModal from '../Relationships/AddRelationshipModal'
import {
  CI_CRITICALITY_LABELS,
  CI_CRITICALITY_COLORS,
  CI_ENVIRONMENT_LABELS,
  CI_ENVIRONMENT_COLORS,
  COMPLIANCE_STATUS_LABELS,
  COMPLIANCE_STATUS_COLORS,
  RELATIONSHIP_TYPES,
} from '../../../utils/cmplan/cmplanConstants'

const relTypeMap = Object.fromEntries(
  RELATIONSHIP_TYPES.map((r) => [r.value, r.label])
)

const CIDetailDrawer = ({ ci, visible, onClose, onEdit, attrDefs = [] }) => {
  const dispatch = useDispatch()
  const ciClasses = useSelector(selectCIClasses)
  const relations = useSelector(selectRelationshipsByCI(ci?.id || ''))
  const submitting = useSelector(selectRelationshipsSubmitting)

  const [addRelVisible, setAddRelVisible] = useState(false)
  const [allCIsForSelect, setAllCIsForSelect] = useState([])
  const [loadingCIs, setLoadingCIs] = useState(false)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenAddRel = useCallback(async () => {
    if (allCIsForSelect.length === 0) {
      setLoadingCIs(true)
      const res = await cmplanApi.configurationItems.getAll({ page: 1, pageSize: 200 })
      if (res.success) setAllCIsForSelect(res.data)
      setLoadingCIs(false)
    }
    setAddRelVisible(true)
  }, [allCIsForSelect.length])

  const handleAddRelSubmit = useCallback(
    async (payload) => {
      const result = await dispatch(createRelationship(payload))
      if (createRelationship.fulfilled.match(result)) {
        notification.success({ message: 'Relationship added.' })
        setAddRelVisible(false)
      } else {
        notification.error({ message: 'Failed to add relationship.' })
      }
    },
    [dispatch]
  )

  const handleDeleteRel = useCallback(
    async (relId) => {
      const result = await dispatch(deleteRelationship(relId))
      if (deleteRelationship.fulfilled.match(result)) {
        notification.success({ message: 'Relationship removed.' })
      } else {
        notification.error({ message: 'Failed to remove relationship.' })
      }
    },
    [dispatch]
  )

  // Guard after all hooks
  if (!ci) return null

  const ciClass = ciClasses.find((c) => c.id === ci.ciClassId)
  const attrDefMap = Object.fromEntries(attrDefs.map((a) => [a.name, a]))

  const renderAttrValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '—'
    const def = attrDefMap[key]
    if (!def) return String(value)

    switch (def.type) {
      case 'checkbox':
        return (
          <Badge
            status={value ? 'success' : 'default'}
            text={value ? 'Yes' : 'No'}
          />
        )
      case 'url':
        return (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        )
      case 'email':
        return <a href={`mailto:${value}`}>{value}</a>
      case 'multiselect':
        if (Array.isArray(value)) {
          const optionMap = Object.fromEntries(
            (def.options || []).map((o) => [o.value, o.label])
          )
          return value.map((v) => (
            <Tag key={v} style={{ margin: '1px 4px 1px 0' }}>
              {optionMap[v] || v}
            </Tag>
          ))
        }
        return String(value)
      case 'select': {
        const optionMap = Object.fromEntries(
          (def.options || []).map((o) => [o.value, o.label])
        )
        return optionMap[value] || value
      }
      default:
        return String(value)
    }
  }

  return (
    <>
    <Drawer
      visible={visible}
      onClose={onClose}
      width={560}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon
            type={ciClass?.icon || 'profile'}
            style={{
              fontSize: 20,
              color: ciClass?.color || '#1890ff',
              backgroundColor: `${ciClass?.color || '#1890ff'}15`,
              padding: 6,
              borderRadius: 6,
            }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{ci.name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
              {ciClass?.label}
            </div>
          </div>
        </div>
      }
      extra={
        <Button type="primary" size="small" icon="edit" onClick={() => onEdit(ci)}>
          Edit
        </Button>
      }
    >
      {/* Status + Criticality row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <CIStatusBadge status={ci.status} />
        <Tag
          color={CI_CRITICALITY_COLORS[ci.criticality]}
          style={{ fontWeight: 500 }}
        >
          {CI_CRITICALITY_LABELS[ci.criticality] || ci.criticality}
        </Tag>
        <Tag
          color={CI_ENVIRONMENT_COLORS[ci.environment]}
          style={{ fontWeight: 500 }}
        >
          {CI_ENVIRONMENT_LABELS[ci.environment] || ci.environment}
        </Tag>
        {ci.complianceStatus && (
          <Tag
            color={COMPLIANCE_STATUS_COLORS[ci.complianceStatus]}
            style={{ fontWeight: 500 }}
          >
            <Icon type="safety-certificate" style={{ marginRight: 4 }} />
            {COMPLIANCE_STATUS_LABELS[ci.complianceStatus]}
            {ci.complianceScore != null && ` (${ci.complianceScore}%)`}
          </Tag>
        )}
      </div>

      {/* Core info */}
      <Descriptions column={1} size="small" bordered>
        {ci.shortDescription && (
          <Descriptions.Item label="Description">
            {ci.shortDescription}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Owner">{ci.owner || '—'}</Descriptions.Item>
        <Descriptions.Item label="Department">{ci.department || '—'}</Descriptions.Item>
        <Descriptions.Item label="Location">{ci.location || '—'}</Descriptions.Item>
        <Descriptions.Item label="Created">
          {new Date(ci.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {new Date(ci.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>

      {/* Tags */}
      {ci.tags && ci.tags.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 12,
              color: '#8c8c8c',
              marginBottom: 6,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Tags
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {ci.tags.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Class-specific attributes */}
      {ci.attributes && Object.keys(ci.attributes).length > 0 && (
        <>
          <Divider orientation="left" style={{ fontSize: 12, marginTop: 20 }}>
            <Icon
              type={ciClass?.icon || 'profile'}
              style={{ color: ciClass?.color, marginRight: 4 }}
            />
            {ciClass?.label} Attributes
          </Divider>
          <Descriptions column={1} size="small" bordered>
            {Object.entries(ci.attributes).map(([key, value]) => {
              const def = attrDefMap[key]
              return (
                <Descriptions.Item
                  key={key}
                  label={
                    <Tooltip title={`key: ${key}`}>
                      {def?.label || key}
                    </Tooltip>
                  }
                >
                  {renderAttrValue(key, value)}
                </Descriptions.Item>
              )
            })}
          </Descriptions>
        </>
      )}

      {/* Relationships */}
      <Divider
        orientation="left"
        style={{ fontSize: 12, marginTop: 20 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span>
            <Icon type="share-alt" style={{ marginRight: 4 }} />
            Relationships ({relations.length})
          </span>
          <Button
            size="small"
            type="dashed"
            icon={loadingCIs ? 'loading' : 'plus'}
            onClick={handleOpenAddRel}
            disabled={loadingCIs}
            style={{ fontWeight: 500 }}
          >
            Add
          </Button>
        </div>
      </Divider>

      {relations.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: '#bfbfbf',
            padding: '20px 0',
            fontSize: 13,
          }}
        >
          <Icon
            type="disconnect"
            style={{ fontSize: 24, display: 'block', marginBottom: 8 }}
          />
          No relationships defined yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {relations.map((rel) => {
            const isSource = rel.sourceId === ci.id
            const peerId = isSource ? rel.targetId : rel.sourceId
            const peerCI = allCIsForSelect.find((c) => c.id === peerId)
            const peerName = peerCI?.name || peerId

            return (
              <div
                key={rel.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: '#fafafa',
                  borderRadius: 6,
                  border: '1px solid #f0f0f0',
                  fontSize: 13,
                }}
              >
                <Icon
                  type={isSource ? 'arrow-right' : 'arrow-left'}
                  style={{
                    color: isSource ? '#1890ff' : '#52c41a',
                    flexShrink: 0,
                  }}
                />
                <Tag
                  color="geekblue"
                  style={{ fontWeight: 500, marginBottom: 0 }}
                >
                  {relTypeMap[rel.relationshipType] || rel.relationshipType}
                </Tag>
                <span
                  style={{
                    color: '#595959',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {peerName}
                </span>
                {rel.description && (
                  <Tooltip title={rel.description}>
                    <Icon type="info-circle" style={{ color: '#bfbfbf' }} />
                  </Tooltip>
                )}
                <Popconfirm
                  title="Remove this relationship?"
                  onConfirm={() => handleDeleteRel(rel.id)}
                  okType="danger"
                  okText="Remove"
                  cancelText="Cancel"
                  placement="topRight"
                >
                  <Button
                    shape="circle"
                    size="small"
                    icon="delete"
                    type="danger"
                    ghost
                    style={{ flexShrink: 0, border: 'none' }}
                  />
                </Popconfirm>
              </div>
            )
          })}
        </div>
      )}
    </Drawer>

    {/* Add Relationship Modal */}
    <AddRelationshipModal
      visible={addRelVisible}
      sourceCI={{
        id: ci.id,
        name: ci.name,
        classIcon: ciClass?.icon,
        classColor: ciClass?.color,
      }}
      allCIs={allCIsForSelect}
      submitting={submitting}
      onSubmit={handleAddRelSubmit}
      onClose={() => setAddRelVisible(false)}
    />

    {loadingCIs && (
      <Spin
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1100,
        }}
        size="large"
      />
    )}
  </>
  )
}

export default CIDetailDrawer
