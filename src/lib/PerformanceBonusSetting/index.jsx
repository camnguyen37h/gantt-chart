import { Collapse } from 'antd'
import { PERFORMANCE_BONUS_SETTING_KEYS } from './constant'
import PerformanceScoreSettingContainer from './performance-score-setting/PerformanceScoreSettingContainer'
import './style.css'

const { Panel } = Collapse

function PerformanceBonusSetting() {
  return (
    <div className="main-content-pr">
      <Collapse
        bordered={false}
        activeKey={[
          PERFORMANCE_BONUS_SETTING_KEYS.PERFORMANCE_SCORE_SETTING,
        ]}>
        <Panel
          key={PERFORMANCE_BONUS_SETTING_KEYS.PERFORMANCE_SCORE_SETTING}
          header="Score Setting"
          style={{ borderBottom: 'none' }}
          collapsible="disabled">
          <PerformanceScoreSettingContainer />
        </Panel>
      </Collapse>
    </div>
  )
}

export default PerformanceBonusSetting
