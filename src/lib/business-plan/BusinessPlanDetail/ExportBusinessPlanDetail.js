import { Spin, Table, message } from 'antd'
import { useEffect, useState } from 'react'
import { getBusinessPlanDetailVersion } from '../redux'
import { NotificationManager } from 'react-notifications'
import styled from 'styled-components'

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
      obj[item.label] = item.data[key]
    })
    result.push(obj)
  })
  return result
}

function formatPercent(number = '') {
  if (!number) return '-'
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
  if (!number) return '-'
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
  const [businessPlanDetailData, setBusinessPlanDetailData] = useState({})
  const [loading, setLoading] = useState(true)
  const [duData, setDuData] = useState([])
  const [textSize, setTextSize] = useState('text-black-12')
  const idBusiness = match.params.id

  function findValue(data, sectionKey, rowKey, columnKey) {
    const value = data.sectionList
      .find(item => item.sectionKey === sectionKey)
      .rowLabels.find(row => row.rowKey === rowKey)
      .cellList.find(cell => cell.columnKey === columnKey).value
    return value
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
    if (idBusiness) {
      getBusinessPlanDetailVersion(idBusiness)
        .then(({ data }) => {
          setLoading(false)
          setBusinessPlanDetailData(data)
          const duData = data.columnLabels
            .filter(
              elm => elm.columnKey !== 'TOTAL' && elm.columnKey !== 'INTERNAL'
            )
            .map((item, index) => {
              return {
                label: item.label,
                data: {
                  unitPrice: findValue(
                    data,
                    'MAN_MONTH',
                    'UNIT_PRICE',
                    item.columnKey
                  ),
                  revenues: findValue(
                    data,
                    'REVENUES',
                    'REVENUES_TOTAL',
                    item.columnKey
                  ),
                  costOfSales: findValue(
                    data,
                    'COST_PRICE',
                    'COST_PRICE_TOTAL',
                    item.columnKey
                  ),
                  sellingExpenses: findValue(
                    data,
                    'SELLING_EXPENSES',
                    'SELLING_EXPENSES_TOTAL',
                    item.columnKey
                  ),
                  deliveryExpenses: findValue(
                    data,
                    'DELIVERY_EXPENSES',
                    'DELIVERY_EXPENSES_TOTAL',
                    item.columnKey
                  ),
                  taxExpenses: findValue(
                    data,
                    'TAX',
                    'TAX_TOTAL',
                    item.columnKey
                  ),
                  directMargin: findValue(
                    data,
                    'MARGIN',
                    'DIRECT_MARGIN',
                    item.columnKey
                  ),
                  directMarginBeforeIncentivesAndProjectBonus: findValue(
                    data,
                    'MARGIN',
                    'DIRECT_MARGIN_BONUS',
                    item.columnKey
                  ),
                  allocationOfPoolAndUnbillable: findValue(
                    data,
                    'MARGIN',
                    'ALLOCATION_OF_POOL_AND_UNBILLABLE',
                    item.columnKey
                  ),
                  indirectMargin: findValue(
                    data,
                    'MARGIN',
                    'INDIRECT_MARGIN',
                    item.columnKey
                  ),
                  directMarginRate: findValue(
                    data,
                    'MARGIN',
                    'DIRECT_MARGIN_RATE',
                    item.columnKey
                  ),
                  directMarginBeforeIncentivesAndProjectBonusRate: findValue(
                    data,
                    'MARGIN',
                    'DIRECT_MARGIN_BONUS_RATE',
                    item.columnKey
                  ),
                  indirectMarginRate: findValue(
                    data,
                    'MARGIN',
                    'INDIRECT_MARGIN_RATE',
                    item.columnKey
                  ),
                },
              }
            })
          generateDataSource(duData)
          setDuData(duData)
          calculateTextSize(duData)
        })
        .catch(result => {
          if (result.status === ResponseStatusCode.forbidden) {
            window.location.href = '/error/access-deny'
          }
          return NotificationManager.error(result.message)
        })
    }
  }, [idBusiness])
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
            <div>BUSINESS PLAN</div>
            <div>{businessPlanDetailData.projectCode}</div>
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
                    key: item.label,
                    className: `text-right ${textSize}`,
                    render: (text, rowData) => {
                      if (
                        rowData.label === 'Direct margin rate' ||
                        rowData.label ===
                          'Direct Margin before Incentives and Project bonus rate' ||
                        rowData.label === 'Indirect margin rate'
                      ) {
                        return `${formatPercent(text)}`
                      } else {
                        return formatMoney(text)
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
