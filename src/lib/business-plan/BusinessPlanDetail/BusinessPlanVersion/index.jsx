import { Button, Dropdown, Icon, Menu, Modal, Select, Tooltip } from 'antd'
import React, { useCallback, useState } from 'react'
import { cloneDeep } from 'lodash'
import styled from 'styled-components'
import { statusBusinessPlanDetail } from '../constant'
import { useBusinessPlanDetails, useBusinessPlanPermission } from '../../hooks'
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
import { canSubmit } from '../../permissions/viewPermissions'
import BUSINESS_PLAN_API from '../../../service/api/businessPlan'
import Request from '../../../service/request'

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
    isSaveShowed,
    generalInformationParams,
    originalBusinessPlanItems,
    columns: columnLabels,
    warningMessage,
    errorMessage,
  } = useBusinessPlanDetails()

  const { generalInfos, listGeneralInformation, mvvLocationTypeIdMap } =
    useSelector(state => state.businessGeneralInformation)

  const currentViewMode = useSelector(
    state => state.businessPlanDetails.viewMode
  )
  const businessPlanVersionId =
    +mvvLocationTypeIdMap[currentViewMode] || parseInt(match.params.buId)

  const { userName } = JSON.parse(localStorage.getItem('userPOA'))

  const buId = Number(match.params.buId)
  const currentMVVInfo = generalInfos.find(function (info) {
    return info.id === buId
  })
  const currentListAM = (currentMVVInfo && currentMVVInfo.listAM) || []
  const isAMSubmit = currentListAM.some(function (item) {
    return item.ldap === userName
  })

  const isDraft =
    (generalInfos.length > 0 &&
      generalInfos.every(
        item => item.status === statusBusinessPlanDetail.draft
      )) ||
    ''
  const isApproved =
    (generalInfos.length > 0 &&
      generalInfos.every(
        item => item.status === statusBusinessPlanDetail.approved
      )) ||
    ''
  const isLatest = listVersions[listVersions.length - 1]
    ? listVersions[listVersions.length - 1].versionId === versionId
    : null

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

  const isSubmit = checkRolePermission(
    SourceConstants.BUSINESS_PLAN_DETAIL,
    ActivityKeyConstants.SUBMIT_BUSINESS_PLAN
  )

  const { userRoles } = useBusinessPlanPermission()
  const generalInfoIdSet = new Set(Object.values(mvvLocationTypeIdMap))
  const hasLinkedMvvMissing = generalInfos.some(
    info => info.mvvLinkedId != null && !generalInfoIdSet.has(info.mvvLinkedId)
  )
  const canSubmitBP =
    isSubmit ||
    (Object.keys(mvvLocationTypeIdMap).length === 1
      ? isAMSubmit
      : canSubmit(userRoles))

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
      const checkUserRoleNextVersion = await Request(
        BUSINESS_PLAN_API.getUserRoleBusinessPlan(id)
      )
      if (checkUserRoleNextVersion.status === ResponseStatusCode.success) {
        window.location.href = `/delivery/business-plan-list/${id}/business-plan-detail`
      } else {
        NotificationManager.error(checkUserRoleNextVersion.message)
      }
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
    const params = {}

    if (isSaveShowed.generalInformation && listGeneralInformation) {
      params.generalInformation = {
        ...generalInformationParams,
        businessPlanVersionId: listGeneralInformation.id || undefined,
        projectCode: listGeneralInformation.projectCode || undefined,
      }
    }

    if (
      isSaveShowed.businessPlan &&
      businessPlanVersionId &&
      (currentViewMode === 'Onsite' || currentViewMode === 'Offshore')
    ) {
      const projectCode = (
        generalInfos.find(item => +item.id === businessPlanVersionId) || {}
      ).projectCode
      const sectionList = cloneDeep(originalBusinessPlanItems)
      sectionList.forEach(section => {
        section.rowLabels = section.rowLabels.filter(
          row =>
            row.label ||
            row.cellList.some(item => item.editable && item.value !== null)
        )
        section.rowLabels.forEach(row => {
          row.cellList = row.cellList.map(cell => {
            if (!cell.compareKey) return cell
            const c = Object.assign({}, cell)
            delete c.compareKey
            return c
          })
        })
      })
      const cleanColumnLabels = columnLabels.map(col => {
        if (!col.compareKey) return col
        const c = Object.assign({}, col)
        delete c.compareKey
        return c
      })
      params.businessPlanSectionDTO = {
        columnLabels: cleanColumnLabels,
        sectionList,
        businessPlanVersionId,
        projectCode,
      }
    }

    const res = await saveDraft(params)
    setChangeVersionModalVisible(false)
    if (res) {
      const checkUserRoleNextVersion = await Request(
        BUSINESS_PLAN_API.getUserRoleBusinessPlan(nextId)
      )
      if (checkUserRoleNextVersion.status === ResponseStatusCode.success) {
        window.location.href = `/delivery/business-plan-list/${nextId}/business-plan-detail`
      } else {
        NotificationManager.error(checkUserRoleNextVersion.message)
      }
    }
  }

  const onCancel = async () => {
    setChangeVersionModalVisible(false)
    isSaveShowedRevenue === true && updateIsSaveShowedRevenue(false)
    isSaveShowedDelivery === true && updateIsSaveShowedDelivery(false)
    const checkUserRoleNextVersion = await Request(
      BUSINESS_PLAN_API.getUserRoleBusinessPlan(nextId)
    )
    if (checkUserRoleNextVersion.status === ResponseStatusCode.success) {
      window.location.href = `/delivery/business-plan-list/${nextId}/business-plan-detail`
    } else {
      NotificationManager.error(checkUserRoleNextVersion.message)
    }
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
          {isDraft && canSubmitBP && (
            <Tooltip
              title={renderTooltipButton(
                hasLinkedMvvMissing
                  ? 'Unable to submit. One of your MVV has not been activated. Please activate to proceed.'
                  : errorMessage
              )}>
              <Button
                type="primary"
                onClick={() => setSubmitModalVisible(true)}
                disabled={errorMessage || hasLinkedMvvMissing}
                loading={loadingSubmit}>
                Submit
              </Button>
            </Tooltip>
          )}
          {isApproved && isLatest && canSubmitBP && (
            <Tooltip
              title={renderTooltipButton(
                hasLinkedMvvMissing
                  ? 'Unable to create new version. One of your MVV has not been activated. Please activate to proceed.'
                  : ''
              )}>
              <Button
                type="primary"
                onClick={onCreateNewVersion}
                loading={loadingSubmit}
                disabled={hasLinkedMvvMissing}>
                Create new version
              </Button>
            </Tooltip>
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
