import { createSlice } from '@reduxjs/toolkit'
import {
  getBusinessPlanSettingMaxKPI,
  getIndustryCurrency,
  getIndustryDomain,
  getUserAndDepartmentCollaborator,
} from '../asyncThunks/businessGeneralInformation'

import { getBusinessPlanDetail } from '../asyncThunks'

export const businessGeneralInformationSlice = createSlice({
  name: 'businessGeneralInformation',
  initialState: {
    listGeneralInformation: {},
    listDomain: [],
    listCurrency: [],
    listUsername: [],
    loadingCollaborator: false,
    listAM: [],
    listAdviser: [],
    listPreSale: [],
    listPreparator: [],
    listTeamLead: [],
    listPM: [],
    industryDomain: null,
    industryCurrency: null,
    businessPlanKpiDTO: null,
    planningStartDate: undefined,
    planningEndDate: undefined,
    businessPlanSettingMaxKpiSetting: null
  },
  reducers: {
    setDataTableCollaborator: (state, action) => {
      const { fieldName, dataClone } = action.payload

      state[fieldName] = [...dataClone]
    },
    handleAddItemCollaborator: (state, action) => {
      const { fieldName, dataClone, newItem } = action.payload
      state[fieldName] = [...dataClone, newItem]
    },
    handleDeleteItemCollaborator: (state, action) => {
      const { fieldName, dataClone, id } = action.payload
      state[fieldName] = dataClone.filter(item => item.id !== id)
    },
    handleChangeInputValueCollaborator: (state, action) => {
      const { value, fieldName } = action.payload
      state[fieldName] = value
    },
    handleChangeDateGeneralInfo: (state, action) => {
      const { value, dateNameLabel } = action.payload
      state[dateNameLabel] = value
    },
    setKpiBonusData: (state, { payload }) => {
      const { key, value } = payload
      state.businessPlanKpiDTO = {
        ...state.businessPlanKpiDTO,
        [key]: value
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(getBusinessPlanDetail.pending, (state, action) => {
      state.loadingCollaborator = true
    })

    builder.addCase(getBusinessPlanDetail.fulfilled, (state, action) => {
      state.loadingCollaborator = false
      const { data } = action.payload || {}

      if (!data) {
        return
      }
      state.listGeneralInformation = data.generalInfo
      state.listAM = data.generalInfo.listAM
      state.listAdviser = data.generalInfo.listAdviser
      state.listPreSale = data.generalInfo.listPreSale
      state.listPreparator = data.generalInfo.listPreparator
      state.listTeamLead = data.generalInfo.listTeamLead
      state.listPM = data.generalInfo.listPM
      state.industryDomain = data.generalInfo.industry
      state.industryCurrency = data.generalInfo.currency
      state.businessPlanKpiDTO = data.generalInfo.businessPlanKpiDTO
      state.planningStartDate = data.generalInfo.planningStartDate
      state.planningEndDate = data.generalInfo.planningEndDate
    })

    builder.addCase(getBusinessPlanDetail.rejected, (state, action) => {
      state.loadingCollaborator = false
    })

    builder.addCase(getIndustryDomain.fulfilled, (state, action) => {
      state.listDomain = action.payload || []
    })

    builder.addCase(getIndustryCurrency.fulfilled, (state, action) => {
      state.listCurrency = action.payload || []
    })

    builder.addCase(getBusinessPlanSettingMaxKPI.fulfilled, (state, { payload }) => {
      state.businessPlanSettingMaxKpiSetting = payload
        ? payload.reduce(
          (
            acc,
            {
              settingConfigKey,
              value
            }
          ) => {
            acc[settingConfigKey] = value;
            return acc;
          }, {}
        )
        : null
    })

    builder.addCase(
      getUserAndDepartmentCollaborator.fulfilled,
      (state, action) => {
        state.listUsername = action.payload || []
      }
    )
  },
})

export const {
  setDataTableCollaborator,
  handleAddItemCollaborator,
  handleDeleteItemCollaborator,
  handleChangeInputValueCollaborator,
  handleChangeDateGeneralInfo,
  setKpiBonusData
} = businessGeneralInformationSlice.actions

export default businessGeneralInformationSlice.reducer
