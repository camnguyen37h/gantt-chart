import { checkRolePermission } from '../../../../components/common/checkRolePermission'
import {
  ActivityKeyConstants,
  SourceConstants,
} from '../../../constants/ActivityKeyConstants'
import { DatePicker, Form, Icon, Select, Table, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useBusinessPlanDetails } from '../../hooks'
import {
  getBusinessPlanSettingMaxKPI,
  getIndustryCurrency,
  getIndustryDomain,
  setValidation,
} from '../../redux'
import {
  handleChangeDateGeneralInfo,
  handleChangeInputValueCollaborator,
  setKpiBonusData,
  setSelectedMvvCode,
} from '../../redux/reducers/businessGeneralInformation'
import { CollaboratorSVG, industrySVG } from '../SVGIcon'
import CollaboratorBodyItem from './CollaboratorBodyItem'
import GeneralInformationHeader from './GeneralInformationHeader'
import IndustryItemInput from './IndustryItemInput'
import KpiBonusBodyItem from './KpiBonusBodyItem'
import { MEMBER_TYPE } from './data'
import { statusBusinessPlanDetail } from '../constant'
import moment from 'moment'
import { DateFormat } from '../../../constants/DateFormat'

const { Option } = Select

const BusinessPlanGeneralInformation = () => {
  const {
    setContractPriceData,
    exchangeRate: exchangeRateValue,
    totalContractPrice: totalContractPriceValue,
    softwareDevelopmentFee,
    otherFees,
    status,
    updateIsSaveShowed,
    startDate,
    endDate,
  } = useBusinessPlanDetails()

  // Mock user for demo - handle null localStorage
  const userPOA = JSON.parse(localStorage.getItem('userPOA')) || {
    userName: 'Demo User',
    userId: 1,
  }
  const { userName } = userPOA

  const dispatch = useDispatch()
  const {
    listGeneralInformation,
    generalInfos,
    selectedMvvCode,
    listDomain,
    listCurrency,
    loadingCollaborator,
    listAM,
    listAdviser,
    listPreSale,
    listPreparator,
    listTeamLead,
    industryDomain,
    industryCurrency,
    businessPlanKpiDTO,
    businessPlanSettingMaxKpiSetting,
    listPM,
    planningStartDate,
    planningEndDate,
  } = useSelector(state => state.businessGeneralInformation)

  const isEditInputDraft =
    (checkRolePermission(
      SourceConstants.BUSINESS_PLAN_DETAIL,
      ActivityKeyConstants.EDIT_BUSINESS_PLAN
    ) ||
      (listAM && listAM.some(p => p.ldap === userName)) ||
      (listPreparator && listPreparator.some(p => p.ldap === userName))) &&
    status === statusBusinessPlanDetail.draft

  const { validation } = useSelector(state => state.businessPlanDetails)

  const {
    businessPlanName,
    customerName,
    exchangeRate,
    orderType,
    recurringNew,
    totalContractPrice,
    cooperationPeriod,
    customerMarket,
  } = listGeneralInformation

  const { AM, TEAM_LEAD, ADVISER, PREPARATOR, PRESALE, PM } = MEMBER_TYPE

  const [paginationAM, setPaginationAM] = useState({
    current: 1,
    pageSize: 5,
    hideOnSinglePage: true,
  })
  const [paginationPM, setPaginationPM] = useState({
    current: 1,
    pageSize: 5,
    hideOnSinglePage: true,
  })
  const [paginationTeamlead, setPaginationTeamlead] = useState({
    current: 1,
    pageSize: 5,
    hideOnSinglePage: true,
  })
  const [paginationPresale, setPaginationPresale] = useState({
    current: 1,
    pageSize: 5,
    hideOnSinglePage: true,
  })
  const [paginationAdviser, setPaginationAdviser] = useState({
    current: 1,
    pageSize: 5,
    hideOnSinglePage: true,
  })

  const [paginationPreparator, setPaginationPreparator] = useState({
    current: 1,
    pageSize: 5,
    hideOnSinglePage: true,
  })

  const handleChangeInputValue = (value, fieldName) => {
    const result = {
      [fieldName]: false,
    }

    dispatch(
      handleChangeInputValueCollaborator({
        fieldName,
        value,
      })
    )

    dispatch(setValidation(result))

    updateIsSaveShowed(true)
  }

  const handleChangePlanningDate = (value, fieldName) => {
    const dateNameLabel =
      fieldName === 'Planning start date:'
        ? 'planningStartDate'
        : 'planningEndDate'
    const timestampValue = moment(value, 'DD/MM/YYYY').valueOf()
    dispatch(
      handleChangeDateGeneralInfo({
        dateNameLabel,
        value: timestampValue,
      })
    )
    updateIsSaveShowed(true)
  }

  const handleMvvChange = value => dispatch(setSelectedMvvCode(value))

  const collaboratorData = [
    {
      dataTable: listAM,
      title: 'AM Information',
      required: true,
      pagination: paginationAM,
      setPagination: setPaginationAM,
      titleColumn: 'AM',
      memberType: AM,
      isAdd: true,
      fieldName: 'listAM',
    },
    {
      dataTable: listPM,
      title: 'PM Information',
      required: true,
      pagination: paginationPM,
      setPagination: setPaginationPM,
      titleColumn: 'PM',
      memberType: PM,
      isAdd: true,
      fieldName: 'listPM',
    },
    {
      dataTable: listTeamLead,
      title: 'Teamlead Information',
      required: true,
      pagination: paginationTeamlead,
      setPagination: setPaginationTeamlead,
      titleColumn: 'Teamlead',
      memberType: TEAM_LEAD,
      isAdd: true,
      fieldName: 'listTeamLead',
    },
    {
      dataTable: listPreparator,
      title: 'Preparator Information',
      pagination: paginationPreparator,
      setPagination: setPaginationPreparator,
      isAdd: true,
      required: true,
      titleColumn: 'Preparator',
      memberType: PREPARATOR,
      fieldName: 'listPreparator',
    },
    {
      dataTable: listPreSale,
      title: 'Presale Information',
      required: false,
      pagination: paginationPresale,
      setPagination: setPaginationPresale,
      titleColumn: 'Presale',
      memberType: PRESALE,
      isAdd: true,
      fieldName: 'listPreSale',
    },
    {
      dataTable: listAdviser,
      title: 'Advisor Information',
      required: false,
      pagination: paginationAdviser,
      setPagination: setPaginationAdviser,
      titleColumn: 'Advisor',
      memberType: ADVISER,
      isAdd: true,
      fieldName: 'listAdviser',
    },
  ]

  useEffect(() => {
    dispatch(getIndustryDomain())
    dispatch(getIndustryCurrency())
    dispatch(getBusinessPlanSettingMaxKPI())
  }, [])

  useEffect(() => {
    setContractPriceData({ exchangeRate })
  }, [exchangeRate, totalContractPrice])

  useEffect(() => {
    setContractPriceData({ totalContractPrice })
  }, [totalContractPrice])

  const onChangeContractPriceInput = (value, key) => {
    setContractPriceData({ [key]: value })

    const result = {
      [key]: false,
    }
    dispatch(setValidation(result))
    if (value) updateIsSaveShowed(true)
  }

  const onChangeKpiBonusInput = (value, key) => {
    dispatch(
      setKpiBonusData({
        key,
        value,
      })
    )
    const validation = {
      [key]: false,
    }
    dispatch(setValidation(validation))
    if (!isNaN(value)) updateIsSaveShowed(true)
  }

  const handleRenderTooltip = () => {
    if (!isEditInputDraft) {
      if (status !== statusBusinessPlanDetail.draft) {
        return 'Cannot edit as the business plan is being reviewed'
      }
      return "You don't have permission to EDIT BUSINESS PLAN"
    }
    return null
  }

  const currencySelected = listCurrency.find(
    item => item.id === industryCurrency
  )

  const getTitle = currency => {
    let title = 'Total original contract price'
    if (currency) {
      title += ` (${currency})`
    }
    return title
  }

  const contractPriceInputConfig = [
    {
      key: 'exchangeRate',
      title: 'Exchange rate (VND)',
      value: exchangeRateValue,
      onChange: onChangeContractPriceInput,
    },
    {
      key: 'totalContractPrice',
      title: getTitle(currencySelected && currencySelected.currency),
      value: totalContractPriceValue,
      disabled: true,
    },
    {
      key: 'softwareDevelopmentFee',
      title: 'Software development fee',
      value: softwareDevelopmentFee,
      onChange: onChangeContractPriceInput,
      isSubItem: true,
    },
    {
      key: 'otherFees',
      title: 'Other fee',
      value: otherFees,
      onChange: onChangeContractPriceInput,
      isSubItem: true,
    },
  ]

  const informationItemData = [
    { label: 'Customer Name:', value: customerName },
    { label: 'Project Name:', value: businessPlanName },
    { label: 'Order Type:', value: orderType },
    { label: 'Recurring/New:', value: recurringNew },
    { label: 'Customer market:', value: customerMarket },
    { label: 'Cooperation period:', value: cooperationPeriod },
    ...(orderType && orderType !== 'T&M'
      ? [
          {
            label: 'Planning start date:',
            value: planningStartDate ? moment(planningStartDate) : null,
          },
          {
            label: 'Planning end date:',
            value: planningEndDate ? moment(planningEndDate) : null,
          },
        ]
      : []),
  ]

  const renderTooltipKpiBonus = KpiSetting => {
    return (
      <div>
        <div>{`Maximum % Bonus for QA is ${KpiSetting.MAX_BUSINESS_PLAN_KPI_QA}%`}</div>
        <div>{`Maximum % Bonus for PM is ${KpiSetting.MAX_BUSINESS_PLAN_KPI_PM}%`}</div>
        <div>{`Total % Bonus must be ${KpiSetting.MAX_BUSINESS_PLAN_KPI_TOTAL}%`}</div>
      </div>
    )
  }

  return (
    <div className="business-general-information">
      {generalInfos && generalInfos.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}>
          <Select
            value={selectedMvvCode}
            onChange={handleMvvChange}
            style={{ width: 200 }}
            placeholder="Select MVV">
            {generalInfos.map(info => (
              <Option key={info.projectCode} value={info.projectCode}>
                {info.projectCode}
              </Option>
            ))}
          </Select>
        </div>
      )}

      <Form>
        <div className="business-information-top">
          <div className="business-information-top-left">
            {informationItemData.map(item => {
              const isStartDate = item.label === 'Planning start date:'
              const isEndDate = item.label === 'Planning end date:'

              return (
                <div className="information-item" key={item.label}>
                  <div className="information-left">{item.label}</div>
                  <div
                    className={`information-right ${
                      isStartDate || isEndDate
                        ? 'custom-planning-date-information'
                        : ''
                    }`}>
                    {isStartDate || isEndDate ? (
                      <DatePicker
                        disabled={!isEditInputDraft}
                        className="custom-planning-date-picker"
                        value={item.value}
                        format={DateFormat.DATE_FORWARD_SLASH}
                        disabledDate={current => {
                          const startItem = informationItemData.find(function (
                            i
                          ) {
                            return i.label === 'Planning start date:'
                          })
                          const endItem = informationItemData.find(function (
                            i
                          ) {
                            return i.label === 'Planning end date:'
                          })

                          const start = startItem ? startItem.value : null
                          const end = endItem ? endItem.value : null

                          if (
                            item.label === 'Planning start date:' &&
                            startDate
                          ) {
                            return current && current > startDate
                          }

                          if (item.label === 'Planning end date:' && endDate) {
                            return current && current < endDate
                          }

                          return false
                        }}
                        onChange={(date, dateString) => {
                          handleChangePlanningDate(dateString, item.label)
                        }}
                      />
                    ) : (
                      <Tooltip title={item.value}>{item.value}</Tooltip>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="business-information-top-right">
            <div className="industry-input-group">
              <div className="business-industry-domain">
                <div className="industry-title">
                  <span>Industry</span>
                  <span className="required">*</span>
                </div>
                <div className="business-industry-select">
                  {validation['industryDomain'] && (
                    <span className="text-danger text-left d-block">
                      Please input required fields
                    </span>
                  )}
                  <Tooltip title={handleRenderTooltip()}>
                    <Select
                      value={industryDomain || undefined}
                      onChange={e =>
                        handleChangeInputValue(e, 'industryDomain')
                      }
                      className={`industry-select ${
                        validation['industryDomain'] && 'select-error'
                      }`}
                      size="small"
                      placeholder="Select industry"
                      disabled={!isEditInputDraft}>
                      {listDomain.map(item => (
                        <Option value={item.id} key={item.id}>
                          <Tooltip title={item.industry} key={item.id}>
                            {item.industry}
                          </Tooltip>
                        </Option>
                      ))}
                    </Select>
                  </Tooltip>
                </div>
              </div>

              <div className="industry-select-currency">
                <div className="industry-title">
                  <span>Currency</span>
                  <span className="required">*</span>
                </div>
                <div className="business-industry-select">
                  {validation['industryCurrency'] && (
                    <span className="text-danger text-left d-block">
                      Please input required fields
                    </span>
                  )}
                  <Tooltip title={handleRenderTooltip()}>
                    <Select
                      value={industryCurrency || undefined}
                      onChange={e =>
                        handleChangeInputValue(e, 'industryCurrency')
                      }
                      className={`industry-select ${
                        validation['industryCurrency'] && 'select-error'
                      }`}
                      size="small"
                      placeholder="Select currency"
                      disabled={!isEditInputDraft}>
                      {listCurrency.map(item => (
                        <Option value={item.id} key={item.id}>
                          {item.currency}
                        </Option>
                      ))}
                    </Select>
                  </Tooltip>
                </div>
              </div>
              {contractPriceInputConfig.map(item => (
                <IndustryItemInput
                  disabled={item.disabled}
                  title={item.title}
                  inputValue={item.value}
                  handleChangeInputValue={item.onChange}
                  key={item.key}
                  name={item.key}
                  isEditInput={isEditInputDraft}
                  validation={validation}
                  handleRenderTooltip={handleRenderTooltip}
                  isSubItem={item.isSubItem}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="business-collaborator mb-14">
          <GeneralInformationHeader
            component={CollaboratorSVG}
            title="Collaborator"
          />
          <div className="business-collaborator-body">
            {collaboratorData.map(data => (
              <CollaboratorBodyItem
                key={data.memberType}
                dataTable={data.dataTable}
                title={data.title}
                required={data.required}
                pagination={data.pagination}
                setPagination={data.setPagination}
                isAdd={data.isAdd}
                titleColumn={data.titleColumn}
                memberType={data.memberType}
                loadingCollaborator={loadingCollaborator}
                fieldName={data.fieldName}
                startDate={startDate}
                endDate={endDate}
              />
            ))}
          </div>
        </div>
        <div>
          <GeneralInformationHeader
            component={() => <Icon type="stock" theme="outlined" />}
            title={
              <span>
                % Bonus
                <span className="text-danger" style={{ fontSize: 16 }}>
                  *
                </span>
                {businessPlanSettingMaxKpiSetting && (
                  <Tooltip
                    title={renderTooltipKpiBonus(
                      businessPlanSettingMaxKpiSetting
                    )}>
                    <Icon
                      type="question-circle"
                      style={{ cursor: 'pointer' }}
                      className="ml-10"
                    />
                  </Tooltip>
                )}
              </span>
            }
          />
          <div className="d-flex gap-6 flex-wrap">
            <KpiBonusBodyItem
              businessPlanKpiDTO={businessPlanKpiDTO}
              canEdit={isEditInputDraft}
              onChangeKpiBonusInput={onChangeKpiBonusInput}
            />
          </div>
        </div>
      </Form>
    </div>
  )
}
export default BusinessPlanGeneralInformation
