import { useSelector } from 'react-redux'
import useBusinessPlanForm from './useBusinessPlanForm'
import { sectionConfig } from '../constants'
import Decimal from 'decimal.js'

const LOC_TYPES = ['Onsite', 'Offshore']
const decimalDivide = (numerator, denominator) =>
  numerator && denominator
    ? new Decimal(numerator).dividedBy(new Decimal(denominator)).toNumber()
    : null

const decimalDividePercent = (numerator, denominator) =>
  numerator && denominator
    ? new Decimal(numerator)
        .dividedBy(new Decimal(denominator))
        .times(100)
        .toNumber()
    : null

const decimalNegate = value =>
  new Decimal(0).minus(new Decimal(value)).toNumber()

const useFormula = () => {
  useBusinessPlanForm()
  const {
    exchangeRate,
    businessPlanItems,
    columns,
    softwareDevelopmentFee,
    viewModeDataMap,
    viewMode,
  } = useSelector(state => state.businessPlanDetails)

  const getDisplayColumnKey = item => item && item.compareKey

  const getColumnMetaByDisplayKey = displayKey => {
    const safeColumns = columns || []
    return safeColumns.find(col => col.compareKey === displayKey)
  }

  const getOBLocationTypeByDisplayKey = displayKey => {
    const meta = getColumnMetaByDisplayKey(displayKey)
    if (!meta || !meta.colCategory) return null
    if (meta.colCategory === 'bu_onsite' || meta.colCategory === 'du_onsite')
      return 'Onsite'
    if (
      meta.colCategory === 'bu_offshore' ||
      meta.colCategory === 'du_offshore'
    )
      return 'Offshore'
    return null
  }

  const isOBOrTotal = () => viewMode === 'OB' || viewMode === 'Total'
  const isOB = () => viewMode === 'OB'
  const isDU = colKey => colKey.toLowerCase().includes('delivery_unit')
  const isSaleCol = colKey => colKey.toLowerCase().includes('sale')

  const getSum = (...rest) => {
    if (rest.every(v => v === null || v === undefined)) return null
    return rest
      .reduce((total, cur) => {
        const val =
          isNaN(cur) || cur === null || cur === undefined
            ? new Decimal(0)
            : new Decimal(cur)
        return total.plus(val)
      }, new Decimal(0))
      .toNumber()
  }

  const getMultiplicationRes = (...rest) => {
    const valid = rest.filter(
      v => v !== null && v !== undefined && v !== '' && !isNaN(v)
    )
    if (valid.length < 2) return null
    return valid
      .reduce((prod, cur) => prod.times(new Decimal(cur)), new Decimal(1))
      .toNumber()
  }

  const getItem = ({ sectionKey, rowKey, columnKey, compareKey: ck }) => {
    const row =
      businessPlanItems[sectionKey] &&
      businessPlanItems[sectionKey].data[rowKey]
    if (!row) return {}
    if (ck) return row.data.find(item => item.compareKey === ck) || {}
    return row.data.find(item => item.columnKey === columnKey) || {}
  }

  const getItems = ({ sectionKey, rowKey, filterCallback }) => {
    const row =
      businessPlanItems[sectionKey] &&
      businessPlanItems[sectionKey].data[rowKey]
    return row ? row.data.filter(filterCallback) : []
  }

  const getItemValues = ({ sectionKey, rowKey, filterCallback }) =>
    getItems({ sectionKey, rowKey, filterCallback }).map(item => item.value)

  const getSumItemValues = ({ sectionKey, rowKey, filterCallback }) =>
    getSum(...getItemValues({ sectionKey, rowKey, filterCallback }))

  const getSumDUValues = ({ sectionKey, rowKey }) =>
    getSumItemValues({
      sectionKey,
      rowKey,
      filterCallback: item => isDU(item.columnKey),
    })

  const getSumAllValues = ({ sectionKey, rowKey }) =>
    getSumItemValues({
      sectionKey,
      rowKey,
      filterCallback: item => item.columnKey.toLowerCase() !== 'total',
    })

  const getSumAllValuesAndSet = ({ sectionKey, rowKey }) =>
    getSumAllValues({ sectionKey, rowKey })

  const getCrossViewCell = (locType, secKey, rowKey, colKey) => {
    const locData = viewModeDataMap[locType]
    if (!locData) return null
    const section = locData.businessPlanItems[secKey]
    if (!section) return null
    const row = section.data[rowKey]
    if (!row) return null
    const cell = row.data.find(c => c.columnKey === colKey)
    return cell && cell.value != null ? cell.value : null
  }

  const sumCrossViewDU = (secKey, rowKey) => {
    const perLoc = LOC_TYPES.map(locType => {
      const locData = viewModeDataMap[locType]
      if (!locData) return null
      const section = locData.businessPlanItems[secKey]
      if (!section) return null
      const row = section.data[rowKey]
      if (!row) return null
      return getSum(
        ...row.data.filter(item => isDU(item.columnKey)).map(item => item.value)
      )
    })
    return perLoc.some(v => v !== null) ? getSum(...perLoc) : null
  }

  const sumCrossViewTotals = (secKey, rowKey) => {
    const perLoc = LOC_TYPES.map(locType =>
      getCrossViewCell(locType, secKey, rowKey, 'TOTAL')
    )
    if (!perLoc.some(v => v !== null)) return undefined
    return getSum(...perLoc)
  }

  const getOBNegativeCrossViewDUSum = (secKey, rowKey) => {
    if (!isOB()) return undefined
    const duSum = sumCrossViewDU(secKey, rowKey)
    return duSum !== null ? duSum : undefined
  }

  const getOBCrossViewCell = (secKey, rowKey, targetItem) => {
    if (!isOBOrTotal()) return undefined
    const colKey = targetItem.columnKey
    if (colKey === 'TOTAL') return undefined

    if (colKey === 'INTERNAL') {
      if (isOB()) {
        return sumCrossViewDU(secKey, rowKey)
      }
      const perLoc = LOC_TYPES.map(locType =>
        getCrossViewCell(locType, secKey, rowKey, 'INTERNAL')
      )
      if (!perLoc.some(v => v !== null)) return undefined
      return getSum(...perLoc)
    }

    if (isSaleCol(colKey)) {
      const locType = getOBLocationTypeByDisplayKey(
        getDisplayColumnKey(targetItem)
      )
      if (!locType) return null
      return getCrossViewCell(locType, secKey, rowKey, 'SALE')
    }
    if (isDU(colKey)) {
      const locType = getOBLocationTypeByDisplayKey(
        getDisplayColumnKey(targetItem)
      )
      if (!locType) return null
      const locData = viewModeDataMap[locType]
      if (!locData) return null
      const section = locData.businessPlanItems[secKey]
      if (!section) return null
      const row = section.data[rowKey]
      if (!row) return null
      // Within a single loc-type view, columnKey is unique — compareKey suffix only exists in the combined view
      const cell = row.data.find(c => c.columnKey === colKey)
      return cell ? (cell.value == null ? null : cell.value) : null
    }
    for (let i = 0; i < LOC_TYPES.length; i++) {
      const locData = viewModeDataMap[LOC_TYPES[i]]
      if (!locData) continue
      const section = locData.businessPlanItems[secKey]
      if (!section) continue
      const row = section.data[rowKey]
      if (!row) continue
      const cell = row.data.find(c => c.columnKey === colKey)
      if (cell) return cell.value == null ? null : cell.value
    }
    return null
  }

  const getTotalColumnAndSet = ({ targetItem, serviceRowKey }) => {
    const { sectionKey, columnKey, rowKey, compareKey: ck } = targetItem
    const rowKeys = Object.keys(businessPlanItems[sectionKey].data).filter(
      key => key !== rowKey
    )
    const values = rowKeys.map(key => {
      const data = businessPlanItems[sectionKey].data[key].data
      const childItem = ck
        ? data.find(item => item.compareKey === ck) ||
          data.find(item => item.columnKey === columnKey)
        : data.find(item => item.columnKey === columnKey)
      if (!childItem) return 0
      const isService = key.match(new RegExp(`${serviceRowKey}_\\d+`))
      const result = getFormula({
        item: childItem,
        columnKey,
        rowKey: key,
        sectionKey,
        isService,
      })
      return result !== undefined ? result : childItem.value
    })
    return getSum(...values)
  }

  const getOBNegativeDUSumInternal = ({ sectionKey, rowKey }) => {
    if (!isOB()) return undefined
    const sum = getSum(
      ...getItems({
        sectionKey,
        rowKey,
        filterCallback: item => isDU(item.columnKey),
      }).map(item => item.value)
    )
    return decimalNegate(sum === null ? 0 : sum)
  }

  const getUnitPriceTotal = () =>
    getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'UNIT_PRICE',
      columnKey: 'SALE',
    }).value

  const getMMBillDU = ({ targetItem }) => {
    const serviceKeys = Object.keys(businessPlanItems.MAN_MONTH.data).filter(
      key => key.match(/MM_BILL_\d+/)
    )
    return getSum(
      ...serviceKeys.map(key => {
        const data = businessPlanItems.MAN_MONTH.data[key].data
        const cell = targetItem.compareKey
          ? data.find(item => item.compareKey === targetItem.compareKey)
          : data.find(
              item =>
                isDU(item.columnKey) && item.columnKey === targetItem.columnKey
            )
        return cell ? cell.value : null
      })
    )
  }

  const getMMBillSale = () => {
    const duItems = getItems({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_BILL',
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(...duItems.map(item => getMMBillDU({ targetItem: item })))
  }

  const getMMManufactureTotal = () =>
    getSumDUValues({ sectionKey: 'MAN_MONTH', rowKey: 'MM_PRODUCTION' })

  const getMMManufactureSale = () => getMMBillSale()

  const getTotalMMBilService = ({ targetItem }) =>
    getSumDUValues({
      sectionKey: targetItem.sectionKey,
      rowKey: targetItem.rowKey,
    })

  const getSoftwareProductionSale = () => {
    if (isOBOrTotal()) return undefined
    return getMultiplicationRes(exchangeRate, softwareDevelopmentFee)
  }

  const getSoftwareProductionDU = ({ targetItem }) =>
    targetItem != null && targetItem.value != null ? targetItem.value : null

  const getSoftwareProductionInternal = () => {
    if (isOB()) {
      const duItems = getItems({
        sectionKey: 'REVENUES',
        rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
        filterCallback: item => isDU(item.columnKey),
      })
      const sum = getSum(...duItems.map(item => item.value))
      return sum !== null ? decimalNegate(sum) : null
    }
    if (viewMode === 'Total') {
      const perLoc = LOC_TYPES.map(locType =>
        getCrossViewCell(
          locType,
          'REVENUES',
          'SOFTWARE_PRODUCTION_REVENUES',
          'INTERNAL'
        )
      )
      if (!perLoc.some(v => v !== null)) return undefined
      return getSum(...perLoc)
    }
    const duItems = getItems({
      sectionKey: 'REVENUES',
      rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
      filterCallback: item => isDU(item.columnKey),
    })
    const sum = getSum(
      ...duItems.map(item => getSoftwareProductionDU({ targetItem: item }))
    )
    return sum === null ? null : decimalNegate(sum)
  }

  const getSoftwareProductionTotal = () => {
    if (isOB())
      return sumCrossViewTotals('REVENUES', 'SOFTWARE_PRODUCTION_REVENUES')
    if (viewMode === 'Total') return undefined
    return getSoftwareProductionSale()
  }

  const getDeductionTotal = () => {
    if (isOB()) return sumCrossViewTotals('REVENUES', 'DEDUCTION')
    if (viewMode === 'Total') return undefined
    return getDeductionSale()
  }

  const getDeductionSale = () => {
    if (isOBOrTotal()) return undefined
    const deductionFromBackend =
      (
        businessPlanItems.REVENUES.data.DEDUCTION.data.find(item =>
          isSaleCol(item.columnKey)
        ) || {}
      ).value || 0
    const revenuesSaleFromBackend =
      (
        businessPlanItems.REVENUES.data.SOFTWARE_PRODUCTION_REVENUES.data.find(
          item => isSaleCol(item.columnKey)
        ) || {}
      ).value || 0
    const totalDeductionRevenue = new Decimal(revenuesSaleFromBackend)
      .plus(new Decimal(deductionFromBackend))
      .toNumber()
    const userRevenues = getSoftwareProductionSale() || 0
    return new Decimal(totalDeductionRevenue)
      .minus(new Decimal(userRevenues))
      .toNumber()
  }

  const getOBRevenuesFeeTotal = ({ rowKey }) => {
    if (!isOB()) return undefined
    const onsiteData = viewModeDataMap['Onsite']
    if (!onsiteData) return undefined
    const onsiteRow =
      onsiteData.businessPlanItems['REVENUES'] &&
      onsiteData.businessPlanItems['REVENUES'].data[rowKey]
    if (!onsiteRow) return undefined
    // Total = Σ BU (SALE) Onsite + Internal_Onsite + Σ DU_Onsite
    // Since Internal_Onsite = -Σ DU_Onsite, they cancel → Total = Σ BU (SALE) Onsite
    return getSum(
      ...onsiteRow.data
        .filter(item => isSaleCol(item.columnKey))
        .map(item => item.value)
    )
  }

  const getOBFeeTotal = ({ sectionKey, rowKey }) => {
    if (isOB()) return getOBRevenuesFeeTotal({ rowKey })
    return getSumAllValues({ sectionKey, rowKey })
  }

  const getOnsiteFeeTotal = args => getOBFeeTotal(args)
  const getEquipmentFeeTotal = args => getOBFeeTotal(args)
  const getOtherFeeTotal = args => getOBFeeTotal(args)
  const getRevenuesServiceTotal = ({ sectionKey, rowKey }) =>
    getSumAllValues({ sectionKey, rowKey })

  const getRevenuesTotalInternal = ({ targetItem, serviceRowKey }) => {
    if (isOB()) {
      const duItems = getItems({
        sectionKey: 'REVENUES',
        rowKey: 'REVENUES_TOTAL',
        filterCallback: item => isDU(item.columnKey),
      })
      const sum = getSum(
        ...duItems.map(item =>
          getTotalColumnAndSet({
            targetItem: item,
            serviceRowKey: sectionConfig.REVENUES.newRowKey,
          })
        )
      )
      return sum !== null ? decimalNegate(sum) : undefined
    }
    if (isOBOrTotal()) {
      const perLoc = LOC_TYPES.map(locType =>
        getCrossViewCell(locType, 'REVENUES', 'REVENUES_TOTAL', 'INTERNAL')
      )
      if (!perLoc.some(v => v !== null)) return undefined
      return getSum(...perLoc)
    }
    return getTotalColumnAndSet({ targetItem, serviceRowKey })
  }

  const getDUCostSale = () => {
    const internal = getSoftwareProductionInternal()
    return internal ? -internal : null
  }

  const getDUCostSaleOB = ({ targetItem }) => {
    if (!isOB()) return undefined
    if (isSaleCol(targetItem.columnKey)) {
      const offshoreData = viewModeDataMap['Offshore']
      if (offshoreData) {
        const offshoreRow =
          offshoreData.businessPlanItems['COST_PRICE'] &&
          offshoreData.businessPlanItems['COST_PRICE'].data['COST_OF_DU_SOLD']
        if (offshoreRow) {
          const cell = offshoreRow.data.find(c => c.columnKey === 'SALE')
          if (cell) return cell.value != null ? cell.value : null
        }
      }
      const onsiteData = viewModeDataMap['Onsite']
      if (onsiteData) {
        const onsiteRow =
          onsiteData.businessPlanItems['COST_PRICE'] &&
          onsiteData.businessPlanItems['COST_PRICE'].data['COST_OF_DU_SOLD']
        if (onsiteRow) {
          const cell = onsiteRow.data.find(c => c.columnKey === 'SALE')
          if (cell) return cell.value != null ? cell.value : null
        }
      }
      return undefined
    }
    const locType = getOBLocationTypeByDisplayKey(
      getDisplayColumnKey(targetItem)
    )
    if (!locType) return undefined
    const locData = viewModeDataMap[locType]
    if (!locData) return undefined
    const row =
      locData.businessPlanItems['COST_PRICE'] &&
      locData.businessPlanItems['COST_PRICE'].data['COST_OF_DU_SOLD']
    if (!row) return undefined
    const cell = row.data.find(c => c.columnKey === targetItem.columnKey)
    return cell && cell.value != null ? cell.value : undefined
  }

  const getDUCostInternal = () => {
    if (isOB()) {
      const offshoreData = viewModeDataMap['Offshore']
      if (!offshoreData) return 0
      const row =
        offshoreData.businessPlanItems['COST_PRICE'] &&
        offshoreData.businessPlanItems['COST_PRICE'].data['COST_OF_DU_SOLD']
      if (!row) return 0
      const saleSum = getSum(
        ...row.data
          .filter(item => isSaleCol(item.columnKey))
          .map(item => item.value)
      )
      return saleSum !== null ? decimalNegate(saleSum) : 0
    }
    return getSoftwareProductionInternal()
  }

  const getDUCostTotal = () => {
    if (isOB()) return 0
    return getSum(getDUCostInternal(), getDUCostSale())
  }

  const getSellingExpensesTotalSaleOB = ({ targetItem, serviceRowKey }) => {
    if (isOB() && isSaleCol(targetItem.columnKey)) {
      const onsiteData = viewModeDataMap['Onsite']
      if (onsiteData) {
        const row =
          onsiteData.businessPlanItems['SELLING_EXPENSES'] &&
          onsiteData.businessPlanItems['SELLING_EXPENSES'].data[
            'SELLING_EXPENSES_TOTAL'
          ]
        if (row) {
          const cell = row.data.find(c => c.columnKey === 'SALE')
          if (cell) return cell.value != null ? cell.value : null
        }
      }
      return undefined
    }
    return getTotalColumnAndSet({ targetItem, serviceRowKey })
  }

  const getIncentiveTotal = () => {
    if (isOBOrTotal()) return undefined
    return getIncentiveSale()
  }

  const getIncentiveSale = () => {
    if (isOBOrTotal()) return undefined
    const revenues = getSoftwareProductionSale()
    const rate = getItem({
      sectionKey: 'REFERENCE',
      rowKey: 'INCENTIVES_RATE',
      columnKey: 'SALE',
    }).value
    if (revenues == null || rate == null) return null
    return new Decimal(revenues)
      .times(new Decimal(rate))
      .dividedBy(100)
      .toNumber()
  }

  const getAgencyTotal = () => {
    if (isOBOrTotal()) return undefined
    const value = getItem({
      sectionKey: 'SELLING_EXPENSES',
      rowKey: 'AGENCY_EXPENSE',
      columnKey: 'SALE',
    }).value
    return value != null ? value : null
  }

  const getDirectLaborCostTotal = ({ targetItem, sectionKey, rowKey }) => {
    if (isOB()) {
      const onsiteData = viewModeDataMap['Onsite']
      const offshoreData = viewModeDataMap['Offshore']
      if (!onsiteData || !offshoreData) return undefined
      const onsiteRow =
        onsiteData.businessPlanItems['DELIVERY_EXPENSES'] &&
        onsiteData.businessPlanItems['DELIVERY_EXPENSES'].data[
          'DIRECT_LABOR_COST'
        ]
      if (!onsiteRow) return undefined
      const offshoreRow =
        offshoreData.businessPlanItems['REVENUES'] &&
        offshoreData.businessPlanItems['REVENUES'].data[
          'SOFTWARE_PRODUCTION_REVENUES'
        ]
      if (!offshoreRow) return undefined
      return getSum(
        ...onsiteRow.data
          .filter(item => isDU(item.columnKey))
          .map(item => item.value),
        ...offshoreRow.data
          .filter(item => isDU(item.columnKey))
          .map(item => item.value)
      )
    }
    return getSumAllValues({ targetItem, sectionKey, rowKey })
  }

  const getOBDeliveryExpenseDU = ({ targetItem, rowKey }) => {
    if (!isOB()) return undefined
    const locType = getOBLocationTypeByDisplayKey(getDisplayColumnKey(targetItem))
    if (locType === 'Offshore') return 0
    const onsiteData = viewModeDataMap['Onsite']
    if (!onsiteData) return undefined
    const row =
      onsiteData.businessPlanItems['DELIVERY_EXPENSES'] &&
      onsiteData.businessPlanItems['DELIVERY_EXPENSES'].data[rowKey]
    if (!row) return undefined
    const cell = row.data.find(c => c.columnKey === targetItem.columnKey)
    return cell && cell.value != null ? cell.value : null
  }

  const getOBDeliveryExpenseTotalFromOnsite = ({ rowKey }) => {
    if (!isOB()) return undefined
    const onsiteData = viewModeDataMap['Onsite']
    if (!onsiteData) return undefined
    const row =
      onsiteData.businessPlanItems['DELIVERY_EXPENSES'] &&
      onsiteData.businessPlanItems['DELIVERY_EXPENSES'].data[rowKey]
    if (!row) return undefined
    return getSum(
      ...row.data
        .filter(item => isSaleCol(item.columnKey))
        .map(item => item.value)
    )
  }

  const makeOBDeliveryTotal = ({ targetItem, sectionKey, rowKey }) => {
    if (isOB()) return getOBDeliveryExpenseTotalFromOnsite({ rowKey })
    return getSumAllValues({ targetItem, sectionKey, rowKey })
  }

  const getOutsourcingCostTotal = args => makeOBDeliveryTotal(args)
  const getEquipmentCostTotal = args => makeOBDeliveryTotal(args)
  const getOnsiteCostTotal = args => makeOBDeliveryTotal(args)
  const getOvertimeTotal = args => makeOBDeliveryTotal(args)
  const getNonDeductionTotal = args => makeOBDeliveryTotal(args)
  const getOtherCost = args => makeOBDeliveryTotal(args)

  const getSenorityBonusTotal = ({ targetItem, sectionKey, rowKey }) =>
    getSumAllValues({ targetItem, sectionKey, rowKey })

  const getProjectBonusDU = ({ targetItem }) => {
    const bonus = getItem({
      sectionKey: 'REFERENCE',
      rowKey: 'PRODUCTION_MM_BONUS',
      columnKey: targetItem.columnKey,
      compareKey: targetItem.compareKey,
    }).value
    const mmBillDU = getMMBillDU({
      targetItem: getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_BILL',
        columnKey: targetItem.columnKey,
        compareKey: targetItem.compareKey,
      }),
    })
    return bonus != null && mmBillDU != null
      ? new Decimal(bonus).times(new Decimal(mmBillDU)).toNumber()
      : null
  }

  const getProjectBonusDUByViewMode = ({ targetItem, rowKey }) => {
    if (isOB()) return getOBDeliveryExpenseDU({ targetItem, rowKey })
    return getProjectBonusDU({ targetItem })
  }

  const getProjectBonusTotal = () => {
    if (isOB())
      return getOBDeliveryExpenseTotalFromOnsite({ rowKey: 'PROJECT_BONUS' })
    const duItems = getItems({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'PROJECT_BONUS',
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(
      ...duItems.map(item => getProjectBonusDU({ targetItem: item }))
    )
  }

  const getTotalTax = ({ targetItem }) => {
    const colKey = targetItem.columnKey
    if (colKey === 'INTERNAL') return null
    if (colKey !== 'TOTAL' && viewMode === 'Total') return undefined

    if (colKey === 'TOTAL' && isOBOrTotal()) {
      const perLoc = LOC_TYPES.map(locType => {
        const revTotal = getCrossViewCell(
          locType,
          'REVENUES',
          'REVENUES_TOTAL',
          'TOTAL'
        )
        const picCit = getCrossViewCell(locType, 'TAX', 'PIC_CIT', 'TOTAL')
        if (revTotal == null || picCit == null) return null
        return new Decimal(revTotal)
          .times(new Decimal(picCit))
          .dividedBy(100)
          .toNumber()
      })
      if (perLoc.some(v => v !== null)) return getSum(...perLoc)
      return undefined
    }

    if (isOB() && isSaleCol(colKey)) {
      return getSum(
        ...LOC_TYPES.map(locType =>
          getCrossViewCell(locType, 'TAX', 'TAX_TOTAL', 'SALE')
        )
      )
    }

    if (isOB()) {
      const cross = getOBCrossViewCell('TAX', 'TAX_TOTAL', targetItem)
      if (cross !== undefined) return cross
      return null
    }

    const revenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: colKey,
    })
    if (!revenues || !revenues.sectionKey) return undefined
    const revenuesValue = getTotalColumnAndSet({
      targetItem: revenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })
    const pic = getItem({
      sectionKey: 'TAX',
      rowKey: 'PIC_CIT',
      columnKey: 'TOTAL',
    }).value
    return revenuesValue != null && pic != null
      ? new Decimal(revenuesValue)
          .times(new Decimal(pic))
          .dividedBy(100)
          .toNumber()
      : null
  }

  const getOBTaxDU = ({ targetItem }) => {
    if (!isOB()) return getTotalTax({ targetItem })
    const locType = getOBLocationTypeByDisplayKey(getDisplayColumnKey(targetItem))
    if (!locType) return null
    const revenuesItem = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: targetItem.columnKey,
      compareKey: targetItem.compareKey,
    })
    if (!revenuesItem || !revenuesItem.sectionKey) return null
    const revenueValue = getTotalColumnAndSet({
      targetItem: revenuesItem,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })
    const picCit = getCrossViewCell(locType, 'TAX', 'PIC_CIT', 'TOTAL')
    if (revenueValue == null || picCit == null) return null
    return new Decimal(revenueValue)
      .times(new Decimal(picCit))
      .dividedBy(100)
      .toNumber()
  }

  const getTaxExpensesTotal = ({ targetItem }) => {
    if (isOB()) {
      // Correct formula: Σ(RevTotal_loc × PIC_CIT_loc / 100) for each loc type
      // getTotalTax already implements this for colKey=TOTAL on OBOrTotal
      return getTotalTax({ targetItem: getItem({ sectionKey: 'TAX', rowKey: 'TAX_TOTAL', columnKey: 'TOTAL' }) })
    }
    return getTotalTax({ targetItem })
  }

  const getOBMarginRowNegativeDUSum = ({ rowKey }) =>
    getOBNegativeCrossViewDUSum('MARGIN', rowKey)

  const getAllocationOfPoolTotal = () => {
    if (isOB()) {
      // Sum computed DU values from OB combined data (Offshore delivery = 0 already reflected)
      const duItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
        filterCallback: item => isDU(item.columnKey),
      })
      return getSum(
        ...duItems.map(item => getAllocationOfPoolDU({ targetItem: item }))
      )
    }
    const duItems = getItems({
      sectionKey: 'MARGIN',
      rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(
      ...duItems.map(item => getAllocationOfPoolDU({ targetItem: item }))
    )
  }

  const getOBAllocationPoolCellValue = ({ targetItem, columnKey }) => {
    if (!isOB()) return undefined
    const colKey = (targetItem && targetItem.columnKey) || columnKey
    const displayKey = getDisplayColumnKey(targetItem) || colKey
    if (isSaleCol(colKey)) {
      const locType = getOBLocationTypeByDisplayKey(displayKey)
      if (!locType) return undefined
      // Offshore DU has DLC=0 in OB → Offshore allocation = 0
      if (locType === 'Offshore') return 0
      // Onsite data is not adjusted in OB → read directly from Onsite individual view
      const cell = getCrossViewCell(
        locType,
        'MARGIN',
        'ALLOCATION_OF_POOL_AND_UNBILLABLE',
        'SALE'
      )
      return cell == null ? 0 : cell
    }
    if (isDU(colKey)) {
      // Compute from OB combined data: (DirectLaborCost / BillRateNorm%) - DirectLaborCost
      const directLabor = getItem({
        sectionKey: 'DELIVERY_EXPENSES',
        rowKey: 'DIRECT_LABOR_COST',
        columnKey: targetItem.columnKey,
        compareKey: targetItem.compareKey,
      }).value
      const billRateNorm = getItem({
        sectionKey: 'REFERENCE',
        rowKey: 'BILL_RATE_NORM',
        columnKey: targetItem.columnKey,
        compareKey: targetItem.compareKey,
      }).value
      if (directLabor == null || billRateNorm == null) return 0
      return new Decimal(directLabor)
        .times(100)
        .dividedBy(new Decimal(billRateNorm))
        .minus(new Decimal(directLabor))
        .toNumber()
    }
    for (let i = 0; i < LOC_TYPES.length; i++) {
      const locData = viewModeDataMap[LOC_TYPES[i]]
      if (!locData) continue
      const row =
        locData.businessPlanItems['MARGIN'] &&
        locData.businessPlanItems['MARGIN'].data[
          'ALLOCATION_OF_POOL_AND_UNBILLABLE'
        ]
      if (!row) continue
      const cell = row.data.find(c => c.columnKey === colKey)
      if (cell) return cell.value == null ? 0 : cell.value
    }
    return 0
  }

  const getAllocationOfPoolDU = ({ targetItem }) => {
    if (isOB()) return getOBAllocationPoolCellValue({ targetItem })
    const directLabor = getItem({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
      columnKey: targetItem.columnKey,
      compareKey: targetItem.compareKey,
    }).value
    const billRateNorm = getItem({
      sectionKey: 'REFERENCE',
      rowKey: 'BILL_RATE_NORM',
      columnKey: targetItem.columnKey,
      compareKey: targetItem.compareKey,
    }).value
    if (directLabor == null || billRateNorm == null) return null
    return new Decimal(directLabor)
      .times(100)
      .dividedBy(new Decimal(billRateNorm))
      .minus(new Decimal(directLabor))
      .toNumber()
  }

  const getDirectMargin = ({ targetItem }) => {
    const colKey = targetItem.columnKey

    if (isOB() && colKey === 'INTERNAL') {
      // INTERNAL = −Σ DU: compute from each DU's formula (respects Offshore delivery=0, etc.)
      const duItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN',
        filterCallback: item => isDU(item.columnKey),
      })
      const sum = getSum(...duItems.map(item => getDirectMargin({ targetItem: item })))
      return sum !== null ? decimalNegate(sum) : null
    } else if (isOB() && isSaleCol(colKey)) {
      const ck = targetItem.compareKey
      const revenuesItem = getItem({ sectionKey: 'REVENUES', rowKey: 'REVENUES_TOTAL', columnKey: colKey, compareKey: ck })
      const costItem = getItem({ sectionKey: 'COST_PRICE', rowKey: 'COST_PRICE_TOTAL', columnKey: colKey, compareKey: ck })
      const sellingItem = getItem({ sectionKey: 'SELLING_EXPENSES', rowKey: 'SELLING_EXPENSES_TOTAL', columnKey: colKey, compareKey: ck })
      const deliveryItem = getItem({ sectionKey: 'DELIVERY_EXPENSES', rowKey: 'DELIVERY_EXPENSES_TOTAL', columnKey: colKey, compareKey: ck })
      const taxItem = getItem({ sectionKey: 'TAX', rowKey: 'TAX_TOTAL', columnKey: colKey, compareKey: ck })
      const revenuesValue = getTotalColumnAndSet({ targetItem: revenuesItem, serviceRowKey: sectionConfig.REVENUES.newRowKey })
      const costValue = getTotalColumnAndSet({ targetItem: costItem, serviceRowKey: sectionConfig.COST_PRICE && sectionConfig.COST_PRICE.newRowKey })
      const sellingValue = getTotalColumnAndSet({ targetItem: sellingItem, serviceRowKey: sectionConfig.SELLING_EXPENSES && sectionConfig.SELLING_EXPENSES.newRowKey })
      const deliveryValue = getTotalColumnAndSet({ targetItem: deliveryItem, serviceRowKey: sectionConfig.DELIVERY_EXPENSES && sectionConfig.DELIVERY_EXPENSES.newRowKey })
      const taxRaw = getOBTaxDU({ targetItem: taxItem })
      const tax = taxRaw != null ? taxRaw : taxItem.value
      const expenseSum = getSum(costValue, sellingValue, deliveryValue, tax)
      return revenuesValue != null && expenseSum != null
        ? new Decimal(revenuesValue).minus(new Decimal(expenseSum)).toNumber()
        : null
    }

    const ck = targetItem.compareKey
    const colItems = {
      revenues: getItem({
        sectionKey: 'REVENUES',
        rowKey: 'REVENUES_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      }),
      cost: getItem({
        sectionKey: 'COST_PRICE',
        rowKey: 'COST_PRICE_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      }),
      selling: getItem({
        sectionKey: 'SELLING_EXPENSES',
        rowKey: 'SELLING_EXPENSES_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      }),
      delivery: getItem({
        sectionKey: 'DELIVERY_EXPENSES',
        rowKey: 'DELIVERY_EXPENSES_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      }),
      tax: getItem({
        sectionKey: 'TAX',
        rowKey: 'TAX_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      }),
    }

    const taxFormula =
      isOB() && colKey === 'TOTAL'
        ? getTaxExpensesTotal({ targetItem: colItems.tax })
        : isOB() && (isDU(colKey) || colKey === 'INTERNAL')
        ? getOBTaxDU({ targetItem: colItems.tax })
        : getTotalTax({ targetItem: colItems.tax })
    const taxValue = taxFormula !== undefined ? taxFormula : colItems.tax.value

    const expenseSum = getSum(
      ...[colItems.cost, colItems.selling, colItems.delivery].map(item =>
        getTotalColumnAndSet({
          targetItem: item,
          serviceRowKey:
            sectionConfig[item.sectionKey] &&
            sectionConfig[item.sectionKey].newRowKey,
        })
      ),
      taxValue
    )

    const revenuesValue = getTotalColumnAndSet({
      targetItem: colItems.revenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return revenuesValue != null && expenseSum != null
      ? new Decimal(revenuesValue).minus(new Decimal(expenseSum)).toNumber()
      : null
  }

  const getDirectMarginBonusDU = ({ targetItem }) => {
    // For non-DU cols in OB/Total (e.g. SALE cols), try cross-view
    // Exclude INTERNAL in OB — it uses the formula path below
    if (isOBOrTotal() && !isDU(targetItem.columnKey) && !(isOB() && targetItem.columnKey === 'INTERNAL')) {
      const cross = getOBCrossViewCell(
        'MARGIN',
        'DIRECT_MARGIN_BONUS',
        targetItem
      )
      if (cross !== undefined) return cross
    }
    return getSum(
      getProjectBonusDUByViewMode({
        targetItem: getItem({
          sectionKey: 'DELIVERY_EXPENSES',
          rowKey: 'PROJECT_BONUS',
          columnKey: targetItem.columnKey,
          compareKey: targetItem.compareKey,
        }),
        rowKey: 'PROJECT_BONUS',
      }),
      getDirectMargin({
        targetItem: getItem({
          sectionKey: 'MARGIN',
          rowKey: 'DIRECT_MARGIN',
          columnKey: targetItem.columnKey,
          compareKey: targetItem.compareKey,
        }),
      })
    )
  }

  const getDirectMarginBonusSaleInternal = ({ targetItem }) => {
    const colKey = targetItem.columnKey
    if (isOB() && colKey === 'INTERNAL') {
      const dm = getDirectMargin({ targetItem })
      // Incentives = 0 for INTERNAL in OB
      // ProjectBonus: read raw INTERNAL value from OB combined data
      const projectBonus = getItem({
        sectionKey: 'DELIVERY_EXPENSES',
        rowKey: 'PROJECT_BONUS',
        columnKey: 'INTERNAL',
      }).value
      return getSum(dm, projectBonus)
    }
    if (isOBOrTotal() && isSaleCol(colKey)) {
      const perLoc = LOC_TYPES.map(locType =>
        getCrossViewCell(locType, 'MARGIN', 'DIRECT_MARGIN', colKey)
      )
      return perLoc.some(v => v !== null) ? getSum(...perLoc) : undefined
    }
    return getSum(
      colKey === 'INTERNAL' ? null : getIncentiveTotal(),
      getDirectMargin({
        targetItem: getItem({
          sectionKey: 'MARGIN',
          rowKey: 'DIRECT_MARGIN',
          columnKey: colKey,
        }),
      })
    )
  }

  const getDirectMarginBonusTotal = () => {
    if (isOB()) {
      const dmItem = getItem({ sectionKey: 'MARGIN', rowKey: 'DIRECT_MARGIN', columnKey: 'TOTAL' })
      const dm = getDirectMargin({ targetItem: dmItem })
      const incentives = getItem({ sectionKey: 'SELLING_EXPENSES', rowKey: 'INCENTIVES', columnKey: 'TOTAL' }).value
      const projectBonus = getProjectBonusTotal()
      return getSum(dm, incentives, projectBonus)
    }
    if (isOBOrTotal()) return sumCrossViewTotals('MARGIN', 'DIRECT_MARGIN_BONUS')
    return getSum(
      getIncentiveTotal(),
      getProjectBonusTotal(),
      getDirectMargin({
        targetItem: getItem({
          sectionKey: 'MARGIN',
          rowKey: 'DIRECT_MARGIN',
          columnKey: 'TOTAL',
        }),
      })
    )
  }

  const getIndirectMarginDU = ({ targetItem }) => {
    const dm = getDirectMargin({
      targetItem: getItem({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN',
        columnKey: targetItem.columnKey,
        compareKey: targetItem.compareKey,
      }),
    })
    const alloc = getAllocationOfPoolDU({
      targetItem: getItem({
        sectionKey: 'MARGIN',
        rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
        columnKey: targetItem.columnKey,
        compareKey: targetItem.compareKey,
      }),
    })
    return dm != null
      ? new Decimal(dm).minus(new Decimal(alloc || 0)).toNumber()
      : null
  }

  const getIndirectMarginTotal = () => {
    if (isOB()) {
      const duItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'INDIRECT_MARGIN',
        filterCallback: item => isDU(item.columnKey),
      })
      return getSum(...duItems.map(item => getIndirectMarginDU({ targetItem: item })))
    }
    if (isOBOrTotal()) return sumCrossViewTotals('MARGIN', 'INDIRECT_MARGIN')
    const dm = getDirectMargin({
      targetItem: getItem({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN',
        columnKey: 'TOTAL',
      }),
    })
    const alloc = getAllocationOfPoolTotal()
    return dm != null
      ? new Decimal(dm).minus(new Decimal(alloc || 0)).toNumber()
      : null
  }

  const getIndirectMarginInternalSale = ({ targetItem }) => {
    if (isOB() && targetItem.columnKey === 'INTERNAL') {
      const duItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'INDIRECT_MARGIN',
        filterCallback: item => isDU(item.columnKey),
      })
      return getSum(...duItems.map(item => getIndirectMarginDU({ targetItem: item })))
    }
    if (isOB() && isSaleCol(targetItem.columnKey)) {
      const saleItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'INDIRECT_MARGIN',
        filterCallback: item => isSaleCol(item.columnKey),
      })
      return getSum(
        ...saleItems.map(item => {
          const dm = getDirectMargin({
            targetItem: getItem({
              sectionKey: 'MARGIN',
              rowKey: 'DIRECT_MARGIN',
              columnKey: item.columnKey,
              compareKey: item.compareKey,
            }),
          })
          const alloc = getOBAllocationPoolCellValue({ targetItem: item })
          return dm != null
            ? new Decimal(dm).minus(new Decimal(alloc || 0)).toNumber()
            : null
        })
      )
    }
    if (viewMode === 'Total' && isSaleCol(targetItem.columnKey)) {
      const perLoc = LOC_TYPES.map(locType =>
        getCrossViewCell(locType, 'MARGIN', 'INDIRECT_MARGIN', 'SALE')
      )
      return perLoc.some(v => v !== null) ? getSum(...perLoc) : null
    }
    if (isOBOrTotal()) {
      const cross = getOBCrossViewCell('MARGIN', 'INDIRECT_MARGIN', targetItem)
      if (cross !== undefined) return cross
    }
    const dm = getDirectMargin({
      targetItem: getItem({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN',
        columnKey: targetItem.columnKey,
      }),
    })
    const alloc = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
      columnKey: targetItem.columnKey,
    }).value
    return dm != null
      ? new Decimal(dm).minus(new Decimal(alloc || 0)).toNumber()
      : null
  }

  const getMarginRate = ({
    targetItem,
    marginRowKey,
    marginValueFn,
    rateRowKey,
    isInternalFn,
  }) => {
    const colKey = targetItem.columnKey
    const ck = targetItem.compareKey

    if (isInternalFn && isInternalFn(colKey))
      return getOBNegativeCrossViewDUSum('MARGIN', rateRowKey)

    if (colKey === 'TOTAL' && isOBOrTotal()) {
      const totals = sumCrossViewTotals('MARGIN', rateRowKey)
      if (totals !== undefined) return totals
    }

    // For SALE cols in OB/Total: sum the rate across all loc types
    if (isOBOrTotal() && isSaleCol(colKey)) {
      const perLoc = LOC_TYPES.map(locType =>
        getCrossViewCell(locType, 'MARGIN', rateRowKey, 'SALE')
      )
      if (perLoc.some(v => v !== null)) return getSum(...perLoc)
      return undefined
    }

    // Rate rows are computed (not stored), so skip cross-view for DU in OB/Total
    if (!isDU(colKey) || !isOBOrTotal()) {
      const crossView = getOBCrossViewCell('MARGIN', rateRowKey, targetItem)
      if (crossView !== undefined) return crossView
    }

    const marginValue = marginValueFn
      ? marginValueFn({
          targetItem: getItem({
            sectionKey: 'MARGIN',
            rowKey: marginRowKey,
            columnKey: colKey,
            compareKey: ck,
          }),
        })
      : null

    const revenuesValue = getTotalColumnAndSet({
      targetItem: getItem({
        sectionKey: 'REVENUES',
        rowKey: 'REVENUES_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      }),
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return decimalDividePercent(marginValue, revenuesValue)
  }

  const getDirectMarginRate = ({ targetItem }) => {
    if (isOB() && targetItem.columnKey === 'INTERNAL') {
      const duItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN_RATE',
        filterCallback: item => isDU(item.columnKey),
      })
      return getSum(...duItems.map(item => getDirectMarginRate({ targetItem: item })))
    }
    if (isOB() && targetItem.columnKey === 'TOTAL') {
      const duItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN_RATE',
        filterCallback: item => isDU(item.columnKey),
      })
      return getSum(...duItems.map(item => getDirectMarginRate({ targetItem: item })))
    }
    if (isOB() && isSaleCol(targetItem.columnKey)) {
      const saleItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN_RATE',
        filterCallback: item => isSaleCol(item.columnKey),
      })
      const totalDM = getSum(
        ...saleItems.map(item =>
          getDirectMargin({
            targetItem: getItem({
              sectionKey: 'MARGIN',
              rowKey: 'DIRECT_MARGIN',
              columnKey: item.columnKey,
              compareKey: item.compareKey,
            }),
          })
        )
      )
      const totalRev = getSum(
        ...saleItems.map(item =>
          getTotalColumnAndSet({
            targetItem: getItem({
              sectionKey: 'REVENUES',
              rowKey: 'REVENUES_TOTAL',
              columnKey: item.columnKey,
              compareKey: item.compareKey,
            }),
            serviceRowKey: sectionConfig.REVENUES.newRowKey,
          })
        )
      )
      return decimalDividePercent(totalDM, totalRev)
    }
    return getMarginRate({
      targetItem,
      marginRowKey: 'DIRECT_MARGIN',
      marginValueFn: getDirectMargin,
      rateRowKey: 'DIRECT_MARGIN_RATE',
    })
  }

  const getDirectMarginBonusRateTotal = () => {
    if (isOB()) {
      const duItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN_BONUS_RATE',
        filterCallback: item => isDU(item.columnKey),
      })
      return getSum(...duItems.map(item => getDirectMarginBonusRateDU({ targetItem: item })))
    }
    if (isOBOrTotal()) {
      const totals = sumCrossViewTotals('MARGIN', 'DIRECT_MARGIN_BONUS_RATE')
      if (totals !== undefined) return totals
    }
    return decimalDividePercent(
      getDirectMarginBonusTotal(),
      getTotalColumnAndSet({
        targetItem: getItem({
          sectionKey: 'REVENUES',
          rowKey: 'REVENUES_TOTAL',
          columnKey: 'TOTAL',
        }),
        serviceRowKey: sectionConfig.REVENUES.newRowKey,
      })
    )
  }

  const getDirectMarginBonusRateSaleInternal = ({ targetItem }) => {
    if (isOB() && targetItem.columnKey === 'INTERNAL') {
      const duItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN_BONUS_RATE',
        filterCallback: item => isDU(item.columnKey),
      })
      return getSum(...duItems.map(item => getDirectMarginBonusRateDU({ targetItem: item })))
    }
    if (isOB() && isSaleCol(targetItem.columnKey)) {
      const saleItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN_BONUS_RATE',
        filterCallback: item => isSaleCol(item.columnKey),
      })
      const totalDMBonus = getSum(
        ...saleItems.map(item => {
          const dm = getDirectMargin({
            targetItem: getItem({
              sectionKey: 'MARGIN',
              rowKey: 'DIRECT_MARGIN',
              columnKey: item.columnKey,
              compareKey: item.compareKey,
            }),
          })
          const projectBonus = getItem({
            sectionKey: 'DELIVERY_EXPENSES',
            rowKey: 'PROJECT_BONUS',
            columnKey: item.columnKey,
            compareKey: item.compareKey,
          }).value
          return getSum(dm, projectBonus)
        })
      )
      const totalRev = getSum(
        ...saleItems.map(item =>
          getTotalColumnAndSet({
            targetItem: getItem({
              sectionKey: 'REVENUES',
              rowKey: 'REVENUES_TOTAL',
              columnKey: item.columnKey,
              compareKey: item.compareKey,
            }),
            serviceRowKey: sectionConfig.REVENUES.newRowKey,
          })
        )
      )
      return decimalDividePercent(totalDMBonus, totalRev)
    }
    return getMarginRate({
      targetItem,
      marginRowKey: 'DIRECT_MARGIN_BONUS',
      marginValueFn: getDirectMarginBonusSaleInternal,
      rateRowKey: 'DIRECT_MARGIN_BONUS_RATE',
      isInternalFn: colKey => isOB() && colKey === 'INTERNAL',
    })
  }

  const getDirectMarginBonusRateDU = ({ targetItem }) =>
    getMarginRate({
      targetItem,
      marginRowKey: 'DIRECT_MARGIN_BONUS',
      marginValueFn: getDirectMarginBonusDU,
      rateRowKey: 'DIRECT_MARGIN_BONUS_RATE',
    })

  const getIndirectMarginRateDU = ({ targetItem }) =>
    getMarginRate({
      targetItem,
      marginRowKey: 'INDIRECT_MARGIN',
      marginValueFn: getIndirectMarginDU,
      rateRowKey: 'INDIRECT_MARGIN_RATE',
    })

  const getIndirectMarginRateSaleInternal = ({ targetItem }) => {
    if (isOB() && targetItem.columnKey === 'INTERNAL') {
      const duItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'INDIRECT_MARGIN_RATE',
        filterCallback: item => isDU(item.columnKey),
      })
      return getSum(...duItems.map(item => getIndirectMarginRateDU({ targetItem: item })))
    }
    if (isOB() && isSaleCol(targetItem.columnKey)) {
      const saleItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'INDIRECT_MARGIN_RATE',
        filterCallback: item => isSaleCol(item.columnKey),
      })
      const totalIM = getSum(
        ...saleItems.map(item => {
          const dm = getDirectMargin({
            targetItem: getItem({
              sectionKey: 'MARGIN',
              rowKey: 'DIRECT_MARGIN',
              columnKey: item.columnKey,
              compareKey: item.compareKey,
            }),
          })
          const alloc = getOBAllocationPoolCellValue({ targetItem: item })
          return dm != null
            ? new Decimal(dm).minus(new Decimal(alloc || 0)).toNumber()
            : null
        })
      )
      const totalRev = getSum(
        ...saleItems.map(item =>
          getTotalColumnAndSet({
            targetItem: getItem({
              sectionKey: 'REVENUES',
              rowKey: 'REVENUES_TOTAL',
              columnKey: item.columnKey,
              compareKey: item.compareKey,
            }),
            serviceRowKey: sectionConfig.REVENUES.newRowKey,
          })
        )
      )
      return decimalDividePercent(totalIM, totalRev)
    }
    return getMarginRate({
      targetItem,
      marginRowKey: 'INDIRECT_MARGIN',
      marginValueFn: getIndirectMarginInternalSale,
      rateRowKey: 'INDIRECT_MARGIN_RATE',
      isInternalFn: colKey => isOB() && colKey === 'INTERNAL',
    })
  }

  const getIndirectMarginRateTotal = () => {
    if (isOB()) {
      const duItems = getItems({
        sectionKey: 'MARGIN',
        rowKey: 'INDIRECT_MARGIN_RATE',
        filterCallback: item => isDU(item.columnKey),
      })
      return getSum(...duItems.map(item => getIndirectMarginRateDU({ targetItem: item })))
    }
    if (isOBOrTotal()) {
      const perLoc = LOC_TYPES.map(locType => {
        const indTotal = getCrossViewCell(
          locType,
          'MARGIN',
          'INDIRECT_MARGIN',
          'TOTAL'
        )
        const revTotal = getCrossViewCell(
          locType,
          'REVENUES',
          'REVENUES_TOTAL',
          'TOTAL'
        )
        return decimalDividePercent(indTotal, revTotal)
      })
      if (perLoc.some(v => v !== null)) return getSum(...perLoc)
      return undefined
    }
    return decimalDividePercent(
      getIndirectMarginTotal(),
      getTotalColumnAndSet({
        targetItem: getItem({
          sectionKey: 'REVENUES',
          rowKey: 'REVENUES_TOTAL',
          columnKey: 'TOTAL',
        }),
        serviceRowKey: sectionConfig.REVENUES.newRowKey,
      })
    )
  }

  const getOBCrossViewRefCell = ({ targetItem, refRowKey }) => {
    if (isOBOrTotal() && isSaleCol(targetItem.columnKey)) {
      const perLoc = LOC_TYPES.map(locType =>
        getCrossViewCell(locType, 'REFERENCE', refRowKey, 'SALE')
      )
      if (perLoc.some(v => v !== null)) return getSum(...perLoc)
      return undefined
    }
    return getOBCrossViewCell('REFERENCE', refRowKey, targetItem)
  }

  const makeRefCrossViewFn =
    refRowKey =>
    ({ targetItem }) =>
      getOBCrossViewRefCell({ targetItem, refRowKey })

  const getDeliveryAverageExpensesTotal = () => {
    if (isOBOrTotal())
      return sumCrossViewTotals('REFERENCE', 'DELIVERY_AVERAGE_EXPENSES')
    return decimalDivide(
      getTotalColumnAndSet({
        targetItem: getItem({
          sectionKey: 'DELIVERY_EXPENSES',
          rowKey: 'DELIVERY_EXPENSES_TOTAL',
          columnKey: 'TOTAL',
        }),
        serviceRowKey: sectionConfig.DELIVERY_EXPENSES.newRowKey,
      }),
      getMMManufactureTotal()
    )
  }

  const getDeliveryAverageExpensesInternal = () => {
    if (!isOB()) return null
    const duItems = getItems({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DELIVERY_EXPENSES_TOTAL',
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(
      ...duItems.map(item => {
        const delivery = getTotalColumnAndSet({
          targetItem: getItem({
            sectionKey: 'DELIVERY_EXPENSES',
            rowKey: 'DELIVERY_EXPENSES_TOTAL',
            columnKey: item.columnKey,
            compareKey: item.compareKey,
          }),
          serviceRowKey: sectionConfig.DELIVERY_EXPENSES.newRowKey,
        })
        const mm = getItem({
          sectionKey: 'MAN_MONTH',
          rowKey: 'MM_PRODUCTION',
          columnKey: item.columnKey,
          compareKey: item.compareKey,
        }).value
        return decimalDivide(delivery, mm)
      })
    )
  }

  const getDeliveryAverageExpensesSale = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({
      targetItem,
      refRowKey: 'DELIVERY_AVERAGE_EXPENSES',
    })
    if (cross !== undefined) return cross
    return decimalDivide(getDUCostSale(), getMMManufactureSale())
  }

  const getDeliveryAverageExpensesDU = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({
      targetItem,
      refRowKey: 'DELIVERY_AVERAGE_EXPENSES',
    })
    if (cross !== undefined) return cross
    return decimalDivide(
      getTotalColumnAndSet({
        targetItem: getItem({
          sectionKey: 'DELIVERY_EXPENSES',
          rowKey: 'DELIVERY_EXPENSES_TOTAL',
          columnKey: targetItem.columnKey,
        }),
        serviceRowKey: sectionConfig.DELIVERY_EXPENSES.newRowKey,
      }),
      getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_PRODUCTION',
        columnKey: targetItem.columnKey,
      }).value
    )
  }

  const getSalaryAverageExpensesTotal = () => {
    if (isOBOrTotal())
      return sumCrossViewTotals('REFERENCE', 'SALARY_AVERAGE_EXPENSES')
    return decimalDivide(
      getDirectLaborCostTotal({
        sectionKey: 'DELIVERY_EXPENSES',
        rowKey: 'DIRECT_LABOR_COST',
      }),
      getMMManufactureTotal()
    )
  }

  const getSalaryAverageExpensesInternal = () => {
    if (!isOB()) return null
    const duItems = getItems({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(
      ...duItems.map(item => {
        const dlc = getItem({
          sectionKey: 'DELIVERY_EXPENSES',
          rowKey: 'DIRECT_LABOR_COST',
          columnKey: item.columnKey,
          compareKey: item.compareKey,
        }).value
        const mm = getItem({
          sectionKey: 'MAN_MONTH',
          rowKey: 'MM_PRODUCTION',
          columnKey: item.columnKey,
          compareKey: item.compareKey,
        }).value
        return decimalDivide(dlc, mm)
      })
    )
  }

  const getSalaryAverageExpensesDU = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({
      targetItem,
      refRowKey: 'SALARY_AVERAGE_EXPENSES',
    })
    if (cross !== undefined) return cross
    return decimalDivide(
      getItem({
        sectionKey: 'DELIVERY_EXPENSES',
        rowKey: 'DIRECT_LABOR_COST',
        columnKey: targetItem.columnKey,
      }).value,
      getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_PRODUCTION',
        columnKey: targetItem.columnKey,
      }).value
    )
  }

  const getSalaryAverageExpensesSale = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({
      targetItem,
      refRowKey: 'SALARY_AVERAGE_EXPENSES',
    })
    if (cross !== undefined) return cross
    return decimalDivide(
      getItem({
        sectionKey: 'DELIVERY_EXPENSES',
        rowKey: 'DIRECT_LABOR_COST',
        columnKey: targetItem.columnKey,
      }).value,
      getMMManufactureSale()
    )
  }

  const getBillableRateTotal = () => {
    if (isOBOrTotal()) return sumCrossViewTotals('REFERENCE', 'BILLABLE_RATE')
    return decimalDividePercent(getMMBillSale(), getMMManufactureTotal())
  }

  const getBillableRateDU = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({
      targetItem,
      refRowKey: 'BILLABLE_RATE',
    })
    if (cross !== undefined) return cross
    return decimalDividePercent(
      getMMBillDU({
        targetItem: getItem({
          sectionKey: 'MAN_MONTH',
          rowKey: 'MM_BILL',
          columnKey: targetItem.columnKey,
        }),
      }),
      getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_PRODUCTION',
        columnKey: targetItem.columnKey,
      }).value
    )
  }

  const getBillableRateSale = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({
      targetItem,
      refRowKey: 'BILLABLE_RATE',
    })
    if (cross !== undefined) return cross
    return decimalDividePercent(getMMBillSale(), getMMManufactureSale())
  }

  const getProductivityTotal = () => {
    if (isOBOrTotal()) return sumCrossViewTotals('REFERENCE', 'PRODUCTIVITY')
    return decimalDivide(getSoftwareProductionTotal(), getMMManufactureTotal())
  }

  const getProductivitySale = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({
      targetItem,
      refRowKey: 'PRODUCTIVITY',
    })
    if (cross !== undefined) return cross
    return decimalDivide(getSoftwareProductionSale(), getMMManufactureSale())
  }

  const getProductivityDU = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({
      targetItem,
      refRowKey: 'PRODUCTIVITY',
    })
    if (cross !== undefined) return cross
    return decimalDivide(
      getSoftwareProductionDU({
        targetItem: getItem({
          sectionKey: 'REVENUES',
          rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
          columnKey: targetItem.columnKey,
        }),
      }),
      getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_PRODUCTION',
        columnKey: targetItem.columnKey,
      }).value
    )
  }

  const getEfficiencyTotal = ({ targetItem }) => {
    if (isOBOrTotal()) return sumCrossViewTotals('REFERENCE', 'EFFICIENCY')
    const dmItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem && targetItem.columnKey,
    })
    if (!dmItem || !dmItem.sectionKey) return undefined
    return decimalDivide(
      getDirectMargin({ targetItem: dmItem }),
      getMMManufactureTotal()
    )
  }

  const getEfficiencySale = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({ targetItem, refRowKey: 'EFFICIENCY' })
    if (cross !== undefined) return cross
    const dmItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })
    if (!dmItem || !dmItem.sectionKey) return undefined
    return decimalDivide(
      getDirectMargin({ targetItem: dmItem }),
      getMMManufactureSale()
    )
  }

  const getEfficiencyDU = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({ targetItem, refRowKey: 'EFFICIENCY' })
    if (cross !== undefined) return cross
    const dmItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })
    if (!dmItem || !dmItem.sectionKey) return undefined
    return decimalDivide(
      getDirectMargin({ targetItem: dmItem }),
      getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_PRODUCTION',
        columnKey: targetItem.columnKey,
      }).value
    )
  }
  const getIncentivesRateCell = makeRefCrossViewFn('INCENTIVES_RATE')
  const getProductionMMBonusCell = makeRefCrossViewFn('PRODUCTION_MM_BONUS')
  const getBillRateNormCell = makeRefCrossViewFn('BILL_RATE_NORM')

  const hideInOB = fn => args => isOB() ? undefined : fn(args)
  const obOnly = fn => args => isOB() ? fn(args) : null

  const SPECIAL_SECTIONS = new Set([
    'REVENUES',
    'COST_PRICE',
    'SELLING_EXPENSES',
    'DELIVERY_EXPENSES',
    'TAX',
    'MARGIN',
    'REFERENCE',
  ])

  const isSpecialSectionFormula = secKey => SPECIAL_SECTIONS.has(secKey)

  const FORMULA_CONFIG = {
    MAN_MONTH: {
      UNIT_PRICE: { total: getUnitPriceTotal },
      MM_PRODUCTION: {
        total: getMMManufactureTotal,
        sale: getMMManufactureSale,
      },
      MM_BILL: {
        total: getMMBillSale,
        sale: getMMBillSale,
        delivery_unit: getMMBillDU,
      },
      SERVICE: { total: getTotalMMBilService },
    },
    REVENUES: {
      REVENUES_TOTAL: {
        total: getTotalColumnAndSet,
        sale: getTotalColumnAndSet,
        internal: getRevenuesTotalInternal,
        delivery_unit: getTotalColumnAndSet,
      },
      SOFTWARE_PRODUCTION_REVENUES: {
        total: getSoftwareProductionTotal,
        sale: getSoftwareProductionSale,
        delivery_unit: getSoftwareProductionDU,
        internal: getSoftwareProductionInternal,
      },
      DEDUCTION: { total: getDeductionTotal, sale: getDeductionSale },
      ONSITE_FEE: { total: getOnsiteFeeTotal },
      EQUIPMENT_FEE: { total: getEquipmentFeeTotal },
      OTHER_FEE: { total: getOtherFeeTotal },
      SERVICE: { total: getRevenuesServiceTotal },
    },
    COST_PRICE: {
      COST_PRICE_TOTAL: {
        total: getTotalColumnAndSet,
        sale: getTotalColumnAndSet,
        internal: getTotalColumnAndSet,
        delivery_unit: getTotalColumnAndSet,
      },
      COST_OF_DU_SOLD: {
        total: getDUCostTotal,
        sale: getDUCostSaleOB,
        internal: getDUCostInternal,
      },
    },
    SELLING_EXPENSES: {
      SELLING_EXPENSES_TOTAL: {
        total: getTotalColumnAndSet,
        sale: getSellingExpensesTotalSaleOB,
        internal: getOBNegativeDUSumInternal,
      },
      INCENTIVES: {
        total: getIncentiveTotal,
        sale: getIncentiveSale,
        internal: getOBNegativeDUSumInternal,
      },
      AGENCY_EXPENSE: {
        total: getAgencyTotal,
        internal: getOBNegativeDUSumInternal,
      },
    },
    DELIVERY_EXPENSES: {
      DELIVERY_EXPENSES_TOTAL: {
        total: getTotalColumnAndSet,
        sale: getTotalColumnAndSet,
        internal: getTotalColumnAndSet,
        delivery_unit: getTotalColumnAndSet,
      },
      OUTSOURCING_COST: {
        total: getOutsourcingCostTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBNegativeDUSumInternal,
      },
      DIRECT_LABOR_COST: {
        total: getDirectLaborCostTotal,
        internal: getOBNegativeDUSumInternal,
      },
      EQUIPMENT_INTERNET_SERVER_COST: {
        total: getEquipmentCostTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBNegativeDUSumInternal,
      },
      ONSITE_DEVELOPMENT_COST: {
        total: getOnsiteCostTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBNegativeDUSumInternal,
      },
      PROJECT_BONUS: {
        total: getProjectBonusTotal,
        delivery_unit: getProjectBonusDUByViewMode,
        internal: getOBNegativeDUSumInternal,
      },
      OVERTIME: {
        total: getOvertimeTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBNegativeDUSumInternal,
      },
      NON_DEDUCTION_VAT: {
        total: getNonDeductionTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBNegativeDUSumInternal,
      },
      SENIORITY_BONUS: {
        total: getSenorityBonusTotal,
        internal: getOBNegativeDUSumInternal,
      },
      OTHER_EXPENSES: {
        total: getOtherCost,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBNegativeDUSumInternal,
      },
      SERVICE: {
        total: getSumAllValuesAndSet,
        internal: getOBNegativeDUSumInternal,
      },
    },
    TAX: {
      TAX_TOTAL: {
        total: getTaxExpensesTotal,
        sale: getTotalTax,
        internal: getOBNegativeDUSumInternal,
        delivery_unit: getOBTaxDU,
      },
      PIC_CIT: { internal: getOBNegativeDUSumInternal },
    },
    MARGIN: {
      DIRECT_MARGIN: {
        total: getDirectMargin,
        sale: getDirectMargin,
        internal: getDirectMargin,
        delivery_unit: getDirectMargin,
      },
      DIRECT_MARGIN_BONUS: {
        total: getDirectMarginBonusTotal,
        sale: getDirectMarginBonusSaleInternal,
        internal: getDirectMarginBonusSaleInternal,
        delivery_unit: getDirectMarginBonusDU,
      },
      ALLOCATION_OF_POOL_AND_UNBILLABLE: {
        total: getAllocationOfPoolTotal,
        sale: getOBAllocationPoolCellValue,
        delivery_unit: getAllocationOfPoolDU,
      },
      INDIRECT_MARGIN: {
        total: getIndirectMarginTotal,
        sale: getIndirectMarginInternalSale,
        internal: getIndirectMarginInternalSale,
        delivery_unit: getIndirectMarginDU,
      },
      DIRECT_MARGIN_RATE: {
        total: getDirectMarginRate,
        sale: getDirectMarginRate,
        internal: getDirectMarginRate,
        delivery_unit: getDirectMarginRate,
      },
      DIRECT_MARGIN_BONUS_RATE: {
        total: getDirectMarginBonusRateTotal,
        sale: getDirectMarginBonusRateSaleInternal,
        internal: getDirectMarginBonusRateSaleInternal,
        delivery_unit: getDirectMarginBonusRateDU,
      },
      INDIRECT_MARGIN_RATE: {
        total: getIndirectMarginRateTotal,
        sale: getIndirectMarginRateSaleInternal,
        internal: getIndirectMarginRateSaleInternal,
        delivery_unit: getIndirectMarginRateDU,
      },
    },
    REFERENCE: {
      DELIVERY_AVERAGE_EXPENSES: {
        total: getDeliveryAverageExpensesTotal,
        sale: hideInOB(getDeliveryAverageExpensesSale),
        internal: obOnly(getDeliveryAverageExpensesInternal),
        delivery_unit: hideInOB(getDeliveryAverageExpensesDU),
      },
      SALARY_AVERAGE_EXPENSES: {
        total: getSalaryAverageExpensesTotal,
        sale: getSalaryAverageExpensesSale,
        internal: obOnly(getSalaryAverageExpensesInternal),
        delivery_unit: hideInOB(getSalaryAverageExpensesDU),
      },
      BILLABLE_RATE: {
        total: hideInOB(getBillableRateTotal),
        sale: hideInOB(getBillableRateSale),
        internal: obOnly(getBillableRateTotal),
        delivery_unit: hideInOB(getBillableRateDU),
      },
      PRODUCTIVITY: {
        total: getProductivityTotal,
        delivery_unit: hideInOB(getProductivityDU),
      },
      EFFICIENCY: {
        total: getEfficiencyTotal,
        delivery_unit: hideInOB(getEfficiencyDU),
      },
      INCENTIVES_RATE: {
        sale: hideInOB(getIncentivesRateCell),
        internal: obOnly(
          ({ targetItem }) =>
            getItem({
              sectionKey: 'REFERENCE',
              rowKey: 'INCENTIVES_RATE',
              columnKey: targetItem.columnKey,
            }).value
        ),
        delivery_unit: hideInOB(getIncentivesRateCell),
      },
      PRODUCTION_MM_BONUS: {
        sale: hideInOB(getProductionMMBonusCell),
        internal: obOnly(
          ({ targetItem }) =>
            getItem({
              sectionKey: 'REFERENCE',
              rowKey: 'PRODUCTION_MM_BONUS',
              columnKey: targetItem.columnKey,
            }).value
        ),
        delivery_unit: hideInOB(getProductionMMBonusCell),
      },
      BILL_RATE_NORM: {
        sale: hideInOB(getBillRateNormCell),
        internal: obOnly(
          ({ targetItem }) =>
            getItem({
              sectionKey: 'REFERENCE',
              rowKey: 'BILL_RATE_NORM',
              columnKey: targetItem.columnKey,
            }).value
        ),
        delivery_unit: hideInOB(getBillRateNormCell),
      },
    },
  }

  const getFormula = ({ item, columnKey, sectionKey, rowKey, isService }) => {
    let colKey = columnKey.toLowerCase()
    if (colKey.includes('delivery_unit')) colKey = 'delivery_unit'
    else if (isSaleCol(colKey)) colKey = 'sale'
    const effectiveRowKey = isService ? 'SERVICE' : rowKey

    const rowConfig =
      FORMULA_CONFIG[sectionKey] && FORMULA_CONFIG[sectionKey][effectiveRowKey]
    const fn = rowConfig && rowConfig[colKey]
    if (!fn) return undefined

    const curSectionConfig = sectionConfig[sectionKey] || {}
    return fn({
      targetItem: item,
      columnKey,
      sectionKey,
      rowKey,
      serviceRowKey: curSectionConfig.newRowKey || '',
    })
  }

  return { getFormula, isSpecialSectionFormula }
}

export default useFormula
