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
  setIsSaveShowedDeliveryPlan,
  setValidation,
  setSelectedMvvCode,
  setContractPriceData,
} from '../redux'
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
  const { loadingCollaborator, generalInfos, mvvLocationTypeIdMap, selectedMvvCode } =
    useSelector(state => state.businessGeneralInformation)

  console.log('mvvLocationTypeIdMap = ', mvvLocationTypeIdMap)

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
        if (res.type.includes('fulfilled'))
          await getBusinessPlanWorkflow({
            referenceId: match.params.buId,
            mvv: res.payload ? res.payload.projectCode : null,
          })
      }
    })()
  }, [match.params.buId])

  useEffect(() => {
    if (
      generalInfos &&
      generalInfos.length > 0 &&
      match.params.buId &&
      viewMode
    ) {
      const currentMVV = generalInfos.find(
        info => info.id === Number(match.params.buId)
      )

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
  }, [viewMode])

  const statusProjectCode = useMemo(() => {
    return (generalInfos.find(item => item.id === businessPlanVersionId) || [])
      .status
  }, [viewMode])

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

    const params = generalInfos
      .filter(info => info.mvvLocationType && info.mvvLocationType !== 'Total')
      .reduce((acc, info) => {
        const key = info.mvvLocationType.toLowerCase() // 'offshore' | 'onsite'
        const {
          listAM = [],
          listTeamLead = [],
          listPreSale = [],
          listPreparator = [],
          listAdviser = [],
          listPM = [],
          currency,
          exchangeRate,
          totalContractPrice,
          softwareDevelopmentFee,
          otherFees,
          industry,
          businessPlanKpiDTO,
        } = info
        acc[key] = {
          businessPlanVersionId: info.id,
          generalInformation: {
            listAM,
            listTeamLead,
            listPreSale,
            listPreparator,
            listAdviser,
            listPM,
            currency,
            exchangeRate,
            totalContractPrice,
            softwareDevelopmentFee,
            otherFees,
            industry,
            businessPlanKpiDTO,
          },
        }
        return acc
      }, {})

    const isSubmit = await submit(params)

    if (isSubmit) {
      await getBusinessPlanDetail(match.params.buId)
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
    // Capture current MVV code before any reload resets state
    const savedProjectCode = projectCode
    const savedViewMode = viewMode

    const params = {
      generalInformation: {
        ...generalInformationParams,
        businessPlanVersionId: businessPlanVersionId,
        projectCode: projectCode,
      },
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
      })
      params.businessPlanSectionDTO = {
        columnLabels,
        sectionList,
        businessPlanVersionId: businessPlanVersionId,
        projectCode: projectCode,
      }
    }

    const saved = await saveDraft(params)
    if (saved) {
      // Refresh General Information
      const res = await getBusinessPlanDetail(match.params.buId)

      // Restore the MVV the user was on before reload (getBusinessPlanDetail
      // resets selectedMvvCode to the API default projectCode)
      if (res && res.payload && res.payload.data) {
        const defaultProjectCode = res.payload.data.projectCode
        if (savedProjectCode && savedProjectCode !== defaultProjectCode) {
          const infos = res.payload.data.generalInfos || []
          const restoredInfo = infos.find(
            info => info.projectCode === savedProjectCode
          )
          if (restoredInfo) {
            dispatch(setSelectedMvvCode(savedProjectCode))
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

      // Refresh Business Plan form data
      if (businessPlanVersionId && savedViewMode !== 'Total') {
        await getBusinessPlanDetailByViewMode(match.params.buId, {
          view: savedViewMode,
        })
      }
    }

    await dispatch(getBusinessPlanHistory(match.params.buId))
    setLoadingSave(false)
  }

  const handleCancel = () => {
    setVisible(true)
  }

  const handleConfirmCancel = async () => {
    setVisible(false)
    updateIsSaveShowed({ generalInformation: false, businessPlan: false })
    await getBusinessPlanDetail(match.params.buId)
  }

  const handleDenyCancel = () => {
    setVisible(false)
  }

  const handleChangeTab = activeKey => {
    setActiveTab(activeKey)
    // Revenue Plan (tab 2) and Delivery Plan (tab 3) require a valid sub-version.
    // If currently on Total/OB mode, resolve the correct mode from selectedMvvCode.
    if (
      activeKey !== '1' &&
      availableModes.length > 0 &&
      !availableModes.includes(viewMode)
    ) {
      const matchedInfo = generalInfos.find(
        info => info.projectCode === selectedMvvCode
      )
      const targetMode =
        matchedInfo && availableModes.includes(matchedInfo.mvvLocationType)
          ? matchedInfo.mvvLocationType
          : availableModes[0]
      setViewMode(targetMode)
    }
    dispatch(
      setActiveBusinessPlanPanel({
        activeKey,
      })
    )
  }

  useEffect(() => {
    if (
      !match.params.buId ||
      !viewMode ||
      !activeCollapse.includes('2') ||
      !activeTab.includes('1')
    )
      return

    getBusinessPlanDetailByViewMode(match.params.buId, {
      view: viewMode,
    })
  }, [viewMode, activeCollapse, match.params.buId])

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
