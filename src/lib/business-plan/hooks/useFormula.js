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
    ratesByLocationType,
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

  const getItem = ({ sectionKey, rowKey, columnKey }) => {
    const row =
      businessPlanItems[sectionKey] &&
      businessPlanItems[sectionKey].data[rowKey]
    if (!row) return {}
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
    if (duSum === null) return undefined
    return decimalNegate(duSum === null ? 0 : duSum)
  }

  const getOBCrossViewCell = (secKey, rowKey, targetItem) => {
    if (!isOBOrTotal()) return undefined
    const colKey = targetItem.columnKey
    if (colKey === 'TOTAL') return undefined

    if (colKey === 'INTERNAL') {
      if (isOB()) {
        const duSum = sumCrossViewDU(secKey, rowKey)
        if (duSum === null) return null
        return decimalNegate(duSum === null ? 0 : duSum)
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
    // For DU and other columns: prefer the specific locType derived from colCategory
    // so that DUs sharing the same columnKey across Onsite/Offshore resolve correctly.
    if (isDU(colKey)) {
      const locType = getOBLocationTypeByDisplayKey(
        getDisplayColumnKey(targetItem)
      )
      if (locType) return getCrossViewCell(locType, secKey, rowKey, colKey)
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
    const { sectionKey, columnKey, rowKey } = targetItem
    const rowKeys = Object.keys(businessPlanItems[sectionKey].data).filter(
      key => key !== rowKey
    )
    const values = rowKeys.map(key => {
      const childItem = businessPlanItems[sectionKey].data[key].data.find(
        item => item.columnKey === columnKey
      )
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
        const cell = businessPlanItems.MAN_MONTH.data[key].data.find(
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

  const getSoftwareProductionSale = ({ targetItem } = {}) => {
    if (isOBOrTotal()) {
      const locType = getOBLocationTypeByDisplayKey(
        getDisplayColumnKey(targetItem)
      )
      if (!locType) return undefined
      const rates = ratesByLocationType && ratesByLocationType[locType]
      if (!rates) return undefined
      return getMultiplicationRes(
        rates.exchangeRate,
        rates.softwareDevelopmentFee
      )
    }
    return getMultiplicationRes(exchangeRate, softwareDevelopmentFee)
  }

  const getSoftwareProductionDU = ({ targetItem }) => {
    const cell =
      businessPlanItems.REVENUES.data.SOFTWARE_PRODUCTION_REVENUES.data.find(
        item => isDU(item.columnKey) && item.columnKey === targetItem.columnKey
      )
    return cell ? cell.value : null
  }

  const getSoftwareProductionInternal = () => {
    if (isOBOrTotal()) {
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
    if (isOBOrTotal()) {
      const perLoc = LOC_TYPES.map(locType => {
        const rates = ratesByLocationType && ratesByLocationType[locType]
        if (!rates) return null
        return getMultiplicationRes(
          rates.exchangeRate,
          rates.softwareDevelopmentFee
        )
      })
      if (!perLoc.some(v => v !== null)) return undefined
      return getSum(...perLoc)
    }
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
    // Total = Σ SALE(onsite) + Internal(onsite) + Σ DU(onsite)
    // Since Internal(onsite) = -Σ DU(onsite), this simplifies to Σ SALE(onsite) only
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
    const sourceColKey = isSaleCol(targetItem.columnKey)
      ? 'SALE'
      : targetItem.columnKey
    const cell = row.data.find(c => c.columnKey === sourceColKey)
    return cell && cell.value != null ? cell.value : undefined
  }

  const getDUCostInternal = () => (isOB() ? 0 : getSoftwareProductionInternal())

  const getDUCostTotal = () => {
    if (isOB()) return 0
    return getSum(getDUCostInternal(), getDUCostSale())
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
    const targetDisplayKey = targetItem.compareKey
    const perLoc = LOC_TYPES.map(locType => {
      const locData = viewModeDataMap[locType]
      if (!locData) return null
      const row =
        locData.businessPlanItems['DELIVERY_EXPENSES'] &&
        locData.businessPlanItems['DELIVERY_EXPENSES'].data[rowKey]
      if (!row) return null
      const cell = row.data.find(c => c.compareKey === targetDisplayKey)
      return cell && cell.value != null ? cell.value : null
    })
    return perLoc.some(v => v !== null) ? getSum(...perLoc) : undefined
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
        .filter(item => item.columnKey.toLowerCase() !== 'total')
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
    }).value
    const mmBillDU = getMMBillDU({
      targetItem: getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_BILL',
        columnKey: targetItem.columnKey,
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

  const getTaxExpensesTotal = ({ targetItem }) => {
    if (isOB()) {
      const onsiteData = viewModeDataMap['Onsite']
      const offshoreData = viewModeDataMap['Offshore']
      if (!onsiteData || !offshoreData) return undefined
      const targetColKey =
        targetItem && targetItem.columnKey ? targetItem.columnKey : 'TOTAL'
      const onsiteRevTotal = getCrossViewCell(
        'Onsite',
        'REVENUES',
        'REVENUES_TOTAL',
        targetColKey
      )
      const onsitePicCit = getCrossViewCell('Onsite', 'TAX', 'PIC_CIT', 'TOTAL')
      const onsiteTax =
        onsiteRevTotal != null && onsitePicCit != null
          ? new Decimal(onsiteRevTotal)
              .times(new Decimal(onsitePicCit))
              .dividedBy(100)
              .toNumber()
          : null
      const offshoreRow =
        offshoreData.businessPlanItems['TAX'] &&
        offshoreData.businessPlanItems['TAX'].data['TAX_TOTAL']
      const offshoreSaleSum = offshoreRow
        ? getSum(
            ...offshoreRow.data
              .filter(item => isSaleCol(item.columnKey))
              .map(item => item.value)
          )
        : null
      return getSum(onsiteTax, offshoreSaleSum)
    }
    return getTotalTax({ targetItem })
  }

  const getOBMarginRowNegativeDUSum = ({ rowKey }) =>
    getOBNegativeCrossViewDUSum('MARGIN', rowKey)

  const getAllocationOfPoolTotal = () => {
    if (isOB()) {
      const perLoc = LOC_TYPES.map(locType => {
        const locData = viewModeDataMap[locType]
        if (!locData) return null
        const row =
          locData.businessPlanItems['MARGIN'] &&
          locData.businessPlanItems['MARGIN'].data[
            'ALLOCATION_OF_POOL_AND_UNBILLABLE'
          ]
        if (!row) return null
        return getSum(
          ...row.data
            .filter(item => item.columnKey.toLowerCase() !== 'total')
            .map(item => (item.value == null ? 0 : item.value))
        )
      })
      if (!perLoc.some(v => v !== null)) return undefined
      return getSum(...perLoc)
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
      const cell = getCrossViewCell(
        locType,
        'MARGIN',
        'ALLOCATION_OF_POOL_AND_UNBILLABLE',
        'SALE'
      )
      return cell == null ? 0 : cell
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
    if (isOB())
      return getOBAllocationPoolCellValue({ columnKey: targetItem.columnKey })
    const directLabor = getItem({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
      columnKey: targetItem.columnKey,
    }).value
    const billRateNorm = getItem({
      sectionKey: 'REFERENCE',
      rowKey: 'BILL_RATE_NORM',
      columnKey: targetItem.columnKey,
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

    if (isOB() && colKey === 'INTERNAL')
      return getOBMarginRowNegativeDUSum({ rowKey: 'DIRECT_MARGIN' })

    if (isOB() && colKey !== 'TOTAL') {
      const locType = getOBLocationTypeByDisplayKey(
        getDisplayColumnKey(targetItem)
      )
      if (locType) {
        const locData = viewModeDataMap[locType]
        if (!locData) return undefined
        const row =
          locData.businessPlanItems['MARGIN'] &&
          locData.businessPlanItems['MARGIN'].data['DIRECT_MARGIN']
        if (!row) return undefined
        const cell = row.data.find(
          c => c.columnKey === (isSaleCol(colKey) ? 'SALE' : colKey)
        )
        return cell ? cell.value : undefined
      }
    }

    const colItems = {
      revenues: getItem({
        sectionKey: 'REVENUES',
        rowKey: 'REVENUES_TOTAL',
        columnKey: colKey,
      }),
      cost: getItem({
        sectionKey: 'COST_PRICE',
        rowKey: 'COST_PRICE_TOTAL',
        columnKey: colKey,
      }),
      selling: getItem({
        sectionKey: 'SELLING_EXPENSES',
        rowKey: 'SELLING_EXPENSES_TOTAL',
        columnKey: colKey,
      }),
      delivery: getItem({
        sectionKey: 'DELIVERY_EXPENSES',
        rowKey: 'DELIVERY_EXPENSES_TOTAL',
        columnKey: colKey,
      }),
      tax: getItem({
        sectionKey: 'TAX',
        rowKey: 'TAX_TOTAL',
        columnKey: colKey,
      }),
    }

    const taxFormula =
      isOB() && colKey === 'TOTAL'
        ? getTaxExpensesTotal({ targetItem: colItems.tax })
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
    if (isOBOrTotal()) {
      const cross = getOBCrossViewCell(
        'MARGIN',
        'DIRECT_MARGIN_BONUS',
        targetItem
      )
      if (cross !== undefined) return cross
    }
    return getSum(
      getProjectBonusDU({
        targetItem: getItem({
          sectionKey: 'DELIVERY_EXPENSES',
          rowKey: 'PROJECT_BONUS',
          columnKey: targetItem.columnKey,
        }),
      }),
      getDirectMargin({
        targetItem: getItem({
          sectionKey: 'MARGIN',
          rowKey: 'DIRECT_MARGIN',
          columnKey: targetItem.columnKey,
        }),
      })
    )
  }

  const getDirectMarginBonusSaleInternal = ({ targetItem }) => {
    const colKey = targetItem.columnKey
    if (isOB() && colKey === 'INTERNAL')
      return getOBMarginRowNegativeDUSum({ rowKey: 'DIRECT_MARGIN_BONUS' })
    if (
      isOB() &&
      getOBLocationTypeByDisplayKey(getDisplayColumnKey(targetItem))
    ) {
      return getDirectMargin({
        targetItem: getItem({
          sectionKey: 'MARGIN',
          rowKey: 'DIRECT_MARGIN',
          columnKey: colKey,
        }),
      })
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

  const getDirectMarginBonusTotal = () =>
    getSum(
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

  const getIndirectMarginDU = ({ targetItem }) => {
    if (isOBOrTotal()) {
      const cross = getOBCrossViewCell('MARGIN', 'INDIRECT_MARGIN', targetItem)
      if (cross !== undefined) return cross
    }
    const dmBonus = getDirectMarginBonusDU({
      targetItem: getItem({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN_BONUS',
        columnKey: targetItem.columnKey,
      }),
    })
    const alloc = getAllocationOfPoolDU({
      targetItem: getItem({
        sectionKey: 'MARGIN',
        rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
        columnKey: targetItem.columnKey,
      }),
    })
    return dmBonus != null
      ? new Decimal(dmBonus).minus(new Decimal(alloc || 0)).toNumber()
      : null
  }

  const getIndirectMarginTotal = () => {
    if (isOBOrTotal()) return sumCrossViewTotals('MARGIN', 'INDIRECT_MARGIN')
    const dmBonus = getDirectMarginBonusTotal()
    const alloc = getAllocationOfPoolTotal()
    return dmBonus != null
      ? new Decimal(dmBonus).minus(new Decimal(alloc || 0)).toNumber()
      : null
  }

  const getIndirectMarginInternalSale = ({ targetItem }) => {
    if (isOBOrTotal()) {
      const cross = getOBCrossViewCell('MARGIN', 'INDIRECT_MARGIN', targetItem)
      if (cross !== undefined) return cross
    }
    const dmBonus = getDirectMarginBonusSaleInternal({
      targetItem: getItem({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN_BONUS',
        columnKey: targetItem.columnKey,
      }),
    })
    const alloc = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
      columnKey: targetItem.columnKey,
    }).value
    return dmBonus != null
      ? new Decimal(dmBonus).minus(new Decimal(alloc || 0)).toNumber()
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

    if (isInternalFn && isInternalFn(colKey))
      return getOBNegativeCrossViewDUSum('MARGIN', rateRowKey)

    if (colKey === 'TOTAL' && isOBOrTotal()) {
      const totals = sumCrossViewTotals('MARGIN', rateRowKey)
      if (totals !== undefined) return totals
    }

    const crossView = getOBCrossViewCell('MARGIN', rateRowKey, targetItem)
    if (crossView !== undefined) return crossView

    const marginValue = marginValueFn
      ? marginValueFn({
          targetItem: getItem({
            sectionKey: 'MARGIN',
            rowKey: marginRowKey,
            columnKey: colKey,
          }),
        })
      : null

    const revenuesValue = getTotalColumnAndSet({
      targetItem: getItem({
        sectionKey: 'REVENUES',
        rowKey: 'REVENUES_TOTAL',
        columnKey: colKey,
      }),
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return decimalDividePercent(marginValue, revenuesValue)
  }

  const getDirectMarginRate = ({ targetItem }) =>
    getMarginRate({
      targetItem,
      marginRowKey: 'DIRECT_MARGIN',
      marginValueFn: getDirectMargin,
      rateRowKey: 'DIRECT_MARGIN_RATE',
      isInternalFn: colKey => isOB() && colKey === 'INTERNAL',
    })

  const getDirectMarginBonusRateTotal = () => {
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

  const getDirectMarginBonusRateSaleInternal = ({ targetItem }) =>
    getMarginRate({
      targetItem,
      marginRowKey: 'DIRECT_MARGIN_BONUS',
      marginValueFn: getDirectMarginBonusSaleInternal,
      rateRowKey: 'DIRECT_MARGIN_BONUS_RATE',
      isInternalFn: colKey => isOB() && colKey === 'INTERNAL',
    })

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

  const getIndirectMarginRateSaleInternal = ({ targetItem }) =>
    getMarginRate({
      targetItem,
      marginRowKey: 'INDIRECT_MARGIN',
      marginValueFn: getIndirectMarginInternalSale,
      rateRowKey: 'INDIRECT_MARGIN_RATE',
      isInternalFn: colKey => isOB() && colKey === 'INTERNAL',
    })

  const getIndirectMarginRateTotal = () => {
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

  const getOBCrossViewRefCell = ({ targetItem, refRowKey }) =>
    getOBCrossViewCell('REFERENCE', refRowKey, targetItem)

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
        sale: getTotalColumnAndSet,
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
        delivery_unit: getTotalTax,
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
        internal: obOnly(getDeliveryAverageExpensesTotal),
        delivery_unit: hideInOB(getDeliveryAverageExpensesDU),
      },
      SALARY_AVERAGE_EXPENSES: {
        total: getSalaryAverageExpensesTotal,
        sale: getSalaryAverageExpensesSale,
        internal: obOnly(getSalaryAverageExpensesTotal),
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
