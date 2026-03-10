import { createSlice } from '@reduxjs/toolkit'
import cloneDeep from 'lodash/cloneDeep'
import {
  getBusinessPlanDetail,
  getBusinessPlanDetailByViewMode,
  getCompareBusinessPlanDetail,
  getSpecificPermission,
} from '../asyncThunks'
import { sectionConfig } from '../../constants'
import { setSelectedMvvCode } from './businessGeneralInformation'

const initialState = {
  isSaveShowed: false,
  businessPlanItems: {},
  columns: [],
  exchangeRate: null,
  totalContractPrice: null,
  softwareDevelopmentFee: null,
  otherFees: null,
  validation: {},
  projectCode: '',
  version: null,
  status: null,
  originalBusinessPlanItems: [],
  compareBusinessPlanItems: null,
  listVersions: [],
  startDate: '',
  endDate: '',
  versionId: null,
  warningMessage: null,
  activePanel: '',
  deliveryUnitDataDelivery: {},
  deliveryUnitDataRevenue: {},
  generalInfos: [],
}
const businessDetailsSlice = createSlice({
  name: 'businessDetails',
  initialState,
  reducers: {
    setIsSaveShowed: (state, action) => {
      state.isSaveShowed = action.payload
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
      const { exchangeRate, softwareDevelopmentFee, otherFees } = payload

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
    },

    setValidation: (state, { payload }) => {
      state.validation = { ...state.validation, ...payload }
    },

    clearCompareBusinessPlan: (state, { payload }) => {
      if (state.compareBusinessPlanItems) {
        state.compareBusinessPlanItems = null
      }
    },

    setActiveBusinessPlanPanel: (state, { payload }) => {
      const { activeKey } = payload
      state.activePanel =
        activeKey === '2' ? 'Revenue' : activeKey === '3' ? 'Delivery' : ''
    },
  },
  extraReducers: builder => {
    // Listen to General Information API to get metadata (versions, dates, etc.)
    builder.addCase(getBusinessPlanDetail.fulfilled, (state, { payload }) => {
      const { data } = payload || {}

      if (!data) return

      // Store metadata from General Information API
      state.listVersions = data.versions || []
      state.projectCode = data.projectCode
      state.version = data.version
      state.status = data.status
      state.versionId = data.id
      state.startDate = data.startDate
      state.endDate = data.endDate
      state.warningMessage = data.warningMessage
      
      // Store generalInfos for MVV switching
      state.generalInfos = data.generalInfos || []

      // Get the selected general info based on projectCode and update contract prices
      const selectedGeneralInfo = data.generalInfos && data.generalInfos.length > 0
        ? data.generalInfos.find(info => info.projectCode === data.projectCode) || data.generalInfos[0]
        : null

      if (selectedGeneralInfo) {
        state.exchangeRate = selectedGeneralInfo.exchangeRate
        state.totalContractPrice = selectedGeneralInfo.totalContractPrice
        state.softwareDevelopmentFee = selectedGeneralInfo.softwareDevelopmentFee
        state.otherFees = selectedGeneralInfo.otherFees
      }
    })

    // Listen to Business Plan Detail By View Mode API to get table data
    builder.addCase(getBusinessPlanDetailByViewMode.fulfilled, (state, { payload }) => {
      const { data, errorMessage } = payload || {}

      if (!data) return

      // Process sectionList and columnLabels
      const mmBill = data.sectionList.reduce((res, section) => {
        if (!res)
          return section.rowLabels.find(item => item.rowKey === 'MM_BILL')
        return res
      }, null)

      let mmBillService = cloneDeep(mmBill)
      mmBillService = {
        ...mmBillService,
        label: '',
        rowKey: 'MM_BILL_1',
        cellList: mmBillService.cellList.map(item => ({
          ...item,
          value: null,
          rowKey: 'MM_BILL_1',
          editable: sectionConfig.MAN_MONTH.newRowEditable(item.columnKey),
        })),
      }

      const originalBusinessPlanItems = cloneDeep(data.sectionList || [])

      const formattedData = (data.sectionList || []).reduce(
        (res, cur, index) => {
          const cloneRowLabels = cloneDeep(cur.rowLabels)
          cloneRowLabels.sort((a, b) => {
            if (
              a.rowKey.match(
                /(MM_BILL_\d+)|(OTHER_EXPENSES_\d+)|(OTHER_FEE_\d+)/
              )
            ) {
              if (
                !b.rowKey.match(
                  /(MM_BILL_\d+)|(OTHER_EXPENSES_\d+)|(OTHER_FEE_\d+)/
                )
              )
                return 1
              else {
                return (
                  parseInt(a.rowKey.match(/\d+/)[0]) -
                  parseInt(b.rowKey.match(/\d+/)[0])
                )
              }
            }
          })

          if (
            cur.sectionKey === 'MAN_MONTH' &&
            !cloneRowLabels.some(item => item.rowKey === 'MM_BILL_1')
          ) {
            cloneRowLabels.push(mmBillService)
            originalBusinessPlanItems[index].rowLabels = cloneRowLabels
          }
          res[cur.sectionKey] = {
            title: cur.sectionTitle,
            data: cloneRowLabels.reduce((rowRes, rowCur) => {
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

      state.businessPlanItems = formattedData
      state.originalBusinessPlanItems = originalBusinessPlanItems
      state.columns = data.columnLabels

      // Update other fields from Business Plan Detail
      state.projectCode = data.projectCode
      state.version = data.version
      state.status = data.status
      state.versionId = data.versionId
      state.startDate = data.startDate
      state.endDate = data.endDate
      state.warningMessage = data.warningMessage
      state.errorMessage = errorMessage
    })

    builder.addCase(
      getCompareBusinessPlanDetail.fulfilled,
      (state, { payload }) => {
        const formattedData = (payload.sectionList || []).reduce((res, cur) => {
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
        }, {})

        state.compareBusinessPlanItems = formattedData
      }
    )

    // Listen to MVV selection change from businessGeneralInformation
    builder.addCase(setSelectedMvvCode, (state, action) => {
      const selectedMvvCode = action.payload
      const selectedGeneralInfo = state.generalInfos.find(
        info => info.projectCode === selectedMvvCode
      )
      
      if (selectedGeneralInfo) {
        state.exchangeRate = selectedGeneralInfo.exchangeRate
        state.totalContractPrice = selectedGeneralInfo.totalContractPrice
        state.softwareDevelopmentFee = selectedGeneralInfo.softwareDevelopmentFee
        state.otherFees = selectedGeneralInfo.otherFees
      }
    })
  },
})

export const {
  setIsSaveShowed,
  setBusinessPlanItem,
  setBusinessPlanItems,
  setContractPriceData,
  setValidation,
  addBusinessPlanRow,
  updateBusinessPlanRow,
  deleteBusinessPlanRow,
  clearCompareBusinessPlan,
  setVersion,
  setActiveBusinessPlanPanel,
} = businessDetailsSlice.actions

export default businessDetailsSlice.reducer
