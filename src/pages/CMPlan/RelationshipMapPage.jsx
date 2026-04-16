import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card,
  Row,
  Col,
  Select,
  Icon,
  Spin,
  Empty,
  Tag,
  Divider,
  Button,
} from 'antd'
import ReactECharts from 'echarts-for-react'
import {
  fetchCIClasses,
  fetchConfigurationItems,
  selectCIClasses,
  selectCIItems,
  selectCILoading,
  fetchAllRelationships,
  selectAllRelationships,
  selectRelationshipsLoading,
} from '../../store/cmplan'
import {
  CI_STATUS_LABELS,
  CI_CRITICALITY_LABELS,
  CI_STATUS_COLORS,
  RELATIONSHIP_TYPES,
} from '../../utils/cmplan/cmplanConstants'
import CIStatusBadge from '../../components/CMPlan/ConfigurationItems/CIStatusBadge'
import './CMPlan.css'

const { Option } = Select

const relTypeMap = Object.fromEntries(
  RELATIONSHIP_TYPES.map((r) => [r.value, r.label])
)

// ── Build ECharts graph option ─────────────────────────────────────────────
const buildGraphOption = (ciItems, relationships, ciClasses) => {
  const classMap = Object.fromEntries(ciClasses.map((c) => [c.id, c]))

  const categories = ciClasses.map((c) => ({
    name: c.label,
    itemStyle: { color: c.color },
  }))

  const nodes = ciItems.map((ci) => {
    const cls = classMap[ci.ciClassId] || {}
    const categoryIdx = ciClasses.findIndex((c) => c.id === ci.ciClassId)
    const size =
      ci.criticality === 'critical'
        ? 44
        : ci.criticality === 'high'
        ? 36
        : ci.criticality === 'medium'
        ? 30
        : 24

    return {
      id: ci.id,
      name: ci.name,
      value: ci.id,
      category: categoryIdx,
      symbolSize: size,
      itemStyle: { color: cls.color || '#1890ff' },
      // Extra data for tooltip
      ciStatus: ci.status,
      ciCriticality: ci.criticality,
      ciClass: cls.label || ci.ciClassId,
      ciOwner: ci.owner || '—',
    }
  })

  const links = relationships.map((rel) => ({
    source: rel.sourceId,
    target: rel.targetId,
    relType: relTypeMap[rel.relationshipType] || rel.relationshipType,
    description: rel.description || '',
    lineStyle: { width: 1.5, curveness: 0.08 },
    label: {
      show: true,
      formatter: relTypeMap[rel.relationshipType] || rel.relationshipType,
      fontSize: 10,
      color: '#8c8c8c',
    },
  }))

  return {
    backgroundColor: '#fafafa',
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'node') {
          const d = params.data
          const statusColor = CI_STATUS_COLORS[d.ciStatus] || '#d9d9d9'
          return [
            `<b style="font-size:13px">${d.name}</b>`,
            `<span style="color:#8c8c8c">Class:</span> ${d.ciClass}`,
            `<span style="color:#8c8c8c">Status:</span> <span style="color:${statusColor};font-weight:600">${CI_STATUS_LABELS[d.ciStatus] || d.ciStatus}</span>`,
            `<span style="color:#8c8c8c">Criticality:</span> ${CI_CRITICALITY_LABELS[d.ciCriticality] || d.ciCriticality}`,
            `<span style="color:#8c8c8c">Owner:</span> ${d.ciOwner}`,
          ].join('<br/>')
        }
        if (params.dataType === 'edge') {
          const d = params.data
          return [
            `<b>${d.relType}</b>`,
            d.description ? `<span style="color:#8c8c8c">${d.description}</span>` : null,
          ]
            .filter(Boolean)
            .join('<br/>')
        }
        return ''
      },
    },
    legend: [
      {
        data: categories.map((c) => c.name),
        orient: 'vertical',
        right: 10,
        top: 40,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 12 },
      },
    ],
    series: [
      {
        type: 'graph',
        layout: 'force',
        animation: true,
        draggable: true,
        roam: true,
        data: nodes,
        links,
        categories,
        label: {
          show: true,
          position: 'bottom',
          formatter: '{b}',
          fontSize: 11,
          color: '#262626',
        },
        lineStyle: {
          color: 'source',
          curveness: 0.08,
          opacity: 0.7,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 3, opacity: 1 },
        },
        force: {
          repulsion: 220,
          gravity: 0.04,
          edgeLength: [100, 280],
          layoutAnimation: true,
          friction: 0.6,
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 8],
      },
    ],
  }
}

// ── Selected CI side panel ─────────────────────────────────────────────────
const CINodePanel = ({ ci, ciClasses, relationships, allCIItems }) => {
  if (!ci) return null
  const cls = ciClasses.find((c) => c.id === ci.ciClassId)
  const rels = relationships.filter(
    (r) => r.sourceId === ci.id || r.targetId === ci.id
  )
  const ciMap = Object.fromEntries(allCIItems.map((c) => [c.id, c]))

  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ marginBottom: 12 }}>
        <CIStatusBadge status={ci.ciStatus || ci.status} />
        <Tag
          color={cls && cls.color}
          style={{ marginLeft: 6, marginBottom: 0, fontWeight: 500 }}
        >
          {cls && cls.label}
        </Tag>
      </div>

      <div style={{ color: '#8c8c8c', marginBottom: 4, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>
        Criticality
      </div>
      <div style={{ marginBottom: 12 }}>
        {CI_CRITICALITY_LABELS[ci.ciCriticality || ci.criticality] || ci.ciCriticality || ci.criticality}
      </div>

      <div style={{ color: '#8c8c8c', marginBottom: 4, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>
        Owner
      </div>
      <div style={{ marginBottom: 12 }}>{ci.ciOwner || ci.owner || '—'}</div>

      {rels.length > 0 && (
        <>
          <Divider style={{ margin: '10px 0' }} />
          <div style={{ color: '#8c8c8c', marginBottom: 8, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>
            Connections ({rels.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rels.map((rel) => {
              const isSource = rel.sourceId === ci.id
              const peerId = isSource ? rel.targetId : rel.sourceId
              const peer = ciMap[peerId]
              return (
                <div
                  key={rel.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 8px',
                    background: '#f5f5f5',
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  <Icon
                    type={isSource ? 'arrow-right' : 'arrow-left'}
                    style={{ color: isSource ? '#1890ff' : '#52c41a', fontSize: 11 }}
                  />
                  <Tag color="geekblue" style={{ fontSize: 10, marginBottom: 0, padding: '0 4px' }}>
                    {relTypeMap[rel.relationshipType] || rel.relationshipType}
                  </Tag>
                  <span style={{ color: '#595959', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(peer && peer.name) || peerId}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
const RelationshipMapPage = () => {
  const dispatch = useDispatch()
  const ciClasses = useSelector(selectCIClasses)
  const ciItems = useSelector(selectCIItems)
  const ciLoading = useSelector(selectCILoading)
  const relationships = useSelector(selectAllRelationships)
  const relLoading = useSelector(selectRelationshipsLoading)

  const [filterClassId, setFilterClassId] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)

  useEffect(() => {
    dispatch(fetchCIClasses())
    dispatch(fetchAllRelationships())
    dispatch(fetchConfigurationItems({ page: 1, pageSize: 200 }))
  }, [dispatch])

  // Apply class filter
  const visibleItems = filterClassId
    ? ciItems.filter((ci) => ci.ciClassId === filterClassId)
    : ciItems

  const visibleCIIds = new Set(visibleItems.map((ci) => ci.id))
  const visibleRels = relationships.filter(
    (r) => visibleCIIds.has(r.sourceId) && visibleCIIds.has(r.targetId)
  )

  const graphOption = buildGraphOption(visibleItems, visibleRels, ciClasses)
  const loading = ciLoading || relLoading

  const handleNodeClick = useCallback(
    (params) => {
      if (params.dataType === 'node') {
        const ci = visibleItems.find((c) => c.id === params.data.id)
        setSelectedNode(ci ? { ...params.data, ...ci } : params.data)
      } else {
        setSelectedNode(null)
      }
    },
    [visibleItems]
  )

  const graphColSpan = selectedNode ? 17 : 24

  return (
    <div className="cmplan-page">
      {/* Page Header */}
      <div className="cmplan-page-header">
        <div className="cmplan-page-header-left">
          <Icon
            type="share-alt"
            className="cmplan-page-header-icon"
            style={{ color: '#722ed1' }}
          />
          <div>
            <h2 className="cmplan-page-title">Relationship Map</h2>
            <p className="cmplan-page-subtitle">
              Visual topology of all CI connections. Drag nodes to rearrange. Click
              a node to inspect its details and relationships.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="cmplan-stat-pill">
            <Icon type="database" style={{ marginRight: 4 }} />
            {visibleItems.length} CIs
          </span>
          <span className="cmplan-stat-pill">
            <Icon type="share-alt" style={{ marginRight: 4 }} />
            {visibleRels.length} Links
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <Card
        className="cmplan-card"
        bodyStyle={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
        style={{ marginBottom: 16 }}
      >
        <Icon type="filter" style={{ color: '#8c8c8c' }} />
        <span style={{ color: '#595959', fontWeight: 500, fontSize: 13 }}>
          Filter by Class:
        </span>
        <Select
          value={filterClassId}
          onChange={setFilterClassId}
          allowClear
          placeholder="All Classes"
          style={{ width: 200 }}
        >
          {ciClasses.map((c) => (
            <Option key={c.id} value={c.id}>
              <Icon type={c.icon} style={{ color: c.color, marginRight: 6 }} />
              {c.label}
            </Option>
          ))}
        </Select>
        <span style={{ marginLeft: 'auto', color: '#8c8c8c', fontSize: 12 }}>
          Showing {visibleItems.length} nodes / {visibleRels.length} edges
          {filterClassId && (
            <Button
              type="link"
              size="small"
              onClick={() => setFilterClassId(null)}
              style={{ padding: '0 4px' }}
            >
              Clear
            </Button>
          )}
        </span>
      </Card>

      {/* Graph + Side panel */}
      <Row gutter={16}>
        <Col span={graphColSpan}>
          <Card
            className="cmplan-card"
            bodyStyle={{ padding: 0, position: 'relative' }}
          >
            {loading ? (
              <div
                className="cmplan-loading-center"
                style={{ height: 620, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Spin size="large" tip="Loading graph..." />
              </div>
            ) : visibleItems.length === 0 ? (
              <Empty
                description="No configuration items found"
                style={{ padding: 100 }}
              />
            ) : (
              <>
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 1,
                    background: 'rgba(255,255,255,0.85)',
                    borderRadius: 4,
                    padding: '4px 10px',
                    fontSize: 11,
                    color: '#8c8c8c',
                    pointerEvents: 'none',
                  }}
                >
                  Scroll to zoom · Drag to pan · Click node for details
                </div>
                <ReactECharts
                  option={graphOption}
                  style={{ height: 620 }}
                  onEvents={{ click: handleNodeClick }}
                  notMerge
                />
              </>
            )}
          </Card>
        </Col>

        {selectedNode && (
          <Col span={7}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon
                    type={
                      (ciClasses.find((c) => c.id === selectedNode.ciClassId) && ciClasses.find((c) => c.id === selectedNode.ciClassId).icon) ||
                      'profile'
                    }
                    style={{
                      color: ciClasses.find((c) => c.id === selectedNode.ciClassId) && ciClasses.find((c) => c.id === selectedNode.ciClassId).color,
                    }}
                  />
                  <span
                    style={{
                      maxWidth: 160,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 13,
                    }}
                  >
                    {selectedNode.name}
                  </span>
                </div>
              }
              extra={
                <Icon
                  type="close"
                  onClick={() => setSelectedNode(null)}
                  style={{ cursor: 'pointer', color: '#8c8c8c' }}
                />
              }
              className="cmplan-card"
              bodyStyle={{ padding: '12px 16px' }}
              style={{ height: '100%' }}
            >
              <CINodePanel
                ci={selectedNode}
                ciClasses={ciClasses}
                relationships={visibleRels}
                allCIItems={visibleItems}
              />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}

export default RelationshipMapPage
