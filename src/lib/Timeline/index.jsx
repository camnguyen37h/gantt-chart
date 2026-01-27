import { Collapse, Tabs } from 'antd'
import PropTypes from 'prop-types'
import { memo, useEffect, useMemo, useState } from 'react'
import Timeline from './components/Timeline'
import { PROJECT_CHARTS } from './constants'
import { ProjectChartCollapseStyled } from './ProjectChartTabs.styled'
import { getStatusColor } from './utils/itemUtils'
import {
  buildStatusColorMap,
  extractUniqueStatuses,
  filterByVisibleStatuses,
  normalizeTimelineData,
} from './utils/timelineUtils'
import { fetchTimelineData } from '../../utils/mockApiData'
import { NotificationManager } from 'react-notifications'

const { Panel } = Collapse

const ProjectChartTabs = ({ projectId, projectStart, projectEnd }) => {
  const [visibleStatuses, setVisibleStatuses] = useState({})
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      return await fetchTimelineData()
    }

    setLoading(true)

    loadData()
      .then(dataResponse => {
        const normalizedItems = normalizeTimelineData(dataResponse || [])
        setDataSource(normalizedItems)
      })
      .finally(() => {
        setLoading(false)
      })
      .catch(error => {
        NotificationManager.error(error.message)
        setLoading(false)
      })
  }, [])

  const statusColorMap = useMemo(() => {
    return buildStatusColorMap(extractUniqueStatuses(dataSource))
  }, [dataSource])

  const itemsWithColors = useMemo(() => {
    if (!dataSource || dataSource.length === 0) {
      return []
    }

    return dataSource.map(item => {
      return {
        ...item,
        color: getStatusColor(item.status),
      }
    })
  }, [dataSource])

  const filteredItems = useMemo(() => {
    return filterByVisibleStatuses(itemsWithColors, visibleStatuses)
  }, [itemsWithColors, visibleStatuses])

  const handleStatusToggle = status => {
    setVisibleStatuses(prev => ({
      ...prev,
      [status]: prev[status] === false,
    }))
  }

  return (
    <ProjectChartCollapseStyled
      accordion
      bordered={false}
      defaultActiveKey={['project-chart']}
      className="mb-24">
      <Panel header="Project chart" key="project-chart">
        <Tabs
          defaultActiveKey={PROJECT_CHARTS.MILESTONE}
          animated={false}
          destroyInactiveTabPane={true}>
          <Tabs.TabPane
            tab={PROJECT_CHARTS.MILESTONE}
            key={PROJECT_CHARTS.MILESTONE}>
            <Timeline
              items={filteredItems}
              headerProps={{
                projectStart,
                projectEnd,
              }}
              config={{
                enableAutoScroll: true,
                enableCurrentDate: true,
                enableGrid: true,
                loading: loading,
              }}
              legendProps={{
                statusColorMap: statusColorMap,
                visibleStatuses: visibleStatuses,
                onStatusToggle: handleStatusToggle,
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={PROJECT_CHARTS.WORKLOAD}
            key={PROJECT_CHARTS.WORKLOAD}>
            <div>workforce</div>
          </Tabs.TabPane>
        </Tabs>
      </Panel>
    </ProjectChartCollapseStyled>
  )
}

ProjectChartTabs.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  projectStart: PropTypes.string,
  projectEnd: PropTypes.string,
}

export default memo(ProjectChartTabs)
