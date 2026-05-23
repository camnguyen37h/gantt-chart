import UserSolidSVG from '../../common/icons/UserSolid'
import { Icon } from 'antd'
import {
  SPECIFIC_PERMISSIONS,
  STATUS_COLOR_ICON,
  STATUS_INFO,
} from '../constants'
import useWorkflowApproval from '../hooks/useWorkflowApproval'
import ApprovalInfo from './ApprovalInfo'
import { DateFormat } from '../../../lib/constants/DateFormat'
import moment from 'moment'

const ApprovalItem = ({
  approver,
  enableActions,
  onClickAssign,
  onClickApprove,
  onClickReject,
}) => {
  const { specificPermissions } = useWorkflowApproval()
  // Mock user for demo
  const userPOA = JSON.parse(localStorage.getItem('userPOA')) || {
    userName: 'Demo User',
    userId: 1,
  }
  const { userName } = userPOA

  const canApprove =
    approver.processStatus === 'TODO' &&
    (userName.includes(approver.ldap) ||
      specificPermissions.includes(SPECIFIC_PERMISSIONS.APPROVE_REJECT))
  const canReject =
    approver.processStatus.match(/TODO|APPROVED/) &&
    (userName.includes(approver.ldap) ||
      specificPermissions.includes(SPECIFIC_PERMISSIONS.APPROVE_REJECT))
  const canAssign =
    approver.processStatus === 'TODO' &&
    (userName.includes(approver.ldap) ||
      specificPermissions.includes(SPECIFIC_PERMISSIONS.ASSIGN))

  const actionsCount = [canApprove, canAssign, canReject].filter(Boolean).length

  const getActions = approver => [
    canApprove ? (
      <Icon
        type="check-circle"
        style={{
          color: 'var(--success-green)',
          fontSize: 16,
          cursor: 'pointer',
        }}
        onClick={() => onClickApprove(approver)}
      />
    ) : null,
    canReject ? (
      <Icon
        type="close-circle"
        style={{ color: '#FF5252', fontSize: 16, cursor: 'pointer' }}
        onClick={() => onClickReject(approver)}
      />
    ) : null,
    canAssign ? (
      <Icon
        type="edit"
        style={{ fontSize: 16, cursor: 'pointer' }}
        onClick={() => onClickAssign(approver)}
      />
    ) : null,
  ]

  const renderColor = status => {
    let color

    switch (status) {
      case 'APPROVED':
        color = STATUS_COLOR_ICON.APPROVED.color
        break
      case 'REJECTED':
        color = STATUS_COLOR_ICON.REJECTED.color
        break
      case 'TODO':
        color = STATUS_COLOR_ICON.TODO.color
        break
      default:
        color = STATUS_COLOR_ICON.WAIT.color
        break
    }
    return color
  }

  const renderInfo = status => {
    let text

    switch (status) {
      case 'APPROVED':
        text = STATUS_INFO.APPROVED.text
        break
      case 'REJECTED':
        text = STATUS_INFO.REJECTED.text
        break
      case 'TODO':
        text = STATUS_INFO.TODO.text
        break
      case 'DELETED':
        text = STATUS_INFO.DELETED.text
        break
      default:
        text = STATUS_INFO.WAIT.text
        break
    }
    return text
  }

  const renderTime = (status, updatedOn) => {
    let time

    switch (status) {
      case 'APPROVED':
      case 'REJECTED':
        time = moment(updatedOn).format(DateFormat.HH_MM_A)
        break
      default:
        time = ''
        break
    }
    return time
  }

  const renderDate = (status, updatedOn) => {
    let date

    switch (status) {
      case 'APPROVED':
      case 'REJECTED':
        date = moment(updatedOn).format(DateFormat.DATE_FORWARD_SLASH)
        break
      default:
        date = ''
        break
    }
    return date
  }

  return (
    <div
      className={`flex-items-center gap-8 grid-item ${
        enableActions && actionsCount > 0
          ? `actions-${actionsCount}`
          : 'no-action'
      }`}>
      <Icon
        component={UserSolidSVG}
        style={{ color: `${renderColor(approver.processStatus)}` }}
      />
      <div style={{ width: 85 }}>{approver.ldap}</div>
      <div>
        <ApprovalInfo
          approver={approver}
          renderColor={renderColor}
          renderInfo={renderInfo}
          renderTime={renderTime}
          renderDate={renderDate}
        />
      </div>
      {enableActions && getActions(approver)}
    </div>
  )
}

export default ApprovalItem
