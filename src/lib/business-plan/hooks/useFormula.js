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
  const getSaleLocType = compareKey => {
    const col = getColumnMetaByDisplayKey(compareKey)
    return col ? col.saleLocType : null
  }
  const isOBOrTotal = () => viewMode === 'OB' || viewMode === 'Total'

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
    getItems({
      sectionKey,
      rowKey,
      filterCallback,
    }).map(item => item.value)
  const getSumItemValues = ({ sectionKey, rowKey, filterCallback }) =>
    getSum(
      ...getItemValues({
        sectionKey,
        rowKey,
        filterCallback,
      })
    )
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
    return undefined
    const duSum = sumCrossViewDU(secKey, rowKey)
    return duSum !== null ? duSum : undefined
  }
  const getOBCrossViewCell = (secKey, rowKey, targetItem) => {
    if (!isOBOrTotal()) return undefined
    const colKey = targetItem.columnKey
    if (colKey === 'TOTAL') return undefined
    if (colKey === 'INTERNAL') {
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
  const getOBSumDUInternal = ({ sectionKey, rowKey }) => {
    return undefined
    const sum = getSum(
      ...getItems({
        sectionKey,
        rowKey,
        filterCallback: item => isDU(item.columnKey),
      }).map(item => item.value)
    )
    return decimalNegate(sum === null ? 0 : sum)
  }
  const getOBDeliveryExpenseInternal = ({ sectionKey, rowKey }) => {
    return undefined
    const onsiteData = viewModeDataMap['Onsite']
    if (!onsiteData) return decimalNegate(0)
    const row =
      onsiteData.businessPlanItems[sectionKey] &&
      onsiteData.businessPlanItems[sectionKey].data[rowKey]
    if (!row) return decimalNegate(0)
    const duValues = row.data
      .filter(item => isDU(item.columnKey))
      .map(item => item.value)
    const sum = getSum(...duValues)
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
    if (isOBOrTotal()) return sumCrossViewTotals('MAN_MONTH', 'MM_BILL')
    const duItems = getItems({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_BILL',
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(
      ...duItems.map(item =>
        getMMBillDU({
          targetItem: item,
        })
      )
    )
  }
  const getMMManufactureTotal = () => {
    if (isOBOrTotal()) return sumCrossViewTotals('MAN_MONTH', 'MM_PRODUCTION')
    return getSumDUValues({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
    })
  }
  const getMMManufactureSale = () => getMMBillSale()
  const getTotalMMBilService = ({ targetItem }) => {
    if (isOBOrTotal()) return sumCrossViewTotals(targetItem.sectionKey, targetItem.rowKey)
    return getSumDUValues({
      sectionKey: targetItem.sectionKey,
      rowKey: targetItem.rowKey,
    })
  }
  const getSoftwareProductionSale = () => {
    if (isOBOrTotal()) return undefined
    return getMultiplicationRes(exchangeRate, softwareDevelopmentFee)
  }
  const getSoftwareProductionDU = ({ targetItem }) => {
    return targetItem != null && targetItem.value != null
      ? targetItem.value
      : null
  }
  const getSoftwareProductionInternal = () => {
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
      ...duItems.map(item =>
        getSoftwareProductionDU({
          targetItem: item,
        })
      )
    )
    return sum === null ? null : decimalNegate(sum)
  }
  const getSoftwareProductionTotal = () => {
    if (viewMode === 'OB') return sumCrossViewTotals('REVENUES', 'SOFTWARE_PRODUCTION_REVENUES')
    if (viewMode === 'Total') return undefined
    return getSoftwareProductionSale()
  }
  const getDeductionTotal = () => {
    if (viewMode === 'OB') return sumCrossViewTotals('REVENUES', 'DEDUCTION')
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

  const getOBFeeTotal = ({ sectionKey, rowKey }) => {
    if (viewMode === 'OB') return sumCrossViewTotals(sectionKey, rowKey)
    return getSumAllValues({
      sectionKey,
      rowKey,
    })
  }
  const getRevenuesTotalInternal = ({ targetItem, serviceRowKey }) => {
    if (isOBOrTotal()) {
      const perLoc = LOC_TYPES.map(locType =>
        getCrossViewCell(locType, 'REVENUES', 'REVENUES_TOTAL', 'INTERNAL')
      )
      if (!perLoc.some(v => v !== null)) return undefined
      return getSum(...perLoc)
    }
    return getTotalColumnAndSet({
      targetItem,
      serviceRowKey,
    })
  }
  const getDUCostSale = () => {
    const internal = getSoftwareProductionInternal()
    return internal ? -internal : null
  }
  const getDUCostSaleOB = ({ targetItem }) => {
    return undefined
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
    if (locType === 'Onsite') return 0
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
    return getSoftwareProductionInternal()
  }
  const getDUCostTotal = () => {
    if (viewMode === 'OB') {
      const offshoreData = viewModeDataMap['Offshore']
      if (!offshoreData) return 0
      const revRow =
        offshoreData.businessPlanItems['REVENUES'] &&
        offshoreData.businessPlanItems['REVENUES'].data['REVENUES_TOTAL']
      if (!revRow) return 0
      const duValues = revRow.data
        .filter(item => isDU(item.columnKey))
        .map(item => item.value)
      const sum = getSum(...duValues)
      return sum !== null ? sum : 0
    }
    return getSum(getDUCostInternal(), getDUCostSale())
  }
  const getSellingExpensesTotalSaleOB = ({ targetItem, serviceRowKey }) => {
    return getTotalColumnAndSet({
      targetItem,
      serviceRowKey,
    })
  }
  const getIncentiveTotal = () => {
    if (viewMode === 'OB') return sumCrossViewTotals('SELLING_EXPENSES', 'INCENTIVES')
    if (viewMode === 'Total') return undefined
    return getIncentiveSale()
  }
  const getIncentiveSale = () => {
    if (viewMode === 'Total') return undefined
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
    if (viewMode === 'OB') return sumCrossViewTotals('SELLING_EXPENSES', 'AGENCY_EXPENSE')
    if (viewMode === 'Total') return undefined
    const value = getItem({
      sectionKey: 'SELLING_EXPENSES',
      rowKey: 'AGENCY_EXPENSE',
      columnKey: 'SALE',
    }).value
    return value != null ? value : null
  }
  const getDirectLaborCostTotal = ({ targetItem, sectionKey, rowKey }) => {
    if (viewMode === 'OB') return sumCrossViewTotals(sectionKey, rowKey)
    return getSumAllValues({
      targetItem,
      sectionKey,
      rowKey,
    })
  }
  const getOBDeliveryExpenseDU = ({ targetItem, rowKey }) => {
    return undefined
    const locType = getOBLocationTypeByDisplayKey(
      getDisplayColumnKey(targetItem)
    )
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

  const makeOBDeliveryTotal = ({ targetItem, sectionKey, rowKey }) => {
    if (viewMode === 'OB') {
      const cell = getCrossViewCell('Onsite', sectionKey, rowKey, 'TOTAL')
      return cell == null ? null : cell
    }
    return getSumAllValues({
      targetItem,
      sectionKey,
      rowKey,
    })
  }
  const getSenorityBonusTotal = ({ targetItem, sectionKey, rowKey }) =>
    getSumAllValues({
      targetItem,
      sectionKey,
      rowKey,
    })
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
    return getProjectBonusDU({
      targetItem,
    })
  }
  const getProjectBonusTotal = () => {
    if (viewMode === 'OB') {
      const cell = getCrossViewCell('Onsite', 'DELIVERY_EXPENSES', 'PROJECT_BONUS', 'TOTAL')
      return cell == null ? null : cell
    }
    const duItems = getItems({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'PROJECT_BONUS',
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(
      ...duItems.map(item =>
        getProjectBonusDU({
          targetItem: item,
        })
      )
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
    return getTotalTax({
      targetItem,
    })
    const locType = getOBLocationTypeByDisplayKey(
      getDisplayColumnKey(targetItem)
    )
    if (!locType) return null
    const revItem = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: targetItem.columnKey,
      compareKey: targetItem.compareKey,
    })
    if (!revItem || !revItem.sectionKey) return null
    const revenueValue = getTotalColumnAndSet({
      targetItem: revItem,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })
    if (revenueValue == null) return null
    if (revenueValue === 0) return 0
    const picCit = getCrossViewCell(locType, 'TAX', 'PIC_CIT', 'TOTAL')
    if (picCit == null) return null
    return new Decimal(revenueValue)
      .times(new Decimal(picCit))
      .dividedBy(100)
      .toNumber()
  }
  const getOBTaxInternal = () => {
    return undefined
    const duItems = getItems({
      sectionKey: 'TAX',
      rowKey: 'TAX_TOTAL',
      filterCallback: item => isDU(item.columnKey),
    })
    const sum = getSum(
      ...duItems.map(item =>
        getOBTaxDU({
          targetItem: item,
        })
      )
    )
    return decimalNegate(sum === null ? 0 : sum)
  }
  const getTaxExpensesTotal = ({ targetItem }) => {
    if (viewMode === 'OB') return sumCrossViewTotals('TAX', 'TAX_TOTAL')
    return getTotalTax({
      targetItem,
    })
  }

  const getPICCITTotal = () => {
    if (viewMode === 'OB') return sumCrossViewTotals('TAX', 'PIC_CIT')
    return undefined
  }
  const sumOBMarginDU = (rowKey, fn) => {
    const items = getItems({
      sectionKey: 'MARGIN',
      rowKey,
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(
      ...items.map(item =>
        fn({
          targetItem: item,
        })
      )
    )
  }
  const sumOBRefDU = (rowKey, fn) => {
    const items = getItems({
      sectionKey: 'REFERENCE',
      rowKey,
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(
      ...items.map(item =>
        fn({
          targetItem: item,
        })
      )
    )
  }
  const getAllocationOfPoolTotal = () => {
    if (viewMode === 'OB') {
      const cell = getCrossViewCell('Onsite', 'MARGIN', 'ALLOCATION_OF_POOL_AND_UNBILLABLE', 'TOTAL')
      return cell == null ? null : cell
    }
    return sumOBMarginDU('ALLOCATION_OF_POOL_AND_UNBILLABLE', getAllocationOfPoolDU)
  }
  const getOBAllocationPoolInternal = () => {
    return undefined
    const sum = sumOBMarginDU(
      'ALLOCATION_OF_POOL_AND_UNBILLABLE',
      getAllocationOfPoolDU
    )
    return sum != null ? decimalNegate(sum) : null
  }
  const getOBAllocationPoolCellValue = ({ targetItem, columnKey }) => {
    return undefined
    const colKey = (targetItem && targetItem.columnKey) || columnKey
    const displayKey = getDisplayColumnKey(targetItem) || colKey
    if (isSaleCol(colKey)) {
      const locType = getOBLocationTypeByDisplayKey(displayKey)
      if (!locType) return undefined
      if (locType === 'Offshore') return 0
      const cell = getCrossViewCell(
        locType,
        'MARGIN',
        'ALLOCATION_OF_POOL_AND_UNBILLABLE',
        'SALE'
      )
      return cell == null ? 0 : cell
    }
    if (isDU(colKey)) {
      const locType = getOBLocationTypeByDisplayKey(
        getDisplayColumnKey(targetItem)
      )
      if (locType === 'Offshore') return 0
      const directLabor = getOBDeliveryExpenseDU({
        targetItem,
        rowKey: 'DIRECT_LABOR_COST',
      })
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
    let taxFormula = getTotalTax({
      targetItem: colItems.tax,
    })
    if (viewMode === 'OB' && colKey === 'TOTAL') {
      taxFormula = getTaxExpensesTotal({ targetItem: colItems.tax })
    }
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
    if (isOBOrTotal() && !isDU(targetItem.columnKey) && true) {
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
    if (viewMode === 'Total')
      return sumCrossViewTotals('MARGIN', 'DIRECT_MARGIN_BONUS')
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
    if (viewMode === 'Total') return sumCrossViewTotals('MARGIN', 'INDIRECT_MARGIN')
    if (viewMode === 'OB') {
      const dmBonus = getDirectMarginBonusTotal()
      const alloc = getAllocationOfPoolTotal()
      return dmBonus != null
        ? new Decimal(dmBonus).plus(new Decimal(alloc || 0)).toNumber()
        : null
    }
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
    if (viewMode === 'Total' && isSaleCol(targetItem.columnKey)) {
      const saleLocType = getSaleLocType(getDisplayColumnKey(targetItem))
      if (saleLocType) {
        return getCrossViewCell(
          saleLocType,
          'MARGIN',
          'INDIRECT_MARGIN',
          'SALE'
        )
      }
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
    if (
      colKey === 'TOTAL' &&
      isOBOrTotal() &&
      (rateRowKey !== 'DIRECT_MARGIN_RATE' || false)
    ) {
      const totals = sumCrossViewTotals('MARGIN', rateRowKey)
      if (totals !== undefined) return totals
    }
    if (isOBOrTotal() && isSaleCol(colKey)) {
      const saleLocType = getSaleLocType(getDisplayColumnKey(targetItem))
      if (saleLocType) {
        const v = getCrossViewCell(saleLocType, 'MARGIN', rateRowKey, 'SALE')
        return v !== null ? v : undefined
      }
      const perLoc = LOC_TYPES.map(locType =>
        getCrossViewCell(locType, 'MARGIN', rateRowKey, 'SALE')
      )
      if (perLoc.some(v => v !== null)) return getSum(...perLoc)
      return undefined
    }
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
  const getOBSaleLocTypeDM = locType => {
    const dm = getCrossViewCell(locType, 'MARGIN', 'DIRECT_MARGIN', 'SALE')
    if (locType === 'Onsite') {
      if (dm == null) return null
      const cost = getCrossViewCell(
        'Onsite',
        'COST_PRICE',
        'COST_OF_DU_SOLD',
        'SALE'
      )
      return new Decimal(dm).plus(new Decimal(cost || 0)).toNumber()
    }
    return dm
  }
  const getOBLocTypeDMTotal = locType => {
    const dmStored = getCrossViewCell(
      locType,
      'MARGIN',
      'DIRECT_MARGIN',
      'TOTAL'
    )
    if (dmStored == null) return null
    const locData = viewModeDataMap[locType]
    if (!locData) return dmStored
    if (locType === 'Onsite') {
      const row =
        locData.businessPlanItems['REVENUES'] &&
        locData.businessPlanItems['REVENUES'].data[
          'SOFTWARE_PRODUCTION_REVENUES'
        ]
      if (!row) return dmStored
      const duSum =
        getSum(...row.data.filter(c => isDU(c.columnKey)).map(c => c.value)) ||
        0
      const internal = row.data.find(c => c.columnKey === 'INTERNAL')
      const adj = new Decimal(duSum)
        .plus(internal && internal.value != null ? internal.value : 0)
        .toNumber()
      return new Decimal(dmStored).minus(adj).toNumber()
    }
    if (locType === 'Offshore') {
      const row =
        locData.businessPlanItems['DELIVERY_EXPENSES'] &&
        locData.businessPlanItems['DELIVERY_EXPENSES'].data[
          'DELIVERY_EXPENSES_TOTAL'
        ]
      if (!row) return dmStored
      const duSum =
        getSum(...row.data.filter(c => isDU(c.columnKey)).map(c => c.value)) ||
        0
      const internal = row.data.find(c => c.columnKey === 'INTERNAL')
      const adj = new Decimal(duSum)
        .plus(internal && internal.value != null ? internal.value : 0)
        .toNumber()
      return new Decimal(dmStored).plus(adj).toNumber() // DM increases when delivery cost removed
    }
    return dmStored
  }
  const getOBLocTypeRevTotal = locType => {
    const revStored = getCrossViewCell(
      locType,
      'REVENUES',
      'REVENUES_TOTAL',
      'TOTAL'
    )
    if (revStored == null) return null
    if (locType !== 'Onsite') return revStored // Offshore revenue unaffected
    const locData = viewModeDataMap['Onsite']
    if (!locData) return revStored
    const row =
      locData.businessPlanItems['REVENUES'] &&
      locData.businessPlanItems['REVENUES'].data['SOFTWARE_PRODUCTION_REVENUES']
    if (!row) return revStored
    const duSum =
      getSum(...row.data.filter(c => isDU(c.columnKey)).map(c => c.value)) || 0
    const internalCell = row.data.find(c => c.columnKey === 'INTERNAL')
    const adj = new Decimal(duSum)
      .plus(internalCell && internalCell.value != null ? internalCell.value : 0)
      .toNumber()
    return new Decimal(revStored).minus(adj).toNumber()
  }

  const getDirectMarginRate = ({ targetItem }) => {
    const colKey = targetItem.columnKey
    return getMarginRate({
      targetItem,
      marginRowKey: 'DIRECT_MARGIN',
      marginValueFn: getDirectMargin,
      rateRowKey: 'DIRECT_MARGIN_RATE',
    })
  }
  const getDirectMarginBonusRateTotal = () => {
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
    return getMarginRate({
      targetItem,
      marginRowKey: 'DIRECT_MARGIN_BONUS',
      marginValueFn: getDirectMarginBonusSaleInternal,
      rateRowKey: 'DIRECT_MARGIN_BONUS_RATE',
      isInternalFn: colKey => false,
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
    return getMarginRate({
      targetItem,
      marginRowKey: 'INDIRECT_MARGIN',
      marginValueFn: getIndirectMarginInternalSale,
      rateRowKey: 'INDIRECT_MARGIN_RATE',
      isInternalFn: colKey => false,
    })
  }
  const getIndirectMarginRateTotal = () => {
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
      const saleLocType = getSaleLocType(getDisplayColumnKey(targetItem))
      if (saleLocType === 'Onsite') {
        const v = getCrossViewCell('Onsite', 'REFERENCE', refRowKey, 'SALE')
        return v !== null ? v : undefined
      }
      if (saleLocType === 'Offshore') {
        const v = getCrossViewCell('Offshore', 'REFERENCE', refRowKey, 'SALE')
        return v !== null ? v : undefined
      }
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
    ({ targetItem }) => {
      if (viewMode === 'OB') return null
      return getOBCrossViewRefCell({
        targetItem,
        refRowKey,
      })
    }
  const getDeliveryAverageExpensesTotal = () => {
    if (viewMode === 'Total')
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
    return null
    const sum = sumOBRefDU(
      'DELIVERY_AVERAGE_EXPENSES',
      getDeliveryAverageExpensesDU
    )
    return sum != null ? decimalNegate(sum) : null
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
    if (viewMode === 'Total')
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
    return null
    const sum = sumOBRefDU(
      'SALARY_AVERAGE_EXPENSES',
      getSalaryAverageExpensesDU
    )
    return sum != null ? decimalNegate(sum) : null
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
    if (viewMode === 'Total') return sumCrossViewTotals('REFERENCE', 'BILLABLE_RATE')
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
    if (viewMode === 'Total') return sumCrossViewTotals('REFERENCE', 'PRODUCTIVITY')
    return decimalDivide(getSoftwareProductionTotal(), getMMManufactureTotal())
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
          compareKey: targetItem.compareKey,
        }),
      }),
      getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_PRODUCTION',
        columnKey: targetItem.columnKey,
        compareKey: targetItem.compareKey,
      }).value
    )
  }
  const getEfficiencyTotal = ({ targetItem }) => {
    if (viewMode === 'Total') return sumCrossViewTotals('REFERENCE', 'EFFICIENCY')
    const dmItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem && targetItem.columnKey,
    })
    if (!dmItem || !dmItem.sectionKey) return undefined
    return decimalDivide(
      getDirectMargin({
        targetItem: dmItem,
      }),
      getMMManufactureTotal()
    )
  }
  const getEfficiencyDU = ({ targetItem }) => {
    const cross = getOBCrossViewRefCell({
      targetItem,
      refRowKey: 'EFFICIENCY',
    })
    if (cross !== undefined) return cross
    const dmItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
      compareKey: targetItem.compareKey,
    })
    if (!dmItem || !dmItem.sectionKey) return undefined
    return decimalDivide(
      getDirectMargin({
        targetItem: dmItem,
      }),
      getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_PRODUCTION',
        columnKey: targetItem.columnKey,
        compareKey: targetItem.compareKey,
      }).value
    )
  }
  const getIncentivesRateCell = makeRefCrossViewFn('INCENTIVES_RATE')
  const getProductionMMBonusCell = makeRefCrossViewFn('PRODUCTION_MM_BONUS')
  const getBillRateNormCell = makeRefCrossViewFn('BILL_RATE_NORM')
  const hideInOB = fn => args => fn(args)
  const obOnly = fn => args => null
  const FORMULA_CONFIG = {
    MAN_MONTH: {
      UNIT_PRICE: {
        total: getUnitPriceTotal,
      },
      MM_PRODUCTION: {
        total: getMMManufactureTotal,
        sale: getMMManufactureSale,
      },
      MM_BILL: {
        total: getMMBillSale,
        sale: getMMBillSale,
        delivery_unit: getMMBillDU,
      },
      SERVICE: {
        total: getTotalMMBilService,
      },
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
      DEDUCTION: {
        total: getDeductionTotal,
        sale: getDeductionSale,
        internal: getOBSumDUInternal,
      },
      ONSITE_FEE: {
        total: getOBFeeTotal,
        internal: getOBSumDUInternal,
      },
      EQUIPMENT_FEE: {
        total: getOBFeeTotal,
        internal: getOBSumDUInternal,
      },
      OTHER_FEE: {
        total: getOBFeeTotal,
        internal: getOBSumDUInternal,
      },
      SERVICE: {
        total: getSumAllValues,
      },
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
        internal: getOBSumDUInternal,
      },
      INCENTIVES: {
        total: getIncentiveTotal,
        sale: getIncentiveSale,
        internal: getOBSumDUInternal,
      },
      AGENCY_EXPENSE: {
        total: getAgencyTotal,
        internal: getOBSumDUInternal,
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
        total: makeOBDeliveryTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBDeliveryExpenseInternal,
      },
      DIRECT_LABOR_COST: {
        total: getDirectLaborCostTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBDeliveryExpenseInternal,
      },
      EQUIPMENT_INTERNET_SERVER_COST: {
        total: makeOBDeliveryTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBDeliveryExpenseInternal,
      },
      ONSITE_DEVELOPMENT_COST: {
        total: makeOBDeliveryTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBDeliveryExpenseInternal,
      },
      PROJECT_BONUS: {
        total: getProjectBonusTotal,
        delivery_unit: getProjectBonusDUByViewMode,
        internal: getOBDeliveryExpenseInternal,
      },
      OVERTIME: {
        total: makeOBDeliveryTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBDeliveryExpenseInternal,
      },
      NON_DEDUCTION_VAT: {
        total: makeOBDeliveryTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBDeliveryExpenseInternal,
      },
      SENIORITY_BONUS: {
        total: getSenorityBonusTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBDeliveryExpenseInternal,
      },
      OTHER_EXPENSES: {
        total: makeOBDeliveryTotal,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBDeliveryExpenseInternal,
      },
      SERVICE: {
        total: getSumAllValues,
        delivery_unit: getOBDeliveryExpenseDU,
        internal: getOBDeliveryExpenseInternal,
      },
    },
    TAX: {
      TAX_TOTAL: {
        total: getTaxExpensesTotal,
        sale: getTotalTax,
        internal: getOBTaxInternal,
        delivery_unit: getOBTaxDU,
      },
      PIC_CIT: {
        total: getPICCITTotal,
        internal: getOBSumDUInternal,
      },
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
        internal: getOBAllocationPoolInternal,
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
        sale: getDeliveryAverageExpensesSale,
        internal: obOnly(getDeliveryAverageExpensesInternal),
        delivery_unit: getDeliveryAverageExpensesDU,
      },
      SALARY_AVERAGE_EXPENSES: {
        total: getSalaryAverageExpensesTotal,
        sale: getSalaryAverageExpensesSale,
        internal: obOnly(getSalaryAverageExpensesInternal),
        delivery_unit: getSalaryAverageExpensesDU,
      },
      BILLABLE_RATE: {
        total: hideInOB(getBillableRateTotal),
        sale: hideInOB(getBillableRateSale),
        internal: obOnly(() => {
          const sum = sumOBRefDU('BILLABLE_RATE', getBillableRateDU)
          return sum != null ? decimalNegate(sum) : null
        }),
        delivery_unit: getBillableRateDU,
      },
      PRODUCTIVITY: {
        total: getProductivityTotal,
        internal: obOnly(() => {
          const sum = sumOBRefDU('PRODUCTIVITY', getProductivityDU)
          return sum != null ? decimalNegate(sum) : null
        }),
        delivery_unit: getProductivityDU,
      },
      EFFICIENCY: {
        total: getEfficiencyTotal,
        internal: obOnly(() => {
          const sum = sumOBRefDU('EFFICIENCY', getEfficiencyDU)
          return sum != null ? decimalNegate(sum) : null
        }),
        delivery_unit: getEfficiencyDU,
      },
      INCENTIVES_RATE: {
        total: getIncentivesRateCell,
        sale: hideInOB(getIncentivesRateCell),
        internal: obOnly(() => {
          const sum = sumOBRefDU('INCENTIVES_RATE', getIncentivesRateCell)
          return sum != null ? decimalNegate(sum) : null
        }),
        delivery_unit: getIncentivesRateCell,
      },
      PRODUCTION_MM_BONUS: {
        total: getProductionMMBonusCell,
        sale: hideInOB(getProductionMMBonusCell),
        internal: obOnly(() => {
          const sum = sumOBRefDU(
            'PRODUCTION_MM_BONUS',
            getProductionMMBonusCell
          )
          return sum != null ? decimalNegate(sum) : null
        }),
        delivery_unit: getProductionMMBonusCell,
      },
      BILL_RATE_NORM: {
        sale: hideInOB(getBillRateNormCell),
        internal: obOnly(() => {
          const sum = sumOBRefDU('BILL_RATE_NORM', getBillRateNormCell)
          return sum != null ? decimalNegate(sum) : null
        }),
        delivery_unit: getBillRateNormCell,
      },
    },
  }
  const isSpecialSectionFormula = secKey =>
    secKey in FORMULA_CONFIG && secKey !== 'MAN_MONTH'
  const getFormula = ({ item, columnKey, sectionKey, rowKey, isService }) => {
    let colKey
    if (isDU(columnKey)) colKey = 'delivery_unit'
    else if (isSaleCol(columnKey)) colKey = 'sale'
    else colKey = columnKey.toLowerCase()
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
  return {
    getFormula,
    isSpecialSectionFormula,
  }
}
export default useFormula
