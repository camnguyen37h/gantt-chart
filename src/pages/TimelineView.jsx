import { Tabs } from 'antd'
import { PROJECT_CHARTS } from '../lib/Timeline/constants'
import ProjectChartTabs from '../lib/Timeline'
import WorkforceChart from '../components/WorkforceChart/WorkforceChart'
import './TimelineView.css'

const TimelineView = () => {
  return (
    <Tabs
      defaultActiveKey={PROJECT_CHARTS.MILESTONE}
      animated={false}
      destroyInactiveTabPane={true}
      className="mb-24">
      <Tabs.TabPane
        tab={PROJECT_CHARTS.MILESTONE}
        key={PROJECT_CHARTS.MILESTONE}>
        <ProjectChartTabs projectId="123456" />
        <ProjectChartTabs projectStart="2023-05-17" />
        <ProjectChartTabs projectEnd="2026-05-17" />
      </Tabs.TabPane>
      <Tabs.TabPane tab={PROJECT_CHARTS.WORKLOAD} key={PROJECT_CHARTS.WORKLOAD}>
        <WorkforceChart />
      </Tabs.TabPane>
    </Tabs>
  )
}

export default TimelineView
