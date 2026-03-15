import { createSlice } from '@reduxjs/toolkit'
import {
  getListResource,
  getListResourceType,
  getLocation,
  getEmployeePosition,
  getEmployeeRole,
  getEmployeeType,
  getResourcesInformationDeliveryPlan,
  getOtherExpensesTable,
  saveDeliveryPlan,
  getListDUByVersionDelivery,
  getLocationExchangeRate,
  getSummaryDeliveryPlan,
} from '../asyncThunks/businessPlanDelivery.js'
import { ALL_OPTION, ALL_OPTION_VALUE } from '../../constants'

const initialState = {
  // Resources Information & Filter
  listResourceType: [],
  loadingResourceType: false,
  listResource: [],
  loadingListResource: false,
  listLocation: [],
  loadingListLocation: false,
  listPosition: [],
  loadingListPosition: false,
  listRole: [],
  loadingListRole: false,
  listEmployeeType: [],
  loadingListEmployeeType: false,

  dataResourcesInformation: {},
  loadingDataResourcesInformation: false,
  resourceInfoTableParams: {
    businessPlanVersionId: '',
    deliveryUnit: '',
    loadDataFromType: '',
    viewType: 1,
    resourceType: '',
    resource: [],
    location: [],
    employeeType: [],
    position: [],
    role: [],
    pageNum: 1,
    pageSize: 20,
  },
  viewType: 1,

  filtersResourcesInfo: {},
  // Other Expenses
  dataListOtherExpenses: [],
  labelMonthOtherExpenses: [],
  formattedRowsData: [],
  getOtherExpensesTableLoading: false,

  // Reference Table
  listDUDelivery: [],
  loadingSummaryDeliveryPlan: false,
  summaryDeliveryPlan: {
    mmEffort: '',
    directLaborCost: '',
    outsourcingCost: '',
    equipmentExpense: '',
    onsiteExpense: '',
    overtime: '',
    other: '',
    nonDeductibleInputVAT: '',
  },

  deliveryUnitDataDelivery: {},
  duValueDelivery: undefined,

  // Params
  isSaveShowedDeliveryPlan: false,
  saveDeliveryPlanLoading: false,
  listLocationExchangeRateData: [],
  listLaborRateData: [],
  loadingGetReferenceTable: false,
  // Load Data From Value
  loadDataFromValue: undefined,
  //
  dataCreateRequest: {
    listResourceInformation: [],
    listOtherExpensesTableData: [],
    listLocationExchangeRateData: [],
  },
  dataUpdateRequest: {
    listResourceInformation: [],
    listOtherExpensesTableData: [],
    listLocationExchangeRateData: [],
  },
  dataDeleteRequest: {
    listResourceInformation: [],
    listOtherExpensesTableData: [],
    listLocationExchangeRateData: [],
  },
  errorDataSubmitDeliveryPlan: null,
}
const handleMergeRow = (array, rowOrId) => {
  const { key, deliveryMemberId, ...restValues } = rowOrId
  const idx = array.findIndex(row => row.key === key)

  if (idx >= 0) {
    const existingRow = array[idx]
    const updatedRow = {
      deliveryMemberId,
      ...existingRow,
      ...restValues,
      budgetMMValueDTO: {
        ...existingRow.budgetMMValueDTO,
        ...restValues.budgetMMValueDTO,
      },
    }

    const copy = [...array]
    copy[idx] = updatedRow
    return copy
  }

  return [...array, rowOrId]
}

const handleMergeOtherExpense = (existingParents = [], payload) => {
  const {
    expenseCategoriesEnum,
    totalExpenseValue: parentTotal,
    otherExpenseId,
    categoriesDataList: incomingChildren,
  } = payload

  // 1) find or append the parent
  const parentIdx = existingParents.findIndex(
    p => p.expenseCategoriesEnum === expenseCategoriesEnum
  )

  // if new parent, just append the whole payload
  if (parentIdx < 0) {
    return [...existingParents, payload]
  }

  // 2) merge into the found parent
  const parent = existingParents[parentIdx]
  const mergedChildren = incomingChildren.reduce((acc, incChild) => {
    const idx = (parent.categoriesDataList || []).findIndex(
      c => c.key === incChild.key
    )

    // if existing child → merge its DTO and any top‐level overrides
    if (idx >= 0) {
      const oldChild = parent.categoriesDataList[idx]
      const newChild = {
        ...oldChild,
        ...incChild,
        otherExpensesMonthlyDTO: {
          ...oldChild.otherExpensesMonthlyDTO,
          ...incChild.otherExpensesMonthlyDTO,
        },
      }
      const copy = [...(parent.categoriesDataList || [])]
      copy[idx] = newChild
      return copy
    }

    // otherwise this is a brand‐new child
    return [...(parent.categoriesDataList || []), incChild]
  }, [])

  // 3) build the new parent row
  const newParent = {
    ...parent,
    totalExpenseValue: parentTotal && parent.totalExpenseValue,
    otherExpenseId: otherExpenseId && parent.otherExpenseId,
    categoriesDataList: mergedChildren,
  }

  // 4) splice it back into the array immutably
  const copy = [...existingParents]
  copy[parentIdx] = newParent
  return copy
}

const businessPlanDeliverySlice = createSlice({
  name: 'businessPlanDelivery',
  initialState,
  reducers: {
    setIsSaveShowedDeliveryPlan: (state, action) => {
      state.isSaveShowedDeliveryPlan = action.payload
    },
    setFiltersResourcesInformation: (state, action) => {
      state.filtersResourcesInfo = action.payload
    },
    setListIdToDeleteResourceInformation: (state, action) => {
      state.dataDeleteRequest = {
        ...state.dataDeleteRequest,
        listResourceInformation:
          state.dataDeleteRequest.listResourceInformation.includes(
            action.payload
          )
            ? state.dataDeleteRequest.listResourceInformation
            : [
                ...state.dataDeleteRequest.listResourceInformation,
                action.payload,
              ],
      }
    },
    removeCreateOrUpdateResourceInformation: (state, action) => {
      state.dataCreateRequest = {
        ...state.dataCreateRequest,
        listResourceInformation:
          state.dataCreateRequest.listResourceInformation.filter(
            r => r.key !== action.payload
          ),
      }
      state.dataUpdateRequest = {
        ...state.dataUpdateRequest,
        listResourceInformation:
          state.dataUpdateRequest.listResourceInformation.filter(
            r => r.key !== action.payload
          ),
      }
    },
    addOrUpdateCreateResource: (state, { payload }) => {
      state.dataCreateRequest = {
        ...state.dataCreateRequest,
        listResourceInformation: handleMergeRow(
          state.dataCreateRequest.listResourceInformation,
          payload
        ),
      }
    },
    addOrUpdateUpdateResource: (state, { payload }) => {
      state.dataUpdateRequest = {
        ...state.dataUpdateRequest,
        listResourceInformation: handleMergeRow(
          state.dataUpdateRequest.listResourceInformation,
          payload
        ),
      }
    },
    addCreateOtherExpense: (state, { payload }) => {
      state.dataCreateRequest = {
        ...state.dataCreateRequest,
        listOtherExpensesTableData: handleMergeOtherExpense(
          state.dataCreateRequest.listOtherExpensesTableData,
          payload
        ),
      }
    },
    addUpdateOtherExpense: (state, { payload }) => {
      state.dataUpdateRequest = {
        ...state.dataUpdateRequest,
        listOtherExpensesTableData: handleMergeOtherExpense(
          state.dataUpdateRequest.listOtherExpensesTableData,
          payload
        ),
      }
    },
    removeUpdateOtherExpense: (state, { payload }) => {
      const listOtherExpensesTableDataUpdated =
        state.dataUpdateRequest.listOtherExpensesTableData
          .map(item => {
            if (item.expenseCategoriesEnum === payload.parentKey) {
              const newCategoriesDataList = item.categoriesDataList.filter(
                child => child.key !== payload.key
              )
              if (newCategoriesDataList.length === 0) {
                return null
              }
              return {
                ...item,
                categoriesDataList: newCategoriesDataList,
              }
            }
            return item
          })
          .filter(item => item !== null)

      state.dataUpdateRequest = {
        ...state.dataUpdateRequest,
        listOtherExpensesTableData: listOtherExpensesTableDataUpdated,
      }

      state.dataDeleteRequest = {
        ...state.dataDeleteRequest,
        listOtherExpensesTableData:
          state.dataDeleteRequest.listOtherExpensesTableData.includes(
            payload.otherExpenseId
          )
            ? state.dataDeleteRequest.listOtherExpensesTableData
            : [
                ...state.dataDeleteRequest.listOtherExpensesTableData,
                payload.otherExpenseId,
              ],
      }
    },
    removeCreateOtherExpense: (state, { payload }) => {
      const listOtherExpensesTableDataUpdated =
        state.dataCreateRequest.listOtherExpensesTableData
          .map(item => {
            if (item.expenseCategoriesEnum === payload.parentKey) {
              const newCategoriesDataList = item.categoriesDataList.filter(
                child => child.key !== payload.key
              )
              if (newCategoriesDataList.length === 0) {
                return null
              }
              return {
                ...item,
                categoriesDataList: newCategoriesDataList,
              }
            }
            return item
          })
          .filter(item => item !== null)

      state.dataCreateRequest = {
        ...state.dataCreateRequest,
        listOtherExpensesTableData: listOtherExpensesTableDataUpdated,
      }
    },
    setResourceInfoTableParams: (state, action) => {
      state.resourceInfoTableParams = action.payload
    },

    resetSaveDeliveryPlanParams: (state, action) => {
      state.resourceInfoTableParams = initialState.resourceInfoTableParams
      state.errorDataSubmitDeliveryPlan =
        initialState.errorDataSubmitDeliveryPlan
      state.loadDataFromValue = initialState.loadDataFromValue
      state.dataCreateRequest = initialState.dataCreateRequest
      state.dataUpdateRequest = initialState.dataUpdateRequest
      state.dataDeleteRequest = initialState.dataDeleteRequest
    },
    resetPayloadSaveDelivery: (state, action) => {
      state.dataCreateRequest = initialState.dataCreateRequest
      state.dataUpdateRequest = initialState.dataUpdateRequest
      state.dataDeleteRequest = initialState.dataDeleteRequest
    },
    setUpdateExchangeRate: (state, { payload }) => {
      const { location, exchangeRate } = payload

      state.listLocationExchangeRateData =
        state.listLocationExchangeRateData.map(item =>
          item.location === location
            ? {
                ...item,
                exchangeRate: exchangeRate,
              }
            : item
        )

      state.dataUpdateRequest = {
        ...state.dataUpdateRequest,
        listLocationExchangeRateData:
          state.dataUpdateRequest.listLocationExchangeRateData
            .reduce((acc, item) => {
              if (item.location === location) {
                // Merge if location exists
                acc.push({ ...item, exchangeRate: exchangeRate })
              } else {
                acc.push(item)
              }
              return acc
            }, [])
            .concat(
              // Add new location if not already included
              !state.dataUpdateRequest.listLocationExchangeRateData.some(
                item => item.location === location
              )
                ? [{ location, exchangeRate }]
                : []
            ),
      }
    },

    setDeliveryUnitDataDelivery: (state, { payload }) => {
      state.deliveryUnitDataDelivery = payload
    },
    setDuValueDelivery: (state, { payload }) => {
      state.duValueDelivery = payload
    },
    resetSummaryDeliveryPlan: state => {
      state.summaryDeliveryPlan = {
        mmEffort: '',
        directLaborCost: '',
        outsourcingCost: '',
        equipmentExpense: '',
        onsiteExpense: '',
        overtime: '',
        other: '',
        nonDeductibleInputVAT: '',
      }
      state.loadingSummaryDeliveryPlan = false
    },
    setLoadDataFromValue: (state, { payload }) => {
      state.loadDataFromValue = payload
    },
    setViewType: (state, { payload }) => {
      state.viewType = payload
    },
    setListResource: (state, { payload }) => {
      state.listResource = payload
    },
    setErrorDataSubmitDeliveryPlan: (state, { payload }) => {
      state.errorDataSubmitDeliveryPlan = payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getListResourceType.pending, state => {
        state.loadingResourceType = true
      })
      .addCase(getListResourceType.fulfilled, (state, { payload }) => {
        state.listResourceType = payload || []
        state.loadingResourceType = false
      })
      .addCase(getListResourceType.rejected, state => {
        state.loadingResourceType = false
      })
    builder
      .addCase(getListResource.pending, state => {
        state.loadingListResource = true
      })
      .addCase(getListResource.fulfilled, (state, { payload }) => {
        state.listResource = payload || []
        state.loadingListResource = false
      })
      .addCase(getListResource.rejected, state => {
        state.loadingListResource = false
      })
    builder
      .addCase(getLocation.pending, state => {
        state.loadingListLocation = true
      })
      .addCase(getLocation.fulfilled, (state, { payload }) => {
        state.listLocation = payload || []
        state.loadingListLocation = false
      })
      .addCase(getLocation.rejected, state => {
        state.loadingListLocation = false
      })
    builder
      .addCase(getEmployeePosition.pending, state => {
        state.loadingListPosition = true
      })
      .addCase(getEmployeePosition.fulfilled, (state, { payload }) => {
        const { data, errorMessage, httpStatus } = payload
        state.listPosition = data || []
        state.loadingListPosition = false
      })
      .addCase(getEmployeePosition.rejected, state => {
        state.loadingListPosition = false
      })
    builder
      .addCase(getEmployeeRole.pending, state => {
        state.loadingListRole = true
      })
      .addCase(getEmployeeRole.fulfilled, (state, { payload }) => {
        state.listRole = payload || []
        state.loadingListRole = false
      })
      .addCase(getEmployeeRole.rejected, state => {
        state.loadingListRole = false
      })
    builder
      .addCase(getEmployeeType.pending, state => {
        state.loadingListEmployeeType = true
      })
      .addCase(getEmployeeType.fulfilled, (state, { payload }) => {
        state.listEmployeeType = payload || []
        state.loadingListEmployeeType = false
      })
      .addCase(getEmployeeType.rejected, state => {
        state.loadingListEmployeeType = false
      })
    builder
      .addCase(getResourcesInformationDeliveryPlan.pending, state => {
        state.loadingDataResourcesInformation = true
      })
      .addCase(
        getResourcesInformationDeliveryPlan.fulfilled,
        (state, { payload }) => {
          state.dataResourcesInformation = payload ? payload.body : {}
          state.loadingDataResourcesInformation = false
        }
      )
      .addCase(getResourcesInformationDeliveryPlan.rejected, state => {
        state.loadingDataResourcesInformation = false
      })
    builder
      .addCase(getOtherExpensesTable.pending, state => {
        state.getOtherExpensesTableLoading = true
      })
      .addCase(getOtherExpensesTable.fulfilled, (state, { payload }) => {
        state.getOtherExpensesTableLoading = false
        state.dataListOtherExpenses = payload ? payload.body.dataList : []
        state.labelMonthOtherExpenses = payload ? payload.body.labelMonth : []
      })
      .addCase(getOtherExpensesTable.rejected, state => {
        state.getOtherExpensesTableLoading = false
      })
    builder
      .addCase(saveDeliveryPlan.pending, state => {
        state.saveDeliveryPlanLoading = true
      })
      .addCase(saveDeliveryPlan.fulfilled, (state, { payload }) => {
        state.saveDeliveryPlanLoading = false
      })
      .addCase(saveDeliveryPlan.rejected, state => {
        state.saveDeliveryPlanLoading = false
      })
    builder.addCase(getListDUByVersionDelivery.pending, (state, action) => {
      state.loadingSummaryDeliveryPlan = true
    })

    builder.addCase(getListDUByVersionDelivery.fulfilled, (state, action) => {
      state.loadingSummaryDeliveryPlan = false

      const filteredItems = action.payload
        ? action.payload
            .filter(item => item.groupId !== null)
            .map(item => ({
              ...item,
              groupId: item.groupId.toString(),
            }))
        : []

      state.listDUDelivery = filteredItems
      state.deliveryUnitDataDelivery =
        filteredItems.length > 0 ? ALL_OPTION : {}
      state.duValueDelivery =
        filteredItems.length > 0 ? ALL_OPTION_VALUE : undefined
    })

    builder.addCase(getListDUByVersionDelivery.rejected, (state, action) => {
      state.loadingSummaryDeliveryPlan = false
    })

    builder.addCase(getSummaryDeliveryPlan.pending, (state, action) => {
      state.loadingSummaryDeliveryPlan = true
    })

    builder.addCase(getSummaryDeliveryPlan.fulfilled, (state, action) => {
      state.loadingSummaryDeliveryPlan = false

      state.summaryDeliveryPlan['mmEffort'] =
        action.payload['mmEffort'] !== null ? action.payload['mmEffort'] : ''
      state.summaryDeliveryPlan['directLaborCost'] =
        action.payload['directLaborCost'] !== null
          ? action.payload['directLaborCost']
          : ''
      state.summaryDeliveryPlan['outsourcingCost'] =
        action.payload['outsourcingCost'] !== null
          ? action.payload['outsourcingCost']
          : ''
      state.summaryDeliveryPlan['equipmentExpense'] =
        action.payload['equipmentExpense'] !== null
          ? action.payload['equipmentExpense']
          : ''
      state.summaryDeliveryPlan['onsiteExpense'] =
        action.payload['onsiteExpense'] !== null
          ? action.payload['onsiteExpense']
          : ''
      state.summaryDeliveryPlan['overtime'] =
        action.payload['overtime'] !== null ? action.payload['overtime'] : ''
      state.summaryDeliveryPlan['other'] =
        action.payload['other'] !== null ? action.payload['other'] : ''
      state.summaryDeliveryPlan['nonDeductibleInputVAT'] =
        action.payload['nonDeductibleInputVAT'] !== null
          ? action.payload['nonDeductibleInputVAT']
          : ''
    })

    builder.addCase(getSummaryDeliveryPlan.rejected, (state, action) => {
      state.loadingSummaryDeliveryPlan = false
    })

    builder
      .addCase(getLocationExchangeRate.pending, state => {
        state.loadingGetReferenceTable = true
      })
      .addCase(getLocationExchangeRate.fulfilled, (state, { payload }) => {
        state.loadingGetReferenceTable = false

        state.listLocationExchangeRateData =
          payload.locationExchangeRateData || []

        state.listLaborRateData = payload.locationSalaryExpenseIndexData || []
      })
      .addCase(getLocationExchangeRate.rejected, state => {
        state.loadingGetReferenceTable = false
      })
  },
})

export const {
  setIsSaveShowedDeliveryPlan,
  setFiltersResourcesInformation,
  setListIdToDeleteResourceInformation,
  setUpdateExchangeRate,
  setResourceInfoTableParams,
  resetSaveDeliveryPlanParams,
  setDeliveryUnitDataDelivery,
  setDuValueDelivery,
  resetSummaryDeliveryPlan,
  setLoadDataFromValue,
  setViewType,
  setListResource,
  removeCreateOrUpdateResourceInformation,
  addOrUpdateCreateResource,
  addOrUpdateUpdateResource,
  addUpdateOtherExpense,
  addCreateOtherExpense,
  removeUpdateOtherExpense,
  removeCreateOtherExpense,
  setErrorDataSubmitDeliveryPlan,
  resetPayloadSaveDelivery,
} = businessPlanDeliverySlice.actions

export default businessPlanDeliverySlice.reducer
