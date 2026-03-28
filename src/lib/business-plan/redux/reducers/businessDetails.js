import { createSlice } from '@reduxjs/toolkit'
import cloneDeep from 'lodash/cloneDeep'
import {
  getBusinessPlanDetail,
  getBusinessPlanDetailByViewMode,
  getCompareBusinessPlanDetail,
  getSummaryRevenuePlan,
  fetchAllViewModesData,
} from '../asyncThunks'
import {
  applyViewModeEntry,
  buildViewModeEntry,
  normalizeColumnKeys,
} from '../../utils'

const initialState = {
  isSaveShowed: { generalInformation: false, businessPlan: false },
  businessPlanItems: {},
  columns: [],
  exchangeRate: null,
  totalContractPrice: null,
  softwareDevelopmentFee: null,
  otherFees: null,
  viewMode: null,
  ratesByLocationType: {},
  generalInfos: [],
  validation: {},
  version: null,
  originalBusinessPlanItems: [],
  compareBusinessPlanItems: null,
  compareColumnLabels: null,
  listVersions: [],
  startDate: '',
  endDate: '',
  versionId: null,
  warningMessage: null,
  activePanel: '',
  deliveryUnitDataDelivery: {},
  loadingBusinessPlan: false,
  viewModeDataMap: {},
}

const businessDetailsSlice = createSlice({
  name: 'businessDetails',
  initialState,
  reducers: {
    setIsSaveShowed: (state, action) => {
      state.isSaveShowed = { ...state.isSaveShowed, ...action.payload }
    },
    setBusinessPlanItems: (state, { payload }) => {
      state.businessPlanItems = payload
    },
    setBusinessPlanItem: (state, { payload }) => {
      const { businessPlanItems, originalBusinessPlanItems } = state
      const { item } = payload
      const { rowKey, sectionKey, columnKey, ...otherProps } = item

      const tempItems = cloneDeep(businessPlanItems)
      const tempOGItems = cloneDeep(originalBusinessPlanItems)

      const index = tempItems[sectionKey].data[rowKey].data.findIndex(
        obj => obj.columnKey === item.columnKey
      )

      const sectionIndex = tempOGItems.findIndex(
        item => item.sectionKey === sectionKey
      )
      const rowIndex =
        sectionIndex < 0
          ? -1
          : tempOGItems[sectionIndex].rowLabels.findIndex(
              item => item.rowKey === rowKey
            )
      const cellIndex =
        rowIndex < 0
          ? -1
          : tempOGItems[sectionIndex].rowLabels[rowIndex].cellList.findIndex(
              item => item.columnKey === columnKey
            )

      if (index > -1)
        state.businessPlanItems[sectionKey].data[rowKey].data[index] = item

      if (sectionIndex > -1 && cellIndex > -1 && rowIndex > -1) {
        state.originalBusinessPlanItems[sectionIndex].rowLabels[
          rowIndex
        ].cellList[cellIndex] = { ...otherProps, columnKey, rowKey }
      }
    },

    addBusinessPlanRow: (state, { payload }) => {
      const { businessPlanItems, originalBusinessPlanItems } = state
      const { sectionKey, rowKey, row } = payload
      const tempOGItems = cloneDeep(originalBusinessPlanItems)

      state.businessPlanItems[sectionKey].data[rowKey] = row
      const sectionIndex = tempOGItems.findIndex(
        item => item.sectionKey === sectionKey
      )

      const ogRow = {
        label: '',
        rowKey,
        cellList: row.data.map(({ sectionKey, ...item }) => item),
      }

      state.originalBusinessPlanItems[sectionIndex].rowLabels.push(ogRow)
    },

    updateBusinessPlanRow: (state, { payload }) => {
      const { businessPlanItems, originalBusinessPlanItems } = state
      const { sectionKey, rowKey, row } = payload
      const tempOGItems = cloneDeep(originalBusinessPlanItems)

      state.businessPlanItems[sectionKey].data[rowKey] = row
      const sectionIndex = tempOGItems.findIndex(
        item => item.sectionKey === sectionKey
      )
      const rowIndex =
        sectionIndex < 0
          ? -1
          : tempOGItems[sectionIndex].rowLabels.findIndex(
              item => item.rowKey === rowKey
            )

      state.originalBusinessPlanItems[sectionIndex].rowLabels[rowIndex] = {
        label: row.title,
        rowKey,
        cellList: row.data.map(({ sectionKey, ...item }) => item),
      }
    },

    deleteBusinessPlanRow: (state, { payload }) => {
      const { businessPlanItems, originalBusinessPlanItems } = state
      const { rowKey, sectionKey } = payload
      const tempOGItems = cloneDeep(originalBusinessPlanItems)
      const cloneSection = cloneDeep(businessPlanItems[sectionKey])

      delete cloneSection.data[rowKey]

      state.businessPlanItems[sectionKey].data = cloneSection.data

      const sectionIndex = tempOGItems.findIndex(
        item => item.sectionKey === sectionKey
      )
      const rowIndex =
        sectionIndex < 0
          ? -1
          : tempOGItems[sectionIndex].rowLabels.findIndex(
              item => item.rowKey === rowKey
            )
      tempOGItems[sectionIndex].rowLabels.splice(rowIndex, 1)

      state.originalBusinessPlanItems = tempOGItems
    },

    setContractPriceData: (state, { payload }) => {
      const {
        exchangeRate,
        softwareDevelopmentFee,
        otherFees,
        mvvLocationType,
      } = payload

      if (exchangeRate !== undefined && exchangeRate !== null)
        state.exchangeRate = exchangeRate
      if (
        softwareDevelopmentFee !== undefined &&
        softwareDevelopmentFee !== null
      )
        state.softwareDevelopmentFee = softwareDevelopmentFee
      if (otherFees !== undefined && otherFees !== null)
        state.otherFees = otherFees
      state.totalContractPrice =
        (state.softwareDevelopmentFee || 0) + (state.otherFees || 0)

      if (mvvLocationType && state.ratesByLocationType[mvvLocationType]) {
        const updates = { exchangeRate, softwareDevelopmentFee, otherFees }
        Object.keys(updates).forEach(key => {
          if (updates[key] !== undefined && updates[key] !== null)
            state.ratesByLocationType[mvvLocationType][key] = updates[key]
        })
      }
    },

    setValidation: (state, { payload }) => {
      state.validation = { ...state.validation, ...payload }
    },

    resetValidation: state => {
      state.validation = {}
    },

    clearCompareBusinessPlan: state => {
      state.compareBusinessPlanItems = null
      state.compareColumnLabels = null
    },

    setActiveBusinessPlanPanel: (state, { payload }) => {
      const { activeKey } = payload
      state.activePanel =
        activeKey === '2' ? 'Revenue' : activeKey === '3' ? 'Delivery' : ''
    },

    setActiveViewMode: (state, { payload }) => {
      const { viewMode } = payload
      state.viewMode = viewMode
      const entry = state.viewModeDataMap[viewMode]
      if (!entry) return
      applyViewModeEntry(state, entry, viewMode)
    },
  },
  extraReducers: builder => {
    builder.addCase(getBusinessPlanDetail.fulfilled, (state, { payload }) => {
      const { data } = payload || {}

      if (!data) return

      state.listVersions = data.versions || []
      state.version = data.version
      state.versionId = data.id
      state.startDate = data.startDate
      state.endDate = data.endDate
      state.warningMessage = data.warningMessage

      state.generalInfos = data.generalInfos || []

      const ratesByLocationType = {}
      if (data.generalInfos && data.generalInfos.length > 0) {
        data.generalInfos.forEach(function (info) {
          if (info.mvvLocationType) {
            ratesByLocationType[info.mvvLocationType] = {
              exchangeRate: info.exchangeRate,
              softwareDevelopmentFee: info.softwareDevelopmentFee,
              otherFees: info.otherFees,
            }
          }
        })
      }
      state.ratesByLocationType = ratesByLocationType

      const selectedGeneralInfo =
        data.generalInfos && data.generalInfos.length > 0
          ? data.generalInfos.find(
              info => info.projectCode === data.projectCode
            ) || data.generalInfos[0]
          : null

      if (selectedGeneralInfo) {
        state.exchangeRate = selectedGeneralInfo.exchangeRate
        state.totalContractPrice = selectedGeneralInfo.totalContractPrice
        state.softwareDevelopmentFee =
          selectedGeneralInfo.softwareDevelopmentFee
        state.otherFees = selectedGeneralInfo.otherFees
      }
    })

    builder.addCase(getBusinessPlanDetailByViewMode.pending, state => {
      state.loadingBusinessPlan = true
    })

    builder.addCase(
      getBusinessPlanDetailByViewMode.fulfilled,
      (state, action) => {
        state.loadingBusinessPlan = false
        const { data, errorMessage } = action.payload || {}
        const viewModeFromAction =
          action.meta &&
          action.meta.arg &&
          action.meta.arg.params &&
          action.meta.arg.params.view
        if (!data) return

        const entry = buildViewModeEntry(data, viewModeFromAction)
        state.viewModeDataMap = {
          ...state.viewModeDataMap,
          [viewModeFromAction]: entry,
        }
        applyViewModeEntry(state, entry, viewModeFromAction)
        state.version = data.version
        state.warningMessage = data.warningMessage
        state.errorMessage = errorMessage
      }
    )

    builder.addCase(getBusinessPlanDetailByViewMode.rejected, state => {
      state.loadingBusinessPlan = false
    })

    builder.addCase(fetchAllViewModesData.pending, state => {
      state.loadingBusinessPlan = true
    })

    builder.addCase(fetchAllViewModesData.fulfilled, (state, { payload }) => {
      state.loadingBusinessPlan = false
      const viewModeDataMap = Object.keys(payload).reduce(function (acc, view) {
        const rawData = payload[view]
        if (rawData) {
          acc[view] = buildViewModeEntry(rawData, view)
        }
        return acc
      }, {})
      state.viewModeDataMap = viewModeDataMap

      const activeViewMode = state.viewMode
      if (activeViewMode && viewModeDataMap[activeViewMode]) {
        applyViewModeEntry(
          state,
          viewModeDataMap[activeViewMode],
          activeViewMode
        )
        const activeRawData = payload[activeViewMode]
        if (activeRawData) {
          state.version = activeRawData.version
          state.warningMessage = activeRawData.warningMessage
        }
      }
    })

    builder.addCase(fetchAllViewModesData.rejected, state => {
      state.loadingBusinessPlan = false
    })

    builder.addCase(getCompareBusinessPlanDetail.pending, state => {
      state.loadingBusinessPlan = true
    })

    builder.addCase(
      getCompareBusinessPlanDetail.fulfilled,
      (state, { payload }) => {
        state.loadingBusinessPlan = false
        const {
          columnLabels: compareColumnLabels,
          sectionList: compareSectionList,
        } = normalizeColumnKeys(
          payload.columnLabels || [],
          payload.sectionList || []
        )
        state.compareColumnLabels = compareColumnLabels || null
        state.compareBusinessPlanItems = compareSectionList.reduce(
          (res, cur) => {
            res[cur.sectionKey] = {
              title: cur.sectionTitle,
              data: cur.rowLabels.reduce((rowRes, rowCur) => {
                rowRes[rowCur.rowKey] = {
                  title: rowCur.label,
                  data: rowCur.cellList.map(item => ({
                    ...item,
                    sectionKey: cur.sectionKey,
                  })),
                }
                return rowRes
              }, {}),
            }
            return res
          },
          {}
        )
      }
    )

    builder.addCase(getCompareBusinessPlanDetail.rejected, state => {
      state.loadingBusinessPlan = false
    })

    builder.addCase(getSummaryRevenuePlan.pending, (state, { payload }) => {
      state.loadingBusinessPlan = true
    })

    builder.addCase(getSummaryRevenuePlan.fulfilled, (state, { payload }) => {
      state.loadingBusinessPlan = false
    })

    builder.addCase(getSummaryRevenuePlan.rejected, (state, action) => {
      state.loadingBusinessPlan = false
    })
  },
})

export const {
  setIsSaveShowed,
  setBusinessPlanItem,
  setBusinessPlanItems,
  setContractPriceData,
  setValidation,
  resetValidation,
  addBusinessPlanRow,
  updateBusinessPlanRow,
  deleteBusinessPlanRow,
  clearCompareBusinessPlan,
  setVersion,
  setActiveBusinessPlanPanel,
  setActiveViewMode,
} = businessDetailsSlice.actions

export default businessDetailsSlice.reducer
