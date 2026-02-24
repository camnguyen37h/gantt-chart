import { Spin, Table } from 'antd'
import { useEffect, useState } from 'react'
import { NotificationManager } from 'react-notifications'
import { getAllIndustry, getBusinessPlanDetailVersion, getIndustryCurrencySymbol } from '../redux'

import styled from 'styled-components'
import { ResponseStatusCode } from '../../service/constant'
import './style.css'

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
// import { Descriptions } from 'antd'
// format money
function formatMoney(number = '') {
  if (!number) return '-'
  const isNegative = number < 0
  const formatedNumber = Intl.NumberFormat('en-US').format(number)
  return isNegative ? `(${formatedNumber.replace('-', '')})` : formatedNumber
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

function formatMoneyUnit(number = '') {
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

const Descriptions = ({ label, children }) => {
  return (
    <div
      style={{
        color: 'black',
        fontSize: 16,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      <div>{label}</div>
      <div
        style={{
          color: 'black',
          fontSize: 16,
          textAlign: 'left',
          width: '75%',
          marginTop: 6,
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
  const [totalSumaryData, setTotalSumaryData] = useState({})
  const [generalInformationData, setGeneralInformationData] = useState({})
  const [curencySymbol, setCurencySymbol] = useState([])
  const [industryCode, setIndustry] = useState([])
  const [loading, setLoading] = useState(true)
  const idBusiness = match.params.id

  const dataSourceFirstTable = [
    {
      key: '1',
      items: 'Unit price',
      total: formatMoneyUnit(totalSumaryData.unitPrice) || 0,
    },
    {
      key: '2',
      items: 'Revenues',
      total: formatMoneyUnit(totalSumaryData.revenues) || 0,
    },
    {
      key: '3',
      items: 'Cost of sales',
      total: formatMoneyUnit(totalSumaryData.costOfSales) || 0,
    },
    {
      key: '4',
      items: 'Selling expenses',
      total: formatMoneyUnit(totalSumaryData.sellingExpenses) || 0,
    },
    {
      key: '5',
      items: 'Delivery expenses',
      total: formatMoneyUnit(totalSumaryData.deliveryExpenses) || 0,
    },
    {
      key: '6',
      items: 'Tax expenses',
      total: formatMoneyUnit(totalSumaryData.taxExpenses) || 0,
    },
    {
      key: '7',
      items: 'Direct Margin',
      total: formatMoneyUnit(totalSumaryData.directMargin) || 0,
    },
    {
      key: '8',
      items: 'Direct Margin before Incentives and Project bonus',
      total:
        formatMoneyUnit(
          totalSumaryData.directMarginBeforeIncentivesAndProjectBonus
        ) || 0,
    },
    {
      key: '9',
      items: 'Allocation of pool and unbillable',
      total:
        formatMoneyUnit(totalSumaryData.allocationOfPoolAndUnbillable) || 0,
    },
    {
      key: '10',
      items: 'Indirect Margin',
      total: formatMoneyUnit(totalSumaryData.indirectMargin) || 0,
    },
    {
      key: '11',
      items: 'Direct Margin rate',
      total: formatPercent(totalSumaryData.directMarginRate),
    },
    {
      key: '12',
      items: 'Direct Margin before Incentives and Project bonus rate',
      total: formatPercent(
        totalSumaryData.directMarginBeforeIncentivesAndProjectBonusRate
      ),
    },
    {
      key: '13',
      items: 'Indirect Margin rate',
      total: formatPercent(totalSumaryData.indirectMarginRate),
    },
  ]

  function findValue(data, sectionKey, rowKey, columnKey) {
    const value = data.sectionList
      .find(item => item.sectionKey === sectionKey)
      .rowLabels.find(row => row.rowKey === rowKey)
      .cellList.find(cell => cell.columnKey === columnKey).value
    return value
  }

  useEffect(() => {
    if (idBusiness) {
      getIndustryCurrencySymbol()
        .then(({ data }) => {
          setCurencySymbol(data)
        })
        .catch(result => {
          console.log(result)
        })

      getAllIndustry()
        .then(({ data }) => {
          setIndustry(data)
        })
        .catch(result => {
          console.log(result)
        })

      getBusinessPlanDetailVersion(idBusiness)
        .then(({ data }) => {
          setLoading(false)

          //General Information data
          setGeneralInformationData({
            customerName: data.generalInfo.customerName,
            projectName: data.generalInfo.businessPlanName,
            projectCode: data.projectCode,
            industry: data.generalInfo.industry,
            orderType: data.generalInfo.orderType,
            customerMarket: data.generalInfo.customerMarket,
            originalRevenue: data.generalInfo.totalContractPrice,
            revenues: findValue(data, 'REVENUES', 'REVENUES_TOTAL', 'TOTAL'),
            version: data.version,
            am: data.generalInfo.listAM.find(item => item.isDefault === true)
              .ldap,
            status: data.status,
            curencyCode: data.generalInfo.currency,
          })

          //Business Sumary data
          setTotalSumaryData({
            unitPrice: findValue(data, 'MAN_MONTH', 'UNIT_PRICE', 'TOTAL'),
            revenues: findValue(data, 'REVENUES', 'REVENUES_TOTAL', 'TOTAL'),
            costOfSales: findValue(
              data,
              'COST_PRICE',
              'COST_PRICE_TOTAL',
              'TOTAL'
            ),
            sellingExpenses: findValue(
              data,
              'SELLING_EXPENSES',
              'SELLING_EXPENSES_TOTAL',
              'TOTAL'
            ),
            deliveryExpenses: findValue(
              data,
              'DELIVERY_EXPENSES',
              'DELIVERY_EXPENSES_TOTAL',
              'TOTAL'
            ),
            taxExpenses: findValue(data, 'TAX', 'TAX_TOTAL', 'TOTAL'),
            directMargin: findValue(data, 'MARGIN', 'DIRECT_MARGIN', 'TOTAL'),
            directMarginBeforeIncentivesAndProjectBonus: findValue(
              data,
              'MARGIN',
              'DIRECT_MARGIN_BONUS',
              'TOTAL'
            ),
            allocationOfPoolAndUnbillable: findValue(
              data,
              'MARGIN',
              'ALLOCATION_OF_POOL_AND_UNBILLABLE',
              'TOTAL'
            ),
            indirectMargin: findValue(
              data,
              'MARGIN',
              'INDIRECT_MARGIN',
              'TOTAL'
            ),
            directMarginRate: findValue(
              data,
              'MARGIN',
              'DIRECT_MARGIN_RATE',
              'TOTAL'
            ),
            directMarginBeforeIncentivesAndProjectBonusRate: findValue(
              data,
              'MARGIN',
              'DIRECT_MARGIN_BONUS_RATE',
              'TOTAL'
            ),
            indirectMarginRate: findValue(
              data,
              'MARGIN',
              'INDIRECT_MARGIN_RATE',
              'TOTAL'
            ),
          })
        })
        .catch(result => {
          if (result.status === ResponseStatusCode.forbidden) {
            window.location.href = '/error/access-deny'
          }
          return NotificationManager.error(result.message)
        })
    }
  }, [idBusiness])

  const industry = industryCode.find(
    item => item.id === generalInformationData.industry
  )
  const currency = curencySymbol.find(
    item => item.id === generalInformationData.curencyCode
  )

  function printBusinessPlan() {

    getBusinessPlanDetailVersion(idBusiness).then(({ data }) => {

      let am = data.generalInfo.listAM.find(item => item.isDefault === true)

      document.title = data.projectCode + '_' + am.departmentName + '_' + data.generalInfo.customerName + '_' + am.ldap + '_' + data.version
      window.print()

    }).catch(result => {

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
        style={{ width: 1000, margin: 'auto', backgroundColor: 'white', position: 'relative' }}>
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
          <img src="/img/cmc_logo_full.png" style={{ height: '50px' }} />
          <div>
            <div>BUSINESS PLAN</div>
            <div>{generalInformationData.projectCode}</div>
          </div>
        </div>
        <div
          className="p-15"
          style={{
            borderStyle: 'solid',
            borderWidth: 2,
            borderColor: 'black',
          }}>
          <div
            className="mb-10"
            style={{
              fontWeight: 'bold',
              fontSize: '18px',
              color: 'black',
            }}>
            GENERAL INFORMATION
          </div>
          <Descriptions label="Customer Name:">
            {generalInformationData.customerName}
          </Descriptions>
          <Descriptions label="Project Name:">
            {generalInformationData.projectName}
          </Descriptions>
          <Descriptions label="Industry:">
            {industry ? industry.industry : '--'}
          </Descriptions>
          <Descriptions label="Order Type:">
            {generalInformationData.orderType}
          </Descriptions>
          <Descriptions label="Customer market:">
            {generalInformationData.customerMarket}
          </Descriptions>
          <Descriptions
            label={`Original revenue (${
              currency ? currency.currency : '--'
            }):`}>
            {formatMoney(generalInformationData.originalRevenue)}
          </Descriptions>
          <Descriptions label="Revenues (VND):">
            {formatMoney(generalInformationData.revenues)}
          </Descriptions>
          <Descriptions label="Version:">
            {generalInformationData.version}
          </Descriptions>
          <Descriptions label="AM:">{generalInformationData.am}</Descriptions>
          <Descriptions label="Status:">
            {generalInformationData.status}
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

        <div
          style={{
            position: 'absolute',
            left: 'calc(100% + 30px)',
            top: '0',
          }}>
          <button
            className="no-print"
            style={{
              backgroundColor: '#777', // lighter gray
              border: 'none',
              borderRadius: '12px',
              padding: '22px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 1000,
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#888')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#777')}
            onClick={printBusinessPlan}
          >
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
            <span style={{ color: 'white', fontSize: '20px', fontWeight: '600' }}>
              Print
            </span>
          </button>
        </div>
      </div>
    </Spin>
  )
}

export default ExportGeneralInfo
