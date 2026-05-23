import { Spin, Table, message } from 'antd'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  getBusinessPlanDetailVersion,
  getBusinessPlanDetailByViewMode,
  setActiveViewMode,
} from '../redux'
import { NotificationManager } from 'react-notifications'
import styled from 'styled-components'
import { ResponseStatusCode } from '../../../service/constant'
import {
  useBusinessPlanDetails,
  useBusinessPlanForm,
  useFormula,
} from '../hooks'
import { resolveValue } from './BusinessPlanFormSection/helpers'

const BorderTable = styled.div`
  td {
    border-right: 1px solid #000 !important;
    border-bottom: 1px solid #000 !important;
  }
  th {
    border-right: 1px solid #000 !important;
    border-bottom: 1px solid #000 !important;
    background-color: #b1b1b1 !important;
  }
`

const keyLabel = {
  unitPrice: 'Unit price',
  revenues: 'Revenues',
  costOfSales: 'Cost of sales',
  sellingExpenses: 'Selling expenses',
  deliveryExpenses: 'Delivery expenses',
  taxExpenses: 'Tax expenses',
  directMargin: 'Direct margin',
  directMarginBeforeIncentivesAndProjectBonus:
    'Direct margin before Incentives and Project bonus',
  allocationOfPoolAndUnbillable: 'Allocation of pool and unbillable',
  indirectMargin: 'Indirect margin',
  directMarginRate: 'Direct margin rate',
  directMarginBeforeIncentivesAndProjectBonusRate:
    'Direct Margin before Incentives and Project bonus rate',
  indirectMarginRate: 'Indirect margin rate',
}

function generateDataSource(data = []) {
  const result = []
  Object.entries(keyLabel).forEach(([key, value]) => {
    const obj = { label: value }
    data.forEach(item => {
      obj[item.compareKey ? item.compareKey : item.columnKey] = item.data[key]
    })
    result.push(obj)
  })
  return result
}

function formatPercent(number = '') {
  const num = Number(number)
  if (!num) return '-'
  const isNegative = number < 0
  const roundedNumber = Math.round(number * 100) / 100
  const fraction = roundedNumber % 1 == 0 ? 0 : 2

  const formatedNumber = Intl.NumberFormat('en-US', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(roundedNumber)

  return isNegative
    ? `(${formatedNumber.replace('-', '')})%`
    : `${formatedNumber}%`
}

function formatMoney(number = '') {
  const num = Number(number)
  if (!num) return '-'
  const isNegative = number < 0
  const newValue = Number(number) / 1000
  const roundedNumber = Math.round(newValue * 100) / 100
  const fraction = roundedNumber % 1 == 0 ? 0 : 2

  const formatedNumber = Intl.NumberFormat('en-US', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(roundedNumber)

  return isNegative ? `(${formatedNumber.replace('-', '')})` : formatedNumber
}
function ExportBusinessPlanDetail({ match }) {
  const dispatch = useDispatch()
  const { businessPlanItems, columns } = useBusinessPlanForm()
  const { getBusinessPlanDetail, fetchAllViewModesData } = useBusinessPlanDetails()

  const [headerProjectCodes, setHeaderProjectCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [duData, setDuData] = useState([])
  const [textSize, setTextSize] = useState('text-black-12')
  const idBusiness = match.params.id
  const { getFormula, isSpecialSectionFormula } = useFormula()

  function findValue(data, sectionKey, rowKey, columnKey) {
    const findData = data.sectionList
      .find(item => item.sectionKey === sectionKey)
      .rowLabels.find(row => row.rowKey === rowKey)
      .cellList.find(cell => cell.columnKey === columnKey)
    return { value: findData.value, permissionView: findData.permissionView }
  }

  function findDataDetail(data, sectionKey, rowKey, columnKey, compareKey) {
    const findData = data[sectionKey].data[rowKey].data.find(item => {
      if (compareKey) {
        return item.compareKey === compareKey
      }
      return item.columnKey === columnKey
    })
    return findData
  }

  function calculateTextSize(data) {
    if (data.length <= 4) {
      setTextSize('text-black-16')
    } else if (data.length > 4 && data.length < 9) {
      setTextSize('text-black-14')
    } else {
      setTextSize('text-black-12')
    }
  }

  useEffect(() => {
    if (
      columns &&
      columns.length > 0 &&
      businessPlanItems &&
      Object.keys(businessPlanItems).length > 0
    ) {
      const newDuData = columns
        .filter(
          elm => elm.columnKey !== 'TOTAL' && elm.columnKey !== 'INTERNAL'
        )
        .map((item, index) => {
          const colKey = item.columnKey
          return {
            label: item.label,
            columnKey: item.columnKey,
            compareKey: item.compareKey,
            data: {
              unitPrice: findDataDetail(
                businessPlanItems,
                'MAN_MONTH',
                'UNIT_PRICE',
                item.columnKey,
                item.compareKey
              ),
              revenues: findDataDetail(
                businessPlanItems,
                'REVENUES',
                'REVENUES_TOTAL',
                item.columnKey,
                item.compareKey
              ),
              costOfSales: findDataDetail(
                businessPlanItems,
                'COST_PRICE',
                'COST_PRICE_TOTAL',
                item.columnKey,
                item.compareKey
              ),
              sellingExpenses: findDataDetail(
                businessPlanItems,
                'SELLING_EXPENSES',
                'SELLING_EXPENSES_TOTAL',
                item.columnKey,
                item.compareKey
              ),
              deliveryExpenses: findDataDetail(
                businessPlanItems,
                'DELIVERY_EXPENSES',
                'DELIVERY_EXPENSES_TOTAL',
                item.columnKey,
                item.compareKey
              ),
              taxExpenses: findDataDetail(
                businessPlanItems,
                'TAX',
                'TAX_TOTAL',
                item.columnKey,
                item.compareKey
              ),
              directMargin: findDataDetail(
                businessPlanItems,
                'MARGIN',
                'DIRECT_MARGIN',
                item.columnKey,
                item.compareKey
              ),
              directMarginBeforeIncentivesAndProjectBonus: findDataDetail(
                businessPlanItems,
                'MARGIN',
                'DIRECT_MARGIN_BONUS',
                item.columnKey,
                item.compareKey
              ),
              allocationOfPoolAndUnbillable: findDataDetail(
                businessPlanItems,
                'MARGIN',
                'ALLOCATION_OF_POOL_AND_UNBILLABLE',
                item.columnKey,
                item.compareKey
              ),
              indirectMargin: findDataDetail(
                businessPlanItems,
                'MARGIN',
                'INDIRECT_MARGIN',
                item.columnKey,
                item.compareKey
              ),
              directMarginRate: findDataDetail(
                businessPlanItems,
                'MARGIN',
                'DIRECT_MARGIN_RATE',
                item.columnKey,
                item.compareKey
              ),
              directMarginBeforeIncentivesAndProjectBonusRate: findDataDetail(
                businessPlanItems,
                'MARGIN',
                'DIRECT_MARGIN_BONUS_RATE',
                item.columnKey,
                item.compareKey
              ),
              indirectMarginRate: findDataDetail(
                businessPlanItems,
                'MARGIN',
                'INDIRECT_MARGIN_RATE',
                item.columnKey,
                item.compareKey
              ),
            },
          }
        })
      generateDataSource(newDuData)
      setDuData(newDuData)
      calculateTextSize(newDuData)
    }
  }, [columns, businessPlanItems])

  useEffect(() => {
    if (idBusiness) {
      setLoading(true)
      Promise.allSettled([
        getBusinessPlanDetailVersion(idBusiness),
        fetchAllViewModesData(idBusiness),
      ])
        .then(([versionResult]) => {
          if (
            versionResult.status === 'fulfilled' &&
            versionResult.value.data
          ) {
            const { generalInfos } = versionResult.value.data
            if (generalInfos && Array.isArray(generalInfos)) {
              const sortedInfos = [...generalInfos].sort((a, b) => {
                if (a.id.toString() === idBusiness) return -1
                if (b.id.toString() === idBusiness) return 1
                return a.id - b.id
              })

              const viewMode =
                sortedInfos.length > 1
                  ? 'Total'
                  : sortedInfos[0].mvvLocationType || 'Total'
              dispatch(setActiveViewMode({ viewMode }))
              dispatch(getBusinessPlanDetail(idBusiness))

              const projectCodes = sortedInfos.map(info => ({
                code: info.projectCode,
                isMain: info.id.toString() === idBusiness,
              }))
              setHeaderProjectCodes(projectCodes)
            }
          } else if (versionResult.status === 'rejected') {
            const result = versionResult.reason
            if (result.status === ResponseStatusCode.forbidden) {
              window.location.href = '/error/access-deny'
            }
            NotificationManager.error(
              result.message || 'Failed to fetch business plan version.'
            )
          }

        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [idBusiness, dispatch, fetchAllViewModesData])

  return (
    <Spin spinning={loading}>
      <div
        id="export"
        className="p-25"
        style={{
          width: '100%',
          margin: 'auto',
          backgroundColor: 'white',
        }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '18px',
            color: 'black',
          }}>
          <img src="/img/cmc_logo_full.png" style={{ height: '50px' }} />
          <div>
            <div style={{ textAlign: 'right' }}>BUSINESS PLAN</div>
            <div>
              {headerProjectCodes.map((item, index) => (
                <span key={item.code}>
                  {item.code}
                  {index < headerProjectCodes.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-40">
          <div
            className="mb-20"
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '16px',
              color: 'black',
            }}>
            <div>BUSINESS PLAN DETAILS</div>
            <div style={{ fontWeight: '500' }}>Unit: Thousand (VND)</div>
          </div>
          <BorderTable>
            <Table
              style={{
                borderTop: '1px solid #000000 ',
                borderLeft: '1px solid #000000 ',
              }}
              rowKey={rowKey => rowKey.label}
              pagination={false}
              bordered={false}
              dataSource={generateDataSource(duData)}
              columns={[
                {
                  title: <b>STT</b>,
                  dataIndex: 'stt',
                  key: 'stt',
                  className: `text-center ${textSize}`,
                  render: (text, record, index) => index + 1,
                  width: 90,
                },
                {
                  title: <b>Items</b>,
                  dataIndex: 'label',
                  key: 'items',
                  className: `text-left ${textSize}`,
                  width: 250,
                },
              ].concat(
                duData.map(item => {
                  return {
                    title: <b>{item.label}</b>,
                    dataIndex: item.label,
                    key: item.compareKey ? item.compareKey : item.columnKey,
                    className: `text-right ${textSize}`,
                    render: (data, rowData) => {
                      const cellItem =
                        rowData[
                          item.compareKey ? item.compareKey : item.columnKey
                        ]
                      if (!cellItem) return '-'

                      const formulaValue = getFormula({
                        item: cellItem,
                        columnKey: item.columnKey,
                        sectionKey: cellItem.sectionKey,
                        rowKey: cellItem.rowKey,
                      })
                      const finalValue = resolveValue(
                        cellItem,
                        formulaValue,
                        isSpecialSectionFormula
                      )

                      if (
                        rowData.label === 'Direct margin rate' ||
                        rowData.label ===
                          'Direct Margin before Incentives and Project bonus rate' ||
                        rowData.label === 'Indirect margin rate'
                      ) {
                        return `${formatPercent(finalValue)}`
                      } else {
                        return formatMoney(finalValue)
                      }
                    },
                  }
                })
              )}
            />
          </BorderTable>
        </div>
      </div>
    </Spin>
  )
}

export default ExportBusinessPlanDetail
