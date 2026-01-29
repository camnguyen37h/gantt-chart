import ProjectChartTabs from '../lib/Timeline'
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
