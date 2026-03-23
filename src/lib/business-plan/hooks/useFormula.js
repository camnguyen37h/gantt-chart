import { useSelector } from 'react-redux'
import { sectionConfig } from '../constants'
import Decimal from 'decimal.js'

const useFormula = () => {
  const {
    exchangeRate,
    businessPlanItems,
    softwareDevelopmentFee,
    ratesByLocationType,
    columns,
  } = useSelector(state => state.businessPlanDetails)

  const getRatesForColumn = function (columnKey) {
    const col =
      columns &&
      columns.find(function (c) {
        return c.columnKey === columnKey
      })
    if (col && col.colCategory) {
      const locationType =
        col.colCategory === 'bu_onsite'
          ? 'Onsite'
          : col.colCategory === 'bu_offshore'
            ? 'Offshore'
            : null
      if (
        locationType &&
        ratesByLocationType &&
        ratesByLocationType[locationType]
      ) {
        return ratesByLocationType[locationType]
      }
    }
    return {
      exchangeRate: exchangeRate,
      softwareDevelopmentFee: softwareDevelopmentFee,
    }
  }

  const getSum = (...rest) => {
    if (rest.every(item => item === null || item === undefined)) return null

    return rest
      .reduce((total, cur) => {
        const value =
          isNaN(cur) || cur === null || cur === undefined
            ? new Decimal(0)
            : new Decimal(cur)
        return total.plus(value)
      }, new Decimal(0))
      .toNumber()
  }

  const getMultiplicationRes = (...rest) => {
    const validItems = rest.filter(
      item => item !== null && item !== undefined && item !== '' && !isNaN(item)
    )

    if (validItems.length < 2) return null

    return validItems
      .reduce((prod, cur) => {
        return prod.times(new Decimal(cur))
      }, new Decimal(1))
      .toNumber()
  }

  const getItem = ({ sectionKey, rowKey, columnKey }) => {
    return businessPlanItems[sectionKey] &&
      businessPlanItems[sectionKey].data[rowKey] &&
      businessPlanItems[sectionKey].data[rowKey].data.find(
        item => item.columnKey === columnKey
      )
      ? businessPlanItems[sectionKey].data[rowKey].data.find(
          item => item.columnKey === columnKey
        )
      : {}
  }

  const getItems = ({ sectionKey, rowKey, filterCallback }) => {
    return businessPlanItems[sectionKey] &&
      businessPlanItems[sectionKey].data[rowKey] &&
      businessPlanItems[sectionKey].data[rowKey].data
      ? businessPlanItems[sectionKey].data[rowKey].data.filter(filterCallback)
      : []
  }

  const getItemValues = ({ sectionKey, rowKey, filterCallback }) =>
    getItems({ sectionKey, rowKey, filterCallback }).map(item => item.value)

  const getSumItemValues = ({ sectionKey, rowKey, filterCallback }) =>
    getSum(...getItemValues({ sectionKey, rowKey, filterCallback }))

  const getSumItemsValuesAndSet = ({ sectionKey, rowKey, filterCallback }) => {
    return getSumItemValues({ sectionKey, rowKey, filterCallback })
  }

  const getSumDUValuesAndSet = ({ targetItem, sectionKey, rowKey }) => {
    return getSumItemsValuesAndSet({
      targetItem,
      sectionKey,
      rowKey,
      filterCallback: item =>
        item.columnKey.toLowerCase().includes('delivery_unit'),
    })
  }

  const getSumAllValuesAndSet = ({ targetItem, sectionKey, rowKey }) => {
    return getSumItemsValuesAndSet({
      targetItem,
      sectionKey,
      rowKey,
      filterCallback: item =>
        item && item.columnKey && item.columnKey.toLowerCase() !== 'total',
    })
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

      if (!childItem) return null

      const regex = `${serviceRowKey}_\\d+`
      const isService = key.match(new RegExp(regex))
      const formulaResult = getFormula({
        item: childItem,
        columnKey,
        rowKey: key,
        sectionKey,
        isService,
      })
      return formulaResult !== undefined ? formulaResult : childItem.value
    })

    return getSum(...values)
  }

  const getUnitPriceTotal = () => {
    const unitPriceSale = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'UNIT_PRICE',
      columnKey: 'SALE',
    })

    return unitPriceSale.value
  }

  const getMMManufactureTotal = () => {
    return getSumDUValuesAndSet({
      rowKey: 'MM_PRODUCTION',
      sectionKey: 'MAN_MONTH',
    })
  }

  const getMMManufactureSale = () => {
    return getMMBillSale()
  }

  const getMMBillSale = () => {
    const mmBillDUItems = getItems({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_BILL',
      filterCallback: item =>
        item.columnKey.toLowerCase().includes('delivery_unit'),
    })
    const mmBillDUValues = mmBillDUItems.map(item =>
      getMMBillDU({ targetItem: item })
    )

    return getSum(...mmBillDUValues)
  }

  const getMMBillDU = ({ targetItem }) => {
    const serviceKeys = Object.keys(businessPlanItems.MAN_MONTH.data).filter(
      key => key.match(/MM_BILL_\d+/)
    )
    const serviceValues = serviceKeys.map(key => {
      return businessPlanItems.MAN_MONTH.data[key].data.find(
        item =>
          item.columnKey.toLowerCase().includes('delivery_unit') &&
          item.columnKey === targetItem.columnKey
      )
        ? businessPlanItems.MAN_MONTH.data[key].data.find(
            item =>
              item.columnKey.toLowerCase().includes('delivery_unit') &&
              item.columnKey === targetItem.columnKey
          ).value
        : null
    })

    return getSum(...serviceValues)
  }

  const getTotalMMBilService = ({ targetItem }) => {
    return getSumDUValuesAndSet({
      targetItem,
      sectionKey: targetItem.sectionKey,
      rowKey: targetItem.rowKey,
    })
  }

  const getSoftwareProductionTotal = () => {
    const saleColumns =
      columns &&
      columns.filter(function (c) {
        return c.columnKey && /^sale_\d+$/i.test(c.columnKey)
      })
    if (!saleColumns || saleColumns.length === 0) {
      return getSoftwareProductionSale()
    }
    const values = saleColumns.map(function (col) {
      return getSoftwareProductionSale({ targetItem: col })
    })
    return getSum.apply(null, values)
  }

  const getSoftwareProductionSale = function ({ targetItem } = {}) {
    const rates =
      targetItem && targetItem.columnKey
        ? getRatesForColumn(targetItem.columnKey)
        : {
            exchangeRate: exchangeRate,
            softwareDevelopmentFee: softwareDevelopmentFee,
          }
    return getMultiplicationRes(
      rates.exchangeRate,
      rates.softwareDevelopmentFee
    )
  }

  const getSoftwareProductionInternal = () => {
    const duItems = getItems({
      sectionKey: 'REVENUES',
      rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
      filterCallback: item =>
        item &&
        item.columnKey &&
        item.columnKey.toLowerCase().includes('delivery_unit'),
    })

    const values = duItems.map(item =>
      getSoftwareProductionDU({ targetItem: item })
    )

    const value = getSum(...values)

    return value === null
      ? null
      : new Decimal(0).minus(new Decimal(value)).toNumber()
  }

  const getSoftwareProductionDU = ({ targetItem }) => {
    if (!targetItem || !targetItem.columnKey) return null
    const found =
      businessPlanItems.REVENUES.data.SOFTWARE_PRODUCTION_REVENUES.data.find(
        item =>
          item.columnKey.toLowerCase().includes('delivery_unit') &&
          item.columnKey === targetItem.columnKey
      )
    return found ? found.value : null
  }

  const getDeductionTotal = () => {
    // For TOTAL column, read the TOTAL values from backend directly.
    const deductionFromBackend =
      (
        businessPlanItems.REVENUES.data.DEDUCTION.data.find(function (item) {
          return item.columnKey === 'TOTAL'
        }) || {}
      ).value || 0

    const revenuesSaleFromBackend =
      (
        businessPlanItems.REVENUES.data.SOFTWARE_PRODUCTION_REVENUES.data.find(
          function (item) {
            return item.columnKey === 'TOTAL'
          }
        ) || {}
      ).value || 0

    const totalDeductionRevenueFromBackend = new Decimal(
      revenuesSaleFromBackend
    )
      .plus(new Decimal(deductionFromBackend))
      .toNumber()

    const computedTotalSPR = getSoftwareProductionTotal()
    const revenuesFromUserTyping =
      computedTotalSPR !== null && computedTotalSPR !== undefined
        ? computedTotalSPR
        : 0

    return new Decimal(totalDeductionRevenueFromBackend)
      .minus(new Decimal(revenuesFromUserTyping))
      .toNumber()
  }

  // targetItem carries the exact SALE columnKey so we read/compute against the right column.
  const getDeductionSale = function ({ targetItem } = {}) {
    const saleColumnKey = targetItem && targetItem.columnKey

    const deductionFromBackend =
      (
        businessPlanItems.REVENUES.data.DEDUCTION.data.find(function (item) {
          return saleColumnKey
            ? item.columnKey === saleColumnKey
            : item.columnKey.toLowerCase().includes('sale')
        }) || {}
      ).value || 0

    const revenuesSaleFromBackend =
      (
        businessPlanItems.REVENUES.data.SOFTWARE_PRODUCTION_REVENUES.data.find(
          function (item) {
            return saleColumnKey
              ? item.columnKey === saleColumnKey
              : item.columnKey.toLowerCase().includes('sale')
          }
        ) || {}
      ).value || 0

    const totalDeductionRevenueFromBackend = new Decimal(
      revenuesSaleFromBackend
    )
      .plus(new Decimal(deductionFromBackend))
      .toNumber()

    const computedSPR = getSoftwareProductionSale({ targetItem: targetItem })
    const revenuesFromUserTyping =
      computedSPR !== null && computedSPR !== undefined ? computedSPR : 0

    return new Decimal(totalDeductionRevenueFromBackend)
      .minus(new Decimal(revenuesFromUserTyping))
      .toNumber()
  }

  const getOnsiteFeeTotal = ({ sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ sectionKey, rowKey })
  }

  const getEquipmentFeeTotal = ({ sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ sectionKey, rowKey })
  }

  const getOtherFeeTotal = ({ sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ sectionKey, rowKey })
  }

  const getRevenuesServiceTotal = ({ sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ sectionKey, rowKey })
  }

  const getDUCostSale = () => {
    return getSoftwareProductionInternal()
      ? -getSoftwareProductionInternal()
      : null
  }

  const getDUCostInternal = () => {
    return getSoftwareProductionInternal()
  }

  const getIncentiveTotal = () => {
    const softwareProductionRevenuesTotal = getSoftwareProductionTotal()

    const incentiveRate = getItem({
      sectionKey: 'REFERENCE',
      rowKey: 'INCENTIVES_RATE',
      columnKey: 'SALE',
    }).value

    return softwareProductionRevenuesTotal !== null &&
      softwareProductionRevenuesTotal !== undefined &&
      incentiveRate !== null &&
      incentiveRate !== undefined
      ? new Decimal(softwareProductionRevenuesTotal)
          .times(new Decimal(incentiveRate))
          .dividedBy(100)
          .toNumber()
      : null
  }

  const getIncentiveSale = function ({ targetItem } = {}) {
    const softwareProductionRevenuesSale = getSoftwareProductionSale({
      targetItem: targetItem,
    })

    const incentiveRate = getItem({
      sectionKey: 'REFERENCE',
      rowKey: 'INCENTIVES_RATE',
      columnKey: 'SALE',
    }).value

    return softwareProductionRevenuesSale !== null &&
      softwareProductionRevenuesSale !== undefined &&
      incentiveRate !== null &&
      incentiveRate !== undefined
      ? new Decimal(softwareProductionRevenuesSale)
          .times(new Decimal(incentiveRate))
          .dividedBy(100)
          .toNumber()
      : null
  }

  const getAgencyTotal = () => {
    const value = getItem({
      sectionKey: 'SELLING_EXPENSES',
      rowKey: 'AGENCY_EXPENSE',
      columnKey: 'SALE',
    }).value
    return value ? value : value === 0 ? value : null
  }

  const getDirectLaborCostTotal = ({ targetItem, sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
  }

  const getOutsourcingCostTotal = ({ targetItem, sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
  }
  const getEquipmentCostTotal = ({ targetItem, sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
  }
  const getOnsiteCostTotal = ({ targetItem, sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
  }
  const getOvertimeTotal = ({ targetItem, sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
  }

  const getNonDeductionTotal = ({ targetItem, sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
  }
  const getSenorityBonusTotal = ({ targetItem, sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
  }

  const getOtherCost = ({ targetItem, sectionKey, rowKey }) => {
    return getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
  }

  const getProjectBonusDU = ({ targetItem }) => {
    const productionMMBonusDU = getItem({
      sectionKey: 'REFERENCE',
      rowKey: 'PRODUCTION_MM_BONUS',
      columnKey: targetItem.columnKey,
    }).value

    const mmBillDUItem = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_BILL',
      columnKey: targetItem.columnKey,
    })

    const mmBillDU = getMMBillDU({ targetItem: mmBillDUItem })

    return productionMMBonusDU !== null && mmBillDU !== null
      ? new Decimal(productionMMBonusDU).times(new Decimal(mmBillDU)).toNumber()
      : null
  }

  const getProjectBonusTotal = () => {
    const duItems = getItems({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'PROJECT_BONUS',
      filterCallback: item =>
        item.columnKey.toLowerCase().includes('delivery_unit'),
    })
    const duValues = duItems.map(item =>
      getProjectBonusDU({ targetItem: item })
    )

    return getSum(...duValues)
  }

  const getDirectMargin = ({ targetItem }) => {
    const totalRevenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const totalCostPrice = getItem({
      sectionKey: 'COST_PRICE',
      rowKey: 'COST_PRICE_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const totalSellingExpenses = getItem({
      sectionKey: 'SELLING_EXPENSES',
      rowKey: 'SELLING_EXPENSES_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const totalDeliveryExpenses = getItem({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DELIVERY_EXPENSES_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const totalTaxExpenses = getItem({
      sectionKey: 'TAX',
      rowKey: 'TAX_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const totalTaxExpensesValue = getTotalTax({ targetItem: totalTaxExpenses })

    const values = [
      totalCostPrice,
      totalSellingExpenses,
      totalDeliveryExpenses,
    ].map(item =>
      getTotalColumnAndSet({
        targetItem: item,
        serviceRowKey:
          sectionConfig[item.sectionKey] &&
          sectionConfig[item.sectionKey].newRowKey,
      })
    )

    const sum = getSum(...values, totalTaxExpensesValue)

    const totalRevenuesValue = getTotalColumnAndSet({
      targetItem: totalRevenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return totalRevenuesValue !== null &&
      sum !== null &&
      totalRevenuesValue !== undefined &&
      sum !== undefined
      ? new Decimal(totalRevenuesValue).minus(new Decimal(sum)).toNumber()
      : null
  }

  const getDirectMarginBonusDU = ({ targetItem }) => {
    const projectBonusItem = getItem({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'PROJECT_BONUS',
      columnKey: targetItem.columnKey,
    })
    const projectBonus = getProjectBonusDU({ targetItem: projectBonusItem })

    const directMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })

    const directMargin = getDirectMargin({ targetItem: directMarginItem })

    return getSum(projectBonus, directMargin)
  }

  const getDirectMarginBonusSaleInternal = ({ targetItem }) => {
    const totalIncentive =
      targetItem.columnKey === 'INTERNAL' ? null : getIncentiveTotal()

    const directMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })

    const directMargin = getDirectMargin({ targetItem: directMarginItem })

    return getSum(totalIncentive, directMargin)
  }

  const getDirectMarginBonusTotal = () => {
    const totalIncentive = getIncentiveTotal()

    const projectBonus = getProjectBonusTotal()

    const directMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: 'TOTAL',
    })

    const directMargin = getDirectMargin({ targetItem: directMarginItem })

    return getSum(totalIncentive, projectBonus, directMargin)
  }
  const getAllocationOfPoolDU = ({ targetItem }) => {
    const directLabor = getItem({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
      columnKey: targetItem.columnKey,
    }).value

    const billrateNorm = getItem({
      sectionKey: 'REFERENCE',
      rowKey: 'BILL_RATE_NORM',
      columnKey: targetItem.columnKey,
    }).value

    return directLabor !== null &&
      billrateNorm !== null &&
      directLabor !== undefined &&
      billrateNorm !== undefined &&
      billrateNorm !== 0
      ? new Decimal(directLabor)
          .times(100)
          .dividedBy(new Decimal(billrateNorm))
          .minus(new Decimal(directLabor || 0))
          .toNumber()
      : null
  }

  const getAllocationOfPoolTotal = () => {
    const DUItems = getItems({
      sectionKey: 'MARGIN',
      rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
      filterCallback: item =>
        item.columnKey.toLowerCase().includes('delivery_unit'),
    })

    const duValues = DUItems.map(item =>
      getAllocationOfPoolDU({ targetItem: item })
    )

    return getSum(...duValues)
  }

  const getIndirectMarginDU = ({ targetItem }) => {
    const directMargin = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })

    const directMarginValue = getDirectMargin({
      targetItem: directMargin,
    })

    const allocationOfPoolItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
      columnKey: targetItem.columnKey,
    })

    const allocationOfPool = getAllocationOfPoolDU({
      targetItem: allocationOfPoolItem,
    })

    return directMarginValue !== null &&
      allocationOfPool !== null &&
      directMarginValue !== undefined &&
      allocationOfPool !== undefined
      ? new Decimal(directMarginValue)
          .minus(new Decimal(allocationOfPool))
          .toNumber()
      : null
  }

  const getIndirectMarginTotal = () => {
    const directMargin = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: 'TOTAL',
    })

    const directMarginValue = getDirectMargin({
      targetItem: directMargin,
    })

    const allocationOfPool = getAllocationOfPoolTotal()

    return directMarginValue !== null &&
      allocationOfPool !== null &&
      directMarginValue !== undefined &&
      allocationOfPool !== undefined
      ? new Decimal(directMarginValue)
          .minus(new Decimal(allocationOfPool))
          .toNumber()
      : null
  }

  const getIndirectMarginInternalSale = ({ targetItem }) => {
    const directMargin = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })

    return getDirectMargin({
      targetItem: directMargin,
    })
  }

  const getDirectMarginRate = ({ targetItem }) => {
    const directMargin = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })

    const directMarginValue = getDirectMargin({ targetItem: directMargin })

    const totalRevenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const revenuesValue = getTotalColumnAndSet({
      targetItem: totalRevenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return directMarginValue != null &&
      revenuesValue != null &&
      revenuesValue !== 0
      ? new Decimal(directMarginValue)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getDirectMarginBonusRateTotal = () => {
    const directMarginBonusItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN_BONUS',
      columnKey: 'TOTAL',
    })

    const directMarginBonus = getDirectMarginBonusTotal({
      targetItem: directMarginBonusItem,
    })

    const totalRevenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: 'TOTAL',
    })

    const revenuesValue = getTotalColumnAndSet({
      targetItem: totalRevenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return directMarginBonus != null &&
      revenuesValue != null &&
      revenuesValue !== 0
      ? new Decimal(directMarginBonus)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getDirectMarginBonusRateSaleInternal = ({ targetItem }) => {
    let directMarginBonus
    const directMarginBonusItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN_BONUS',
      columnKey: targetItem.columnKey,
    })

    directMarginBonus = getDirectMarginBonusSaleInternal({
      targetItem: directMarginBonusItem,
    })

    const totalRevenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const revenuesValue = getTotalColumnAndSet({
      targetItem: totalRevenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return directMarginBonus != null &&
      revenuesValue != null &&
      revenuesValue !== 0
      ? new Decimal(directMarginBonus)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getDirectMarginBonusRateDU = ({ targetItem }) => {
    let directMarginBonus
    const directMarginBonusItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN_BONUS',
      columnKey: targetItem.columnKey,
    })

    directMarginBonus = getDirectMarginBonusDU({
      targetItem: directMarginBonusItem,
    })

    const totalRevenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const revenuesValue = getTotalColumnAndSet({
      targetItem: totalRevenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return directMarginBonus != null &&
      revenuesValue != null &&
      revenuesValue !== 0
      ? new Decimal(directMarginBonus)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getIndirectMarginRateDU = ({ targetItem }) => {
    let indirectMargin
    const indirectMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'INDIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })

    indirectMargin = getIndirectMarginDU({
      targetItem: indirectMarginItem,
    })

    const totalRevenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const revenuesValue = getTotalColumnAndSet({
      targetItem: totalRevenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return indirectMargin != null &&
      revenuesValue != null &&
      revenuesValue !== 0
      ? new Decimal(indirectMargin)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getIndirectMarginRateSaleInternal = ({ targetItem }) => {
    let indirectMargin
    const indirectMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'INDIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })

    indirectMargin = getIndirectMarginInternalSale({
      targetItem: indirectMarginItem,
    })

    const totalRevenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const revenuesValue = getTotalColumnAndSet({
      targetItem: totalRevenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return indirectMargin != null &&
      revenuesValue != null &&
      revenuesValue !== 0
      ? new Decimal(indirectMargin)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getIndirectMarginRateTotal = () => {
    let indirectMargin
    const indirectMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'INDIRECT_MARGIN',
      columnKey: 'TOTAL',
    })

    indirectMargin = getIndirectMarginTotal({
      targetItem: indirectMarginItem,
    })

    const totalRevenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: 'TOTAL',
    })

    const revenuesValue = getTotalColumnAndSet({
      targetItem: totalRevenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    return indirectMargin != null &&
      revenuesValue != null &&
      revenuesValue !== 0
      ? new Decimal(indirectMargin)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getDeliveryAverageExpensesTotal = () => {
    const deliveryExpensesItem = getItem({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DELIVERY_EXPENSES_TOTAL',
      columnKey: 'TOTAL',
    })

    const deliveryExpenses = getTotalColumnAndSet({
      targetItem: deliveryExpensesItem,
      serviceRowKey: sectionConfig.DELIVERY_EXPENSES.newRowKey,
    })

    const mmManufacture = getMMManufactureTotal()

    return deliveryExpenses != null &&
      mmManufacture != null &&
      mmManufacture !== 0
      ? new Decimal(deliveryExpenses)
          .dividedBy(new Decimal(mmManufacture))
          .toNumber()
      : null
  }

  const getDeliveryAverageExpensesSale = () => {
    const costOfDUSold = getDUCostSale()

    const mmManufacture = getMMManufactureSale()

    return costOfDUSold != null && mmManufacture != null && mmManufacture !== 0
      ? new Decimal(costOfDUSold)
          .dividedBy(new Decimal(mmManufacture))
          .toNumber()
      : null
  }

  const getDeliveryAverageExpensesDU = ({ targetItem }) => {
    const deliveryExpensesItem = getItem({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DELIVERY_EXPENSES_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const deliveryExpenses = getTotalColumnAndSet({
      targetItem: deliveryExpensesItem,
      serviceRowKey: sectionConfig.DELIVERY_EXPENSES.newRowKey,
    })

    const mmManufacture = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
      columnKey: targetItem.columnKey,
    }).value

    return deliveryExpenses != null &&
      mmManufacture != null &&
      mmManufacture !== 0
      ? new Decimal(deliveryExpenses)
          .dividedBy(new Decimal(mmManufacture))
          .toNumber()
      : null
  }

  const getSalaryAverageExpensesDU = ({ targetItem }) => {
    const laborCost = getItem({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
      columnKey: targetItem.columnKey,
    }).value

    const mmManufacture = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
      columnKey: targetItem.columnKey,
    }).value

    return laborCost != null && mmManufacture != null && mmManufacture !== 0
      ? new Decimal(laborCost).dividedBy(new Decimal(mmManufacture)).toNumber()
      : null
  }

  const getSalaryAverageExpensesSale = ({ targetItem }) => {
    const laborCost = getItem({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
      columnKey: targetItem.columnKey,
    }).value

    const mmManufacture = getMMManufactureSale()

    return laborCost != null && mmManufacture != null && mmManufacture !== 0
      ? new Decimal(laborCost).dividedBy(new Decimal(mmManufacture)).toNumber()
      : null
  }

  const getSalaryAverageExpensesTotal = () => {
    const laborCost = getDirectLaborCostTotal({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
    })

    const mmManufacture = getMMManufactureTotal()

    return laborCost != null && mmManufacture != null && mmManufacture !== 0
      ? new Decimal(laborCost).dividedBy(new Decimal(mmManufacture)).toNumber()
      : null
  }

  const getBillableRateDU = ({ targetItem }) => {
    const mmBill = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_BILL',
      columnKey: targetItem.columnKey,
    })

    const mmBillValue = getMMBillDU({ targetItem: mmBill })

    const mmManufacture = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
      columnKey: targetItem.columnKey,
    }).value

    return mmBillValue != null && mmManufacture != null && mmManufacture !== 0
      ? new Decimal(mmBillValue)
          .dividedBy(new Decimal(mmManufacture))
          .times(100)
          .toNumber()
      : null
  }

  const getBillableRateSale = () => {
    const mmBill = getMMBillSale()

    const mmManufacture = getMMManufactureSale()

    return mmBill != null && mmManufacture != null && mmManufacture !== 0
      ? new Decimal(mmBill)
          .dividedBy(new Decimal(mmManufacture))
          .times(100)
          .toNumber()
      : null
  }

  const getBillableRateTotal = () => {
    const mmBill = getMMBillSale()

    const mmManufacture = getMMManufactureTotal()

    return mmBill != null && mmManufacture != null && mmManufacture !== 0
      ? new Decimal(mmBill)
          .dividedBy(new Decimal(mmManufacture))
          .times(100)
          .toNumber()
      : null
  }

  const getProductivityDU = ({ targetItem }) => {
    const softwareProductionRevenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
      columnKey: targetItem.columnKey,
    })

    const softwareValue = getSoftwareProductionDU({
      targetItem: softwareProductionRevenues,
    })

    const mmManufacture = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
      columnKey: targetItem.columnKey,
    }).value

    return softwareValue != null && mmManufacture != null && mmManufacture !== 0
      ? new Decimal(softwareValue)
          .dividedBy(new Decimal(mmManufacture))
          .toNumber()
      : null
  }

  const getProductivityTotal = () => {
    const softwareProductionRevenues = getSoftwareProductionTotal()

    const mmManufacture = getMMManufactureTotal()

    return softwareProductionRevenues != null &&
      mmManufacture != null &&
      mmManufacture !== 0
      ? new Decimal(softwareProductionRevenues)
          .dividedBy(new Decimal(mmManufacture))
          .toNumber()
      : null
  }

  const getEfficiencyDU = ({ targetItem }) => {
    const directMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })
    const directMargin = getDirectMargin({ targetItem: directMarginItem })

    const mmManufacture = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
      columnKey: targetItem.columnKey,
    }).value

    return directMargin != null && mmManufacture != null && mmManufacture !== 0
      ? new Decimal(directMargin)
          .dividedBy(new Decimal(mmManufacture))
          .toNumber()
      : null
  }

  const getEfficiencyTotal = ({ targetItem }) => {
    const directMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })
    const directMargin = getDirectMargin({ targetItem: directMarginItem })

    const mmManufacture = getMMManufactureTotal()

    return directMargin != null && mmManufacture != null && mmManufacture !== 0
      ? new Decimal(directMargin)
          .dividedBy(new Decimal(mmManufacture))
          .toNumber()
      : null
  }

  const getTotalTax = ({ targetItem }) => {
    if (targetItem.columnKey === 'INTERNAL') return null
    const revenues = getItem({
      sectionKey: 'REVENUES',
      rowKey: 'REVENUES_TOTAL',
      columnKey: targetItem.columnKey,
    })

    const revenuesValue = getTotalColumnAndSet({
      targetItem: revenues,
      serviceRowKey: sectionConfig.REVENUES.newRowKey,
    })

    const pic = getItem({
      sectionKey: 'TAX',
      rowKey: 'PIC_CIT',
      columnKey: 'TOTAL',
    }).value

    return revenuesValue !== null &&
      pic !== null &&
      revenuesValue !== undefined &&
      pic !== undefined
      ? new Decimal(revenuesValue)
          .times(new Decimal(pic))
          .dividedBy(100)
          .toNumber()
      : null
  }

  const getFormula = ({ item, columnKey, sectionKey, rowKey, isService }) => {
    let lowerCaseColumnKey = columnKey.toLowerCase()
    if (lowerCaseColumnKey.includes('delivery_unit'))
      lowerCaseColumnKey = 'delivery_unit'
    if (/^sale_\d+$/.test(lowerCaseColumnKey)) lowerCaseColumnKey = 'sale'
    let newRowkey = rowKey
    if (isService) {
      newRowkey = 'SERVICE'
    }

    const curSectionConfig = sectionConfig[sectionKey] || {}
    const config = {
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
          internal: getTotalColumnAndSet,
          delivery_unit: getTotalColumnAndSet,
        },
        SOFTWARE_PRODUCTION_REVENUES: {
          delivery_unit: getSoftwareProductionDU,
          internal: getSoftwareProductionInternal,
          sale: getSoftwareProductionSale,
          total: getSoftwareProductionTotal,
        },
        DEDUCTION: {
          total: getDeductionTotal,
          sale: getDeductionSale,
        },
        ONSITE_FEE: {
          total: getOnsiteFeeTotal,
        },
        EQUIPMENT_FEE: {
          total: getEquipmentFeeTotal,
        },
        OTHER_FEE: {
          total: getOtherFeeTotal,
        },
        SERVICE: {
          total: getRevenuesServiceTotal,
        },
      },
      COST_PRICE: {
        COST_PRICE_TOTAL: {
          sale: getTotalColumnAndSet,
          internal: getTotalColumnAndSet,
          delivery_unit: getTotalColumnAndSet,
        },
        COST_OF_DU_SOLD: {
          internal: getDUCostInternal,
          sale: getDUCostSale,
        },
      },
      SELLING_EXPENSES: {
        SELLING_EXPENSES_TOTAL: {
          total: getTotalColumnAndSet,
          sale: getTotalColumnAndSet,
        },
        INCENTIVES: {
          total: getIncentiveTotal,
          sale: getIncentiveSale,
        },
        AGENCY_EXPENSE: {
          total: getAgencyTotal,
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
        },
        DIRECT_LABOR_COST: {
          total: getDirectLaborCostTotal,
        },
        EQUIPMENT_INTERNET_SERVER_COST: {
          total: getEquipmentCostTotal,
        },
        ONSITE_DEVELOPMENT_COST: {
          total: getOnsiteCostTotal,
        },
        PROJECT_BONUS: {
          total: getProjectBonusTotal,
          delivery_unit: getProjectBonusDU,
        },
        OVERTIME: {
          total: getOvertimeTotal,
        },
        NON_DEDUCTION_VAT: {
          total: getNonDeductionTotal,
        },
        SENIORITY_BONUS: {
          total: getSenorityBonusTotal,
        },
        OTHER_EXPENSES: {
          total: getOtherCost,
        },
        SERVICE: {
          total: getSumAllValuesAndSet,
        },
      },
      TAX: {
        TAX_TOTAL: {
          total: getTotalTax,
          sale: getTotalTax,
          delivery_unit: getTotalTax,
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
          delivery_unit: getDeliveryAverageExpensesDU,
        },
        SALARY_AVERAGE_EXPENSES: {
          total: getSalaryAverageExpensesTotal,
          sale: getSalaryAverageExpensesSale,
          delivery_unit: getSalaryAverageExpensesDU,
        },
        BILLABLE_RATE: {
          total: getBillableRateTotal,
          sale: getBillableRateSale,
          delivery_unit: getBillableRateDU,
        },
        PRODUCTIVITY: {
          total: getProductivityTotal,
          delivery_unit: getProductivityDU,
        },
        EFFICIENCY: {
          total: getEfficiencyTotal,
          delivery_unit: getEfficiencyDU,
        },
      },
    }
    return config[sectionKey] &&
      config[sectionKey][newRowkey] &&
      config[sectionKey][newRowkey][lowerCaseColumnKey]
      ? config[sectionKey][newRowkey][lowerCaseColumnKey]({
          targetItem: item,
          columnKey,
          sectionKey,
          rowKey,
          serviceRowKey: curSectionConfig ? curSectionConfig.newRowKey : '',
        })
      : undefined
  }

  const isSpecialSectionFormula = sectionKey => {
    return (
      sectionKey === 'REVENUES' ||
      sectionKey === 'COST_PRICE' ||
      sectionKey === 'SELLING_EXPENSES' ||
      sectionKey === 'DELIVERY_EXPENSES' ||
      sectionKey === 'TAX' ||
      sectionKey === 'MARGIN' ||
      sectionKey === 'REFERENCE'
    )
  }

  return { getFormula, isSpecialSectionFormula }
}

export default useFormula
