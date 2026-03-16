import { Button, Dropdown, Icon, Menu, Modal, Select, Tooltip } from 'antd'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { statusBusinessPlanDetail } from '../constant'
import { useBusinessPlanDetails } from '../../hooks'
import { withRouter } from 'react-router'
import { checkRolePermission } from '../../../../components/common/checkRolePermission'
import {
  ActivityKeyConstants,
  SourceConstants,
} from '../../../constants/ActivityKeyConstants'
import { ResponseStatusCode } from '../../../service/constant'
import { useDispatch, useSelector } from 'react-redux'
import {
  setErrorDataSubmitDeliveryPlan,
  setIsSaveConfirmShowed,
  setIsSaveShowedDeliveryPlan,
} from '../../redux'
import { NotificationManager } from 'react-notifications'
import { getMissingFieldsArray } from '../BusinessPlanDelivery/utils'

const StyledSelect = styled(Select)`
  .ant-select-selection {
    background-color: var(--light-blue);
    width: 120px;
  }
`

function BusinessPlanVersion({
  onSubmit,
  onBaselineRevenuePlan,
  onBaselineDeliveryPlan,
  loadingSubmit,
  onCreateNewVersion,
  history,
  match,
  onExport,
  loadingExport,
}) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [changeVersionModalVisible, setChangeVersionModalVisible] =
    useState(false)
  const [submitModalVisible, setSubmitModalVisible] = useState(false)
  const [nextId, setNextId] = useState()
  const {
    saveDraft,
    versionId,
    listVersions,
    generalInformationParams,
    originalBusinessPlanItems,
    columns: columnLabels,
    warningMessage,
    errorMessage,
  } = useBusinessPlanDetails()

  const { listAM, generalInfos } = useSelector(state => state.businessGeneralInformation)

  // Mock user for demo
  const userPOA = JSON.parse(localStorage.getItem('userPOA')) || {
    userName: 'Demo User',
    userId: 1,
  }
  const { userName } = userPOA

  const isAMSubmit =
    listAM &&
    listAM.map(item => item.ldap) &&
    listAM.map(item => item.ldap).includes(userName)

  const isDraft = generalInfos.length > 0 && generalInfos.every(item => item.status === statusBusinessPlanDetail.draft)
  const isApproved = generalInfos.length > 0 && generalInfos.every(item => item.status === statusBusinessPlanDetail.approved)
  const isLatest = listVersions[listVersions.length - 1]
    ? listVersions[listVersions.length - 1].versionId === versionId
    : null

  const { listDuRevenue } = useSelector(state => state.businessPlanRevenue)
  const { listDUDelivery } = useSelector(state => state.businessPlanDelivery)

  const isSaveShowedRevenue = useSelector(
    state => state.businessPlanRevenue.isSaveConfirmShowed
  )

  const isSaveShowedDelivery = useSelector(
    state => state.businessPlanDelivery.isSaveShowedDeliveryPlan
  )

  const isExport = checkRolePermission(
    SourceConstants.BUSINESS_PLAN_LIST,
    ActivityKeyConstants.EXPORT_BUSINESS_PLAN
  )

  const isCreateNewVersion = checkRolePermission(
    SourceConstants.BUSINESS_PLAN_DETAIL,
    ActivityKeyConstants.CREATE_NEW_VERSION
  )

  const isSubmit = checkRolePermission(
    SourceConstants.BUSINESS_PLAN_DETAIL,
    ActivityKeyConstants.SUBMIT_BUSINESS_PLAN
  )

  const updateIsSaveShowedRevenue = useCallback(
    value => {
      return dispatch(setIsSaveConfirmShowed(value))
    },
    [dispatch]
  )

  const updateIsSaveShowedDelivery = useCallback(
    value => {
      return dispatch(setIsSaveShowedDeliveryPlan(value))
    },
    [dispatch]
  )

  const onChangeVersion = async id => {
    if (isDraft) {
      setChangeVersionModalVisible(true)
      setNextId(id)
    } else {
      history.push(`/delivery/business-plan-list/${id}/business-plan-detail`)
    }
  }

  const renderTooltipButton = errorMessage => {
    if (!errorMessage) return ''
    if (Array.isArray(errorMessage) && errorMessage) {
      return errorMessage.join(',')
    } else {
      return errorMessage
    }
  }

  const onOk = async () => {
    const params = {
      businessPlanVersionId: parseInt(match.params.buId),
      generalInformation: generalInformationParams,
      sectionList: originalBusinessPlanItems,
      columnLabels,
    }
    const res = await saveDraft(params)
    setChangeVersionModalVisible(false)
    if (res) {
      history.push(
        `/delivery/business-plan-list/${nextId}/business-plan-detail`
      )
    }
  }

  const onCancel = () => {
    setChangeVersionModalVisible(false)
    isSaveShowedRevenue === true && updateIsSaveShowedRevenue(false)
    isSaveShowedDelivery === true && updateIsSaveShowedDelivery(false)
    history.push(`/delivery/business-plan-list/${nextId}/business-plan-detail`)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const resultRevenue = await onBaselineRevenuePlan()
      const resultBaselineDeliveryPlan = await onBaselineDeliveryPlan()

      if (
        resultBaselineDeliveryPlan.payload.status ===
        ResponseStatusCode.forceExpired
      ) {
        const { data, message } = resultBaselineDeliveryPlan.payload
        dispatch(setErrorDataSubmitDeliveryPlan({ data, message }))
        const missingFieldsArr = getMissingFieldsArray(data)
        NotificationManager.error(
          <div>
            <p>{message}</p>
            <ul>
              {missingFieldsArr.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        )
      }

      if (
        resultRevenue.payload.data.httpStatus === ResponseStatusCode.success &&
        resultBaselineDeliveryPlan.payload.status === ResponseStatusCode.success
      ) {
        await onSubmit()
      }
    } finally {
      setLoading(false)
      setSubmitModalVisible(false)
    }
  }

  function handleMenuClick(e) {
    if (e.key === '1') {
      window.open(`/export-general-info/${match.params.buId}`)
    } else {
      window.open(`/export-business-plan-detail/${match.params.buId}`)
    }
  }

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">General Information</Menu.Item>
      <Menu.Item key="2">Business Plan Detail</Menu.Item>
    </Menu>
  )

  return (
    <div>
      <div
        className="flex-items-center"
        style={{ justifyContent: 'space-between' }}>
        <div className="flex-items-center gap-8">
          <Icon type="file-text" />
          <StyledSelect onChange={onChangeVersion} value={versionId}>
            {listVersions.map(item => (
              <Select.Option value={item.versionId} key={item.versionId}>
                {item.versionName}
              </Select.Option>
            ))}
          </StyledSelect>
        </div>
        <div>
          {isExport && (
            <Dropdown overlay={menu} className="mr-10" trigger={['click']}>
              <Button>
                Export <Icon type="down" />
              </Button>
            </Dropdown>
          )}
          {isDraft && (isAMSubmit || isSubmit) && (
            <Tooltip title={renderTooltipButton(errorMessage)}>
              <Button
                type="primary"
                onClick={() => setSubmitModalVisible(true)}
                disabled={errorMessage}
                loading={loadingSubmit}>
                Submit
              </Button>
            </Tooltip>
          )}
          {isApproved && isLatest && isCreateNewVersion && (
            <Button
              type="primary"
              onClick={onCreateNewVersion}
              loading={loadingSubmit}>
              Create new version
            </Button>
          )}
        </div>
        <Modal
          title="Warning"
          visible={changeVersionModalVisible}
          onCancel={() => setChangeVersionModalVisible(false)}
          footer={null}>
          <div>
            Change version may cause your data to be lost, do you want to save
            them ?
          </div>
          <div className="text-right mt-3">
            <Button className="mr-3" type="primary" ghost onClick={onCancel}>
              No
            </Button>
            <Button type="primary" onClick={onOk}>
              Yes
            </Button>
          </div>
        </Modal>
        <Modal
          title="Confirmation"
          visible={submitModalVisible}
          onCancel={() => setSubmitModalVisible(false)}
          footer={null}>
          <div>Are you sure you want to submit ?</div>
          <div className="text-right mt-3">
            <Button
              className="mr-3"
              type="primary"
              ghost
              onClick={() => setSubmitModalVisible(false)}>
              No
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              Yes
            </Button>
          </div>
        </Modal>
      </div>
      {warningMessage && <div className="error mt-2">{warningMessage}</div>}
    </div>
  )
}

export default withRouter(BusinessPlanVersion)
