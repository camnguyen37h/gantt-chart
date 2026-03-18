import { createSlice } from '@reduxjs/toolkit'
import cloneDeep from 'lodash/cloneDeep'
import {
  getBusinessPlanDetail,
  getBusinessPlanDetailByViewMode,
  getCompareBusinessPlanDetail,
  getPositionRevenuePlan,
  getSummaryRevenuePlan,
} from '../asyncThunks'
import { sectionConfig } from '../../constants'

/** Deduplicates columnKeys by appending `_index` to each occurrence (e.g. DELIVERY_UNIT_7_5, DELIVERY_UNIT_7_7). */
const normalizeColumnKeys = (columnLabels, sectionList) => {
  // Pass 1: group each columnKey's positions to detect duplicates
  const positionsByKey = new Map()
  for (let ci = 0; ci < columnLabels.length; ci++) {
    const colKey = columnLabels[ci].columnKey
    const positions = positionsByKey.get(colKey)
    if (positions) positions.push(ci)
    else positionsByKey.set(colKey, [ci])
  }

  // Build renamedKeysByOriginal and patch resultColumns only for duplicate keys (copy-on-write)
  const renamedKeysByOriginal = new Map()
  let resultColumns = columnLabels
  positionsByKey.forEach((positions, colKey) => {
    if (positions.length < 2) return
    if (resultColumns === columnLabels) resultColumns = columnLabels.slice()
    const renamedKeys = positions.map(pos => colKey + '_' + columnLabels[pos].index)
    renamedKeysByOriginal.set(colKey, renamedKeys)
    for (let pi = 0; pi < positions.length; pi++) {
      resultColumns[positions[pi]] = { ...columnLabels[positions[pi]], columnKey: renamedKeys[pi] }
    }
  })

  if (renamedKeysByOriginal.size === 0) return { columnLabels, sectionList }

  // Pass 2: remap each cell's columnKey by occurrence order within the row
  const resultSections = sectionList.map(section => ({
    ...section,
    rowLabels: section.rowLabels.map(row => {
      const occurrenceCount = {}
      return {
        ...row,
        cellList: row.cellList.map(cell => {
          const renamedKeys = renamedKeysByOriginal.get(cell.columnKey)
          if (!renamedKeys) return cell
          const occurrence = (occurrenceCount[cell.columnKey] = (occurrenceCount[cell.columnKey] || 0) + 1)
          return { ...cell, columnKey: renamedKeys[occurrence - 1] }
        }),
      }
    }),
  }))

  return { columnLabels: resultColumns, sectionList: resultSections }
}

const initialState = {
  isSaveShowed: { generalInformation: false, businessPlan: false },
  businessPlanItems: {},
  columns: [],
  exchangeRate: null,
  totalContractPrice: null,
  softwareDevelopmentFee: null,
  otherFees: null,
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
      (state, { payload }) => {
        state.loadingBusinessPlan = false
        const { data, errorMessage } = payload || {}

        if (!data) return
        const { columnLabels, sectionList } = normalizeColumnKeys(
          data.columnLabels || [],
          data.sectionList || []
        )
        const mmBill = sectionList.reduce((res, section) => {
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

        const originalBusinessPlanItems = cloneDeep(sectionList)

        state.businessPlanItems = sectionList.reduce(
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
        state.originalBusinessPlanItems = originalBusinessPlanItems
        state.columns = columnLabels
        state.version = data.version
        state.warningMessage = data.warningMessage
        state.errorMessage = errorMessage
      }
    )

    builder.addCase(getBusinessPlanDetailByViewMode.rejected, state => {
      state.loadingBusinessPlan = false
    })

    builder.addCase(getCompareBusinessPlanDetail.pending, state => {
      state.loadingBusinessPlan = true
    })

    builder.addCase(
      getCompareBusinessPlanDetail.fulfilled,
      (state, { payload }) => {
        state.loadingBusinessPlan = false
        const { columnLabels: compareColumnLabels, sectionList: compareSectionList } = normalizeColumnKeys(
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
} = businessDetailsSlice.actions

export default businessDetailsSlice.reducer
