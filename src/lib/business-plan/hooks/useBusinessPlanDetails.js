import * as BusinessPlanAPI from '../businessPlanApiConfig'
import { useCallback } from 'react'
import { NotificationManager } from 'react-notifications'
import { useDispatch, useSelector } from 'react-redux'
import { ResponseStatusCode } from '../../service/constant'
import * as redux from '../redux'
import { getRowConfig } from '../constants'
import { getDisplayKey } from '../utils'
import moment from 'moment'
import { DateFormat } from '../../constants/DateFormat'

const useBusinessPlanDetails = () => {
  const dispatch = useDispatch()
  const {
    activePanel,
    loadingBusinessPlan,
    isSaveShowed,
    exchangeRate,
    totalContractPrice,
    version,
    originalBusinessPlanItems,
    columns,
    validation,
    listVersions,
    id,
    startDate,
    endDate,
    versionId,
    softwareDevelopmentFee,
    otherFees,
    warningMessage,
    errorMessage,
  } = useSelector(state => state.businessPlanDetails)

  const {
    listAM,
    listPreSale,
    listPreparator,
    listTeamLead,
    industryCurrency,
    industryDomain,
    listPM,
    listAdviser,
    businessPlanKpiDTO,
    businessPlanSettingMaxKpiSetting,
    planningStartDate,
    planningEndDate,
  } = useSelector(state => state.businessGeneralInformation)
  const { listDocuments } = useSelector(state => state.businessDocuments)
  const changeDataWithoutId = data => {
    return data.map(item => {
      const { id, startDate, endDate, ...otherParams } = item
      return {
        id: null,
        startDate: moment(startDate).format(DateFormat.YYYY_MM_DD),
        endDate: moment(endDate).format(DateFormat.YYYY_MM_DD),
        ...otherParams,
      }
    })
  }

  const handleReturnDataWithLdap = data => {
    return data.filter(item => item.ldap)
  }

  const generalInformationParams = {
    listAM: handleReturnDataWithLdap(changeDataWithoutId(listAM)),
    listTeamLead: handleReturnDataWithLdap(changeDataWithoutId(listTeamLead)),
    listPreSale: handleReturnDataWithLdap(changeDataWithoutId(listPreSale)),
    listPreparator: handleReturnDataWithLdap(
      changeDataWithoutId(listPreparator)
    ),
    listAdviser: handleReturnDataWithLdap(changeDataWithoutId(listAdviser)),
    listPM: handleReturnDataWithLdap(changeDataWithoutId(listPM)),
    currency: industryCurrency,
    exchangeRate,
    totalContractPrice,
    softwareDevelopmentFee,
    otherFees,
    industry: industryDomain,
    businessPlanKpiDTO: {
      ...businessPlanKpiDTO,
      businessPlanVersionId: versionId,
      id: (businessPlanKpiDTO && businessPlanKpiDTO.id) || null,
    },
    ...(planningStartDate && {
      planningStartDate: moment(planningStartDate).format(
        DateFormat.YYYY_MM_DD
      ),
    }),
    ...(planningEndDate && {
      planningEndDate: moment(planningEndDate).format(DateFormat.YYYY_MM_DD),
    }),
  }

  const getBusinessPlanDetail = useCallback(
    id => {
      return dispatch(redux.getBusinessPlanDetail(id))
    },
    [dispatch]
  )

  const getBusinessPlanDetailByViewMode = useCallback(
    (id, params) => {
      return dispatch(redux.getBusinessPlanDetailByViewMode({ id, params }))
    },
    [dispatch]
  )

  const updateIsSaveShowed = useCallback(
    value => {
      return dispatch(redux.setIsSaveShowed(value))
    },
    [dispatch]
  )

  const saveDraft = async params => {
    const isValid = handleValidateDraft()
    if (!isValid) return false

    const result = await BusinessPlanAPI.saveDraft(params)
    if (result.status === ResponseStatusCode.success) {
      NotificationManager.success(result.data)
      updateIsSaveShowed({ generalInformation: false, businessPlan: false })
      return result.data
    } else {
      updateIsSaveShowed({ generalInformation: false, businessPlan: false })
      return NotificationManager.error(result.message)
    }
  }

  const submit = async params => {
    const isValid = handleValidate()

    if (!isValid) return
    const result = await BusinessPlanAPI.submit(params)
    if (result.status === ResponseStatusCode.success) {
      NotificationManager.success(result.data)
      updateIsSaveShowed({ generalInformation: false, businessPlan: false })
      return result.data
    } else {
      updateIsSaveShowed({ generalInformation: false, businessPlan: false })
      return NotificationManager.error(result.message)
    }
  }

  const createNewVersion = async id => {
    const result = await BusinessPlanAPI.createNewVersion(id)
    if (result.status === ResponseStatusCode.success) {
      NotificationManager.success('Create successfully')
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }

  const setContractPriceData = useCallback(
    value => {
      return dispatch(redux.setContractPriceData(value))
    },
    [dispatch]
  )

  const handleCheckAtLeastOneFilled = data => {
    return data.some(obj => obj.ldap !== '')
  }

  const handleValidateKpiBonus = businessPlanKpiDTO => {
    if (!businessPlanKpiDTO)
      return {
        kpiPm: false,
        kpiQa: false,
        kpiMember: false,
      }

    const { kpiPm, kpiQa, kpiMember } = businessPlanKpiDTO
    return Object.fromEntries(
      Object.entries({ kpiPm, kpiQa, kpiMember }).map(([key, value]) => [
        key,
        value === null || value === undefined || value === '',
      ])
    )
  }

  const validateTotalKpiBonus = (businessPlanKpiDTO, total) => {
    if (!businessPlanKpiDTO) return false
    const { kpiPm, kpiQa, kpiMember } = businessPlanKpiDTO
    return (
      parseFloat(total) ===
      parseFloat(kpiPm || 0) +
        parseFloat(kpiQa || 0) +
        parseFloat(kpiMember || 0)
    )
  }

  const handleValidate = useCallback(() => {
    const itemsRes = originalBusinessPlanItems.reduce((res, section) => {
      const sectionRes = section.rowLabels.reduce((sectionRes, row) => {
        const rowKey = row.rowKey
        const rowRes = row.cellList.reduce((itemRes, item) => {
          const res = {}
          if (!row.label || !row.label.toString().trim())
            res[`${rowKey}-label`] = true
          if (
            item.editable &&
            item.value === null &&
            getRowConfig()[rowKey] &&
            getRowConfig()[rowKey].required
          ) {
            res[`${rowKey}-${getDisplayKey(item)}`] = true
          }
          return { ...itemRes, ...res }
        }, {})
        return { ...sectionRes, ...rowRes }
      }, {})
      return { ...res, ...sectionRes }
    }, {})

    const generalInformationResult = {
      industryCurrency: !industryCurrency ? true : false,
      exchangeRate:
        exchangeRate === null ||
        exchangeRate === undefined ||
        exchangeRate === ''
          ? true
          : false,
      totalContractPrice:
        totalContractPrice === null ||
        totalContractPrice === undefined ||
        totalContractPrice === ''
          ? true
          : false,
      otherFees:
        otherFees === null || otherFees === undefined || otherFees === ''
          ? true
          : false,
      softwareDevelopmentFee:
        softwareDevelopmentFee === null ||
        softwareDevelopmentFee === undefined ||
        softwareDevelopmentFee === ''
          ? true
          : false,
      listAM:
        listAM.length < 1 || !handleCheckAtLeastOneFilled(listAM)
          ? true
          : false,
      listTeamLead:
        listTeamLead.length < 1 || !handleCheckAtLeastOneFilled(listTeamLead)
          ? true
          : false,
      listPreparator:
        listPreparator.length < 1 ||
        !handleCheckAtLeastOneFilled(listPreparator)
          ? true
          : false,
      listPM:
        listPM.length < 1 || !handleCheckAtLeastOneFilled(listPM)
          ? true
          : false,
      industryDomain: !industryDomain ? true : false,
    }

    const resultValidateKPIBonus = handleValidateKpiBonus(
      businessPlanKpiDTO || {}
    )

    const result = {
      ...generalInformationResult,
      ...itemsRes,
      ...resultValidateKPIBonus,
    }

    dispatch(redux.setValidation(result))

    const totalKpiBonus = businessPlanSettingMaxKpiSetting
      ? businessPlanSettingMaxKpiSetting.MAX_BUSINESS_PLAN_KPI_TOTAL
      : 0

    const isValidGeneralInformation = Object.values({
      ...generalInformationResult,
      ...resultValidateKPIBonus,
    }).every(item => !item)

    const isValidBusinessPlan = Object.values(itemsRes).every(item => !item)

    const isValid = Object.values(result).every(item => !item)

    const isValidTotalKpiBonus = validateTotalKpiBonus(
      businessPlanKpiDTO,
      totalKpiBonus
    )

    if (!isValidGeneralInformation) {
      return NotificationManager.error(
        'Please input required fields in General Information'
      )
    }
    if (!isValidTotalKpiBonus) {
      return NotificationManager.error(
        `Total % Bonus must be ${totalKpiBonus}%`
      )
    }
    if (!isValidBusinessPlan) {
      return NotificationManager.error(
        'Please input required fields in Tab Business Plan'
      )
    }

    return isValid
  }, [
    dispatch,
    listAM.length,
    listPreparator.length,
    listTeamLead.length,
    totalContractPrice,
    exchangeRate,
    industryCurrency,
    handleCheckAtLeastOneFilled,
    businessPlanKpiDTO,
    businessPlanSettingMaxKpiSetting,
  ])

  const handleValidateDraft = useCallback(() => {
    const itemsRes = originalBusinessPlanItems.reduce((res, section) => {
      const sectionRes = section.rowLabels.reduce((sectionRes, row) => {
        const rowKey = row.rowKey
        const rowRes = {}
        if (row.cellList.some(item => item.editable && item.value !== null)) {
          if (!row.label || !row.label.toString().trim())
            rowRes[`${rowKey}-label`] = true
        }
        return { ...sectionRes, ...rowRes }
      }, {})
      return { ...res, ...sectionRes }
    }, {})

    const result = {
      ...itemsRes,
    }

    dispatch(redux.setValidation(result))

    const isValid = Object.values(result).every(item => !item)

    if (!isValid) {
      return NotificationManager.error('Please input required fields')
    }

    return isValid
  }, [
    dispatch,
    listAM.length,
    listPreparator.length,
    listTeamLead.length,
    totalContractPrice,
    exchangeRate,
    industryCurrency,
    handleCheckAtLeastOneFilled,
    businessPlanKpiDTO,
  ])

  const setValidation = useCallback(
    result => {
      dispatch(redux.setValidation(result))
    },
    [dispatch]
  )

  return {
    activePanel,
    loadingBusinessPlan,
    isSaveShowed,
    exchangeRate,
    totalContractPrice,
    updateIsSaveShowed,
    saveDraft,
    submit,
    getBusinessPlanDetail,
    getBusinessPlanDetailByViewMode,
    setContractPriceData,
    handleValidate,
    version,
    originalBusinessPlanItems,
    columns,
    setValidation,
    validation,
    listVersions,
    id,
    startDate,
    endDate,
    createNewVersion,
    versionId,
    generalInformationParams,
    listAM,
    listPreparator,
    softwareDevelopmentFee,
    otherFees,
    warningMessage,
    errorMessage,
  }
}

export default useBusinessPlanDetails
