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
  const [showVersions, setShowVersions] = useState(true)
  const commentRef = useRef()
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectPerson, setRejectPerson] = useState()
  const [rejectLoading, setRejectLoading] = useState(false)
  const dispatch = useDispatch()

  // Mock versions data - will be replaced with real data later
  const mockVersions = [
    {
      id: 437,
      projectCode: 'GLBOD2500047',
      status: 'Draft',
      startDate: 1735664400000, // 01/01/2025
      endDate: 1735750800000, // 01/01/2027
      checked: false
    }
  ]

  const { approveRejectWO, getBusinessPlanWorkflow, listWorkOrder, listStep } =
    useBusinessPlanStep()

  // Mock user for demo
  const userPOA = JSON.parse(localStorage.getItem('userPOA')) || { userName: 'Demo User', userId: 1 }
  const { userName } = userPOA

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
        onClick={() => setShowVersions(!showVersions)}>
        <Icon
          type="right"
          style={{ fontSize: 12, color: 'rgba(0,0,0,0.85)' }}
          rotate={!showVersions ? 0 : 90}
        />
        <h5 className="font-weight-600 mb-0" style={{ fontSize: 18, marginBottom: 0 }}>
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

      {/* Versions List */}
      {showVersions && mockVersions.length > 0 && (
        <div style={{ marginLeft: 0, marginTop: 4 }}>
          {mockVersions.map((version, index) => (
            <div
              key={version.id}
              className="flex-items-center gap-8"
              style={{ 
                paddingLeft: 72,
                paddingTop: 8,
                paddingBottom: 8,
                position: 'relative'
              }}>
              {/* L-shaped connector */}
              <div style={{
                position: 'absolute',
                left: 44,
                top: 0,
                width: 20,
                height: 'calc(50% + 2px)',
                borderLeft: '2px solid #d9d9d9',
                borderBottom: '2px solid #d9d9d9',
                borderBottomLeftRadius: 4
              }} />
              
              <span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(0,0,0,0.85)' }}>
                {version.projectCode}
              </span>
              
              <Tag {...STATUS_COLOR_DETAIL[version.status && version.status.toUpperCase()]}>
                {version.status}
              </Tag>
              
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)' }}>
                {`From ${
                  (version.startDate &&
                    moment(version.startDate).format(DateFormat.DATE_FORWARD_SLASH)) ||
                  ''
                } to ${
                  (version.endDate && 
                    moment(version.endDate).format(DateFormat.DATE_FORWARD_SLASH)) ||
                  ''
                }`}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Workflow Section - separate toggle */}
      <div
        style={{ cursor: 'pointer', marginTop: 16 }}
        className="flex-items-center gap-8"
        onClick={() => setShowed(!showed)}>
        <Icon
          type="right"
          style={{ fontSize: 12, color: 'rgba(0,0,0,0.85)' }}
          rotate={!showed ? 0 : 90}
        />
        <span style={{ fontSize: 14, fontWeight: 500 }}>Workflow Approval</span>
      </div>

      {showed && listStep.length > 0 && (
        <WorkflowApproval
          listStep={listStep}
          listDU={listWorkOrder}
          enableActions={enableActions}
          hideApproverList={false}
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
