import {
  Button,
  Collapse,
  Divider,
  Popconfirm,
  Spin,
  Tabs,
  Tooltip,
} from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  setActiveViewMode,
  setContractPriceData,
  setIsSaveShowedDeliveryPlan,
  setValidation,
} from '../redux'
import { setSelectedMvvCode } from '../redux/reducers/businessGeneralInformation'
import BusinessPlanDelivery from './BusinessPlanDelivery'
import BusinessPlanFormSection from './BusinessPlanFormSection'
import BusinessPlanGeneralInformation from './BusinessPlanGeneralInformation'
import { GeneralInformationTotalTemplate } from './BusinessPlanReport/constant'
import BusinessPlanRevenue from './BusinessPlanRevenue'
import BusinessPlanStep from './BusinessPlanStep'
import BusinessPlanVersion from './BusinessPlanVersion'
import './style.css'
import Loading from '../../../components/common/Loading/Loading'
import BusinessPlanTabWrapper from './BusinessPlanTabWrapper'
import { NotificationManager } from 'react-notifications'

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
  const skipViewModeReset = useRef(false)
  const [activeTab, setActiveTab] = useState('1')
  const [activeCollapse, setActiveCollapse] = useState('')
  const [viewMode, setViewMode] = useState('Total')

  const {
    loadingBusinessPlan,
    isSaveShowed,
    updateIsSaveShowed,
    saveDraft,
    submit,
    getBusinessPlanDetail,
    getBusinessPlanDetailByViewMode,
    fetchAllViewModesData,
    originalBusinessPlanItems,
    columns: columnLabels,
    startDate,
    endDate,
    createNewVersion,
    generalInformationParams,
  } = useBusinessPlanDetails()

  const { getBusinessPlanWorkflow } = useBusinessPlanStep()

  const dispatch = useDispatch()

  const [loadingSave, setLoadingSave] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [visible, setVisible] = useState(false)
  const { loadingApproval } = useBusinessPlanStep()
  const {
    loadingCollaborator,
    listGeneralInformation,
    generalInfos,
    mvvLocationTypeIdMap,
    selectedMvvCode,
  } = useSelector(state => state.businessGeneralInformation)

  const { listDuRevenue } = useSelector(state => state.businessPlanRevenue)

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

  useEffect(() => {
    ;(async () => {
      if (match.params.buId) {
        const res = await getBusinessPlanDetail(match.params.buId)
        if (res.type.includes('fulfilled')) {
          await getBusinessPlanWorkflow({
            referenceId: match.params.buId,
          })
        }
      }
    })()
  }, [match.params.buId])

  useEffect(() => {
    if (skipViewModeReset.current) return
    if (generalInfos && generalInfos.length > 0 && match.params.buId) {
      const matchedMVV = generalInfos.find(
        info => info.id === Number(match.params.buId)
      )
      const currentMVV = matchedMVV || generalInfos[0]

      if (currentMVV && currentMVV.mvvLocationType) {
        const locationType = currentMVV.mvvLocationType
        setViewMode(locationType)
      }
    }
  }, [generalInfos, match.params.buId])

  const businessPlanVersionId = useMemo(() => {
    return +mvvLocationTypeIdMap[viewMode] || null
  }, [viewMode])

  const projectCode = useMemo(() => {
    return (generalInfos.find(item => +item.id === businessPlanVersionId) || [])
      .projectCode
  }, [businessPlanVersionId])

  const statusProjectCode = useMemo(() => {
    return (generalInfos.find(item => item.id === businessPlanVersionId) || [])
      .status
  }, [businessPlanVersionId])

  const availableModes = useMemo(() => {
    const modes = []
    if (mvvLocationTypeIdMap['Onsite']) modes.push('Onsite')
    if (mvvLocationTypeIdMap['Offshore']) modes.push('Offshore')
    return modes
  }, [mvvLocationTypeIdMap])

  const customPanelStyle = {
    border: 0,
    overflow: 'hidden',
  }

  const onSubmit = async () => {
    updateIsSaveShowed({ generalInformation: false, businessPlan: false })
    setLoadingSubmit(true)

    const params = {}

    if (isSaveShowed.generalInformation && listGeneralInformation) {
      params.generalInformation = {
        ...generalInformationParams,
        businessPlanVersionId: listGeneralInformation.id || undefined,
        projectCode: listGeneralInformation.projectCode || undefined,
      }
    }

    if (
      businessPlanVersionId &&
      (viewMode === 'Onsite' || viewMode === 'Offshore')
    ) {
      const sectionList = cloneDeep(originalBusinessPlanItems)
      sectionList.forEach(section => {
        section.rowLabels = section.rowLabels.filter(row => {
          if (row.label) return true
          if (row.cellList.some(item => item.editable && item.value !== null)) {
            return true
          }
          return false
        })
        section.rowLabels.forEach(function (row) {
          row.cellList = row.cellList.map(function (cell) {
            if (!cell.compareKey) return cell
            const c = Object.assign({}, cell)
            delete c.compareKey
            return c
          })
        })
      })
      const cleanColumnLabels = columnLabels.map(function (col) {
        if (!col.compareKey) return col
        const c = Object.assign({}, col)
        delete c.compareKey
        return c
      })
      params.businessPlanSectionDTO = {
        columnLabels: cleanColumnLabels,
        sectionList,
        businessPlanVersionId: businessPlanVersionId,
        projectCode: projectCode,
      }
    }

    const onsiteInfo = generalInfos.find(
      item => item.mvvLocationType === 'Onsite'
    )
    const offshoreInfo = generalInfos.find(
      item => item.mvvLocationType === 'Offshore'
    )

    if (onsiteInfo) {
      params.onsite = {
        businessPlanVersionId: onsiteInfo.id,
        projectCode: onsiteInfo.projectCode,
        status: onsiteInfo.status
          ? onsiteInfo.status.replace(' ', '_').toUpperCase()
          : onsiteInfo.status,
      }
    }
    if (offshoreInfo) {
      params.offshore = {
        businessPlanVersionId: offshoreInfo.id,
        projectCode: offshoreInfo.projectCode,
        status: offshoreInfo.status
          ? offshoreInfo.status.replace(' ', '_').toUpperCase()
          : offshoreInfo.status,
      }
    }

    const isSubmit = await submit(params)

    if (isSubmit) {
      await getBusinessPlanDetail(match.params.buId)
      await getBusinessPlanWorkflow({
        referenceId: match.params.buId,
      })
      await dispatch(getBusinessPlanHistory(match.params.buId))
    }

    setLoadingSubmit(false)
  }

  const onBaselineRevenuePlan = async () => {
    if (!listDuRevenue) return

    const param = {}
    const onsiteInfo = generalInfos.find(
      item => item.mvvLocationType === 'Onsite'
    )
    const offshoreInfo = generalInfos.find(
      item => item.mvvLocationType === 'Offshore'
    )
    if (offshoreInfo) {
      param.offshore = {
        mvv: offshoreInfo.projectCode,
        businessVersion: offshoreInfo.id,
      }
    }
    if (onsiteInfo) {
      param.onsite = {
        mvv: onsiteInfo.projectCode,
        businessVersion: onsiteInfo.id,
      }
    }
    return await dispatch(postSubmitBaselineRevenuePlan(param))
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

    return await dispatch(saveDeliveryPlan(saveDeliveryPlanParams))
  }

  const handleCreateNewVersion = async () => {
    const res = await createNewVersion(match.params.buId)
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
    if (loadingSave) return

    setLoadingSave(true)
    const savedProjectCode = projectCode
    const savedViewMode = viewMode
    const savedActiveCollapse = activeCollapse
    const savedActiveTab = activeTab
    const savedSelectedMvvCode = selectedMvvCode
    skipViewModeReset.current = true

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
      (viewMode === 'Onsite' || viewMode === 'Offshore')
    ) {
      const sectionList = cloneDeep(originalBusinessPlanItems)
      sectionList.forEach(section => {
        section.rowLabels = section.rowLabels.filter(row => {
          if (row.label) return true
          if (row.cellList.some(item => item.editable && item.value !== null)) {
            return true
          }
          return false
        })
        section.rowLabels.forEach(function (row) {
          row.cellList = row.cellList.map(function (cell) {
            if (!cell.compareKey) return cell
            const c = Object.assign({}, cell)
            delete c.compareKey
            return c
          })
        })
      })
      const cleanColumnLabels = columnLabels.map(function (col) {
        if (!col.compareKey) return col
        const c = Object.assign({}, col)
        delete c.compareKey
        return c
      })
      params.businessPlanSectionDTO = {
        columnLabels: cleanColumnLabels,
        sectionList,
        businessPlanVersionId: businessPlanVersionId,
        projectCode: projectCode,
      }
    }

    const saved = await saveDraft(params)
    if (saved) {
      const res = await getBusinessPlanDetail(match.params.buId)

      if (res && res.payload && res.payload.data) {
        const infos = res.payload.data.generalInfos || []
        const targetCode = savedSelectedMvvCode || savedProjectCode
        if (targetCode) {
          const restoredInfo = infos.find(
            info => info.projectCode === targetCode
          )
          if (restoredInfo) {
            dispatch(setSelectedMvvCode(targetCode))
            dispatch(
              setContractPriceData({
                exchangeRate: restoredInfo.exchangeRate,
                softwareDevelopmentFee: restoredInfo.softwareDevelopmentFee,
                otherFees: restoredInfo.otherFees,
              })
            )
          }
        }
      }

      if (businessPlanVersionId && savedViewMode !== 'Total') {
        await getBusinessPlanDetailByViewMode(match.params.buId, {
          view: savedViewMode,
        })
      }
    }
    await fetchAllViewModesData(match.params.buId)
    await dispatch(getBusinessPlanHistory(match.params.buId))
    skipViewModeReset.current = false
    setViewMode(savedViewMode)
    setActiveCollapse(savedActiveCollapse)
    setActiveTab(savedActiveTab)
    setLoadingSave(false)
  }

  const handleCancel = () => {
    setVisible(true)
  }

  const handleConfirmCancel = async () => {
    setVisible(false)
    updateIsSaveShowed({ generalInformation: false, businessPlan: false })
    await getBusinessPlanDetail(match.params.buId)
    await fetchAllViewModesData(match.params.buId)
  }

  const handleDenyCancel = () => {
    setVisible(false)
  }

  const handleChangeTab = activeKey => {
    if (availableModes.length > 0 && !availableModes.includes(viewMode)) {
      const matchedInfo = generalInfos.find(
        info => info.projectCode === match.params.buId
      )
      const targetMode =
        matchedInfo && availableModes.includes(matchedInfo.mvvLocationType)
          ? matchedInfo.mvvLocationType
          : availableModes[0]
      setViewMode(targetMode)
    }

    setActiveTab(activeKey)
    dispatch(
      setActiveBusinessPlanPanel({
        activeKey,
      })
    )
  }

  // Load all 4 view modes in parallel when Business Plan tab is opened
  useEffect(() => {
    if (
      !match.params.buId ||
      !activeCollapse.includes('2') ||
      !activeTab.includes('1')
    )
      return
    fetchAllViewModesData(match.params.buId)
  }, [activeCollapse, match.params.buId, activeTab])

  // Switch active view mode from pre-loaded data (no API call)
  useEffect(() => {
    if (!viewMode) return
    dispatch(setActiveViewMode({ viewMode }))
  }, [viewMode])

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

    if (businessPlanVersionId) {
      const dataDelivery = {
        businessPlanVersionId: businessPlanVersionId,
        type: 'Delivery',
      }
      dispatch(getListDUByVersionDelivery(dataDelivery))

      const dataRevenue = {
        businessPlanVersionId: businessPlanVersionId,
        type: 'Revenue',
      }
      dispatch(getListDUByVersionRevenue(dataRevenue))
    }
  }, [businessPlanVersionId])

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
          projectCode={projectCode}
          startDate={startDate}
          endDate={endDate}
        />
        <StyledCollapse
          activeKey={activeCollapse}
          onChange={keys => setActiveCollapse(keys)}
          bordered={false}>
          <Panel
            key="1"
            header="General Information"
            style={customPanelStyle}
            forceRender={true}>
            <BusinessPlanGeneralInformation />
          </Panel>

          <Panel key="2" header="Business Plan" style={customPanelStyle}>
            <Spin spinning={loadingBusinessPlan}>
              <div className="business-plan-section">
                <Tabs
                  activeKey={activeTab}
                  animated={false}
                  destroyInactiveTabPane={false}
                  className="business-plan-section-tab"
                  onChange={handleChangeTab}>
                  <BusinessPlanTabWrapper
                    value={viewMode}
                    onChange={e => setViewMode(e.target.value)}
                    activeTab={activeTab}
                    availableModes={availableModes}
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
                    <BusinessPlanFormSection
                      handleChangeTab={handleChangeTab}
                      activeTab={activeTab}
                      viewMode={viewMode}
                    />
                  </BusinessPlanTabWrapper>
                  {listDuRevenue && listDuRevenue.length > 0 && (
                    <BusinessPlanTabWrapper
                      value={viewMode}
                      onChange={e => setViewMode(e.target.value)}
                      activeTab={activeTab}
                      availableModes={availableModes}
                      tab={
                        isSaveShowedDeliveryPlan ||
                        isSaveShowed.generalInformation ||
                        isSaveShowed.businessPlan ? (
                          <Tooltip
                            title={`You should save ${
                              isSaveShowed.generalInformation ||
                              isSaveShowed.businessPlan
                                ? 'Business Plan'
                                : 'Delivery Plan'
                            } before viewing other tabs`}>
                            <span>Revenue Plan</span>
                          </Tooltip>
                        ) : (
                          <span>Revenue Plan</span>
                        )
                      }
                      key="2"
                      disabled={
                        isSaveShowedDeliveryPlan ||
                        isSaveShowed.generalInformation ||
                        isSaveShowed.businessPlan
                      }>
                      {businessPlanVersionId && (
                        <BusinessPlanRevenue
                          businessVersion={businessPlanVersionId}
                          projectCode={projectCode}
                          status={statusProjectCode}
                          dataDu={listDuRevenue}
                          viewMode={viewMode}
                        />
                      )}
                    </BusinessPlanTabWrapper>
                  )}

                  {listDUDelivery && listDUDelivery.length > 0 && (
                    <BusinessPlanTabWrapper
                      value={viewMode}
                      onChange={e => setViewMode(e.target.value)}
                      activeTab={activeTab}
                      availableModes={availableModes}
                      tab={
                        isEditingRevenuePlan ||
                        isSaveShowed.generalInformation ||
                        isSaveShowed.businessPlan ? (
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
                      disabled={
                        isEditingRevenuePlan ||
                        isSaveShowed.generalInformation ||
                        isSaveShowed.businessPlan
                      }>
                      <BusinessPlanDelivery
                        ref={businessPlanDeliveryRef}
                        buId={businessPlanVersionId}
                        mvv={projectCode}
                        status={statusProjectCode}
                        dataDu={listDUDelivery}
                        viewMode={viewMode}
                      />
                    </BusinessPlanTabWrapper>
                  )}
                </Tabs>
              </div>
            </Spin>
          </Panel>

          {/*<Panel*/}
          {/*  key="3"*/}
          {/*  header="Documents"*/}
          {/*  style={customPanelStyle}*/}
          {/*  forceRender>*/}
          {/*  <BusinessPlanDocuments />*/}
          {/*</Panel>*/}
          {/*<Panel key="4" header="Activity" style={customPanelStyle}>*/}
          {/*  <BusinessPlanActivity />*/}
          {/*</Panel>*/}
        </StyledCollapse>
        <StyledAffix
          ref={affixRef}
          className={
            isSaveShowed.generalInformation || isSaveShowed.businessPlan
              ? 'active'
              : ''
          }>
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
