import './style.css'
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
  useRef,
  useState,
} from 'react'
import { NotificationManager } from 'react-notifications'
import { useDispatch, useSelector, useStore } from 'react-redux'
import {
  getLocationExchangeRate,
  getOtherExpensesTable,
  getOvertimeData,
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
import { DELIVERY_PLAN_SECTION } from './constants'
import { StyledAffix, StyledPanelHeader } from './styled'
import Overtime from './Overtime'

const { Panel } = Collapse
const DEFAULT_PANELS = [DELIVERY_PLAN_SECTION.SUMMARY]
const customPanelStyle = {
  border: 0,
  overflow: 'hidden',
}

const CustomDescription = ({ title, value }) => {
  return (
    <Row className="d-flex align-items-center">
      <Col span={5} style={{ marginBottom: 4 }}>
        {title}
      </Col>
      <Col span={1} type="flex" align="middle">
        <Tooltip title={DeliverySummaryTooltip[title]}>
          <Icon
            type="question-circle"
            style={{ cursor: 'pointer', padding: '4px' }}
          />
        </Tooltip>
      </Col>
      <Col span={6}>
        <div style={{ textAlign: 'left' }}>
          {value < 0
            ? `(${formatFloatNumber(Math.abs(value), 0, 3)})`
            : formatFloatNumber(value, 0, 3)}
        </div>
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
    const store = useStore()

    const affixRef = useRef(null)
    const deliveryPlanReferenceRef = useRef(null)
    const deliveryPlanOtherExpensesRef = useRef(null)
    const resourcesInformationRef = useRef(null)
    const overtimeExpenseRef = useRef(null)

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

    const canViewDeliveryPlanAllFilter = checkRolePermission(
      SourceConstants.BUSINESS_PLAN_DETAIL,
      ActivityKeyConstants.VIEW_DELIVERY_PLAN_ALL
    )

    useImperativeHandle(ref, () => ({
      handleSaveDraft,
    }))

    useEffect(() => {
      if (buId) {
        dispatch(
          getLocationExchangeRate({
            businessPlanVersionId: Number(buId),
            deliveryUnit: '',
          })
        )
      }
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
        activePanelList.includes(DELIVERY_PLAN_SECTION.RESOURCES_INFORMATION) &&
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
      if (activePanelList.includes(DELIVERY_PLAN_SECTION.OTHER_EXPENSES)) {
        dispatch(
          getOtherExpensesTable({
            deliveryUnit,
            businessPlanVersionId,
            pageNum: 1,
            pageSize: 10,
          })
        )
      }
      if (activePanelList.includes(DELIVERY_PLAN_SECTION.REFERENCE)) {
        dispatch(
          getLocationExchangeRate({
            businessPlanVersionId,
            deliveryUnit: '',
          })
        )
      }
      if (activePanelList.includes(DELIVERY_PLAN_SECTION.OVERTIME)) {
        dispatch(
          getOvertimeData({
            deliveryUnit,
            businessPlanVersionId,
            pageNum: 1,
            pageSize: 10,
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
      if (activePanelList.includes(DELIVERY_PLAN_SECTION.HISTORY)) {
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
      await new Promise(resolve => setTimeout(resolve, 100))

      const latestState = store.getState().businessPlanDelivery
      const {
        dataCreateRequest: latestCreate,
        dataUpdateRequest: latestUpdate,
        dataDeleteRequest: latestDelete,
        deliveryUnitDataDelivery: latestUnit,
        resourceInfoTableParams: latestParams,
      } = latestState

      if (!latestUnit) return
      if (latestUnit.groupName === ALL_OPTION_VALUE) {
        return NotificationManager.error(
          'You cannot operate task because changes at filter all, changes cannot be saved'
        )
      }

      const saveDeliveryPlanParams = {
        businessPlanId: Number(buId),
        groupId: [Number(latestUnit.groupId)],
        isSubmit: false,
        viewType: latestParams.viewType,
        loadDataFromType: '',
        dataCreateRequest: latestCreate,
        dataUpdateRequest: latestUpdate,
        dataDeleteRequest: latestDelete,
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
          !activePanelList.includes(DELIVERY_PLAN_SECTION.REFERENCE) ||
          (deliveryPlanReferenceRef.current &&
            deliveryPlanReferenceRef.current.validate()),
        isValidOtherExpenses:
          !activePanelList.includes(DELIVERY_PLAN_SECTION.OTHER_EXPENSES) ||
          (deliveryPlanOtherExpensesRef.current &&
            deliveryPlanOtherExpensesRef.current.validate()),

        isValidOvertimeExpense:
          !activePanelList.includes(DELIVERY_PLAN_SECTION.OVERTIME) ||
          (overtimeExpenseRef.current && overtimeExpenseRef.current.validate()),

        isValidHeadCountTable:
          !activePanelList.includes(
            DELIVERY_PLAN_SECTION.RESOURCES_INFORMATION
          ) ||
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
      dispatch(
        getSummaryDeliveryPlan({
          businessPlanVersionId: Number(buId),
          groupId: '',
        })
      )
    }, [dispatch, buId])

    const initDeliveryWithFirstDu = useCallback(() => {
      if (!dataDu || dataDu.length === 0) return

      const firstDu = dataDu && dataDu[0]
      if (!firstDu) return
      dispatch(setDeliveryUnitDataDelivery(firstDu))
      dispatch(setDuValueDelivery(firstDu.groupId))
      dispatch(
        getLocationExchangeRate({
          businessPlanVersionId: Number(buId),
          deliveryUnit: firstDu.groupName,
        })
      )
      dispatch(
        getSummaryDeliveryPlan({
          businessPlanVersionId: Number(buId),
          groupId: Number.parseInt(firstDu.groupId),
        })
      )
    }, [dispatch, buId, dataDu])

    useEffect(() => {
      dispatch(resetSummaryDeliveryPlan())
      if (activePanel !== 'Delivery') return
      if (canViewDeliveryPlanAllFilter) {
        initDeliveryWithAll()
      } else {
        initDeliveryWithFirstDu()
      }
    }, [activePanel, buId, dataDu])

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
          <Panel
            style={customPanelStyle}
            key={DELIVERY_PLAN_SECTION.SUMMARY}
            header={
              <StyledPanelHeader>
                <span>Summary</span>
                <div
                  onClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}>
                  <BusinessPlanDropdownDu
                    buId={buId}
                    dataDU={dataDu}
                    duValue={duValueDelivery}
                    updateIsSaveConfirmShowed={updateIsSaveConfirmShowed}
                    showAllOption={canViewDeliveryPlanAllFilter}
                  />
                </div>
              </StyledPanelHeader>
            }>
            <DeliverySummary buId={buId} canViewDelivery={canViewDelivery} />
          </Panel>
          <Panel
            style={customPanelStyle}
            header="Resources Information"
            key={DELIVERY_PLAN_SECTION.RESOURCES_INFORMATION}>
            <ResourcesInformation
              ref={resourcesInformationRef}
              isExpandPanel={activePanelList.includes(
                DELIVERY_PLAN_SECTION.RESOURCES_INFORMATION
              )}
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
          <Panel
            style={customPanelStyle}
            header="Other expenses"
            key={DELIVERY_PLAN_SECTION.OTHER_EXPENSES}>
            <OtherExpensesTable
              ref={deliveryPlanOtherExpensesRef}
              isExpandPanel={activePanelList.includes(
                DELIVERY_PLAN_SECTION.OTHER_EXPENSES
              )}
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
          <Panel
            style={customPanelStyle}
            header="Overtime"
            key={DELIVERY_PLAN_SECTION.OVERTIME}>
            <Overtime
              ref={overtimeExpenseRef}
              buId={buId}
              isExpandPanel={activePanelList.includes(
                DELIVERY_PLAN_SECTION.OVERTIME
              )}
              isSaveShowed={isSaveShowed}
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
          <Panel
            style={customPanelStyle}
            header="Reference"
            key={DELIVERY_PLAN_SECTION.REFERENCE}>
            <DeliveryPlanReference
              ref={deliveryPlanReferenceRef}
              isExpandPanel={activePanelList.includes(
                DELIVERY_PLAN_SECTION.REFERENCE
              )}
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
          <Panel
            style={customPanelStyle}
            header="History"
            key={DELIVERY_PLAN_SECTION.HISTORY}>
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
