import { useSelector } from 'react-redux'
import { sectionConfig } from '../constants'
import Decimal from 'decimal.js'

const useFormula = () => {
  const {
    exchangeRate,
    businessPlanItems,
    softwareDevelopmentFee,
    viewMode,
    ratesByLocationType,
  } = useSelector(state => state.businessPlanDetails)

  const getRatesByLocationType = locationType => {
    if (
      locationType &&
      ratesByLocationType &&
      ratesByLocationType[locationType]
    ) {
      return ratesByLocationType[locationType]
    }
    return {
      exchangeRate: exchangeRate,
      softwareDevelopmentFee: softwareDevelopmentFee,
    }
  }

  const allLocationTypes = ratesByLocationType
    ? Object.keys(ratesByLocationType)
    : []

  const getSum = (...rest) => {
    if (rest.every(item => item === null || item === undefined)) return null

    return rest
      .reduce((total, cur) => {
        const value =
          cur === null || cur === undefined || isNaN(cur) || !isFinite(cur)
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
    try {
      if (!businessPlanItems || !businessPlanItems[sectionKey]) {
        return {}
      }

      const section = businessPlanItems[sectionKey]
      if (!section.data || !section.data[rowKey]) {
        return {}
      }

      const row = section.data[rowKey]
      if (!row.data || !Array.isArray(row.data)) {
        return {}
      }

      const foundItem = row.data.find(function (item) {
        return item && item.columnKey === columnKey
      })

      return foundItem || {}
    } catch (error) {
      return {}
    }
  }

  const getItems = ({ sectionKey, rowKey, filterCallback }) => {
    try {
      if (!businessPlanItems || !businessPlanItems[sectionKey]) {
        return []
      }

      const section = businessPlanItems[sectionKey]
      if (!section.data || !section.data[rowKey]) {
        return []
      }

      const row = section.data[rowKey]
      if (!row.data || !Array.isArray(row.data)) {
        return []
      }

      return row.data.filter(filterCallback) || []
    } catch (error) {
      return []
    }
  }

  const getItemValue = function (params, fallback) {
    const sectionKey = params.sectionKey
    const rowKey = params.rowKey
    const columnKey = params.columnKey

    if (fallback === undefined) {
      fallback = null
    }

    const item = getItem({
      sectionKey: sectionKey,
      rowKey: rowKey,
      columnKey: columnKey,
    })

    if (!item || Object.keys(item).length === 0) {
      return fallback
    }

    return item.value !== undefined && item.value !== null
      ? item.value
      : fallback
  }

  const getItemValues = ({ sectionKey, rowKey, filterCallback }) => {
    const items = getItems({ sectionKey, rowKey, filterCallback })
    return items.map(function (item) {
      return item && item.value !== undefined ? item.value : null
    })
  }

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
      filterCallback: function (item) {
        return (
          item &&
          item.columnKey &&
          item.columnKey.toLowerCase().includes('delivery_unit')
        )
      },
    })
  }

  const getSumAllValuesAndSet = ({ targetItem, sectionKey, rowKey }) => {
    return getSumItemsValuesAndSet({
      targetItem,
      sectionKey,
      rowKey,
      filterCallback: function (item) {
        return (
          item && item.columnKey && item.columnKey.toLowerCase() !== 'total'
        )
      },
    })
  }

  const getTotalColumnAndSet = ({ targetItem, serviceRowKey }) => {
    try {
      const sectionKey = targetItem.sectionKey
      const columnKey = targetItem.columnKey
      const rowKey = targetItem.rowKey

      if (
        !businessPlanItems ||
        !businessPlanItems[sectionKey] ||
        !businessPlanItems[sectionKey].data
      ) {
        return null
      }

      const rowKeys = Object.keys(businessPlanItems[sectionKey].data).filter(
        function (key) {
          return key !== rowKey
        }
      )

      const values = rowKeys.map(function (key) {
        const childItem = getItem({
          sectionKey: sectionKey,
          rowKey: key,
          columnKey: columnKey,
        })

        if (!childItem || Object.keys(childItem).length === 0) {
          return null
        }

        const regex = serviceRowKey + '_\\d+'
        const isService = key.match(new RegExp(regex))

        const formulaValue = getFormula({
          item: childItem,
          columnKey: columnKey,
          rowKey: key,
          sectionKey: sectionKey,
          isService: isService,
        })

        return formulaValue !== undefined
          ? formulaValue
          : childItem.value || null
      })

      return getSum(...values)
    } catch (error) {
      return null
    }
  }

  const getUnitPriceTotal = () => {
    return getItemValue({
      sectionKey: 'MAN_MONTH',
      rowKey: 'UNIT_PRICE',
      columnKey: 'SALE',
    })
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
      filterCallback: function (item) {
        return (
          item &&
          item.columnKey &&
          item.columnKey.toLowerCase().includes('delivery_unit')
        )
      },
    })
    const mmBillDUValues = mmBillDUItems.map(function (item) {
      return getMMBillDU({ targetItem: item })
    })

    return getSum(...mmBillDUValues)
  }

  const getMMBillDU = ({ targetItem }) => {
    try {
      if (
        !businessPlanItems ||
        !businessPlanItems.MAN_MONTH ||
        !businessPlanItems.MAN_MONTH.data
      ) {
        return null
      }

      const serviceKeys = Object.keys(businessPlanItems.MAN_MONTH.data).filter(
        function (key) {
          return key.match(/MM_BILL_\d+/)
        }
      )

      const serviceValues = serviceKeys.map(function (key) {
        if (
          !businessPlanItems.MAN_MONTH.data[key] ||
          !businessPlanItems.MAN_MONTH.data[key].data
        ) {
          return null
        }

        const foundItem = businessPlanItems.MAN_MONTH.data[key].data.find(
          function (item) {
            return (
              item &&
              item.columnKey &&
              item.columnKey.toLowerCase().includes('delivery_unit') &&
              item.columnKey === targetItem.columnKey
            )
          }
        )

        return foundItem && foundItem.value !== undefined
          ? foundItem.value
          : null
      })

      return getSum(...serviceValues)
    } catch (error) {
      return null
    }
  }

  const getTotalMMBilService = ({ targetItem }) => {
    return getSumDUValuesAndSet({
      targetItem,
      sectionKey: targetItem.sectionKey,
      rowKey: targetItem.rowKey,
    })
  }

  const getSoftwareProductionTotal = () => {
    if (allLocationTypes.length > 1) {
      const values = allLocationTypes.map(lt =>
        getSoftwareProductionSaleByLocationType(lt)
      )
      return getSum.apply(null, values)
    }
    return getSoftwareProductionSaleByLocationType(viewMode)
  }

  const getSoftwareProductionSaleByLocationType = locationType => {
    const rates = getRatesByLocationType(locationType)
    return getMultiplicationRes(
      rates.exchangeRate,
      rates.softwareDevelopmentFee
    )
  }

  const getSoftwareProductionSale = () => {
    if (viewMode === 'Total' || viewMode === 'OB') {
      return getSoftwareProductionTotal()
    }

    return getSoftwareProductionSaleByLocationType(viewMode)
  }

  const getSoftwareProductionInternal = () => {
    const duItems = getItems({
      sectionKey: 'REVENUES',
      rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
      filterCallback: function (item) {
        return (
          item &&
          item.columnKey &&
          item.columnKey.toLowerCase().includes('delivery_unit')
        )
      },
    })

    const values = duItems.map(function (item) {
      return getSoftwareProductionDU({ targetItem: item })
    })

    const value = getSum(...values)

    return value === null
      ? null
      : new Decimal(0).minus(new Decimal(value)).toNumber()
  }

  const getSoftwareProductionDU = ({ targetItem }) => {
    try {
      const revenuesItem = getItem({
        sectionKey: 'REVENUES',
        rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
        columnKey: targetItem.columnKey,
      })
      return revenuesItem && revenuesItem.value !== undefined
        ? revenuesItem.value
        : null
    } catch (error) {
      return null
    }
  }

  const getDeductionTotal = () => {
    return getDeductionSale()
  }

  const getDeductionSale = () => {
    try {
      const resolvedColumnKey =
        viewMode === 'Total' || viewMode === 'OB' ? 'TOTAL' : 'SALE'

      const deductionFromBackend = getItemValue(
        {
          sectionKey: 'REVENUES',
          rowKey: 'DEDUCTION',
          columnKey: resolvedColumnKey,
        },
        0
      )

      const revenuesSaleFromBackend = getItemValue(
        {
          sectionKey: 'REVENUES',
          rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
          columnKey: resolvedColumnKey,
        },
        0
      )

      const totalDeductionRevenueFromBackend = new Decimal(
        revenuesSaleFromBackend
      )
        .plus(new Decimal(deductionFromBackend))
        .toNumber()

      const softProdSale =
        viewMode === 'Total' || viewMode === 'OB'
          ? getSoftwareProductionTotal()
          : getSoftwareProductionSale()
      const revenuesFromUserTyping =
        softProdSale !== null && softProdSale !== undefined ? softProdSale : 0

      return new Decimal(totalDeductionRevenueFromBackend)
        .minus(new Decimal(revenuesFromUserTyping))
        .toNumber()
    } catch (error) {
      return null
    }
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
    return getIncentiveSale()
  }

  const getIncentiveSale = () => {
    const softwareProductionRevenuesSale = getSoftwareProductionTotal()

    const incentiveRate = getItemValue({
      sectionKey: 'REFERENCE',
      rowKey: 'INCENTIVES_RATE',
      columnKey: 'SALE',
    })

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
    const value = getItemValue({
      sectionKey: 'SELLING_EXPENSES',
      rowKey: 'AGENCY_EXPENSE',
      columnKey: 'SALE',
    })
    return value !== null && value !== undefined ? value : null
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
    const productionMMBonusDU = getItemValue({
      sectionKey: 'REFERENCE',
      rowKey: 'PRODUCTION_MM_BONUS',
      columnKey: targetItem.columnKey,
    })

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
      filterCallback: function (item) {
        return (
          item &&
          item.columnKey &&
          item.columnKey.toLowerCase().includes('delivery_unit')
        )
      },
    })
    const duValues = duItems.map(function (item) {
      return getProjectBonusDU({ targetItem: item })
    })

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
    const directLabor = getItemValue({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
      columnKey: targetItem.columnKey,
    })

    const billrateNorm = getItemValue({
      sectionKey: 'REFERENCE',
      rowKey: 'BILL_RATE_NORM',
      columnKey: targetItem.columnKey,
    })

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
      filterCallback: function (item) {
        return (
          item &&
          item.columnKey &&
          item.columnKey.toLowerCase().includes('delivery_unit')
        )
      },
    })

    const duValues = DUItems.map(function (item) {
      return getAllocationOfPoolDU({ targetItem: item })
    })

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

    return directMarginValue && revenuesValue
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

    return directMarginBonus && revenuesValue
      ? new Decimal(directMarginBonus)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getDirectMarginBonusRateSaleInternal = ({ targetItem }) => {
    const directMarginBonusItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN_BONUS',
      columnKey: targetItem.columnKey,
    })

    const directMarginBonus = getDirectMarginBonusSaleInternal({
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

    return directMarginBonus && revenuesValue
      ? new Decimal(directMarginBonus)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getDirectMarginBonusRateDU = ({ targetItem }) => {
    const directMarginBonusItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN_BONUS',
      columnKey: targetItem.columnKey,
    })

    const directMarginBonus = getDirectMarginBonusDU({
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

    return directMarginBonus && revenuesValue
      ? new Decimal(directMarginBonus)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getIndirectMarginRateDU = ({ targetItem }) => {
    const indirectMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'INDIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })

    const indirectMargin = getIndirectMarginDU({
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

    return indirectMargin && revenuesValue
      ? new Decimal(indirectMargin)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getIndirectMarginRateSaleInternal = ({ targetItem }) => {
    const indirectMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'INDIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })

    const indirectMargin = getIndirectMarginInternalSale({
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

    return indirectMargin && revenuesValue
      ? new Decimal(indirectMargin)
          .dividedBy(new Decimal(revenuesValue))
          .times(100)
          .toNumber()
      : null
  }

  const getIndirectMarginRateTotal = () => {
    const indirectMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'INDIRECT_MARGIN',
      columnKey: 'TOTAL',
    })

    const indirectMargin = getIndirectMarginTotal({
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

    return indirectMargin && revenuesValue
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
    return deliveryExpenses && mmManufacture
      ? new Decimal(deliveryExpenses)
          .dividedBy(new Decimal(mmManufacture))
          .toNumber()
      : null
  }

  const getDeliveryAverageExpensesSale = () => {
    const costOfDUSold = getDUCostSale()

    const mmManufacture = getMMManufactureSale()
    return costOfDUSold && mmManufacture
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

    const mmManufacture = getItemValue({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
      columnKey: targetItem.columnKey,
    })

    return deliveryExpenses && mmManufacture
      ? new Decimal(deliveryExpenses)
          .dividedBy(new Decimal(mmManufacture))
          .toNumber()
      : null
  }

  const getSalaryAverageExpensesDU = ({ targetItem }) => {
    const laborCost = getItemValue({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
      columnKey: targetItem.columnKey,
    })

    const mmManufacture = getItemValue({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
      columnKey: targetItem.columnKey,
    })

    return laborCost && mmManufacture
      ? new Decimal(laborCost).dividedBy(new Decimal(mmManufacture)).toNumber()
      : null
  }

  const getSalaryAverageExpensesSale = ({ targetItem }) => {
    const laborCost = getItemValue({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
      columnKey: targetItem.columnKey,
    })

    const mmManufacture = getMMManufactureSale()

    return laborCost && mmManufacture
      ? new Decimal(laborCost).dividedBy(new Decimal(mmManufacture)).toNumber()
      : null
  }

  const getSalaryAverageExpensesTotal = () => {
    const laborCost = getDirectLaborCostTotal({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
    })

    const mmManufacture = getMMManufactureTotal()

    return laborCost && mmManufacture
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

    const mmManufacture = getItemValue({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
      columnKey: targetItem.columnKey,
    })

    return mmBillValue && mmManufacture
      ? new Decimal(mmBillValue)
          .dividedBy(new Decimal(mmManufacture))
          .times(100)
          .toNumber()
      : null
  }

  const getBillableRateSale = () => {
    const mmBill = getMMBillSale()

    const mmManufacture = getMMManufactureSale()

    return mmBill && mmManufacture
      ? new Decimal(mmBill)
          .dividedBy(new Decimal(mmManufacture))
          .times(100)
          .toNumber()
      : null
  }

  const getBillableRateTotal = () => {
    const mmBill = getMMBillSale()

    const mmManufacture = getMMManufactureTotal()

    return mmBill && mmManufacture
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

    const mmManufacture = getItemValue({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
      columnKey: targetItem.columnKey,
    })

    return softwareValue && mmManufacture
      ? new Decimal(softwareValue)
          .dividedBy(new Decimal(mmManufacture))
          .toNumber()
      : null
  }

  const getProductivityTotal = () => {
    const softwareProductionRevenues = getSoftwareProductionTotal()

    const mmManufacture = getMMManufactureTotal()

    return softwareProductionRevenues && mmManufacture
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

    const mmManufacture = getItemValue({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_PRODUCTION',
      columnKey: targetItem.columnKey,
    })

    return directMargin && mmManufacture
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

    return directMargin && mmManufacture
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

    const pic = getItemValue({
      sectionKey: 'TAX',
      rowKey: 'PIC_CIT',
      columnKey: 'TOTAL',
    })

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
