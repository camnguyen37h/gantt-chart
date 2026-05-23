import { Spin, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import { NotificationManager } from 'react-notifications'
import {
  getAllIndustry,
  getBusinessPlanDetailByView,
  getBusinessPlanDetailVersion,
  getIndustryCurrencySymbol,
} from '../redux'

import styled from 'styled-components'
import { ResponseStatusCode } from 'Service/constant'
import './style.css'
import { dummyPlan, permissionType } from './constant'

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
function formatMoney(number = '') {
  if (!number) return '-'
  const isNegative = number < 0
  const formatedNumber = Intl.NumberFormat('en-US').format(number)
  return isNegative ? `(${formatedNumber.replace('-', '')})` : formatedNumber
}

function formatPercent(number = '') {
  const num = Number(number)
  if (!num) return '-'
  const isNegative = number < 0
  const roundedNumber = Math.round(number * 100) / 100
  const fraction = roundedNumber % 1 === 0 ? 0 : 2

  const formatedNumber = Intl.NumberFormat('en-US', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(roundedNumber)

  return isNegative
    ? `(${formatedNumber.replace('-', '')})%`
    : `${formatedNumber}%`
}

function formatMoneyUnit(number = '') {
  const num = Number(number)
  if (!num) return '-'
  const isNegative = number < 0
  const newValue = Number(number) / 1000
  const roundedNumber = Math.round(newValue * 100) / 100
  const fraction = roundedNumber % 1 === 0 ? 0 : 2

  const formatedNumber = Intl.NumberFormat('en-US', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(roundedNumber)

  return isNegative ? `(${formatedNumber.replace('-', '')})` : formatedNumber
}

const Descriptions = ({ label, children }) => {
  return (
    <div
      style={{
        color: 'black',
        fontSize: 16,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
      }}>
      <div>{label}</div>
      <div
        style={{
          color: 'black',
          fontSize: 16,
          textAlign: 'left',
          width: '75%',
        }}>
        {children}
      </div>
    </div>
  )
}

const columnsFirstTable = [
  {
    title: <b>STT</b>,
    dataIndex: 'stt',
    key: 'stt',
    className: 'text-center text-black-16',
    width: 90,
    render: (text, record, index) => index + 1,
  },
  {
    title: <b>Items</b>,
    dataIndex: 'items',
    key: 'items',
    className: 'text-left text-black-16',
  },
  {
    title: <b>Total (VND)</b>,
    dataIndex: 'total',
    key: 'total',
    className: 'text-right text-black-16',
    width: 250,
  },
]

function ExportGeneralInfo({ match }) {
  const [businessPlans, setBusinessPlans] = useState([])
  const [curencySymbol, setCurencySymbol] = useState([])
  const [industryCode, setIndustry] = useState([])
  const [loading, setLoading] = useState(true)
  const idBusiness = match.params.id

  const dataToRender =
    loading && businessPlans.length === 0 ? [dummyPlan] : businessPlans

  function findValue(data, sectionKey, rowKey, columnKey) {
    const findData = data.sectionList
      .find(item => item.sectionKey === sectionKey)
      .rowLabels.find(row => row.rowKey === rowKey)
      .cellList.find(cell => cell.columnKey === columnKey)
    return {
      value: findData.value,
    }
  }

  useEffect(() => {
    if (idBusiness) {
      setLoading(true)
      Promise.all([
        getIndustryCurrencySymbol(),
        getAllIndustry(),
        getBusinessPlanDetailVersion(idBusiness),
      ])
        .then(async ([currencyRes, industryRes, businessPlanRes]) => {
          setCurencySymbol(currencyRes.data)
          setIndustry(industryRes.data)

          const { data: businessPlanData } = businessPlanRes
          const { generalInfos } = businessPlanData

          const sortedGeneralInfos = [...generalInfos].sort((a, b) => {
            if (a.id.toString() === idBusiness) return -1
            if (b.id.toString() === idBusiness) return 1
            return a.id - b.id
          })

          const plansData = await Promise.all(
            sortedGeneralInfos.map(async info => {
              const result = await getBusinessPlanDetailByView(
                info.id,
                info.mvvLocationType || 'Total'
              )

              if (result.status !== ResponseStatusCode.success) {
                throw result
              }
              const summaryData = result.data
              const allProjectCode = generalInfos.map(item => item.projectCode)

              const generalInformation = {
                customerName: info.customerName,
                projectName: info.businessPlanName,
                projectCode: info.projectCode,
                industry: info.industry,
                orderType: info.orderType,
                customerMarket: info.customerMarket,
                originalRevenue: info.totalContractPrice,
                revenues: findValue(
                  summaryData,
                  'REVENUES',
                  'REVENUES_TOTAL',
                  'TOTAL'
                ).value,
                version: summaryData.version,
                am: info.listAM.find(item => item.isDefault === true).ldap,
                status: summaryData.status,
                curencyCode: info.currency,
                mvvLocationType: info.mvvLocationType,
              }

              const summaryInfo = {
                unitPrice: findValue(
                  summaryData,
                  'MAN_MONTH',
                  'UNIT_PRICE',
                  'TOTAL'
                ),
                revenues: findValue(
                  summaryData,
                  'REVENUES',
                  'REVENUES_TOTAL',
                  'TOTAL'
                ),
                costOfSales: findValue(
                  summaryData,
                  'COST_PRICE',
                  'COST_PRICE_TOTAL',
                  'TOTAL'
                ),
                sellingExpenses: findValue(
                  summaryData,
                  'SELLING_EXPENSES',
                  'SELLING_EXPENSES_TOTAL',
                  'TOTAL'
                ),
                deliveryExpenses: findValue(
                  summaryData,
                  'DELIVERY_EXPENSES',
                  'DELIVERY_EXPENSES_TOTAL',
                  'TOTAL'
                ),
                taxExpenses: findValue(
                  summaryData,
                  'TAX',
                  'TAX_TOTAL',
                  'TOTAL'
                ),
                directMargin: findValue(
                  summaryData,
                  'MARGIN',
                  'DIRECT_MARGIN',
                  'TOTAL'
                ),
                directMarginBeforeIncentivesAndProjectBonus: findValue(
                  summaryData,
                  'MARGIN',
                  'DIRECT_MARGIN_BONUS',
                  'TOTAL'
                ),
                allocationOfPoolAndUnbillable: findValue(
                  summaryData,
                  'MARGIN',
                  'ALLOCATION_OF_POOL_AND_UNBILLABLE',
                  'TOTAL'
                ),
                indirectMargin: findValue(
                  summaryData,
                  'MARGIN',
                  'INDIRECT_MARGIN',
                  'TOTAL'
                ),
                directMarginRate: findValue(
                  summaryData,
                  'MARGIN',
                  'DIRECT_MARGIN_RATE',
                  'TOTAL'
                ),
                directMarginBeforeIncentivesAndProjectBonusRate: findValue(
                  summaryData,
                  'MARGIN',
                  'DIRECT_MARGIN_BONUS_RATE',
                  'TOTAL'
                ),
                indirectMarginRate: findValue(
                  summaryData,
                  'MARGIN',
                  'INDIRECT_MARGIN_RATE',
                  'TOTAL'
                ),
              }

              return {
                id: info.id,
                generalInformation,
                summaryInfo,
                allProjectCode,
              }
            })
          )

          setBusinessPlans(plansData)
          setLoading(false)
        })
        .catch(result => {
          setLoading(false)
          if (result.status === ResponseStatusCode.forbidden) {
            window.location.href = '/error/access-deny'
          }
          return NotificationManager.error(
            result.message || 'Internal Server Error'
          )
        })
    }
  }, [idBusiness])

  function printBusinessPlan() {
    getBusinessPlanDetailVersion(idBusiness)
      .then(({ data }) => {
        const mainInfo =
          data.generalInfos.find(
            info => info.id.toString() === idBusiness.toString()
          ) || data.generalInfos[0]

        if (mainInfo) {
          let am = mainInfo.listAM.find(item => item.isDefault === true)
          document.title =
            data.projectCode +
            '_' +
            (am.departmentName || '') +
            '_' +
            mainInfo.customerName +
            '_' +
            (am.ldap || '') +
            '_' +
            data.version
          window.print()
        }
      })
      .catch(result => {
        if (result.status === ResponseStatusCode.forbidden) {
          window.location.href = '/error/access-deny'
        }

        return NotificationManager.error(result.message)
      })
  }

  return (
    <Spin spinning={loading}>
      <div
        className="p-25"
        style={{
          width: 1000,
          margin: 'auto',
          backgroundColor: 'white',
          position: 'relative',
        }}>
        {dataToRender.map((plan, index) => {
          const { generalInformation, summaryInfo, allProjectCode } = plan
          const industry = industryCode.find(
            item => item.id === generalInformation.industry
          )
          const currency = curencySymbol.find(
            item => item.id === generalInformation.curencyCode
          )

          const dataSourceFirstTable = [
            {
              key: '1',
              items: 'Unit price',
              total: formatMoneyUnit(summaryInfo.unitPrice.value),
            },
            {
              key: '2',
              items: 'Revenues',
              total: formatMoneyUnit(summaryInfo.revenues.value),
            },
            {
              key: '3',
              items: 'Cost of sales',
              total: formatMoneyUnit(summaryInfo.costOfSales.value),
            },
            {
              key: '4',
              items: 'Selling expenses',
              total: formatMoneyUnit(summaryInfo.sellingExpenses.value),
            },
            {
              key: '5',
              items: 'Delivery expenses',
              total: formatMoneyUnit(summaryInfo.deliveryExpenses.value),
            },
            {
              key: '6',
              items: 'Tax expenses',
              total: formatMoneyUnit(summaryInfo.taxExpenses.value),
            },
            {
              key: '7',
              items: 'Direct Margin',
              total: formatMoneyUnit(summaryInfo.directMargin.value),
            },
            {
              key: '8',
              items: 'Direct Margin before Incentives and Project bonus',
              total: formatMoneyUnit(
                summaryInfo.directMarginBeforeIncentivesAndProjectBonus.value
              ),
            },
            {
              key: '9',
              items: 'Allocation of pool and unbillable',
              total: formatMoneyUnit(
                summaryInfo.allocationOfPoolAndUnbillable.value
              ),
            },
            {
              key: '10',
              items: 'Indirect Margin',
              total: formatMoneyUnit(summaryInfo.indirectMargin.value),
            },
            {
              key: '11',
              items: 'Direct Margin rate',
              total: formatPercent(summaryInfo.directMarginRate.value),
            },
            {
              key: '12',
              items: 'Direct Margin before Incentives and Project bonus rate',
              total: formatPercent(
                summaryInfo.directMarginBeforeIncentivesAndProjectBonusRate
                  .value
              ),
            },
            {
              key: '13',
              items: 'Indirect Margin rate',
              total: formatPercent(summaryInfo.indirectMarginRate.value),
            },
          ]

          return (
            <React.Fragment key={plan.id}>
              {index === 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: 18,
                    marginBottom: 40,
                    color: 'black',
                  }}>
                  <img
                    src="/img/cmc_logo_full.png"
                    style={{ height: '50px' }}
                  />
                  <div>
                    <div style={{ textAlign: 'right' }}>BUSINESS PLAN</div>
                    <div>{allProjectCode.join(', ')}</div>
                  </div>
                </div>
              )}
              <div
                className="p-15"
                style={{
                  borderStyle: 'solid',
                  borderWidth: 2,
                  borderColor: 'black',
                  marginTop: index > 0 ? 40 : 0,
                }}>
                <div
                  className="mb-10"
                  style={{
                    fontWeight: 'bold',
                    fontSize: '18px',
                    color: 'black',
                  }}>
                  GENERAL INFORMATION{' '}
                  {generalInformation.projectCode &&
                    `(${generalInformation.projectCode})`}
                </div>
                <Descriptions label="Customer Name:">
                  {generalInformation.customerName}
                </Descriptions>
                <Descriptions label="Project Name:">
                  {generalInformation.projectName}
                </Descriptions>
                <Descriptions label="Industry:">
                  {industry ? industry.industry : '--'}
                </Descriptions>
                <Descriptions label="Order Type:">
                  {generalInformation.orderType}
                </Descriptions>
                <Descriptions label="Customer market:">
                  {generalInformation.customerMarket}
                </Descriptions>
                <Descriptions
                  label={`Original revenue (${
                    currency ? currency.currency : '--'
                  }):`}>
                  {formatMoney(generalInformation.originalRevenue)}
                </Descriptions>
                <Descriptions label="Revenues (VND):">
                  {formatMoney(generalInformation.revenues)}
                </Descriptions>
                <Descriptions label="Version:">
                  {generalInformation.version}
                </Descriptions>
                <Descriptions label="AM:">{generalInformation.am}</Descriptions>
                <Descriptions label="Status:">
                  {generalInformation.status}
                </Descriptions>
              </div>
              <div
                className="table-export-general p-20 mt-40 html2pdf__page-break"
                style={{
                  borderStyle: 'solid',
                  borderWidth: 2,
                  borderColor: 'black',
                }}>
                <div
                  className="mb-20"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    color: 'black',
                  }}>
                  <div>BUSINESS PLAN SUMMARY</div>
                  <div style={{ fontWeight: '500' }}>Unit: Thousand (VND)</div>
                </div>
                <BorderTable>
                  <Table
                    style={{
                      borderTop: '1px solid #000000 ',
                      borderLeft: '1px solid #000000 ',
                    }}
                    rowKey={rowKey => rowKey.key}
                    pagination={false}
                    bordered={false}
                    dataSource={dataSourceFirstTable}
                    columns={columnsFirstTable}
                  />
                </BorderTable>
              </div>
            </React.Fragment>
          )
        })}

        <div
          style={{
            position: 'absolute',
            left: 'calc(100% + 30px)',
            top: '0',
          }}>
          <button
            className="no-print"
            style={{
              backgroundColor: '#777',
              border: 'none',
              borderRadius: '12px',
              padding: '22px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 1000,
            }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#888')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#777')}
            onClick={printBusinessPlan}>
            <img
              src="/img/print.png"
              alt="Print"
              style={{
                width: '40px',
                height: '40px',
                marginBottom: '12px',
                filter: 'brightness(0) invert(1)',
              }}
            />
            <span
              style={{ color: 'white', fontSize: '20px', fontWeight: '600' }}>
              Print
            </span>
          </button>
        </div>
      </div>
    </Spin>
  )
}

export default ExportGeneralInfo
