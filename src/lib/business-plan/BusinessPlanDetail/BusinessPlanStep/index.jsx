import Tag from '../../../../components/common/Tag'
import { DateFormat } from '../../../constants/DateFormat'
import { Form, Icon, Input, Modal } from 'antd'
import moment from 'moment'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { STATUS_COLOR_DETAIL } from '../../constants'
import { useBusinessPlanDetails, useBusinessPlanStep } from '../../hooks'
import { statusBusinessPlanDetail } from '../constant'
import styled from 'styled-components'

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

// Wrapper for smooth collapse animation
const VersionRowWrapper = styled.div`
  display: grid;
  grid-template-rows: ${props => props.isVisible ? '1fr' : '0fr'};
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  /* Use CSS order for sorting */
  order: ${props => props.isActive ? -1 : 0};
`;

// Styled component for version row with connector
const VersionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  position: relative;
  min-height: 0;
  
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.isVisible ? 1 : 0};

  ${props => props.isActive ? `
    cursor: pointer;
    padding-left: 0;
  ` : `
    padding-left: 72px;

    &::before {
      content: '';
      position: absolute;
      left: 44px;
      top: 0;
      width: 20px;
      height: calc(50% + 2px);
      border-left: 2px solid #d9d9d9;
      border-bottom: 2px solid #d9d9d9;
      border-bottom-left-radius: 4px;
    }
  `}
`;

function BusinessPlanStep({ status, match, projectCode, startDate, endDate }) {
  const [showVersions, setShowVersions] = useState(true)
  const commentRef = useRef()
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectPerson, setRejectPerson] = useState()
  const [rejectLoading, setRejectLoading] = useState(false)
  const dispatch = useDispatch()

  // Get generalInfos from Redux
  const { generalInfos = [] } = useSelector(
    state => state.businessGeneralInformation
  )
  const { listVersions = [] } = useSelector(
    state => state.businessPlanDetails
  )

  const businessPlanId = match.params.buId

  const { approveRejectWO, getBusinessPlanWorkflow, listWorkOrder, listStep } =
    useBusinessPlanStep()

  // Mock user for demo
  const userPOA = JSON.parse(localStorage.getItem('userPOA')) || { userName: 'Demo User', userId: 1 }
  const { userName } = userPOA

  const { getBusinessPlanDetail } = useBusinessPlanDetails()

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
      {/* Versions List - Order controlled by CSS order property in VersionRowWrapper */}
      {generalInfos.length > 0 && (
        <div style={{ marginLeft: 0, marginTop: 4, display: 'flex', flexDirection: 'column' }}>
          {generalInfos.map((info) => {
            const isActive = info.id === Number(businessPlanId)
            const isVisible = isActive || showVersions
            
            // Find matching version to get status
            const matchingVersion = listVersions?.find(v => v.versionId === info.id)
            const versionStatus = matchingVersion?.statusName || 'Draft'
            
            return (
              <VersionRowWrapper
                key={info.id}
                isActive={isActive}
                isVisible={isVisible}>
                <VersionRow
                  isActive={isActive}
                  isVisible={isVisible}
                  onClick={isActive ? () => setShowVersions(!showVersions) : undefined}>
                  {isActive && (
                    <Icon
                      type="right"
                      style={{ fontSize: 12, color: 'rgba(0,0,0,0.85)', transition: 'transform 0.3s' }}
                      rotate={!showVersions ? 0 : 90}
                    />
                  )}
                  
                  {isActive ? (
                    <h5 className="font-weight-600 mb-0" style={{ fontSize: 18, marginBottom: 0 }}>
                      {info.projectCode}
                    </h5>
                  ) : (
                    <span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(0,0,0,0.85)' }}>
                      {info.projectCode}
                    </span>
                  )}
                
                <Tag {...STATUS_COLOR_DETAIL[versionStatus && versionStatus.toUpperCase()]}>
                  {versionStatus}
                </Tag>
                
                {info.mvvLocationType && (
                  <span style={{ 
                    fontSize: 13, 
                    fontWeight: 500, 
                    color: '#1890ff',
                    padding: '2px 8px',
                    background: '#e6f7ff',
                    borderRadius: 2,
                    border: '1px solid #91d5ff'
                  }}>
                    {info.mvvLocationType}
                  </span>
                )}
                
                <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)' }}>{`From ${
                  (info.startDate &&
                    moment(info.startDate).format(DateFormat.DATE_FORWARD_SLASH)) ||
                  ''
                } to ${
                  (info.endDate && 
                    moment(info.endDate).format(DateFormat.DATE_FORWARD_SLASH)) ||
                  ''
                }`}</div>
              </VersionRow>
            </VersionRowWrapper>
          )})
          }
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
