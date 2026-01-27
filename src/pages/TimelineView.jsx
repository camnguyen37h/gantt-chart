import { Tabs } from 'antd'
import { PROJECT_CHARTS } from '../lib/Timeline/constants'
import ProjectChartTabs from '../lib/Timeline'
import WorkforceChart from '../components/WorkforceChart/WorkforceChart'
import './TimelineView.css'

const TimelineView = () => {
  return (
    <ProjectChartTabs
      projectId="123456"
      projectStart="2023-05-17"
      projectEnd="2026-05-17"
    />
  )
}

export default TimelineView
