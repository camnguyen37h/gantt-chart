import { ResponseStatusCode } from '@/service/constant'
import { createSlice } from '@reduxjs/toolkit'
import {
  API_TYPE,
  REVENUE_TYPE_ORIGIN,
  SELLING_TYPE_ORIGIN,
} from '../../constants'
import {
  getBusinessPlanOtherRevenue,
  getBusinessPlanSellingExpenses,
  getListDUByVersionRevenue,
  getPositionRevenuePlan,
  getSummaryRevenuePlan,
  postBusinessPlanOtherRevenue,
  postSubmitBaselineRevenuePlan,
} from '../asyncThunks/businessPlanRevenue'

const initialState = {
  dataSourceTableRevenue: undefined,
  errorMessage: '',
  isLoading: false,
  isSaveConfirmShowed: false,
  updateOtherRevenuesData: [],
  deleteOtherRevenuesData: [],
  createOtherRevenuesData: [],
  isUpdated: 0,

  dataSourceTableSellingExpenses: undefined,
  updateSellingExpensesData: [],
  deleteSellingExpensesData: [],
  createSellingExpensesData: [],

  isUpdatedSellingExpenses: 0,
  isLoadingSellingExpenses: false,

  filtersRevenue: {},
  dataFilterPosition: [],
  isLoadingFilterPosition: false,

  isSubmitBaseline: 0,
  listRevenueInvalid: [],

  summaryRevenuePlan: {
    mmBill: '',
    softwareProductionRevenues: '',
    deduction: '',
    onsiteFee: '',
    equipmentRevenue: '',
    otherRevenues: '',
    agencyExpenses: '',
    loading: false,
  },

  listDuRevenue: [],
  deliveryUnitDataRevenue: {},
  duValueRevenue: undefined,
}

const businessPlanRevenueSlice = createSlice({
  name: 'businessPlanRevenue',
  initialState,
  reducers: {
    setIsSaveConfirmShowed: (state, action) => {
      state.isSaveConfirmShowed = action.payload
    },
    setListRevenueInvalid: (state, action) => {
      state.listRevenueInvalid = action.payload
    },
    resetSummaryRevenuePlan: state => {
      state.summaryRevenuePlan = {
        mmBill: '',
        softwareProductionRevenues: '',
        deduction: '',
        onsiteFee: '',
        equipmentRevenue: '',
        otherRevenues: '',
        agencyExpenses: '',
        loading: false,
      }
    },
    // Other revenues
    setUpdateOtherRevenuesData: (state, action) => {
      const updatedRow = action.payload
      const existingIndex = state.updateOtherRevenuesData.findIndex(
        row => row.revenueTypeSpecificId === updatedRow.revenueTypeSpecificId
      )

      if (existingIndex !== -1) {
        state.updateOtherRevenuesData[existingIndex] = updatedRow
      } else {
        state.updateOtherRevenuesData.push(updatedRow)
      }
    },
    setDeleteOtherRevenuesData: (state, action) => {
      if (String(action.payload).includes('new')) {
        state.createOtherRevenuesData = state.createOtherRevenuesData.filter(
          item => item.key !== action.payload
        )
      } else {
        const removedDataId = action.payload
        const existingIndex =
          state.deleteOtherRevenuesData.indexOf(removedDataId)

        if (existingIndex === -1) {
          state.deleteOtherRevenuesData = [
            ...state.deleteOtherRevenuesData,
            removedDataId,
          ]
        }
      }
    },
    setCreateOtherRevenuesData: (state, action) => {
      const { key, field, month, value } = action.payload
      const existingIndex = state.createOtherRevenuesData.findIndex(row => {
        return row.key === key
      })
      let newData = [...state.createOtherRevenuesData]
      const revenueTypeIdParent = Number(key.split('-')[2])
      if (existingIndex === -1) {
        const indexItemAdded = Number(key.split('-')[3])
        const newRow = {
          key,
          revenueTypeId: revenueTypeIdParent,
          revenueTypeSpecificId: indexItemAdded,
          revenueName: field === 'revenueName' ? value : '',
          total: '',
          revenueDetails: month
            ? [
                {
                  month: parseInt(month.split('-')[0]),
                  year: parseInt(month.split('-')[1]),
                  date: month,
                  value,
                },
              ]
            : [],
        }
        newData.push(newRow)
      } else {
        newData = newData.map((row, idx) => {
          if (idx === existingIndex) {
            return {
              ...row,
              [field]:
                field === 'revenueDetails'
                  ? value
                    ? [
                        ...row.revenueDetails.filter(d => d.date !== month),
                        {
                          revenueTypeId: revenueTypeIdParent,
                          month: parseInt(month.split('-')[0]),
                          year: parseInt(month.split('-')[1]),
                          date: month,
                          value,
                        },
                      ]
                    : row.revenueDetails.filter(d => d.date !== month)
                  : value,
            }
          }
          return row
        })
      }
      state.createOtherRevenuesData = newData
    },
    setFiltersRevenue: (state, action) => {
      state.filtersRevenue = action.payload
    },
    setIsLoadingOtherRevenues: (state, action) => {
      state.isLoading = action.payload
    },

    // Selling expenses
    setUpdateSellingExpensesData: (state, action) => {
      const updatedRow = action.payload
      const existingIndex = state.updateSellingExpensesData.findIndex(
        row => row.revenueTypeSpecificId === updatedRow.revenueTypeSpecificId
      )

      if (existingIndex !== -1) {
        state.updateSellingExpensesData[existingIndex] = updatedRow
      } else {
        state.updateSellingExpensesData.push(updatedRow)
      }
    },
    setDeleteSellingExpensesData: (state, action) => {
      if (String(action.payload).includes('new')) {
        state.createOtherRevenuesData = state.createOtherRevenuesData.filter(
          item => item.key !== action.payload
        )
      } else {
        const removedDataId = action.payload
        const existingIndex =
          state.deleteSellingExpensesData.indexOf(removedDataId)

        if (existingIndex === -1) {
          state.deleteSellingExpensesData = [
            ...state.deleteSellingExpensesData,
            removedDataId,
          ]
        }
      }
    },
    setCreateSellingExpensesData: (state, action) => {
      const { key, field, month, value } = action.payload
      const existingIndex = state.createSellingExpensesData.findIndex(row => {
        return row.key === key
      })
      let newData = [...state.createSellingExpensesData]
      const revenueTypeIdParent = Number(key.split('-')[2])
      if (existingIndex === -1) {
        const indexItemAdded = Number(key.split('-')[3])
        const newRow = {
          key,
          revenueTypeId: revenueTypeIdParent,
          revenueTypeSpecificId: indexItemAdded,
          revenueName: field === 'revenueName' ? value : '',
          total: '',
          revenueDetails: month
            ? [
                {
                  month: parseInt(month.split('-')[0]),
                  year: parseInt(month.split('-')[1]),
                  date: month,
                  value,
                },
              ]
            : [],
        }
        newData.push(newRow)
      } else {
        newData = newData.map((row, idx) => {
          if (idx === existingIndex) {
            return {
              ...row,
              [field]:
                field === 'revenueDetails'
                  ? value
                    ? [
                        ...row.revenueDetails.filter(d => d.date !== month),
                        {
                          revenueTypeId: revenueTypeIdParent,
                          month: parseInt(month.split('-')[0]),
                          year: parseInt(month.split('-')[1]),
                          date: month,
                          value,
                        },
                      ]
                    : row.revenueDetails.filter(d => d.date !== month)
                  : value,
            }
          }
          return row
        })
      }
      state.createSellingExpensesData = newData
    },
    setDeliveryUnitDataRevenue: (state, { payload }) => {
      state.deliveryUnitDataRevenue = payload
    },
    setDuValueRevenue: (state, { payload }) => {
      state.duValueRevenue = payload
    },
    setIsLoadingSellingExpenses: (state, action) => {
      state.isLoadingSellingExpenses = action.payload
    },
  },
  extraReducers: builder => {
    // GET getBusinessPlanOtherRevenue
    builder.addCase(
      getBusinessPlanOtherRevenue.pending,
      (state, { payload }) => {
        state.isLoading = true
      }
    )
    builder.addCase(
      getBusinessPlanOtherRevenue.fulfilled,
      (state, { payload }) => {
        const { data, errorMessage } = payload
        if (!data) return
        const mainDataOrigin = {
          startDate: data.startDate,
          endDate: data.endDate,
          revenues: REVENUE_TYPE_ORIGIN.map(type => {
            const existingRevenue = data.revenues.find(
              item => item.type === type
            )
            return (
              existingRevenue || {
                type,
                total: 0,
                additionalItems: [],
              }
            )
          }),
        }
        state.isLoading = false
        state.dataSourceTableRevenue = mainDataOrigin
        state.errorMessage = errorMessage
        state.isUpdated = 0
        state.deleteOtherRevenuesData = []
        state.createOtherRevenuesData = []
        state.updateOtherRevenuesData = []
        state.isSubmitBaseline = 0
      }
    )
    builder.addCase(
      getBusinessPlanOtherRevenue.rejected,
      (state, { payload }) => {
        state.isLoading = false
      }
    )

    // POST postBusinessPlanOtherRevenue
    builder.addCase(
      postBusinessPlanOtherRevenue.pending,
      (state, { payload, meta }) => {
        if (meta.arg.apiType === API_TYPE.SELLING_EXPENSES) {
          state.isLoadingSellingExpenses = true
        } else {
          state.isLoading = true
        }
      }
    )

    builder.addCase(
      postBusinessPlanOtherRevenue.fulfilled,
      (state, { payload, meta }) => {
        const { errorMessage, httpStatus } = payload
        if (httpStatus === ResponseStatusCode.success) {
          if (meta.arg.apiType === API_TYPE.SELLING_EXPENSES) {
            state.isUpdatedSellingExpenses = 1
            state.isLoadingSellingExpenses = false
          } else {
            state.isUpdated = 1
            state.isLoading = false
          }
        }
        state.errorMessage = errorMessage
      }
    )
    builder.addCase(
      postBusinessPlanOtherRevenue.rejected,
      (state, { payload, meta }) => {
        if (meta.arg.apiType === API_TYPE.SELLING_EXPENSES) {
          state.isLoadingSellingExpenses = false
        } else {
          state.isLoading = false
        }
      }
    )

    // GET getBusinessPlanSellingExpenses
    builder.addCase(
      getBusinessPlanSellingExpenses.pending,
      (state, { payload }) => {
        state.isLoadingSellingExpenses = true
      }
    )
    builder.addCase(
      getBusinessPlanSellingExpenses.fulfilled,
      (state, { payload }) => {
        const { data, errorMessage } = payload
        if (!data) return
        const mainDataOrigin = {
          startDate: data.startDate,
          endDate: data.endDate,
          revenues: SELLING_TYPE_ORIGIN.map(type => {
            const existingSelling = data.revenues.find(
              item => item.type === type
            )
            return (
              existingSelling || {
                type,
                total: 0,
                additionalItems: [],
              }
            )
          }),
        }
        state.isLoadingSellingExpenses = false
        state.dataSourceTableSellingExpenses = mainDataOrigin
        state.errorMessage = errorMessage
        state.isUpdatedSellingExpenses = 0
        state.deleteSellingExpensesData = []
        state.createSellingExpensesData = []
        state.updateSellingExpensesData = []
      }
    )
    builder.addCase(
      getBusinessPlanSellingExpenses.rejected,
      (state, { payload }) => {
        state.isLoadingSellingExpenses = false
      }
    )

    // POST
    builder.addCase(
      postSubmitBaselineRevenuePlan.pending,
      (state, { payload }) => {
        state.isLoading = true
      }
    )

    builder.addCase(
      postSubmitBaselineRevenuePlan.fulfilled,
      (state, { payload }) => {
        const { errorMessage, httpStatus } = payload
        if (httpStatus === ResponseStatusCode.success) {
          state.isSubmitBaseline = 1
        }
        state.isLoading = false
        state.errorMessage = errorMessage
      }
    )
    builder.addCase(
      postSubmitBaselineRevenuePlan.rejected,
      (state, { payload }) => {
        state.isLoading = false
      }
    )

    // GET getPositionRevenuePlan
    builder.addCase(getPositionRevenuePlan.pending, (state, { payload }) => {
      state.isLoadingFilterPosition = true
    })

    builder.addCase(getPositionRevenuePlan.fulfilled, (state, { payload }) => {
      const { data, errorMessage, httpStatus } = payload
      if (httpStatus === ResponseStatusCode.success) {
        state.dataFilterPosition = data
      }
      state.isLoadingFilterPosition = false
      // state.errorMessage = errorMessage
    })

    builder.addCase(getPositionRevenuePlan.rejected, (state, { payload }) => {
      state.isLoadingFilterPosition = false
    })

    builder.addCase(getSummaryRevenuePlan.pending, (state, action) => {
      state.summaryRevenuePlan.loading = true
    })

    builder.addCase(getSummaryRevenuePlan.fulfilled, (state, action) => {
      state.summaryRevenuePlan.loading = false

      state.summaryRevenuePlan['mmBill'] =
        action.payload['mmBill'] !== null ? action.payload['mmBill'] : ''
      state.summaryRevenuePlan['softwareProductionRevenues'] =
        action.payload['softwareProductionRevenues'] !== null
          ? action.payload['softwareProductionRevenues']
          : ''
      state.summaryRevenuePlan['deduction'] =
        action.payload['deduction'] !== null ? action.payload['deduction'] : ''
      state.summaryRevenuePlan['onsiteFee'] =
        action.payload['onsiteFee'] !== null ? action.payload['onsiteFee'] : ''
      state.summaryRevenuePlan['equipmentRevenue'] =
        action.payload['equipmentRevenue'] !== null
          ? action.payload['equipmentRevenue']
          : ''
      state.summaryRevenuePlan['otherRevenues'] =
        action.payload['otherRevenues'] !== null
          ? action.payload['otherRevenues']
          : ''
      state.summaryRevenuePlan['agencyExpenses'] =
        action.payload['agencyExpenses'] !== null
          ? action.payload['agencyExpenses']
          : ''
    })

    builder.addCase(getSummaryRevenuePlan.rejected, (state, action) => {
      state.summaryRevenuePlan.loading = false
    })

    builder.addCase(getListDUByVersionRevenue.fulfilled, (state, action) => {
      const filteredItems = action.payload
        .filter(item => item.groupId !== null)
        .map(item => ({
          ...item,
          groupId: item.groupId.toString(),
        }))

      state.listDuRevenue = filteredItems || []
      state.deliveryUnitDataRevenue =
        filteredItems.length > 0 ? filteredItems[0] : {}
      state.duValueRevenue =
        filteredItems.length > 0 ? filteredItems[0].groupId : undefined
    })
  },
})

export const {
  setIsSaveConfirmShowed,
  setListRevenueInvalid,
  setUpdateOtherRevenuesData,
  setDeleteOtherRevenuesData,
  setCreateOtherRevenuesData,
  setUpdateSellingExpensesData,
  setDeleteSellingExpensesData,
  setCreateSellingExpensesData,
  setFiltersRevenue,
  setIsLoadingOtherRevenues,
  setIsLoadingSellingExpenses,
  setDeliveryUnitDataRevenue,
  setDuValueRevenue,
  resetSummaryRevenuePlan,
} = businessPlanRevenueSlice.actions
export default businessPlanRevenueSlice.reducer
