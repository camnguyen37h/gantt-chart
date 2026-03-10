import Tag from '../../../../components/common/Tag'
import { DateFormat } from '../../../constants/DateFormat'
import { Form, Icon, Input, Modal } from 'antd'
import moment from 'moment'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { STATUS_COLOR_DETAIL, STATUS_COLOR_PROJECT_TYPE } from '../../constants'
import { useBusinessPlanDetails, useBusinessPlanStep } from '../../hooks'
import { statusBusinessPlanDetail } from '../constant'
import { VersionRowWrapper, VersionRow } from './index.styled'
import WorkflowApproval from '../../../../components/workflow-approval/WorkflowApproval'
import { useDispatch, useSelector } from 'react-redux'
import {
  getBusinessPlanDetailComment,
  postBusinessPlanComment,
} from '../../redux'
import { MODULE_COMMENT_TYPE } from '../../../constants/CommentConstant'

const CommentForm = Form.create()(
  forwardRef(({ form }, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }))
    return (
      <Form>
        <Form.Item
          label="Please comment before rejecting"
          key="comment"
          required>
          {form.getFieldDecorator('comment', {
            rules: [{ required: true, message: 'Please input required field' }],
          })(<Input.TextArea />)}
        </Form.Item>
      </Form>
    )
  })
)

function BusinessPlanStep({ match, projectCode, status, startDate, endDate }) {
  const [showVersions, setShowVersions] = useState(true)
  const commentRef = useRef()
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectPerson, setRejectPerson] = useState()
  const [rejectLoading, setRejectLoading] = useState(false)
  const dispatch = useDispatch()

  const { approveRejectWO, getBusinessPlanWorkflow, listWorkOrder, listStep } =
    useBusinessPlanStep()

  const userPOA = JSON.parse(localStorage.getItem('userPOA')) || {
    userName: 'Demo User',
    userId: 1,
  }
  const { userName } = userPOA

  const { getBusinessPlanDetail } = useBusinessPlanDetails()
  const { generalInfos = [] } = useSelector(
    state => state.businessGeneralInformation
  )

  const businessPlanId = match.params.buId

  const handleAssign = async params => {
    const { ldap, departmentName, stepName, taskKey } = params || {}
    await approveRejectWO({
      ldap,
      department: departmentName,
      stepName,
      referenceId: businessPlanId,
      action: 'REASSIGN',
      taskKey,
    })
    await getBusinessPlanWorkflow({
      referenceId: businessPlanId,
      mvv: projectCode,
    })
    await getBusinessPlanDetail(businessPlanId)
  }

  const handleApprove = async params => {
    const { ldap, departmentName, stepName, taskKey } = params || {}
    await approveRejectWO({
      ldap: userName,
      department: departmentName,
      stepName,
      referenceId: businessPlanId,
      action: 'APPROVED',
      taskKey,
    })
    await getBusinessPlanWorkflow({
      referenceId: businessPlanId,
      mvv: projectCode,
    })
    await getBusinessPlanDetail(businessPlanId)
  }

  const handleReject = async () => {
    try {
      setRejectLoading(true)
      const res = await commentRef.current.form.validateFields()
      const { ldap, departmentName, stepName } = rejectPerson || {}
      await dispatch(
        postBusinessPlanComment({
          referenceId: businessPlanId,
          commentContent: res.comment,
          moduleTypeEnum: MODULE_COMMENT_TYPE.BUSINESS_PLAN_DETAIL,
        })
      )

      await dispatch(
        getBusinessPlanDetailComment({
          referenceId: businessPlanId,
          module: MODULE_COMMENT_TYPE.BUSINESS_PLAN_DETAIL,
        })
      )
      await approveRejectWO({
        ldap: userName,
        department: departmentName,
        stepName,
        referenceId: businessPlanId,
        action: 'REJECTED',
        taskKey: rejectPerson.taskKey,
      })
      setRejectModalVisible(false)
    } catch (e) {
      console.log(e)
    } finally {
      setRejectLoading(false)
      await getBusinessPlanWorkflow({
        referenceId: businessPlanId,
        mvv: projectCode,
      })
      await getBusinessPlanDetail(businessPlanId)
    }
  }

  const enableActions =
    status !== statusBusinessPlanDetail.draft &&
    status !== statusBusinessPlanDetail.approved

  const onClickReject = person => {
    setRejectPerson(person)
    setRejectModalVisible(true)
  }

  return (
    <div style={{ padding: '12px 16px' }}>
      {generalInfos.length > 0 && (
        <div
          style={{
            marginLeft: 0,
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
          }}>
          {generalInfos.map(info => {
            const isActive = info.id === Number(businessPlanId)
            const isVisible = isActive || showVersions
            const versionStatus = info.status || 'Draft'

            return (
              <VersionRowWrapper
                key={info.id}
                isActive={isActive}
                isVisible={isVisible}>
                <VersionRow
                  isActive={isActive}
                  isVisible={isVisible}
                  onClick={
                    isActive ? () => setShowVersions(!showVersions) : undefined
                  }>
                  {isActive && (
                    <Icon
                      type="right"
                      style={{
                        fontSize: 12,
                        color: 'rgba(0,0,0,0.85)',
                        transition: 'transform 0.3s',
                      }}
                      rotate={!showVersions ? 0 : 90}
                    />
                  )}

                  <h5
                    className="font-weight-600 mb-0"
                    style={{ fontSize: 16, marginBottom: 0 }}>
                    {info.projectCode}
                  </h5>

                  <Tag>{info.versionName}</Tag>

                  <Tag {...STATUS_COLOR_DETAIL[versionStatus.toUpperCase()]}>
                    {versionStatus}
                  </Tag>

                  {info.mvvLocationType && (
                    <Tag {...STATUS_COLOR_PROJECT_TYPE[info.mvvLocationType]}>
                      {info.mvvLocationType}
                    </Tag>
                  )}

                  <div
                    style={{
                      fontSize: 14,
                      color: 'rgba(0,0,0,0.65)',
                    }}>{`From ${
                    (info.startDate &&
                      moment(info.startDate).format(
                        DateFormat.DATE_FORWARD_SLASH
                      )) ||
                    ''
                  } to ${
                    (info.endDate &&
                      moment(info.endDate).format(
                        DateFormat.DATE_FORWARD_SLASH
                      )) ||
                    ''
                  }`}</div>
                </VersionRow>
              </VersionRowWrapper>
            )
          })}
        </div>
      )}

      {listStep.length > 0 && (
        <WorkflowApproval
          listStep={listStep}
          listDU={listWorkOrder}
          enableActions={enableActions}
          hideApproverList={!showVersions}
          onReject={handleReject}
          onApprove={handleApprove}
          onAssign={handleAssign}
          onClickReject={onClickReject}
        />
      )}
      <Modal
        destroyOnClose
        visible={rejectModalVisible}
        okButtonProps={{
          type: 'danger',
          loading: rejectLoading,
        }}
        okText={'Reject'}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}>
        <CommentForm wrappedComponentRef={commentRef} />
      </Modal>
    </div>
  )
}

export default withRouter(BusinessPlanStep)
