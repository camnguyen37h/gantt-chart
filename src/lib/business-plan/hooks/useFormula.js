import { useSelector } from 'react-redux'
import useBusinessPlanForm from './useBusinessPlanForm'
import { sectionConfig } from '../constants'
import Decimal from 'decimal.js'

const useFormula = () => {
  const { setBusinessPlanItem } = useBusinessPlanForm()
  const {
    totalContractPrice,
    exchangeRate,
    businessPlanItems,
    softwareDevelopmentFee,
  } = useSelector(state => state.businessPlanDetails)

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

  const conditionsetBusinessPlanItem = ({ targetItem, value }) => {
    if (value !== targetItem.value) {
      setBusinessPlanItem({ item: { ...targetItem, value } })
    }
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

  const getSumItemsValuesAndSet = ({
    targetItem,
    sectionKey,
    rowKey,
    filterCallback,
  }) => {
    const value = getSumItemValues({ sectionKey, rowKey, filterCallback })
    return value
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
      filterCallback: item => item.columnKey.toLowerCase() !== 'total',
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

      const regex = `${serviceRowKey}_\\d+`
      const isService = key.match(new RegExp(regex))
      return getFormula({
        item: childItem,
        columnKey,
        rowKey: key,
        sectionKey,
        isService,
      }) !== undefined
        ? getFormula({
            item: childItem,
            columnKey,
            rowKey: key,
            sectionKey,
            isService,
          })
        : businessPlanItems[sectionKey].data[key].data.find(
            item => item.columnKey === columnKey
          ).value
    })

    const value = getSum(...values)
    return value
  }

  const getUnitPriceTotal = () => {
    const unitPriceSale = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'UNIT_PRICE',
      columnKey: 'SALE',
    })
    const value = unitPriceSale.value
    return value
  }

  const getUnitPriceSale = () => {
    const softwareProductionRevenuesSale = getSoftwareProductionSale()

    const mmBillSale = getMMBillSale()

    const value =
      softwareProductionRevenuesSale !== null &&
      mmBillSale !== null &&
      softwareProductionRevenuesSale !== undefined &&
      mmBillSale !== undefined
        ? softwareProductionRevenuesSale / mmBillSale
        : null

    return value
  }

  const getMMManufactureTotal = () => {
    const value = getSumDUValuesAndSet({
      rowKey: 'MM_PRODUCTION',
      sectionKey: 'MAN_MONTH',
    })
    return value
  }

  const getMMManufactureSale = () => {
    const value = getMMBillSale()
    return value
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
    const value = getSum(...mmBillDUValues)

    return value
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

    const value = getSum(...serviceValues)
    return value
  }

  const getTotalMMBilService = ({ targetItem }) => {
    return getSumDUValuesAndSet({
      targetItem,
      sectionKey: targetItem.sectionKey,
      rowKey: targetItem.rowKey,
    })
  }

  const getSoftwareProductionTotal = () => {
    return getSoftwareProductionSale()
  }

  const getSoftwareProductionSale = () => {
    const value = getMultiplicationRes(exchangeRate, softwareDevelopmentFee)
    return value
  }

  const getSoftwareProductionInternal = () => {
    const duItems = getItems({
      sectionKey: 'REVENUES',
      rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
      filterCallback: item =>
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
    const unitPriceDU = businessPlanItems.MAN_MONTH.data.UNIT_PRICE.data.find(
      item =>
        item.columnKey.toLowerCase().includes('delivery_unit') &&
        item.columnKey === targetItem.columnKey
    ).value

    const revenuesFromWorkDUFromBackend =
      businessPlanItems.REVENUES.data.SOFTWARE_PRODUCTION_REVENUES.data.find(
        item =>
          item.columnKey.toLowerCase().includes('delivery_unit') &&
          item.columnKey === targetItem.columnKey
      ).value

    const mmBillDUItem = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'MM_BILL',
      columnKey: targetItem.columnKey,
    })

    const mmbillDU = getMMBillDU({ targetItem: mmBillDUItem })

    const value = revenuesFromWorkDUFromBackend
    return value
  }

  const getDeductionTotal = () => {
    const value = getDeductionSale()
    return value
  }

  const getDeductionSale = () => {
    const unitPrice = getItem({
      sectionKey: 'MAN_MONTH',
      rowKey: 'UNIT_PRICE',
      columnKey: 'SALE',
    }).value
    const mmBill = getMMBillSale()
    const softwareProductionRevenues = getSoftwareProductionSale()

    const deductionFromBackend =
      (
        businessPlanItems.REVENUES.data.DEDUCTION.data.find(function (item) {
          return item.columnKey.toLowerCase().includes('sale')
        }) || {}
      ).value || 0

    const revenuesSaleFromBackend =
      (
        businessPlanItems.REVENUES.data.SOFTWARE_PRODUCTION_REVENUES.data.find(
          function (item) {
            return item.columnKey.toLowerCase().includes('sale')
          }
        ) || {}
      ).value || 0

    const totalDeductionRevenueFromBackend = new Decimal(
      revenuesSaleFromBackend
    )
      .plus(new Decimal(deductionFromBackend))
      .toNumber()

    const revenuesFromUserTyping =
      getSoftwareProductionSale() !== null &&
      getSoftwareProductionSale() !== undefined
        ? getSoftwareProductionSale()
        : 0

    const value = new Decimal(totalDeductionRevenueFromBackend)
      .minus(new Decimal(revenuesFromUserTyping))
      .toNumber()
    return value
  }

  const getOnsiteFeeTotal = ({ sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ sectionKey, rowKey })
    return value
  }

  const getEquipmentFeeTotal = ({ sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ sectionKey, rowKey })
    return value
  }

  const getOtherFeeTotal = ({ sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ sectionKey, rowKey })
    return value
  }

  const getRevenuesServiceTotal = ({ sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ sectionKey, rowKey })
    return value
  }

  const getDUCostSale = () => {
    const value = getSoftwareProductionInternal()
      ? -getSoftwareProductionInternal()
      : null
    return value
  }

  const getDUCostInternal = () => {
    const value = getSoftwareProductionInternal()
    return value
  }

  const getDUCostTotal = () => {
    return getSum(getDUCostInternal(), getDUCostSale())
  }

  const getIncentiveTotal = () => {
    const value = getIncentiveSale()
    return value
  }

  const getIncentiveSale = () => {
    const softwareProductionRevenuesSale = getSoftwareProductionSale()

    const incentiveRate = getItem({
      sectionKey: 'REFERENCE',
      rowKey: 'INCENTIVES_RATE',
      columnKey: 'SALE',
    }).value

    const value =
      softwareProductionRevenuesSale !== null &&
      softwareProductionRevenuesSale !== undefined &&
      incentiveRate !== null &&
      incentiveRate !== undefined
        ? new Decimal(softwareProductionRevenuesSale)
            .times(new Decimal(incentiveRate))
            .dividedBy(100)
            .toNumber()
        : null
    return value
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
    const value = getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
    return value
  }

  const getOutsourcingCostTotal = ({ targetItem, sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
    return value
  }
  const getEquipmentCostTotal = ({ targetItem, sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
    return value
  }
  const getOnsiteCostTotal = ({ targetItem, sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
    return value
  }
  const getOvertimeTotal = ({ targetItem, sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
    return value
  }

  const getNonDeductionTotal = ({ targetItem, sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
    return value
  }
  const getSenorityBonusTotal = ({ targetItem, sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
    return value
  }

  const getOtherCost = ({ targetItem, sectionKey, rowKey }) => {
    const value = getSumAllValuesAndSet({ targetItem, sectionKey, rowKey })
    return value
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

    const value =
      productionMMBonusDU !== null && mmBillDU !== null
        ? new Decimal(productionMMBonusDU)
            .times(new Decimal(mmBillDU))
            .toNumber()
        : null
    return value
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

    const value = getSum(...duValues)
    return value
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

    const value =
      totalRevenuesValue !== null &&
      sum !== null &&
      totalRevenuesValue !== undefined &&
      sum !== undefined
        ? new Decimal(totalRevenuesValue).minus(new Decimal(sum)).toNumber()
        : null

    return value
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

    const value = getSum(projectBonus, directMargin)
    return value
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

    const value = getSum(totalIncentive, directMargin)
    return value
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

    const value = getSum(totalIncentive, projectBonus, directMargin)
    return value
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

    const value =
      directLabor !== null &&
      billrateNorm !== null &&
      directLabor !== undefined &&
      billrateNorm !== undefined
        ? new Decimal(directLabor)
            .times(100)
            .dividedBy(new Decimal(billrateNorm))
            .minus(new Decimal(directLabor || 0))
            .toNumber()
        : null
    return value
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

    const value =
      directMarginValue !== null &&
      allocationOfPool !== null &&
      directMarginValue !== undefined &&
      allocationOfPool !== undefined
        ? new Decimal(directMarginValue)
            .minus(new Decimal(allocationOfPool))
            .toNumber()
        : null
    return value
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

    const value =
      directMarginValue !== null &&
      allocationOfPool !== null &&
      directMarginValue !== undefined &&
      allocationOfPool !== undefined
        ? new Decimal(directMarginValue)
            .minus(new Decimal(allocationOfPool))
            .toNumber()
        : null
    return value
  }

  const getIndirectMarginInternalSale = ({ targetItem }) => {
    const directMargin = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })

    const directMarginValue = getDirectMargin({
      targetItem: directMargin,
    })

    const value = directMarginValue
    return value
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

    const value =
      directMarginValue && revenuesValue
        ? new Decimal(directMarginValue)
            .dividedBy(new Decimal(revenuesValue))
            .times(100)
            .toNumber()
        : null
    return value
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

    const value =
      directMarginBonus && revenuesValue
        ? new Decimal(directMarginBonus)
            .dividedBy(new Decimal(revenuesValue))
            .times(100)
            .toNumber()
        : null
    return value
  }

  const getDirectMarginBonusRateSaleInternal = ({ targetItem }) => {
    let directMarginBonus = null
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

    const value =
      directMarginBonus && revenuesValue
        ? new Decimal(directMarginBonus)
            .dividedBy(new Decimal(revenuesValue))
            .times(100)
            .toNumber()
        : null
    return value
  }

  const getDirectMarginBonusRateDU = ({ targetItem }) => {
    let directMarginBonus = null
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

    const value =
      directMarginBonus && revenuesValue
        ? new Decimal(directMarginBonus)
            .dividedBy(new Decimal(revenuesValue))
            .times(100)
            .toNumber()
        : null
    return value
  }

  const getIndirectMarginRateDU = ({ targetItem }) => {
    let indirectMargin = null
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

    const value =
      indirectMargin && revenuesValue
        ? new Decimal(indirectMargin)
            .dividedBy(new Decimal(revenuesValue))
            .times(100)
            .toNumber()
        : null
    return value
  }

  const getIndirectMarginRateSaleInternal = ({ targetItem }) => {
    let indirectMargin = null
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

    const value =
      indirectMargin && revenuesValue
        ? new Decimal(indirectMargin)
            .dividedBy(new Decimal(revenuesValue))
            .times(100)
            .toNumber()
        : null
    return value
  }

  const getIndirectMarginRateTotal = () => {
    let indirectMargin = null
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

    const value =
      indirectMargin && revenuesValue
        ? new Decimal(indirectMargin)
            .dividedBy(new Decimal(revenuesValue))
            .times(100)
            .toNumber()
        : null
    return value
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
    const value =
      deliveryExpenses && mmManufacture
        ? new Decimal(deliveryExpenses)
            .dividedBy(new Decimal(mmManufacture))
            .toNumber()
        : null
    return value
  }

  const getDeliveryAverageExpensesSale = () => {
    const costOfDUSold = getDUCostSale()

    const mmManufacture = getMMManufactureSale()
    const value =
      costOfDUSold && mmManufacture
        ? new Decimal(costOfDUSold)
            .dividedBy(new Decimal(mmManufacture))
            .toNumber()
        : null
    return value
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

    const value =
      deliveryExpenses && mmManufacture
        ? new Decimal(deliveryExpenses)
            .dividedBy(new Decimal(mmManufacture))
            .toNumber()
        : null
    return value
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

    const value =
      laborCost && mmManufacture
        ? new Decimal(laborCost)
            .dividedBy(new Decimal(mmManufacture))
            .toNumber()
        : null
    return value
  }

  const getSalaryAverageExpensesSale = ({ targetItem }) => {
    const laborCost = getItem({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
      columnKey: targetItem.columnKey,
    }).value

    const mmManufacture = getMMManufactureSale()

    const value =
      laborCost && mmManufacture
        ? new Decimal(laborCost)
            .dividedBy(new Decimal(mmManufacture))
            .toNumber()
        : null
    return value
  }

  const getSalaryAverageExpensesTotal = ({ targetItem }) => {
    const laborCost = getDirectLaborCostTotal({
      sectionKey: 'DELIVERY_EXPENSES',
      rowKey: 'DIRECT_LABOR_COST',
    })

    const mmManufacture = getMMManufactureTotal()

    const value =
      laborCost && mmManufacture
        ? new Decimal(laborCost)
            .dividedBy(new Decimal(mmManufacture))
            .toNumber()
        : null
    return value
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

    const value =
      mmBillValue && mmManufacture
        ? new Decimal(mmBillValue)
            .dividedBy(new Decimal(mmManufacture))
            .times(100)
            .toNumber()
        : null

    return value
  }

  const getBillableRateSale = () => {
    const mmBill = getMMBillSale()

    const mmManufacture = getMMManufactureSale()

    const value =
      mmBill && mmManufacture
        ? new Decimal(mmBill)
            .dividedBy(new Decimal(mmManufacture))
            .times(100)
            .toNumber()
        : null

    return value
  }

  const getBillableRateTotal = () => {
    const mmBill = getMMBillSale()

    const mmManufacture = getMMManufactureTotal()

    const value =
      mmBill && mmManufacture
        ? new Decimal(mmBill)
            .dividedBy(new Decimal(mmManufacture))
            .times(100)
            .toNumber()
        : null
    return value
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

    const value =
      softwareValue && mmManufacture
        ? new Decimal(softwareValue)
            .dividedBy(new Decimal(mmManufacture))
            .toNumber()
        : null
    return value
  }

  const getProductivityTotal = () => {
    const softwareProductionRevenues = getSoftwareProductionTotal()

    const mmManufacture = getMMManufactureTotal()

    const value =
      softwareProductionRevenues && mmManufacture
        ? new Decimal(softwareProductionRevenues)
            .dividedBy(new Decimal(mmManufacture))
            .toNumber()
        : null
    return value
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

    const value =
      directMargin && mmManufacture
        ? new Decimal(directMargin)
            .dividedBy(new Decimal(mmManufacture))
            .toNumber()
        : null
    return value
  }

  const getEfficiencyTotal = ({ targetItem }) => {
    const directMarginItem = getItem({
      sectionKey: 'MARGIN',
      rowKey: 'DIRECT_MARGIN',
      columnKey: targetItem.columnKey,
    })
    const directMargin = getDirectMargin({ targetItem: directMarginItem })

    const mmManufacture = getMMManufactureTotal()

    const value =
      directMargin && mmManufacture
        ? new Decimal(directMargin)
            .dividedBy(new Decimal(mmManufacture))
            .toNumber()
        : null
    return value
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

    const value =
      revenuesValue !== null &&
      pic !== null &&
      revenuesValue !== undefined &&
      pic !== undefined
        ? new Decimal(revenuesValue)
            .times(new Decimal(pic))
            .dividedBy(100)
            .toNumber()
        : null

    return value
  }

  const getFormula = ({ item, columnKey, sectionKey, rowKey, isService }) => {
    let lowerCaseColumnKey = columnKey.toLowerCase()
    if (lowerCaseColumnKey.includes('delivery_unit'))
      lowerCaseColumnKey = 'delivery_unit'
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
