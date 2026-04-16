import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card,
  Row,
  Col,
  Icon,
  Spin,
  Empty,
  Tag,
  Select,
  Badge,
  Divider,
} from 'antd'
import ReactECharts from 'echarts-for-react'
import {
  fetchCIGroups,
  fetchConfigurationItems,
  selectCIGroups,
  selectCIGroupsLoading,
  selectCIItems,
  selectCILoading,
} from '../../store/cmplan'
import { GROUP_TYPE_MAP, CI_STATUS_LABELS } from '../../utils/cmplan/cmplanConstants'
import './CMPlan.css'

const { Option } = Select

// ── Build force graph option ─────────────────────────────────────────────────
const buildGroupGraphOption = (groups, allCIs) => {
  const ciMap = Object.fromEntries(allCIs.map((c) => [c.id, c]))

  // Group nodes
  const nodes = groups.map((g) => {
    const typeInfo = GROUP_TYPE_MAP[g.groupType] || { color: '#8c8c8c' }
    const memberCount = (g.ciIds || []).length
    return {
      id: g.id,
      name: g.name,
      value: memberCount,
      symbolSize: Math.max(40, Math.min(80, 28 + memberCount * 4)),
      itemStyle: { color: g.color || typeInfo.color },
      label: {
        show: true,
        formatter: `{b}\n(${memberCount} CIs)`,
        fontSize: 11,
        color: '#262626',
      },
      // extra for tooltip
      gOwner: g.owner || '—',
      gType: (GROUP_TYPE_MAP[g.groupType] && GROUP_TYPE_MAP[g.groupType].label) || g.groupType,
      gColor: g.color,
      gDescription: g.description || '',
      ciIds: g.ciIds || [],
    }
  })

  // Edges: connect groups that share at least one CI
  const edges = []
  const usedPairs = new Set()
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const a = groups[i]
      const b = groups[j]
      const shared = (a.ciIds || []).filter((id) => (b.ciIds || []).includes(id))
      if (shared.length > 0) {
        const pairKey = [a.id, b.id].sort().join('|')
        if (!usedPairs.has(pairKey)) {
          usedPairs.add(pairKey)
          edges.push({
            source: a.id,
            target: b.id,
            sharedCount: shared.length,
            sharedNames: shared.map((id) => (ciMap[id] && ciMap[id].name) || id).join(', '),
            lineStyle: { width: Math.min(shared.length * 1.5, 6), opacity: 0.6 },
            label: {
              show: true,
              formatter: `${shared.length} shared`,
              fontSize: 10,
              color: '#8c8c8c',
            },
          })
        }
      }
    }
  }

  return {
    backgroundColor: '#fafafa',
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'node') {
          const d = params.data
          return [
            `<b style="font-size:13px">${d.name}</b>`,
            `<span style="color:#8c8c8c">Type:</span> ${d.gType}`,
            `<span style="color:#8c8c8c">Owner:</span> ${d.gOwner}`,
            `<span style="color:#8c8c8c">CIs:</span> <b>${d.value}</b>`,
            d.gDescription ? `<span style="color:#8c8c8c;font-style:italic">${d.gDescription}</span>` : null,
          ].filter(Boolean).join('<br/>')
        }
        if (params.dataType === 'edge') {
          const d = params.data
          return [
            `<b>${d.sharedCount} shared CI${d.sharedCount > 1 ? 's' : ''}</b>`,
            `<span style="color:#8c8c8c;font-size:11px">${d.sharedNames}</span>`,
          ].join('<br/>')
        }
        return ''
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        animation: true,
        draggable: true,
        roam: true,
        data: nodes,
        links: edges,
        label: { show: true },
        lineStyle: { color: '#aaa', curveness: 0.1 },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 4, opacity: 1 },
        },
        force: {
          repulsion: 320,
          gravity: 0.05,
          edgeLength: [120, 300],
          layoutAnimation: true,
          friction: 0.6,
        },
      },
    ],
  }
}

// ── Selected group panel ──────────────────────────────────────────────────────
const GroupPanel = ({ group, allCIs, onClose }) => {
  if (!group) return null
  const typeInfo = GROUP_TYPE_MAP[group.gType || group.groupType] || { icon: 'cluster', color: '#8c8c8c', label: group.gType }
  const memberCIs = allCIs.filter((ci) => (group.ciIds || []).includes(ci.id))

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: `${group.gColor || group.color}20`,
              border: `2px solid ${group.gColor || group.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon type={typeInfo.icon} style={{ color: group.gColor || group.color, fontSize: 13 }} />
          </span>
          <span style={{ fontSize: 13, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {group.name}
          </span>
        </div>
      }
      extra={
        <Icon type="close" onClick={onClose} style={{ cursor: 'pointer', color: '#8c8c8c' }} />
      }
      className="cmplan-card"
      bodyStyle={{ padding: '12px 16px' }}
      style={{ height: '100%' }}
    >
      <div style={{ marginBottom: 10 }}>
        <Tag color={group.gColor || group.color} style={{ fontWeight: 600 }}>
          {typeInfo.label}
        </Tag>
      </div>

      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Owner</div>
      <div style={{ marginBottom: 12, fontSize: 13 }}>{group.gOwner || '—'}</div>

      {group.gDescription && (
        <div style={{ marginBottom: 12, fontSize: 12, color: '#595959', fontStyle: 'italic' }}>
          {group.gDescription}
        </div>
      )}

      <Divider style={{ margin: '8px 0' }} />
      <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
        Config Items ({memberCIs.length})
      </div>

      <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {memberCIs.length === 0 ? (
          <div style={{ color: '#bfbfbf', textAlign: 'center', padding: '16px 0', fontSize: 12 }}>No CIs assigned</div>
        ) : (
          memberCIs.map((ci) => (
            <div
              key={ci.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 8px',
                background: '#f5f5f5',
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              <Badge
                status={
                  ci.status === 'active' ? 'success' :
                  ci.status === 'maintenance' ? 'warning' :
                  ci.status === 'retired' ? 'error' : 'default'
                }
              />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {ci.name}
              </span>
              <span style={{ color: '#8c8c8c', fontSize: 11 }}>
                {CI_STATUS_LABELS[ci.status] || ci.status}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const GroupMapPage = () => {
  const dispatch = useDispatch()
  const groups = useSelector(selectCIGroups)
  const groupsLoading = useSelector(selectCIGroupsLoading)
  const allCIs = useSelector(selectCIItems)
  const cisLoading = useSelector(selectCILoading)

  const [filterType, setFilterType] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)

  useEffect(() => {
    dispatch(fetchCIGroups())
    dispatch(fetchConfigurationItems({ page: 1, pageSize: 200 }))
  }, [dispatch])

  const loading = groupsLoading || cisLoading

  const visibleGroups = filterType
    ? groups.filter((g) => g.groupType === filterType)
    : groups

  const graphOption = buildGroupGraphOption(visibleGroups, allCIs)

  const handleNodeClick = useCallback(
    (params) => {
      if (params.dataType === 'node') {
        const g = visibleGroups.find((gr) => gr.id === params.data.id)
        setSelectedGroup(g ? { ...params.data, ...g } : params.data)
      } else {
        setSelectedGroup(null)
      }
    },
    [visibleGroups]
  )

  const uniqueTypes = [...new Set(groups.map((g) => g.groupType))]
  const graphColSpan = selectedGroup ? 17 : 24

  return (
    <div className="cmplan-page">
      {/* Header */}
      <div className="cmplan-page-header">
        <div className="cmplan-page-header-left">
          <Icon type="apartment" className="cmplan-page-header-icon" style={{ color: '#722ed1' }} />
          <div>
            <h2 className="cmplan-page-title">Group Map</h2>
            <p className="cmplan-page-subtitle">
              Visual topology of groups and their shared CIs. Thicker edges mean more
              shared configuration items. Click a group node to inspect members.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="cmplan-stat-pill">
            <Icon type="cluster" style={{ marginRight: 4 }} />
            {visibleGroups.length} Groups
          </span>
        </div>
      </div>

      {/* Filter */}
      <Card
        className="cmplan-card"
        bodyStyle={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
        style={{ marginBottom: 16 }}
      >
        <Icon type="filter" style={{ color: '#8c8c8c' }} />
        <span style={{ color: '#595959', fontWeight: 500, fontSize: 13 }}>Filter by Type:</span>
        <Select
          value={filterType}
          onChange={setFilterType}
          allowClear
          placeholder="All Types"
          style={{ width: 180 }}
        >
          {uniqueTypes.map((type) => {
            const t = GROUP_TYPE_MAP[type] || { icon: 'tag', label: type }
            return (
              <Option key={type} value={type}>
                <Icon type={t.icon} style={{ marginRight: 6 }} />
                {t.label}
              </Option>
            )
          })}
        </Select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8c8c8c' }}>
          Edges = shared CIs between groups&nbsp;&nbsp;·&nbsp;&nbsp;Node size = CI count
        </span>
      </Card>

      {/* Graph + Panel */}
      <Row gutter={16}>
        <Col span={graphColSpan}>
          <Card className="cmplan-card" bodyStyle={{ padding: 0, position: 'relative' }}>
            {loading ? (
              <div style={{ height: 580, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" tip="Loading groups..." />
              </div>
            ) : visibleGroups.length === 0 ? (
              <Empty description="No groups found" style={{ padding: 100 }} />
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
                  Scroll to zoom · Drag to pan · Click group to inspect
                </div>
                <ReactECharts
                  option={graphOption}
                  style={{ height: 580 }}
                  onEvents={{ click: handleNodeClick }}
                  notMerge
                />
              </>
            )}
          </Card>
        </Col>

        {selectedGroup && (
          <Col span={7}>
            <GroupPanel
              group={selectedGroup}
              allCIs={allCIs}
              onClose={() => setSelectedGroup(null)}
            />
          </Col>
        )}
      </Row>
    </div>
  )
}

export default GroupMapPage
