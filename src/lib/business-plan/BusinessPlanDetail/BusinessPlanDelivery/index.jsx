import { checkRolePermission } from '../../../../components/common/checkRolePermission'
import Loading from '../../../../components/common/Loading/Loading'
import {
  ActivityKeyConstants,
  SourceConstants,
} from '../../../constants/ActivityKeyConstants'
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
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import {
  getLocationExchangeRate,
  getOtherExpensesTable,
  getResourcesInformationDeliveryPlan,
  getSummaryDeliveryPlan,
  resetSaveDeliveryPlanParams,
  saveDeliveryPlan,
  setIsSaveShowedDeliveryPlan,
  resetSummaryDeliveryPlan,
  setDeliveryUnitDataDelivery,
  setDuValueDelivery,
  setLoadDataFromValue,
  setErrorDataSubmitDeliveryPlan,
} from '../../redux'
import BusinessPlanDropdownDu from '../BusinessPlanDropdownDu'
import BusinessPlanHistoryTable from '../BusinessPlanRevenue/BusinessPlanHistoryTable'
import { statusBusinessPlanDetail } from '../constant'
import DeliveryPlanReference from './DeliveryPlanReference'
import OtherExpensesTable from './OtherExpensesTable'
import ResourcesInformation from './ResourcesInformation'
import './style.css'
import useBussinessPlanHistoryService from '../../hooks/useBussinessPlanHistoryService'
import { DeliverySummaryTooltip } from '../BusinessPlanRevenue/constant'
import { ResponseStatusCode } from '../../../service/constant'

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
    <div>
      <Row>
        <Col span={4} style={{ marginBottom: 4 }}>
          {title}
        </Col>
        <Col span={4}>
          <Row type="flex" align="middle">
            <Col span={16}>
              <Tooltip title={DeliverySummaryTooltip[title]}>
                <Icon type="question-circle" style={{ cursor: 'pointer' }} />
              </Tooltip>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'left' }}>
                {value < 0
                  ? `(${formatFloatNumber(Math.abs(value), 0, 3)})`
                  : formatFloatNumber(value, 0, 3)}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

const DeliverySummary = ({ buId }) => {
  const dispatch = useDispatch()
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
          <CustomDescription title="MM effort" value={mmEffort} />
          <CustomDescription
            title="Direct labor cost"
            value={directLaborCost}
          />
          <CustomDescription title="Outsourcing cost" value={outsourcingCost} />
          <CustomDescription
            title="Equipment, Internet, Server cost"
            value={equipmentExpense}
          />
          <CustomDescription title="Onsite expense" value={onsiteExpense} />
          <CustomDescription title="Overtime" value={overtime} />
          <CustomDescription
            title="Non-deductible input VAT"
            value={nonDeductibleInputVAT}
          />
          <CustomDescription title="Other expenses" value={other} />
        </div>
      )}
    </div>
  )
}

const BusinessPlanDelivery = forwardRef(
  ({ buId, status, dataDu, mvv }, ref) => {
    const dispatch = useDispatch()

    const affixRef = useRef(null)
    const deliveryPlanReferenceRef = useRef(null)
    const deliveryPlanOtherExpensesRef = useRef(null)
    const resourcesInformationRef = useRef(null)

    const [visible, setVisible] = useState(false)
    const [activePanelList, setActivePanelList] = useState(DEFAULT_PANELS)
    const isSaveShowed = useSelector(
      state => state.businessPlanDelivery.isSaveShowedDeliveryPlan
    )
    const { fetchHistoryDeliveryPlan } = useBussinessPlanHistoryService()
    const {
      resourceInfoTableParams,
      dataCreateRequest,
      dataUpdateRequest,
      dataDeleteRequest,
      saveDeliveryPlanLoading,
      deliveryUnitDataDelivery,
      duValueDelivery,
      viewType,
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
    }, [])

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
      const deliveryUnit = deliveryUnitDataDelivery.groupName
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
      activePanelList.includes('3') &&
        dispatch(
          getOtherExpensesTable({
            deliveryUnit,
            businessPlanVersionId,
            pageNum: 1,
            pageSize: 10,
          })
        )
      activePanelList.includes('4') &&
        dispatch(
          getLocationExchangeRate({
            businessPlanVersionId,
            deliveryUnit: '',
          })
        )
      dispatch(resetSaveDeliveryPlanParams())
      dispatch(setLoadDataFromValue(undefined))
      await dispatch(
        getSummaryDeliveryPlan({
          businessPlanVersionId,
          groupId:
            deliveryUnitDataDelivery &&
            parseInt(deliveryUnitDataDelivery.groupId),
        })
      )
      activePanelList.includes('5') &&
        fetchHistoryDeliveryPlan(
          buId,
          deliveryUnitDataDelivery.groupName,
          1,
          10,
          deliveryUnitDataDelivery.groupSale
        )
    }
    const handleSaveDraft = async () => {
      const isValid = handleValidate()

      if (!isValid) return
      if (!deliveryUnitDataDelivery) return

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

    useEffect(() => {
      dispatch(resetSummaryDeliveryPlan())
      if (activePanel === 'Delivery') {
        dispatch(setDeliveryUnitDataDelivery(dataDu[0]))
        dispatch(setDuValueDelivery(dataDu && dataDu[0] && dataDu[0].groupId))
        dispatch(
          getSummaryDeliveryPlan({
            businessPlanVersionId: Number(buId),
            groupId: dataDu[0] && parseInt(dataDu[0].groupId),
          })
        )
      }
    }, [activePanel])

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
            showAllOption
          />
          <Panel style={customPanelStyle} header="Summary" key="1">
            <DeliverySummary buId={buId} />
          </Panel>
          {deliveryUnitDataDelivery && (
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
                    canEditDeliveryPlanAllStatus)
                }
              />
            </Panel>
          )}
          {deliveryUnitDataDelivery && (
            <Panel style={customPanelStyle} header="Other expenses" key="3">
              <OtherExpensesTable
                ref={deliveryPlanOtherExpensesRef}
                isExpandPanel={activePanelList.includes('3')}
                buId={buId}
                deliveryUnitDataDelivery={deliveryUnitDataDelivery}
                canEdit={
                  status !== statusBusinessPlanDetail.approved &&
                  (status === statusBusinessPlanDetail.draft ||
                    canEditDeliveryPlanAllStatus)
                }
              />
            </Panel>
          )}
          <Panel style={customPanelStyle} header="Reference" key="4">
            <DeliveryPlanReference
              ref={deliveryPlanReferenceRef}
              isExpandPanel={activePanelList.includes('4')}
              canEdit={
                status !== statusBusinessPlanDetail.approved &&
                (status === statusBusinessPlanDetail.draft ||
                  canEditDeliveryPlanAllStatus)
              }
            />
          </Panel>
          {deliveryUnitDataDelivery && (
            <Panel style={customPanelStyle} header="History" key="5">
              <BusinessPlanHistoryTable
                getBusinessPlanHistoryAPI="HistoryDeliveryPlan"
                BusinessPlanVersionId={buId}
                DeliveryUnit={deliveryUnitDataDelivery.groupName}
                isSale={deliveryUnitDataDelivery.groupSale ? 1 : 0}
              />
            </Panel>
          )}
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
