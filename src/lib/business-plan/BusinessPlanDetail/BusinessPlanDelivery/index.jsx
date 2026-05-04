import { checkRolePermission } from '../../../../components/common/checkRolePermission'
import Loading from '../../../../components/common/Loading/Loading'
import { ALL_OPTION, ALL_OPTION_VALUE } from '../../constants'
import useBusinessPlanPermission from '../../hooks/useBusinessPlanPermission'
import useBusinessPlanHistoryService from '../../hooks/useBusinessPlanHistoryService'
import { SCOPE } from '../../permissions/policyMatrix'
import { MASKED_VALUE } from '../../permissions/viewPermissions'
import {
  ActivityKeyConstants,
  SourceConstants,
} from '../../../constants/ActivityKeyConstants'
import { ResponseStatusCode } from '../../../service/constant'
import { formatFloatNumber } from '../../../utils/format-utils/ConvertNumber'
import {
  Button,
  Col,
  Collapse,
  Icon,
  Popconfirm,
  Row,
  Spin,
  Tooltip,
} from 'antd'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { NotificationManager } from 'react-notifications'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import {
  getLocationExchangeRate,
  getOtherExpensesTable,
  getResourcesInformationDeliveryPlan,
  getSummaryDeliveryPlan,
  resetSaveDeliveryPlanParams,
  resetSummaryDeliveryPlan,
  saveDeliveryPlan,
  setDeliveryUnitDataDelivery,
  setDuValueDelivery,
  setErrorDataSubmitDeliveryPlan,
  setIsSaveShowedDeliveryPlan,
  setLoadDataFromValue,
} from '../../redux'
import BusinessPlanDropdownDu from '../BusinessPlanDropdownDu'
import BusinessPlanHistoryTable from '../BusinessPlanRevenue/BusinessPlanHistoryTable'
import { DeliverySummaryTooltip } from '../BusinessPlanRevenue/constant'
import { statusBusinessPlanDetail } from '../constant'
import DeliveryPlanReference from './DeliveryPlanReference'
import OtherExpensesTable from './OtherExpensesTable'
import ResourcesInformation from './ResourcesInformation'
import './style.css'

const { Panel } = Collapse
const DEFAULT_PANELS = ['1']
const customPanelStyle = {
  border: 0,
  overflow: 'hidden',
}

const StyledAffix = styled.div`
  position: fixed;
  bottom: 0;
  background: #ffffff;
  width: calc(100% - 280px);
  transition: transform 1s;
  transform: translateY(100%);
  z-index: 99;
  left: 240px;
  &.active {
    transform: translateY(0);
  }

  .sidebar-collapsed & {
    width: calc(100% - 180px);
    left: 140px;
  }

  .affix-content {
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > span {
      color: var(--primary-blue);
    }
  }
`
const CustomDescription = ({ title, value }) => {
  return (
    <Row>
      <Col span={5} style={{ marginBottom: 4 }}>
        {title}
      </Col>
      <Col span={7}>
        <Row type="flex" align="middle">
          <Col span={4} type="flex" align="middle">
            <Tooltip title={DeliverySummaryTooltip[title]}>
              <Icon
                type="question-circle"
                style={{ cursor: 'pointer', padding: '4px' }}
              />
            </Tooltip>
          </Col>
          <Col span={7}>
            <div style={{ textAlign: 'left' }}>
              {value < 0
                ? `(${formatFloatNumber(Math.abs(value), 0, 3)})`
                : formatFloatNumber(value, 0, 3)}
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

const DeliverySummary = ({ canViewDelivery }) => {
  const { summaryDeliveryPlan, loadingSummaryDeliveryPlan } = useSelector(
    state => state.businessPlanDelivery
  )

  const {
    mmEffort,
    directLaborCost,
    outsourcingCost,
    equipmentExpense,
    onsiteExpense,
    overtime,
    other,
    nonDeductibleInputVAT,
  } = summaryDeliveryPlan

  return (
    <div>
      {loadingSummaryDeliveryPlan ? (
        <Spin spinning={loadingSummaryDeliveryPlan} />
      ) : (
        <div>
          <CustomDescription
            title="MM effort"
            value={canViewDelivery ? mmEffort : MASKED_VALUE}
          />
          <CustomDescription
            title="Direct labor cost"
            value={canViewDelivery ? directLaborCost : MASKED_VALUE}
          />
          <CustomDescription
            title="Outsourcing cost"
            value={canViewDelivery ? outsourcingCost : MASKED_VALUE}
          />
          <CustomDescription
            title="Equipment, Internet, Server cost"
            value={canViewDelivery ? equipmentExpense : MASKED_VALUE}
          />
          <CustomDescription
            title="Onsite expense"
            value={canViewDelivery ? onsiteExpense : MASKED_VALUE}
          />
          <CustomDescription
            title="Overtime"
            value={canViewDelivery ? overtime : MASKED_VALUE}
          />
          <CustomDescription
            title="Non-deductible input VAT"
            value={canViewDelivery ? nonDeductibleInputVAT : MASKED_VALUE}
          />
          <CustomDescription
            title="Other expenses"
            value={canViewDelivery ? other : MASKED_VALUE}
          />
        </div>
      )}
    </div>
  )
}

const BusinessPlanDelivery = forwardRef(
  ({ buId, status, dataDu, mvv, viewMode }, ref) => {
    const dispatch = useDispatch()

    const affixRef = useRef(null)
    const deliveryPlanReferenceRef = useRef(null)
    const deliveryPlanOtherExpensesRef = useRef(null)
    const resourcesInformationRef = useRef(null)

    const deliveryScope =
      viewMode === 'Offshore' ? SCOPE.DELIVERY_OFFSHORE : SCOPE.DELIVERY_ONSITE
    const deliveryPerms = useBusinessPlanPermission(deliveryScope)
    const canViewDelivery = deliveryPerms.canViewScope
    const canEditDelivery = deliveryPerms.canEditScope

    const [visible, setVisible] = useState(false)
    const [activePanelList, setActivePanelList] = useState(DEFAULT_PANELS)
    const isSaveShowed = useSelector(
      state => state.businessPlanDelivery.isSaveShowedDeliveryPlan
    )
    const { fetchUserActionHistory } = useBusinessPlanHistoryService()
    const {
      resourceInfoTableParams,
      dataCreateRequest,
      dataUpdateRequest,
      dataDeleteRequest,
      saveDeliveryPlanLoading,
      deliveryUnitDataDelivery,
      duValueDelivery,
    } = useSelector(state => state.businessPlanDelivery)

    const { activePanel } = useSelector(state => state.businessPlanDetails)

    const updateIsSaveConfirmShowed = useCallback(
      value => {
        return dispatch(setIsSaveShowedDeliveryPlan(value))
      },
      [dispatch]
    )
    const canEditDeliveryPlanAllStatus = checkRolePermission(
      SourceConstants.BUSINESS_PLAN_DETAIL,
      ActivityKeyConstants.EDIT_DELIVERY_PLAN_ALL_STATUS
    )

    const showAllOption = useMemo(() => {
      try {
        const roles = JSON.parse(localStorage.getItem('LoginRole')) || []
        const roleNames = roles.flatMap(r => r.activities || []).map(a => a.name)
        return roleNames.some(
          r => r === 'DB-ADMIN' || r === 'DB-FC' || r === 'DB-FCL' || r === 'DB-BOM'
        )
      } catch {
        return false
      }
    }, [])

    useImperativeHandle(ref, () => ({
      handleSaveDraft,
    }))

    useEffect(() => {
      dispatch(
        getLocationExchangeRate({
          businessPlanVersionId: Number(buId),
          deliveryUnit: '',
        })
      )
    }, [buId])

    const handleCancel = () => {
      setVisible(true)
    }

    const handleDenyCancel = () => {
      setVisible(false)
    }
    const handleConfirmCancel = async () => {
      updateIsSaveConfirmShowed(false)
      handleDenyCancel()
      reloadData()
    }
    const reloadData = async () => {
      if (!deliveryUnitDataDelivery) return
      const businessPlanVersionId = Number(buId)
      const isAllSelected =
        deliveryUnitDataDelivery.groupName === ALL_OPTION_VALUE
      const deliveryUnit = isAllSelected
        ? undefined
        : deliveryUnitDataDelivery.groupName
      const groupId = isAllSelected
        ? ''
        : parseInt(deliveryUnitDataDelivery.groupId)
      if (
        activePanelList.includes('2') &&
        !resourceInfoTableParams.loadDataFromType
      ) {
        dispatch(
          getResourcesInformationDeliveryPlan({
            ...resourceInfoTableParams,
            loadDataFromType: '',
            businessPlanVersionId,
            deliveryUnit,
          })
        )
      }
      if (activePanelList.includes('3')) {
        dispatch(
          getOtherExpensesTable({
            deliveryUnit,
            businessPlanVersionId,
            pageNum: 1,
            pageSize: 10,
          })
        )
      }
      if (activePanelList.includes('4')) {
        dispatch(
          getLocationExchangeRate({
            businessPlanVersionId,
            deliveryUnit: '',
          })
        )
      }
      dispatch(resetSaveDeliveryPlanParams())
      dispatch(setLoadDataFromValue(undefined))
      await dispatch(
        getSummaryDeliveryPlan({
          businessPlanVersionId,
          groupId,
        })
      )
      if (activePanelList.includes('5')) {
        fetchUserActionHistory(
          buId,
          deliveryUnit,
          1,
          10,
          deliveryUnitDataDelivery.groupSale,
          'DELIVERY_PLAN'
        )
      }
    }
    const handleSaveDraft = async () => {
      const isValid = handleValidate()

      if (!isValid) return
      if (!deliveryUnitDataDelivery) return
      if (deliveryUnitDataDelivery.groupName === ALL_OPTION_VALUE) {
        return NotificationManager.error(
          'You cannot operate task because changes at filter all, changes cannot be saved'
        )
      }

      const saveDeliveryPlanParams = {
        businessPlanId: Number(buId),
        groupId: [Number(deliveryUnitDataDelivery.groupId)],
        isSubmit: false,
        viewType: resourceInfoTableParams.viewType,
        loadDataFromType: '',
        dataCreateRequest,
        dataUpdateRequest,
        dataDeleteRequest,
      }

      try {
        const result = await dispatch(saveDeliveryPlan(saveDeliveryPlanParams))
        if (result.payload.status === ResponseStatusCode.success) {
          dispatch(setErrorDataSubmitDeliveryPlan(null))
          return result
        } else return null
      } catch (error) {
        NotificationManager.error(error)
        return null
      } finally {
        setVisible(false)
        updateIsSaveConfirmShowed(false)
        reloadData()
      }
    }

    const handleValidate = useCallback(() => {
      const result = {
        isValidReference:
          !activePanelList.includes('4') ||
          (deliveryPlanReferenceRef.current &&
            deliveryPlanReferenceRef.current.validate()),
        isValidOtherExpenses:
          !activePanelList.includes('3') ||
          (deliveryPlanOtherExpensesRef.current &&
            deliveryPlanOtherExpensesRef.current.validate()),
        isValidHeadCountTable:
          !activePanelList.includes('2') ||
          (resourcesInformationRef.current &&
            resourcesInformationRef.current.validate()),
      }

      const isValid = Object.values(result).every(item => item === true)

      return isValid
    }, [
      deliveryPlanReferenceRef,
      resourcesInformationRef,
      deliveryPlanOtherExpensesRef,
      activePanelList,
    ])

    const initDeliveryWithAll = useCallback(() => {
      dispatch(setDeliveryUnitDataDelivery(ALL_OPTION))
      dispatch(setDuValueDelivery(ALL_OPTION_VALUE))
      dispatch(getSummaryDeliveryPlan({ businessPlanVersionId: Number(buId), groupId: '' }))
    }, [dispatch, buId])

    const initDeliveryWithFirstDu = useCallback(() => {
      const firstDu = dataDu && dataDu[0]
      if (!firstDu) return
      dispatch(setDeliveryUnitDataDelivery(firstDu))
      dispatch(setDuValueDelivery(firstDu.groupId))
      dispatch(getLocationExchangeRate({ businessPlanVersionId: Number(buId), deliveryUnit: firstDu.groupName }))
      dispatch(getSummaryDeliveryPlan({ businessPlanVersionId: Number(buId), groupId: parseInt(firstDu.groupId) }))
    }, [dispatch, buId, dataDu])

    useEffect(() => {
      dispatch(resetSummaryDeliveryPlan())
      if (activePanel !== 'Delivery') return
      if (showAllOption) {
        initDeliveryWithAll()
      } else {
        if (!dataDu || dataDu.length === 0) return
        initDeliveryWithFirstDu()
      }
    }, [activePanel, buId, viewMode, dataDu])

    return (
      <div>
        <Collapse
          className="delivery-collapse"
          bordered={false}
          activeKey={activePanelList}
          onChange={keys => setActivePanelList(keys)}
          expandIcon={({ isActive }) => (
            <Icon type="caret-right" rotate={isActive ? 90 : 0} />
          )}>
          <BusinessPlanDropdownDu
            buId={buId}
            dataDU={dataDu}
            duValue={duValueDelivery}
            updateIsSaveConfirmShowed={updateIsSaveConfirmShowed}
            showAllOption={showAllOption}
          />
          <Panel style={customPanelStyle} header="Summary" key="1">
            <DeliverySummary buId={buId} canViewDelivery={canViewDelivery} />
          </Panel>
          <Panel
            style={customPanelStyle}
            header="Resources Information"
            key="2">
            <ResourcesInformation
              ref={resourcesInformationRef}
              isExpandPanel={activePanelList.includes('2')}
              buId={buId}
              deliveryUnitDataDelivery={deliveryUnitDataDelivery}
              isSaveShowed={isSaveShowed}
              mvv={mvv}
              canEdit={
                status !== statusBusinessPlanDetail.approved &&
                (status === statusBusinessPlanDetail.draft ||
                  canEditDeliveryPlanAllStatus) &&
                deliveryUnitDataDelivery.groupName !== ALL_OPTION_VALUE &&
                canEditDelivery
              }
              canView={canViewDelivery}
            />
          </Panel>
          <Panel style={customPanelStyle} header="Other expenses" key="3">
            <OtherExpensesTable
              ref={deliveryPlanOtherExpensesRef}
              isExpandPanel={activePanelList.includes('3')}
              buId={buId}
              deliveryUnitDataDelivery={deliveryUnitDataDelivery}
              canEdit={
                status !== statusBusinessPlanDetail.approved &&
                (status === statusBusinessPlanDetail.draft ||
                  canEditDeliveryPlanAllStatus) &&
                deliveryUnitDataDelivery.groupName !== ALL_OPTION_VALUE &&
                canEditDelivery
              }
              canView={canViewDelivery}
            />
          </Panel>
          <Panel style={customPanelStyle} header="Reference" key="4">
            <DeliveryPlanReference
              ref={deliveryPlanReferenceRef}
              isExpandPanel={activePanelList.includes('4')}
              canEdit={
                status !== statusBusinessPlanDetail.approved &&
                (status === statusBusinessPlanDetail.draft ||
                  canEditDeliveryPlanAllStatus) &&
                deliveryUnitDataDelivery.groupName !== ALL_OPTION_VALUE &&
                canEditDelivery
              }
              canView={canViewDelivery}
            />
          </Panel>
          <Panel style={customPanelStyle} header="History" key="5">
            <BusinessPlanHistoryTable
              getBusinessPlanHistoryAPI="HistoryDeliveryPlan"
              BusinessPlanVersionId={buId}
              DeliveryUnit={
                deliveryUnitDataDelivery.groupName === ALL_OPTION_VALUE
                  ? undefined
                  : deliveryUnitDataDelivery.groupName
              }
              isSale={deliveryUnitDataDelivery.groupSale ? 1 : 0}
              canView={canViewDelivery}
            />
          </Panel>
        </Collapse>
        <StyledAffix ref={affixRef} className={isSaveShowed ? 'active' : ''}>
          <div className="affix-content">
            <span>Save change ?</span>
            <div className="d-flex gap-8">
              <Popconfirm
                getPopupContainer={() => affixRef.current}
                className="flex-items-center gap-8"
                placement="topLeft"
                visible={visible}
                title="Are you sure cancel save change?"
                onConfirm={handleConfirmCancel}
                onCancel={handleDenyCancel}
                okText="Yes"
                cancelText="No">
                <Button onClick={handleCancel} className="mr-3">
                  Cancel
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                onClick={handleSaveDraft}
                loading={saveDeliveryPlanLoading}>
                Save
              </Button>
            </div>
          </div>
        </StyledAffix>
        <Loading loading={saveDeliveryPlanLoading} />
      </div>
    )
  }
)

export default memo(BusinessPlanDelivery)
