import { Button, Collapse, Divider, Popconfirm, Tabs, Tooltip } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { useBusinessPlanDetails, useBusinessPlanStep } from '../hooks'
import {
  getBusinessPlanHistory,
  getListDUByVersionDelivery,
  getListDUByVersionRevenue,
  postSubmitBaselineRevenuePlan,
  saveDeliveryPlan,
  setActiveBusinessPlanPanel,
  setIsSaveShowedDeliveryPlan,
  setValidation,
} from '../redux'
import BusinessPlanDelivery from './BusinessPlanDelivery'
import BusinessPlanFormSection from './BusinessPlanFormSection'
import BusinessPlanGeneralInformation from './BusinessPlanGeneralInformation'
import { GeneralInformationTotalTemplate } from './BusinessPlanReport/constant'
import BusinessPlanRevenue from './BusinessPlanRevenue'
import BusinessPlanStep from './BusinessPlanStep'
import BusinessPlanVersion from './BusinessPlanVersion'
import BusinessPlanTabWrapper from './BusinessPlanTabWrapper'
import './style.css'
import Loading from '../../../components/common/Loading/Loading'
import {NotificationManager} from "react-notifications";

const { Panel } = Collapse
const { TabPane } = Tabs

const StyledCollapse = styled(Collapse)`
  .ant-collapse-item {
    .ant-collapse-header {
      padding-left: 20px;
      font-size: 18px;
      font-weight: 600;

      .ant-collapse-arrow {
        left: 0;
      }
    }
  }
`

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

function BusinessPlanDetail({ match, history }) {
  const affixRef = useRef(null)
  const businessPlanDeliveryRef = useRef(null)

  const {
    isSaveShowed,
    updateIsSaveShowed,
    saveDraft,
    submit,
    getBusinessPlanDetail,
    getBusinessPlanDetailByViewMode,
    loadBusinessPlanFullData,
    projectCode,
    status,
    originalBusinessPlanItems,
    columns: columnLabels,
    startDate,
    endDate,
    createNewVersion,
    versionId,
    generalInformationParams,
  } = useBusinessPlanDetails()

  const { getBusinessPlanWorkflow } = useBusinessPlanStep()

  const dispatch = useDispatch()

  const [loadingSave, setLoadingSave] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [visible, setVisible] = useState(false)
  const { loadingApproval } = useBusinessPlanStep()
  const { loadingCollaborator, generalInfos } = useSelector(
    state => state.businessGeneralInformation
  )

  const { listDuRevenue, deliveryUnitDataRevenue } = useSelector(
    state => state.businessPlanRevenue
  )

  const isEditingRevenuePlan = useSelector(
    state => state.businessPlanRevenue.isSaveConfirmShowed
  )

  const {
    isSaveShowedDeliveryPlan,
    resourceInfoTableParams,
    listDUDelivery,
    deliveryUnitDataDelivery,
    dataCreateRequest,
    dataUpdateRequest,
    dataDeleteRequest,
  } = useSelector(state => state.businessPlanDelivery)

  const [activeTab, setActiveTab] = useState('1')
  const [viewOption, setViewOption] = useState(null) // Always string: 'Total', 'OB', 'Onsite', 'Offshore'
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Get buId (MVV ID) from generalInfos by locationType (for Revenue/Delivery tabs)
  // Returns the buId of the MVV with matching locationType (Onsite=436, Offshore=437)
  const getMVVIdByLocationType = useCallback((locationType) => {
    if (!generalInfos || generalInfos.length === 0) return null
    
    const mvv = generalInfos.find(info => info.mvvLocationType === locationType)
    return mvv ? mvv.id : null
  }, [generalInfos])

  // Get current MVV buId based on viewOption and activeTab
  // This should be used by Revenue/Delivery components to load data for specific MVV
  const currentMVVId = useMemo(() => {
    if (activeTab === '1') return null // Business Plan uses match.params.buId
    if (!viewOption) return null
    
    return getMVVIdByLocationType(viewOption)
  }, [activeTab, viewOption, getMVVIdByLocationType])

  // Debug: Log current MVV ID when it changes (can be removed in production)
  useEffect(() => {
    if (currentMVVId !== null && activeTab !== '1') {
      console.log(`[${activeTab === '2' ? 'Revenue' : 'Delivery'} Plan] Selected ${viewOption} - MVV ID (buId): ${currentMVVId}`)
    }
  }, [currentMVVId, activeTab, viewOption])

  // Load General Information first on mount
  useEffect(() => {
    ;(async () => {
      if (match.params.buId && isInitialLoad) {
        // Only load General Information first to get mvvLocationType
        const res = await getBusinessPlanDetail(match.params.buId)
        if (res.type.includes('fulfilled')) {
          await getBusinessPlanWorkflow({
            referenceId: match.params.buId,
            mvv: res.payload ? res.payload.data.projectCode : null,
          })
        }
        setIsInitialLoad(false)
      }
    })()
  }, [match.params.buId])

  // Auto-select view option based on current MVV's locationType after generalInfos loads
  useEffect(() => {
    if (!isInitialLoad && generalInfos && generalInfos.length > 0 && match.params.buId && !viewOption) {
      const currentMVV = generalInfos.find(info => info.id === Number(match.params.buId))
      
      if (currentMVV && currentMVV.mvvLocationType) {
        const locationType = currentMVV.mvvLocationType
        if (locationType === 'Onsite') {
          setViewOption('Onsite')
        } else if (locationType === 'Offshore') {
          setViewOption('Offshore')
        }
      } else {
        // Fallback to Onsite if no mvvLocationType found
        setViewOption('Onsite')
      }
    }
  }, [isInitialLoad, generalInfos, match.params.buId, viewOption])

  // Load Business Plan table data once viewOption is determined
  useEffect(() => {
    if (match.params.buId && viewOption) {
      if (activeTab === '1') {
        // Business Plan: pass string value (Total/OB/Onsite/Offshore)
        getBusinessPlanDetailByViewMode({ id: match.params.buId, viewMode: viewOption })
      }
      // Revenue/Delivery tabs: API would use currentGroupId if needed
    }
  }, [viewOption, match.params.buId, activeTab, getBusinessPlanDetailByViewMode])

  // Auto-switch view when changing tabs
  useEffect(() => {
    if (viewOption === null) return

    // When switching from Business Plan (Total/OB) to Revenue/Delivery tabs
    // Auto-switch to Onsite (using buId to find current MVV's locationType)
    if ((activeTab === '2' || activeTab === '3') && (viewOption === 'Total' || viewOption === 'OB')) {
      // Find current MVV's locationType from match.params.buId
      const currentMVV = generalInfos?.find(info => info.id === Number(match.params.buId))
      const defaultLocationType = currentMVV?.mvvLocationType || 'Onsite'
      setViewOption(defaultLocationType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const customPanelStyle = {
    border: 0,
    overflow: 'hidden',
  }

  const onSubmit = async () => {
    updateIsSaveShowed(false)
    setLoadingSubmit(true)
    const params = {
      businessPlanVersionId: versionId,
      generalInformation: generalInformationParams,
      sectionList: originalBusinessPlanItems,
      columnLabels,
    }

    const isSubmit = await submit(params)

    if (isSubmit) {
      await loadBusinessPlanFullData(match.params.buId, viewOption)
      await getBusinessPlanWorkflow({
        referenceId: match.params.buId,
        mvv: projectCode,
      })
      await dispatch(getBusinessPlanHistory(match.params.buId))
    }
    setLoadingSubmit(false)
  }

  const onBaselineRevenuePlan = async () => {
    if (!listDuRevenue) return

    const param = {
      mvv: projectCode,
      businessVersion: versionId,
    }
    const result = await dispatch(postSubmitBaselineRevenuePlan(param))
    return result
  }
  const onBaselineDeliveryPlan = async () => {
    if (!listDUDelivery) return

    if (isSaveShowedDeliveryPlan) {
      const isValid =
        businessPlanDeliveryRef &&
        businessPlanDeliveryRef.current.handleValidate()

      if (!isValid) return { payload: { status: '' } }
      else {
        const saveParams = {
          businessPlanId: Number(match.params.buId),
          groupId: [Number(deliveryUnitDataDelivery.groupId)],
          isSubmit: false,
          viewType: resourceInfoTableParams.viewType,
          loadDataFromType: '',
          dataCreateRequest,
          dataUpdateRequest,
          dataDeleteRequest,
        }
        try {
          await dispatch(saveDeliveryPlan(saveParams))
        } catch (error) {
          return NotificationManager.error(error)
        } finally {
          dispatch(setIsSaveShowedDeliveryPlan(false))
        }
      }
    }
    const saveDeliveryPlanParams = {
      businessPlanId: Number(match.params.buId),
      isSubmit: true,
      viewType: resourceInfoTableParams.viewType,
      loadDataFromType: '',
      dataSubmit: null,
    }
    const result = await dispatch(saveDeliveryPlan(saveDeliveryPlanParams))
    return result
  }

  const handleCreateNewVersion = async () => {
    const res = await createNewVersion(versionId)
    if (res) {
      history.push(`/delivery/business-plan-list/${res}/business-plan-detail`)
    }
  }

  const handleExport = async () => {
    // await createNewVersion(versionId)
    const opt = {
      margin: [0.01, 0.01, 0.01, 0.01],
      filename: 'myfile.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    }

    html2pdf().from(GeneralInformationTotalTemplate()).set(opt).save()
    // setLoadingExport(true)
    // setLoadingExport(false)
  }

  const onSaveDraft = async () => {
    setLoadingSave(true)
    const sectionList = cloneDeep(originalBusinessPlanItems)
    sectionList.forEach(section => {
      section.rowLabels = section.rowLabels.filter(row => {
        if (row.label) return true
        if (row.cellList.some(item => item.editable && item.value !== null)) {
          return true
        }
        return false
      })
    })
    const params = {
      businessPlanVersionId: parseInt(match.params.buId),
      generalInformation: generalInformationParams,
      sectionList,
      columnLabels,
    }
    await saveDraft(params)
    await dispatch(getBusinessPlanHistory(match.params.buId))
    setLoadingSave(false)
  }

  const handleCancel = () => {
    setVisible(true)
  }

  const handleConfirmCancel = async () => {
    setVisible(false)
    updateIsSaveShowed(false)
    await loadBusinessPlanFullData(match.params.buId, viewOption)
  }

  const handleDenyCancel = () => {
    setVisible(false)
  }

  const handleChangeTab = activeKey => {
    if (activeKey === '1') {
      loadBusinessPlanFullData(match.params.buId, viewOption)
    }
    setActiveTab(activeKey)
    dispatch(
      setActiveBusinessPlanPanel({
        activeKey,
      })
    )
  }

  useEffect(() => {
    const result = {
      industryCurrency: false,
      industryDomain: false,
      exchangeRate: false,
      totalContractPrice: false,
      listAM: false,
      listTeamLead: false,
      listPreparator: false,
      listPM: false,
    }
    dispatch(setValidation(result))

    const dataDelivery = {
      businessPlanVersionId: match.params.buId,
      type: 'Delivery',
    }
    dispatch(getListDUByVersionDelivery(dataDelivery))

    const dataRevenue = {
      businessPlanVersionId: match.params.buId,
      type: 'Revenue',
    }
    dispatch(getListDUByVersionRevenue(dataRevenue))
  }, [])

  return (
    <div className="main-content-pr">
      <div className="pb-5">
        {(loadingCollaborator || loadingApproval) && (
          <Loading loading={loadingCollaborator || loadingApproval} />
        )}
        <BusinessPlanVersion
          match={match}
          onSubmit={onSubmit}
          onBaselineRevenuePlan={onBaselineRevenuePlan}
          onBaselineDeliveryPlan={onBaselineDeliveryPlan}
          loadingSubmit={loadingSubmit}
          loadingExport={loadingExport}
          onCreateNewVersion={handleCreateNewVersion}
          onExport={handleExport}
        />
        <Divider className="mb-3" />
        <BusinessPlanStep
          status={status}
          projectCode={projectCode}
          startDate={startDate}
          endDate={endDate}
        />
        <StyledCollapse bordered={false}>
          <Panel
            key="1"
            header="General Information"
            style={customPanelStyle}
            forceRender={true}>
            <BusinessPlanGeneralInformation />
          </Panel>
          <Panel key="2" header="Business Plan" style={customPanelStyle}>
            <div className="business-plan-section">
              <Tabs
                  activeKey={activeTab}
                  animated={false}
                  destroyInactiveTabPane={false}
                  className="business-plan-section-tab"
                  onChange={handleChangeTab}>
                <BusinessPlanTabWrapper
                    value={viewOption}
                    onChange={e => setViewOption(e.target.value)}
                    activeTab={activeTab}
                    tab={
                      isSaveShowedDeliveryPlan || isEditingRevenuePlan ? (
                          <Tooltip
                              title={`You should save ${
                                  isSaveShowedDeliveryPlan
                                      ? 'Delivery Plan'
                                      : 'Revenue Plan'
                              } before viewing other tabs`}>
                            <span>Business Plan</span>
                          </Tooltip>
                      ) : (
                          <span>Business Plan</span>
                      )
                    }
                    key="1"
                    disabled={isSaveShowedDeliveryPlan || isEditingRevenuePlan}>
                  {viewOption && (
                    <BusinessPlanFormSection 
                      handleChangeTab={handleChangeTab} 
                      viewOption={viewOption} 
                    />
                  )}
                </BusinessPlanTabWrapper>
                {listDuRevenue && listDuRevenue.length > 0 && (
                    <BusinessPlanTabWrapper
                        value={viewOption}
                        onChange={e => setViewOption(e.target.value)}
                        activeTab={activeTab}
                        tab={
                          isSaveShowedDeliveryPlan || isSaveShowed ? (
                              <Tooltip
                                  title={`You should save ${
                                      isSaveShowed ? 'Business Plan' : 'Delivery Plan'
                                  } before viewing other tabs`}>
                                <span>Revenue Plan</span>
                              </Tooltip>
                          ) : (
                              <span>Revenue Plan</span>
                          )
                        }
                        key="2"
                        disabled={isSaveShowedDeliveryPlan || isSaveShowed}>
                      <BusinessPlanRevenue
                          businessVersion={match.params.buId}
                          projectCode={projectCode}
                          status={status}
                          dataDu={listDuRevenue}
                          selectedMVVId={currentMVVId}
                      />
                    </BusinessPlanTabWrapper>
                )}

                {listDUDelivery && listDUDelivery.length > 0 && (
                    <BusinessPlanTabWrapper
                        value={viewOption}
                        onChange={e => setViewOption(e.target.value)}
                        activeTab={activeTab}
                        tab={
                          isEditingRevenuePlan || isSaveShowed ? (
                              <Tooltip
                                  title={`You should save ${
                                      isEditingRevenuePlan
                                          ? 'Revenue Plan'
                                          : 'Business Plan'
                                  } before viewing other tabs`}>
                                <span>Delivery Plan</span>
                              </Tooltip>
                          ) : (
                              <span>Delivery Plan</span>
                          )
                        }
                        key="3"
                        disabled={isEditingRevenuePlan || isSaveShowed}>
                      <BusinessPlanDelivery
                          ref={businessPlanDeliveryRef}
                          buId={match.params.buId}
                          mvv={projectCode}
                          status={status}
                          dataDu={listDUDelivery}
                          selectedMVVId={currentMVVId}
                      />
                    </BusinessPlanTabWrapper>
                )}
              </Tabs>
            </div>
          </Panel>
        </StyledCollapse>
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
                onClick={onSaveDraft}
                loading={loadingSave}>
                Save
              </Button>
            </div>
          </div>
        </StyledAffix>
      </div>
    </div>
  )
}

export default BusinessPlanDetail
