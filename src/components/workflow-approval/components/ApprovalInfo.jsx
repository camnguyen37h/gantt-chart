import { DateFormat } from '../../../lib/constants/DateFormat'
import { Icon, Popover } from 'antd'
import moment from 'moment'

function ApprovalInfo({
  approver,
  renderColor,
  renderInfo,
  renderDate,
  renderTime,
}) {
  const { processStatus, updatedOn } = approver

  const content = (
    <div>
      <div className="flex-start gap-8">
        <Icon type="edit" />
        <div>
          <span style={{ fontWeight: 'bold', marginRight: 8 }}>Status:</span>
          <span style={{ color: `${renderColor(approver.processStatus)}` }}>
            {renderInfo(processStatus)}
          </span>
        </div>
      </div>
      <div className="flex-start gap-8">
        <Icon type="clock-circle" />
        <div>
          <span style={{ fontWeight: 'bold', marginRight: 8 }}>Time:</span>
          {renderTime(processStatus, updatedOn)}
        </div>
      </div>
      <div className="flex-start gap-8">
        <Icon type="calendar" />
        <div>
          <span style={{ fontWeight: 'bold', marginRight: 8 }}>Date:</span>
          {renderDate(processStatus, updatedOn)}
        </div>
      </div>
    </div>
  )

  return (
    <Popover content={content}>
      <Icon type="info-circle" />
    </Popover>
  )
}

export default ApprovalInfo
