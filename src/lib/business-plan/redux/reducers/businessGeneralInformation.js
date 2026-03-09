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
    generalInfos: [],
    selectedMvvCode: null,
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
    setSelectedMvvCode: (state, action) => {
      state.selectedMvvCode = action.payload
      // Update listGeneralInformation based on selected MVV
      const selectedInfo = state.generalInfos.find(info => info.projectCode === action.payload)
      if (selectedInfo) {
        state.listGeneralInformation = selectedInfo
        state.listAM = selectedInfo.listAM || []
        state.listAdviser = selectedInfo.listAdviser || []
        state.listPreSale = selectedInfo.listPreSale || []
        state.listPreparator = selectedInfo.listPreparator || []
        state.listTeamLead = selectedInfo.listTeamLead || []
        state.listPM = selectedInfo.listPM || []
        state.industryDomain = selectedInfo.industry
        state.industryCurrency = selectedInfo.currency
        state.businessPlanKpiDTO = selectedInfo.businessPlanKpiDTO
        state.planningStartDate = selectedInfo.planningStartDate
        state.planningEndDate = selectedInfo.planningEndDate
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

      // Store all generalInfos
      state.generalInfos = data.generalInfos || []

      // Set selected MVV to match the business plan id (from URL)
      // Priority: data.projectCode from API response (already matched in mock)
      state.selectedMvvCode = data.projectCode

      // Get the selected general info (matching projectCode)
      const selectedInfo = state.generalInfos.find(
        info => info.projectCode === state.selectedMvvCode
      ) || state.generalInfos[0]

      if (selectedInfo) {
        state.listGeneralInformation = selectedInfo
        state.listAM = selectedInfo.listAM || []
        state.listAdviser = selectedInfo.listAdviser || []
        state.listPreSale = selectedInfo.listPreSale || []
        state.listPreparator = selectedInfo.listPreparator || []
        state.listTeamLead = selectedInfo.listTeamLead || []
        state.listPM = selectedInfo.listPM || []
        state.industryDomain = selectedInfo.industry
        state.industryCurrency = selectedInfo.currency
        state.businessPlanKpiDTO = selectedInfo.businessPlanKpiDTO
        state.planningStartDate = selectedInfo.planningStartDate
        state.planningEndDate = selectedInfo.planningEndDate
      }
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
  setKpiBonusData,
  setSelectedMvvCode
} = businessGeneralInformationSlice.actions

export default businessGeneralInformationSlice.reducer
