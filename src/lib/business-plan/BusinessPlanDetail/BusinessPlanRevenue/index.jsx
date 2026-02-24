import { ResponseStatusCode } from '../../../service/constant'
import { Button, Collapse, Icon, Popconfirm } from 'antd'
import React, {
  forwardRef,
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
  API_TYPE,
  NOTIFICATION_MESSAGE_REVENUE,
  REVENUE_PLAN_TAB,
} from '../../constants'
import {
  getBusinessPlanOtherRevenue,
  getBusinessPlanSellingExpenses,
  getSummaryRevenuePlan,
  postBusinessPlanOtherRevenue,
  resetSummaryRevenuePlan,
  setDeliveryUnitDataRevenue,
  setDuValueRevenue,
  setIsLoadingOtherRevenues,
  setIsLoadingSellingExpenses,
  setIsSaveConfirmShowed,
  setListRevenueInvalid,
} from '../../redux'
import BusinessPlanDropdownDu from '../BusinessPlanDropdownDu'
import BusinessPlanHistoryTable from './BusinessPlanHistoryTable'
import OtherRevenueTable from './OtherRevenueTable'
import RevenueInformation from './RevenueInformation'
import RevenueSummary from './RevenueSummary'
import SellingExpenses from './SellingExpenses'
import './style.css'

const { Panel } = Collapse
export const StyledAffix = styled.div`
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

const customPanelStyle = {
  border: 0,
  overflow: 'hidden',
}

const BusinessPlanRevenue = forwardRef(
  ({ businessVersion, projectCode, status, dataDu }, ref) => {
    const [expandPanel, setExpandPanel] = useState([REVENUE_PLAN_TAB.SUMMARY])
    const [visible, setVisible] = useState(false)
    const [loadingSave, setLoadingSave] = useState(false)
    const [keyReset, setKeyReset] = useState(0)
    const affixRef = useRef(null)
    const isSaveShowed = useSelector(
      state => state.businessPlanRevenue.isSaveConfirmShowed
    )
    const updateOtherRevenues = useSelector(
      state => state.businessPlanRevenue.updateOtherRevenuesData
    )
    const deleteOtherRevenues = useSelector(
      state => state.businessPlanRevenue.deleteOtherRevenuesData
    )
    const createOtherRevenues = useSelector(
      state => state.businessPlanRevenue.createOtherRevenuesData
    )
    const updateSellingExpenses = useSelector(
      state => state.businessPlanRevenue.updateSellingExpensesData
    )
    const deleteSellingExpenses = useSelector(
      state => state.businessPlanRevenue.deleteSellingExpensesData
    )
    const createSellingExpenses = useSelector(
      state => state.businessPlanRevenue.createSellingExpensesData
    )
    const { deliveryUnitDataRevenue, duValueRevenue } = useSelector(
      state => state.businessPlanRevenue
    )
    const mainDataOtherRevenues = useSelector(
      state => state.businessPlanRevenue.dataSourceTableRevenue
    )
    const mainDataSellingExpenses = useSelector(
      state => state.businessPlanRevenue.dataSourceTableSellingExpenses
    )

    const { activePanel } = useSelector(state => state.businessPlanDetails)
    const dispatch = useDispatch()

    const updateIsSaveConfirmShowed = useCallback(
      value => {
        return dispatch(setIsSaveConfirmShowed(value))
      },
      [dispatch]
    )

    const handleChangePanel = key => {
      setExpandPanel(key)
    }

    const handleCancel = () => {
      setVisible(true)
    }

    const handleDenyCancel = () => {
      setVisible(false)
    }

    const handleConfirmCancel = async () => {
      updateIsSaveConfirmShowed(false)
      setKeyReset(prev => prev + 1)
      handleDenyCancel()
      dispatch(
        getBusinessPlanOtherRevenue({
          mvv: projectCode,
          duId: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupId,
          businessVersion: businessVersion,
          isSale: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupSale,
          status,
        })
      )
      dispatch(
        getBusinessPlanSellingExpenses({
          mvv: projectCode,
          duId: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupId,
          businessVersion: businessVersion,
          isSale: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupSale,
          status,
        })
      )
    }

    const validateRevenueNames = (
      originalDataOtherRevenues,
      originalDataSellingExpenses,
      ...dataArrays
    ) => {
      const emptyRevenueList = []
      const duplicateRevenueList = []
      const combinedChangingData = dataArrays.flat()
      const originalItems = [
        ...((originalDataOtherRevenues && originalDataOtherRevenues.revenues) ||
          []),
        ...((originalDataSellingExpenses &&
          originalDataSellingExpenses.revenues) ||
          []),
      ]
        .flatMap(revenueGroup => revenueGroup.additionalItems || [])
        .filter(item => !!item.revenueName)

      const originalRevenueMap = new Map()
      const changingItemsMap = new Map()

      const normalizeRevenueName = name =>
        name.trim().replace(/\s+/g, ' ').toLowerCase()

      for (const item of originalItems) {
        const key = `${item.revenueTypeId}-${normalizeRevenueName(
          item.revenueName
        )}`
        if (!originalRevenueMap.has(key)) {
          originalRevenueMap.set(key, item.revenueTypeSpecificId)
        }
      }

      for (const item of combinedChangingData) {
        if (!item.revenueName || item.revenueName.trim() === '') {
          emptyRevenueList.push({
            key: item.key,
            revenueTypeSpecificId: item.revenueTypeSpecificId,
          })
          continue
        }

        const lookupKey = `${item.revenueTypeId}-${normalizeRevenueName(
          item.revenueName
        )}`
        const isDuplicateWithOriginal =
          originalRevenueMap.has(lookupKey) &&
          originalRevenueMap.get(lookupKey) !== item.revenueTypeSpecificId

        const isDuplicateInNewItems =
          changingItemsMap.has(lookupKey) &&
          changingItemsMap.get(lookupKey) !== item.revenueTypeSpecificId

        if (isDuplicateWithOriginal || isDuplicateInNewItems) {
          duplicateRevenueList.push({
            key: item.key,
            revenueTypeSpecificId: item.revenueTypeSpecificId,
          })
        } else {
          originalRevenueMap.set(lookupKey, item.revenueTypeSpecificId)
          changingItemsMap.set(lookupKey, item.revenueTypeSpecificId)
        }
      }

      const invalidList = [...emptyRevenueList, ...duplicateRevenueList]

      if (invalidList.length > 0) {
        dispatch(setListRevenueInvalid(invalidList))
        if (emptyRevenueList.length > 0) {
          NotificationManager.error(NOTIFICATION_MESSAGE_REVENUE.REVENUE_EMPTY)
        }
        if (duplicateRevenueList.length > 0) {
          NotificationManager.error(
            NOTIFICATION_MESSAGE_REVENUE.REVENUE_DUPLICATE
          )
        }
        return false
      }
      return true
    }

    const handleSaveDraft = async () => {
      setLoadingSave(true)
      let hasSucceeded = false
      try {
        const filterUpdateOtherRevenues = updateOtherRevenues.filter(
          item => !deleteOtherRevenues.includes(item.revenueTypeSpecificId)
        )

        const filterUpdateSellingExpenses = updateSellingExpenses.filter(
          item => !deleteSellingExpenses.includes(item.revenueTypeSpecificId)
        )

        const params = {
          mvv: projectCode,
          duId: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupId,
          businessVersion: businessVersion,
          isSale: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupSale,
          deletedItems: deleteOtherRevenues,
          updatedItems: filterUpdateOtherRevenues,
          createdItems: createOtherRevenues,
        }

        const paramsSelling = {
          mvv: projectCode,
          duId: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupId,
          businessVersion: businessVersion,
          isSale: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupSale,
          deletedItems: deleteSellingExpenses,
          updatedItems: filterUpdateSellingExpenses,
          createdItems: createSellingExpenses,
        }

        const allCreatedItems = [
          ...createOtherRevenues,
          ...createSellingExpenses,
        ]
        const allUpdatedItems = [
          ...filterUpdateOtherRevenues,
          ...filterUpdateSellingExpenses,
        ]

        if (
          allCreatedItems.length > 0 ||
          allUpdatedItems.length > 0 ||
          deleteOtherRevenues.length > 0 ||
          deleteSellingExpenses.length > 0
        ) {
          const isValid = validateRevenueNames(
            mainDataOtherRevenues,
            mainDataSellingExpenses,
            allCreatedItems,
            allUpdatedItems
          )
          if (isValid) {
            const apiPostRevenue = [
              createOtherRevenues.length > 0 ||
              filterUpdateOtherRevenues.length > 0 ||
              deleteOtherRevenues.length > 0
                ? dispatch(
                    postBusinessPlanOtherRevenue({
                      params: params,
                      apiType: API_TYPE.OTHER_REVENUES,
                    })
                  )
                : null,
              createSellingExpenses.length > 0 ||
              filterUpdateSellingExpenses.length > 0 ||
              deleteSellingExpenses.length > 0
                ? dispatch(
                    postBusinessPlanOtherRevenue({
                      params: paramsSelling,
                      apiType: API_TYPE.SELLING_EXPENSES,
                    })
                  )
                : null,
            ].filter(Boolean)

            const results = await Promise.allSettled(apiPostRevenue)
            results.forEach(result => {
              if (
                result.status === 'fulfilled' &&
                result.value.payload.httpStatus === ResponseStatusCode.success
              ) {
                hasSucceeded = true
              }
            })
            return results
          }
        } else {
          updateIsSaveConfirmShowed(false)
          return []
        }
      } catch (error) {
        dispatch(setIsLoadingOtherRevenues(false))
        dispatch(setIsLoadingSellingExpenses(false))
        updateIsSaveConfirmShowed(false)
      } finally {
        if (hasSucceeded) {
          NotificationManager.success('Save successfully!')
        }
        setVisible(false)
        setLoadingSave(false)
      }
    }

    useImperativeHandle(ref, () => ({
      handleSaveDraft,
    }))

    useEffect(() => {
      dispatch(resetSummaryRevenuePlan())

      if (activePanel === 'Revenue') {
        dispatch(setDeliveryUnitDataRevenue(dataDu[0]))
        dispatch(setDuValueRevenue(dataDu && dataDu[0] && dataDu[0].groupId))
        dispatch(
          getSummaryRevenuePlan({
            businessPlanVersionId: businessVersion,
            duSelected: { ...dataDu[0], groupId: parseInt(dataDu[0].groupId) },
          })
        )
      }
    }, [activePanel])

    return (
      <div>
        <Collapse
          className="revenue-collapse"
          bordered={false}
          activeKey={expandPanel}
          onChange={handleChangePanel}
          expandIcon={({ isActive }) => (
            <Icon type="caret-right" rotate={isActive ? 90 : 0} />
          )}>
          <BusinessPlanDropdownDu
            buId={businessVersion}
            dataDU={dataDu}
            duValue={duValueRevenue}
            updateIsSaveConfirmShowed={updateIsSaveConfirmShowed}
          />

          <Panel
            style={customPanelStyle}
            header={REVENUE_PLAN_TAB.SUMMARY}
            key={REVENUE_PLAN_TAB.SUMMARY}>
            <RevenueSummary businessVersion={businessVersion} />
          </Panel>
          <Panel
            style={customPanelStyle}
            header={REVENUE_PLAN_TAB.SOFTWARE_PRODUCTION_REVENUE_INFORMATION}
            key={REVENUE_PLAN_TAB.SOFTWARE_PRODUCTION_REVENUE_INFORMATION}>
            <RevenueInformation
              isExpandPanel={expandPanel.includes(
                REVENUE_PLAN_TAB.SOFTWARE_PRODUCTION_REVENUE_INFORMATION
              )}
              businessVersion={businessVersion}
              projectCode={projectCode}
              status={status}
              deliveryUnitDataRevenue={deliveryUnitDataRevenue}
              setExpandPanel={setExpandPanel}
            />
          </Panel>
          <Panel
            style={customPanelStyle}
            header={REVENUE_PLAN_TAB.OTHER_REVENUES}
            key={REVENUE_PLAN_TAB.OTHER_REVENUES}>
            <div>
              <OtherRevenueTable
                isExpandPanel={expandPanel.includes(
                  REVENUE_PLAN_TAB.OTHER_REVENUES
                )}
                businessVersion={businessVersion}
                projectCode={projectCode}
                status={status}
                deliveryUnitDataRevenue={deliveryUnitDataRevenue}
                keyReset={keyReset}
              />
            </div>
          </Panel>
          {deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupSale ? (
            <Panel
              style={customPanelStyle}
              header={REVENUE_PLAN_TAB.SELLING_EXPENSES}
              key={REVENUE_PLAN_TAB.SELLING_EXPENSES}>
              <div>
                <SellingExpenses
                  isExpandPanel={expandPanel.includes(
                    REVENUE_PLAN_TAB.SELLING_EXPENSES
                  )}
                  businessVersion={businessVersion}
                  projectCode={projectCode}
                  status={status}
                  deliveryUnitDataRevenue={deliveryUnitDataRevenue}
                  keyReset={keyReset}
                />
              </div>
            </Panel>
          ) : (
            <React.Fragment></React.Fragment>
          )}

          <Panel
            style={customPanelStyle}
            header={REVENUE_PLAN_TAB.HISTORY}
            key={REVENUE_PLAN_TAB.HISTORY}>
            <BusinessPlanHistoryTable
              getBusinessPlanHistoryAPI="HistoryRevenuePlan"
              BusinessPlanVersionId={businessVersion}
              DeliveryUnit={deliveryUnitDataRevenue.groupName}
              isSale={deliveryUnitDataRevenue.groupSale ? 1 : 0}
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
                loading={loadingSave}>
                Save
              </Button>
            </div>
          </div>
        </StyledAffix>
      </div>
    )
  }
)
export default BusinessPlanRevenue
