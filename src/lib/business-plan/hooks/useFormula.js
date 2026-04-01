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

  const getOBDeliveryExpenseInternal = ({ sectionKey, rowKey }) => {
    if (!isOB()) return undefined
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

  const getSoftwareProductionDU = ({ targetItem }) => {
    if (isOB()) {
      const locType = getOBLocationTypeByDisplayKey(
        getDisplayColumnKey(targetItem)
      )
      if (locType === 'Onsite') return 0
    }
    return targetItem != null && targetItem.value != null
      ? targetItem.value
      : null
  }

  const getSoftwareProductionInternal = () => {
    if (isOB()) {
      const duItems = getItems({
        sectionKey: 'REVENUES',
        rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
        filterCallback: item => isDU(item.columnKey),
      })
      const sum = getSum(
        ...duItems.map(item => getSoftwareProductionDU({ targetItem: item }))
      )
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
    if (isOB()) {
      const offshoreData = viewModeDataMap['Offshore']
      if (!offshoreData) return 0
      const row =
        offshoreData.businessPlanItems['COST_PRICE'] &&
        offshoreData.businessPlanItems['COST_PRICE'].data['COST_OF_DU_SOLD']
      if (!row) return 0
      const saleValues = row.data
        .filter(item => isSaleCol(item.columnKey))
        .map(item => item.value)
      const sum = getSum(...saleValues)
      return sum !== null ? decimalNegate(sum) : 0
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
    if (isOB()) {
      const onsiteData = viewModeDataMap['Onsite']
      if (!onsiteData) return undefined
      const row =
        onsiteData.businessPlanItems['SELLING_EXPENSES'] &&
        onsiteData.businessPlanItems['SELLING_EXPENSES'].data['INCENTIVES']
      if (!row) return undefined
      return getSum(
        ...row.data
          .filter(item => item.columnKey !== 'TOTAL')
          .map(item => item.value)
      )
    }
    if (viewMode === 'Total') return undefined
    return getIncentiveSale()
  }

  const getIncentiveSale = () => {
    if (isOB()) {
      const onsiteData = viewModeDataMap['Onsite']
      if (!onsiteData) return undefined
      const row =
        onsiteData.businessPlanItems['SELLING_EXPENSES'] &&
        onsiteData.businessPlanItems['SELLING_EXPENSES'].data['INCENTIVES']
      if (!row) return undefined
      const cell = row.data.find(item => isSaleCol(item.columnKey))
      return cell && cell.value != null ? cell.value : undefined
    }
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
    if (isOB()) {
      const onsiteData = viewModeDataMap['Onsite']
      if (!onsiteData) return undefined
      const row =
        onsiteData.businessPlanItems['SELLING_EXPENSES'] &&
        onsiteData.businessPlanItems['SELLING_EXPENSES'].data['AGENCY_EXPENSE']
      if (!row) return undefined
      return getSum(
        ...row.data
          .filter(item => item.columnKey !== 'TOTAL')
          .map(item => item.value)
      )
    }
    if (viewMode === 'Total') return undefined
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
      const onsiteDirectLaborRow =
        onsiteData.businessPlanItems['DELIVERY_EXPENSES'] &&
        onsiteData.businessPlanItems['DELIVERY_EXPENSES'].data[
          'DIRECT_LABOR_COST'
        ]
      if (!onsiteDirectLaborRow) return undefined
      const offshoreRevenuesRow =
        offshoreData.businessPlanItems['REVENUES'] &&
        offshoreData.businessPlanItems['REVENUES'].data[
          'SOFTWARE_PRODUCTION_REVENUES'
        ]
      if (!offshoreRevenuesRow) return undefined
      return getSum(
        ...onsiteDirectLaborRow.data
          .filter(item => isDU(item.columnKey))
          .map(item => item.value),
        ...offshoreRevenuesRow.data
          .filter(item => isDU(item.columnKey))
          .map(item => item.value)
      )
    }
    return getSumAllValues({ targetItem, sectionKey, rowKey })
  }

  const getOBDeliveryExpenseDU = ({ targetItem, rowKey }) => {
    if (!isOB()) return undefined
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
        .filter(item => item.columnKey !== 'TOTAL')
        .map(item => item.value)
    )
  }

  const makeOBDeliveryTotal = ({ targetItem, sectionKey, rowKey }) => {
    if (isOB()) return getOBDeliveryExpenseTotalFromOnsite({ rowKey })
    return getSumAllValues({ targetItem, sectionKey, rowKey })
  }

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
        ...LOC_TYPES.map(locType => {
          const rev = getCrossViewCell(
            locType,
            'REVENUES',
            'REVENUES_TOTAL',
            'SALE'
          )
          const pic = getCrossViewCell(locType, 'TAX', 'PIC_CIT', 'TOTAL')
          if (rev == null || pic == null) return null
          return new Decimal(rev)
            .times(new Decimal(pic))
            .dividedBy(100)
            .toNumber()
        })
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
    if (!isOB()) return undefined
    const duItems = getItems({
      sectionKey: 'TAX',
      rowKey: 'TAX_TOTAL',
      filterCallback: item => isDU(item.columnKey),
    })
    const sum = getSum(...duItems.map(item => getOBTaxDU({ targetItem: item })))
    return decimalNegate(sum === null ? 0 : sum)
  }

  const getTaxExpensesTotal = ({ targetItem }) => {
    if (isOB()) {

      return getTotalTax({
        targetItem: getItem({
          sectionKey: 'TAX',
          rowKey: 'TAX_TOTAL',
          columnKey: 'TOTAL',
        }),
      })
    }
    return getTotalTax({ targetItem })
  }

  const sumOBMarginDU = (rowKey, fn) => {
    const items = getItems({
      sectionKey: 'MARGIN',
      rowKey,
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(...items.map(item => fn({ targetItem: item })))
  }

  const sumOBRefDU = (rowKey, fn) => {
    const items = getItems({
      sectionKey: 'REFERENCE',
      rowKey,
      filterCallback: item => isDU(item.columnKey),
    })
    return getSum(...items.map(item => fn({ targetItem: item })))
  }

  const getAllocationOfPoolTotal = () =>
    sumOBMarginDU('ALLOCATION_OF_POOL_AND_UNBILLABLE', getAllocationOfPoolDU)

  const getOBAllocationPoolInternal = () => {
    if (!isOB()) return undefined
    const sum = sumOBMarginDU(
      'ALLOCATION_OF_POOL_AND_UNBILLABLE',
      getAllocationOfPoolDU
    )
    return sum != null ? decimalNegate(sum) : null
  }

  const getOBAllocationPoolCellValue = ({ targetItem, columnKey }) => {
    if (!isOB()) return undefined
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

      const internalRevItem = getItem({ sectionKey: 'REVENUES', rowKey: 'REVENUES_TOTAL', columnKey: 'INTERNAL' })
      const internalCostItem = getItem({ sectionKey: 'COST_PRICE', rowKey: 'COST_PRICE_TOTAL', columnKey: 'INTERNAL' })
      const internalSellingItem = getItem({ sectionKey: 'SELLING_EXPENSES', rowKey: 'SELLING_EXPENSES_TOTAL', columnKey: 'INTERNAL' })
      const internalDeliveryItem = getItem({ sectionKey: 'DELIVERY_EXPENSES', rowKey: 'DELIVERY_EXPENSES_TOTAL', columnKey: 'INTERNAL' })
      const revVal = getRevenuesTotalInternal({ targetItem: internalRevItem, serviceRowKey: sectionConfig.REVENUES.newRowKey })
      const costVal = getTotalColumnAndSet({ targetItem: internalCostItem, serviceRowKey: sectionConfig.COST_PRICE && sectionConfig.COST_PRICE.newRowKey })
      const sellingVal = getTotalColumnAndSet({ targetItem: internalSellingItem, serviceRowKey: sectionConfig.SELLING_EXPENSES && sectionConfig.SELLING_EXPENSES.newRowKey })
      const deliveryVal = getTotalColumnAndSet({ targetItem: internalDeliveryItem, serviceRowKey: sectionConfig.DELIVERY_EXPENSES && sectionConfig.DELIVERY_EXPENSES.newRowKey })
      const taxVal = getOBTaxInternal()
      if (revVal == null) return null
      return new Decimal(revVal)
        .minus(new Decimal(costVal || 0))
        .minus(new Decimal(sellingVal || 0))
        .minus(new Decimal(deliveryVal || 0))
        .minus(new Decimal(taxVal || 0))
        .toNumber()
    } else if (isOB() && isSaleCol(colKey)) {
      const ck = targetItem.compareKey
      const revenuesItem = getItem({
        sectionKey: 'REVENUES',
        rowKey: 'REVENUES_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      })
      const costItem = getItem({
        sectionKey: 'COST_PRICE',
        rowKey: 'COST_PRICE_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      })
      const sellingItem = getItem({
        sectionKey: 'SELLING_EXPENSES',
        rowKey: 'SELLING_EXPENSES_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      })
      const deliveryItem = getItem({
        sectionKey: 'DELIVERY_EXPENSES',
        rowKey: 'DELIVERY_EXPENSES_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      })
      const taxItem = getItem({
        sectionKey: 'TAX',
        rowKey: 'TAX_TOTAL',
        columnKey: colKey,
        compareKey: ck,
      })
      const revenuesValue = getTotalColumnAndSet({
        targetItem: revenuesItem,
        serviceRowKey: sectionConfig.REVENUES.newRowKey,
      })
      const costValue = getTotalColumnAndSet({
        targetItem: costItem,
        serviceRowKey:
          sectionConfig.COST_PRICE && sectionConfig.COST_PRICE.newRowKey,
      })
      const sellingValue = getSellingExpensesTotalSaleOB({
        targetItem: sellingItem,
        serviceRowKey:
          sectionConfig.SELLING_EXPENSES &&
          sectionConfig.SELLING_EXPENSES.newRowKey,
      })
      const deliveryValue = getTotalColumnAndSet({
        targetItem: deliveryItem,
        serviceRowKey:
          sectionConfig.DELIVERY_EXPENSES &&
          sectionConfig.DELIVERY_EXPENSES.newRowKey,
      })
      const tax = getTotalTax({ targetItem: taxItem })
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
        : isOB() && colKey === 'INTERNAL'
        ? getOBTaxInternal()
        : isOB() && isDU(colKey)
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
    if (
      isOBOrTotal() &&
      !isDU(targetItem.columnKey) &&
      !(isOB() && targetItem.columnKey === 'INTERNAL')
    ) {
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
      const projectBonus = getOBDeliveryExpenseInternal({
        sectionKey: 'DELIVERY_EXPENSES',
        rowKey: 'PROJECT_BONUS',
      })
      const incentives = getOBSumDUInternal({
        sectionKey: 'SELLING_EXPENSES',
        rowKey: 'INCENTIVES',
      })
      return getSum(dm, projectBonus, incentives)
    }
    if (isOB() && isSaleCol(colKey)) {
      const ck = targetItem.compareKey
      const dm = getDirectMargin({
        targetItem: getItem({ sectionKey: 'MARGIN', rowKey: 'DIRECT_MARGIN', columnKey: colKey, compareKey: ck }),
      })
      const pbItem = getItem({ sectionKey: 'DELIVERY_EXPENSES', rowKey: 'PROJECT_BONUS', columnKey: colKey, compareKey: ck })
      const projectBonus = getProjectBonusDUByViewMode({ targetItem: pbItem, rowKey: 'PROJECT_BONUS' })
      const incentives = getIncentiveSale()
      return getSum(dm, projectBonus, incentives)
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
      const dmItem = getItem({
        sectionKey: 'MARGIN',
        rowKey: 'DIRECT_MARGIN',
        columnKey: 'TOTAL',
      })
      const dm = getDirectMargin({ targetItem: dmItem })
      const incentives = getIncentiveTotal()
      const projectBonus = getProjectBonusTotal()
      return getSum(dm, incentives, projectBonus)
    }
    if (isOBOrTotal())
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
    if (isOB()) {

      const dmOnsite = getCrossViewCell('Onsite', 'MARGIN', 'DIRECT_MARGIN', 'TOTAL')
      const dmOffshore = getCrossViewCell('Offshore', 'MARGIN', 'DIRECT_MARGIN', 'TOTAL')
      if (dmOnsite == null && dmOffshore == null) return null

      let onsiteAdj = 0
      const onsiteLocData = viewModeDataMap['Onsite']
      if (onsiteLocData) {
        const swProdRow =
          onsiteLocData.businessPlanItems['REVENUES'] &&
          onsiteLocData.businessPlanItems['REVENUES'].data['SOFTWARE_PRODUCTION_REVENUES']
        if (swProdRow) {
          const duSum = getSum(...swProdRow.data.filter(c => isDU(c.columnKey)).map(c => c.value)) || 0
          const internalCell = swProdRow.data.find(c => c.columnKey === 'INTERNAL')
          onsiteAdj = new Decimal(duSum)
            .plus(internalCell && internalCell.value != null ? internalCell.value : 0)
            .toNumber()
        }
      }

      let offshoreAdj = 0
      const offshoreLocData = viewModeDataMap['Offshore']
      if (offshoreLocData) {
        const delivRow =
          offshoreLocData.businessPlanItems['DELIVERY_EXPENSES'] &&
          offshoreLocData.businessPlanItems['DELIVERY_EXPENSES'].data['DELIVERY_EXPENSES_TOTAL']
        if (delivRow) {
          const duSum = getSum(...delivRow.data.filter(c => isDU(c.columnKey)).map(c => c.value)) || 0
          const internalCell = delivRow.data.find(c => c.columnKey === 'INTERNAL')
          offshoreAdj = new Decimal(duSum)
            .plus(internalCell && internalCell.value != null ? internalCell.value : 0)
            .toNumber()
        }
      }

      const alloc = getAllocationOfPoolTotal()

      return new Decimal(dmOnsite || 0)
        .minus(onsiteAdj)
        .plus(new Decimal(dmOffshore || 0).plus(offshoreAdj))
        .minus(new Decimal(alloc || 0))
        .toNumber()
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
      const sum = getSum(
        ...duItems.map(item => getIndirectMarginDU({ targetItem: item }))
      )
      return sum != null ? decimalNegate(sum) : null
    }
    if (isOB() && isSaleCol(targetItem.columnKey)) {
      const dm = getDirectMargin({
        targetItem: getItem({
          sectionKey: 'MARGIN',
          rowKey: 'DIRECT_MARGIN',
          columnKey: targetItem.columnKey,
          compareKey: targetItem.compareKey,
        }),
      })
      const offshoreSellingExp = getCrossViewCell(
        'Offshore',
        'SELLING_EXPENSES',
        'SELLING_EXPENSES_TOTAL',
        'SALE'
      )
      return dm != null
        ? new Decimal(dm).minus(new Decimal(offshoreSellingExp || 0)).toNumber()
        : null
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

    if (isOBOrTotal() && isSaleCol(colKey)) {
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
      const cost = getCrossViewCell('Onsite', 'COST_PRICE', 'COST_OF_DU_SOLD', 'SALE')
      return new Decimal(dm).plus(new Decimal(cost || 0)).toNumber()
    }
    return dm
  }

  const getOBLocTypeDMTotal = locType => {
    const dmStored = getCrossViewCell(locType, 'MARGIN', 'DIRECT_MARGIN', 'TOTAL')
    if (dmStored == null) return null
    const locData = viewModeDataMap[locType]
    if (!locData) return dmStored
    if (locType === 'Onsite') {

      const row = locData.businessPlanItems['REVENUES'] &&
        locData.businessPlanItems['REVENUES'].data['SOFTWARE_PRODUCTION_REVENUES']
      if (!row) return dmStored
      const duSum = getSum(...row.data.filter(c => isDU(c.columnKey)).map(c => c.value)) || 0
      const internal = row.data.find(c => c.columnKey === 'INTERNAL')
      const adj = new Decimal(duSum).plus(internal && internal.value != null ? internal.value : 0).toNumber()
      return new Decimal(dmStored).minus(adj).toNumber()
    }
    if (locType === 'Offshore') {

      const row = locData.businessPlanItems['DELIVERY_EXPENSES'] &&
        locData.businessPlanItems['DELIVERY_EXPENSES'].data['DELIVERY_EXPENSES_TOTAL']
      if (!row) return dmStored
      const duSum = getSum(...row.data.filter(c => isDU(c.columnKey)).map(c => c.value)) || 0
      const internal = row.data.find(c => c.columnKey === 'INTERNAL')
      const adj = new Decimal(duSum).plus(internal && internal.value != null ? internal.value : 0).toNumber()
      return new Decimal(dmStored).plus(adj).toNumber()  // DM increases when delivery cost removed
    }
    return dmStored
  }

  const getOBLocTypeRevTotal = locType => {
    const revStored = getCrossViewCell(locType, 'REVENUES', 'REVENUES_TOTAL', 'TOTAL')
    if (revStored == null) return null
    if (locType !== 'Onsite') return revStored  // Offshore revenue unaffected
    const locData = viewModeDataMap['Onsite']
    if (!locData) return revStored
    const row = locData.businessPlanItems['REVENUES'] &&
      locData.businessPlanItems['REVENUES'].data['SOFTWARE_PRODUCTION_REVENUES']
    if (!row) return revStored
    const duSum = getSum(...row.data.filter(c => isDU(c.columnKey)).map(c => c.value)) || 0
    const internalCell = row.data.find(c => c.columnKey === 'INTERNAL')
    const adj = new Decimal(duSum)
      .plus(internalCell && internalCell.value != null ? internalCell.value : 0)
      .toNumber()
    return new Decimal(revStored).minus(adj).toNumber()
  }

  const getOBTotalRateByLocType = marginRowKey => {
    if (!isOB()) return undefined
    const allocTotal = marginRowKey === 'INDIRECT_MARGIN' ? getAllocationOfPoolTotal() : 0
    const parts = LOC_TYPES.map(locType => {
      const dm = getOBLocTypeDMTotal(locType)
      if (dm == null) return null
      const rev = getOBLocTypeRevTotal(locType)
      if (!rev) return null
      let value = dm
      if (marginRowKey === 'DIRECT_MARGIN_BONUS') {
        const inc = getCrossViewCell(locType, 'SELLING_EXPENSES', 'INCENTIVES', 'TOTAL')

        const pb = locType === 'Offshore'
          ? 0
          : getCrossViewCell(locType, 'DELIVERY_EXPENSES', 'PROJECT_BONUS', 'TOTAL')
        value = new Decimal(dm).plus(inc || 0).plus(pb || 0).toNumber()
      } else if (marginRowKey === 'INDIRECT_MARGIN') {
        if (locType === 'Onsite') {
          value = new Decimal(dm).minus(allocTotal || 0).toNumber()
        }
      }
      return decimalDividePercent(value, rev)
    })
    return parts.some(v => v !== null) ? getSum(...parts) : null
  }

  const getOBSaleRateByParts = marginRowKey => {
    const parts = LOC_TYPES.map(locType => {
      const dm = getOBSaleLocTypeDM(locType)
      let margin
      if (marginRowKey === 'DIRECT_MARGIN') {
        margin = dm
      } else if (marginRowKey === 'DIRECT_MARGIN_BONUS') {
        const pb = getCrossViewCell(locType, 'DELIVERY_EXPENSES', 'PROJECT_BONUS', 'SALE')
        const inc = getCrossViewCell(locType, 'SELLING_EXPENSES', 'INCENTIVES', 'SALE')
        margin = dm != null ? getSum(dm, pb, inc) : null
      } else if (marginRowKey === 'INDIRECT_MARGIN') {
        const alloc = getCrossViewCell(locType, 'MARGIN', 'ALLOCATION_OF_POOL_AND_UNBILLABLE', 'SALE')
        margin = dm != null ? new Decimal(dm).minus(new Decimal(alloc || 0)).toNumber() : null
      } else {
        margin = getCrossViewCell(locType, 'MARGIN', marginRowKey, 'SALE')
      }
      const rev = getCrossViewCell(locType, 'REVENUES', 'REVENUES_TOTAL', 'SALE')
      return decimalDividePercent(margin, rev)
    })
    return parts.some(v => v !== null) ? getSum(...parts) : null
  }

  const getDirectMarginRate = ({ targetItem }) => {
    const colKey = targetItem.columnKey
    if (isOB() && colKey === 'TOTAL') return getOBTotalRateByLocType('DIRECT_MARGIN')
    if (isOB() && colKey === 'INTERNAL') {
      const sum = sumOBMarginDU('DIRECT_MARGIN_RATE', getDirectMarginRate)
      return sum != null ? decimalNegate(sum) : null
    }
    if (isOB() && isSaleCol(colKey)) {
      const byParts = getOBSaleRateByParts('DIRECT_MARGIN')
      if (byParts != null) return byParts
    }
    return getMarginRate({
      targetItem,
      marginRowKey: 'DIRECT_MARGIN',
      marginValueFn: getDirectMargin,
      rateRowKey: 'DIRECT_MARGIN_RATE',
    })
  }

  const getDirectMarginBonusRateTotal = () => {
    if (isOB()) return getOBTotalRateByLocType('DIRECT_MARGIN_BONUS')
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
      const sum = sumOBMarginDU('DIRECT_MARGIN_BONUS_RATE', getDirectMarginBonusRateDU)
      return sum != null ? decimalNegate(sum) : null
    }
    if (isOB() && isSaleCol(targetItem.columnKey)) {
      const byParts = getOBSaleRateByParts('DIRECT_MARGIN_BONUS')
      if (byParts != null) return byParts
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
      const sum = sumOBMarginDU('INDIRECT_MARGIN_RATE', getIndirectMarginRateDU)
      return sum != null ? decimalNegate(sum) : null
    }
    if (isOB() && isSaleCol(targetItem.columnKey)) {
      const byParts = getOBSaleRateByParts('INDIRECT_MARGIN')
      if (byParts != null) return byParts
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
    if (isOB()) return getOBTotalRateByLocType('INDIRECT_MARGIN')
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
    if (isOB()) {
      return getSum(
        ...LOC_TYPES.map(locType => {
          const mmTotal = getCrossViewCell(locType, 'MAN_MONTH', 'MM_PRODUCTION', 'TOTAL')
          if (locType === 'Onsite') {
            const delivery = getCrossViewCell(
              'Onsite',
              'DELIVERY_EXPENSES',
              'DELIVERY_EXPENSES_TOTAL',
              'TOTAL'
            )
            return decimalDivide(delivery, mmTotal)
          }
          const offshoreData = viewModeDataMap['Offshore']
          if (!offshoreData) return null
          const deRow =
            offshoreData.businessPlanItems['DELIVERY_EXPENSES'] &&
            offshoreData.businessPlanItems['DELIVERY_EXPENSES'].data['DELIVERY_EXPENSES_TOTAL']
          if (!deRow) return null
          const delivery = getSum(
            ...deRow.data
              .filter(c => !isDU(c.columnKey) && c.columnKey !== 'TOTAL')
              .map(c => c.value)
          )
          return decimalDivide(delivery, mmTotal)
        })
      )
    }
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
    const sum = sumOBRefDU('DELIVERY_AVERAGE_EXPENSES', getDeliveryAverageExpensesDU)
    return sum != null ? decimalNegate(sum) : null
  }

  const getDeliveryAverageExpensesSale = ({ targetItem }) => {
    if (isOB()) {

      return getSum(
        ...LOC_TYPES.map(locType => {
          if (locType === 'Onsite') return 0
          const cost = getCrossViewCell(locType, 'COST_PRICE', 'COST_OF_DU_SOLD', 'SALE')
          const mm = getCrossViewCell(locType, 'MAN_MONTH', 'MM_BILL', 'SALE')
          return decimalDivide(cost, mm)
        })
      )
    }
    const cross = getOBCrossViewRefCell({
      targetItem,
      refRowKey: 'DELIVERY_AVERAGE_EXPENSES',
    })
    if (cross !== undefined) return cross
    return decimalDivide(getDUCostSale(), getMMManufactureSale())
  }

  const getDeliveryAverageExpensesDU = ({ targetItem }) => {
    if (isOB()) {
      const locType = getOBLocationTypeByDisplayKey(getDisplayColumnKey(targetItem))
      if (!locType) return null
      if (locType === 'Offshore') return 0

      const delivery = getOBDeliveryExpenseDU({
        targetItem,
        rowKey: 'DELIVERY_EXPENSES_TOTAL',
      })
      if (delivery === undefined) return undefined
      const mm = getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_PRODUCTION',
        columnKey: targetItem.columnKey,
      }).value
      return decimalDivide(delivery, mm)
    }
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
    if (isOB()) {
      return getSum(
        ...LOC_TYPES.map(locType => {
          const mmTotal = getCrossViewCell(locType, 'MAN_MONTH', 'MM_PRODUCTION', 'TOTAL')
          if (locType === 'Onsite') {
            const dlcTotal = getCrossViewCell('Onsite', 'DELIVERY_EXPENSES', 'DIRECT_LABOR_COST', 'TOTAL')
            return decimalDivide(dlcTotal, mmTotal)
          }
          const offshoreData = viewModeDataMap['Offshore']
          if (!offshoreData) return null
          const dlcRow =
            offshoreData.businessPlanItems['DELIVERY_EXPENSES'] &&
            offshoreData.businessPlanItems['DELIVERY_EXPENSES'].data['DIRECT_LABOR_COST']
          if (!dlcRow) return null
          const dlc = getSum(
            ...dlcRow.data
              .filter(c => !isDU(c.columnKey) && c.columnKey !== 'TOTAL')
              .map(c => c.value)
          )
          return decimalDivide(dlc, mmTotal)
        })
      )
    }
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
    const sum = sumOBRefDU('SALARY_AVERAGE_EXPENSES', getSalaryAverageExpensesDU)
    return sum != null ? decimalNegate(sum) : null
  }

  const getSalaryAverageExpensesDU = ({ targetItem }) => {
    if (isOB()) {
      const locType = getOBLocationTypeByDisplayKey(getDisplayColumnKey(targetItem))
      if (!locType) return null
      if (locType === 'Offshore') return 0

      const dlc = getOBDeliveryExpenseDU({
        targetItem,
        rowKey: 'DIRECT_LABOR_COST',
      })
      if (dlc === undefined) return undefined
      const mm = getItem({
        sectionKey: 'MAN_MONTH',
        rowKey: 'MM_PRODUCTION',
        columnKey: targetItem.columnKey,
      }).value
      return decimalDivide(dlc, mm)
    }
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

  const getProductivityDU = ({ targetItem }) => {
    if (!isOB()) {
      const cross = getOBCrossViewRefCell({
        targetItem,
        refRowKey: 'PRODUCTIVITY',
      })
      if (cross !== undefined) return cross
    }
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
    if (isOB()) {
      return getSum(
        ...LOC_TYPES.map(locType => {
          const dm = getOBLocTypeDMTotal(locType)
          const mm = getCrossViewCell(locType, 'MAN_MONTH', 'MM_PRODUCTION', 'TOTAL')
          return decimalDivide(dm, mm)
        })
      )
    }
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

  const getEfficiencyDU = ({ targetItem }) => {
    if (!isOB()) {
      const cross = getOBCrossViewRefCell({ targetItem, refRowKey: 'EFFICIENCY' })
      if (cross !== undefined) return cross
    }
    const dmItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
      compareKey: targetItem.compareKey,
    })
    if (!dmItem || !dmItem.sectionKey) return undefined
    return decimalDivide(
      getDirectMargin({ targetItem: dmItem }),
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

  const hideInOB = fn => args => isOB() ? undefined : fn(args)
  const obOnly = fn => args => isOB() ? fn(args) : null

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
      DEDUCTION: {
        total: getDeductionTotal,
        sale: getDeductionSale,
        internal: getOBSumDUInternal,
      },
      ONSITE_FEE: { total: getOBFeeTotal, internal: getOBSumDUInternal },
      EQUIPMENT_FEE: { total: getOBFeeTotal, internal: getOBSumDUInternal },
      OTHER_FEE: { total: getOBFeeTotal, internal: getOBSumDUInternal },
      SERVICE: { total: getSumAllValues },
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
      PIC_CIT: { internal: getOBSumDUInternal },
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
        sale: hideInOB(getIncentivesRateCell),
        internal: obOnly(() => {
          const sum = sumOBRefDU('INCENTIVES_RATE', getIncentivesRateCell)
          return sum != null ? decimalNegate(sum) : null
        }),
        delivery_unit: getIncentivesRateCell,
      },
      PRODUCTION_MM_BONUS: {
        sale: hideInOB(getProductionMMBonusCell),
        internal: obOnly(() => {
          const sum = sumOBRefDU('PRODUCTION_MM_BONUS', getProductionMMBonusCell)
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

  return { getFormula, isSpecialSectionFormula }
}

export default useFormula
