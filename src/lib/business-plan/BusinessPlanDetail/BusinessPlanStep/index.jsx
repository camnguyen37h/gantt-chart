import Tag from '../../../../components/common/Tag'
import { DateFormat } from '../../../constants/DateFormat'
import { Form, Icon, Input, Modal } from 'antd'
import moment from 'moment'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { STATUS_COLOR_DETAIL } from '../../constants'
import { useBusinessPlanDetails, useBusinessPlanStep } from '../../hooks'
import { statusBusinessPlanDetail } from '../constant'

import WorkflowApproval from '../../../../components/workflow-approval/WorkflowApproval'
import { useDispatch } from 'react-redux'
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

function BusinessPlanStep({ status, match, projectCode, startDate, endDate }) {
  const [showed, setShowed] = useState(true)
  const commentRef = useRef()
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectPerson, setRejectPerson] = useState()
  const [rejectLoading, setRejectLoading] = useState(false)
  const dispatch = useDispatch()

  const { approveRejectWO, getBusinessPlanWorkflow, listWorkOrder, listStep } =
    useBusinessPlanStep()

  const { userName } = JSON.parse(localStorage.getItem('userPOA'))

  const { getBusinessPlanDetail } = useBusinessPlanDetails()

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
      <div
        style={{ cursor: 'pointer' }}
        className="flex-items-center gap-8"
        onClick={() => setShowed(!showed)}>
        <Icon
          type="right"
          style={{ fontSize: 12, color: 'rgba(0,0,0,0.85)' }}
          rotate={!showed ? 0 : 90}
        />
        <h5 className="font-weight-600 mb-0" style={{ fontSize: 18 }}>
          {projectCode}
        </h5>
        <Tag {...STATUS_COLOR_DETAIL[status && status.toUpperCase()]}>
          {status}
        </Tag>
        <div>{`From ${
          (startDate &&
            moment(startDate).format(DateFormat.DATE_FORWARD_SLASH)) ||
          ''
        } to ${
          (endDate && moment(endDate).format(DateFormat.DATE_FORWARD_SLASH)) ||
          ''
        }`}</div>
      </div>
      {listStep.length > 0 && (
        <WorkflowApproval
          listStep={listStep}
          listDU={listWorkOrder}
          enableActions={enableActions}
          hideApproverList={!showed}
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
