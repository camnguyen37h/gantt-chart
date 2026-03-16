import { useMemo, useState, useEffect, useCallback } from 'react'
import { Icon, Table, Tooltip } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import * as BusinessPlanAPI from '../../../businessPlanApiConfig'
import { ResponseStatusCode } from '../../../../service/constant'
import { NotificationManager } from 'react-notifications'
import { formatFloatNumber } from '../../../../utils/format-utils/ConvertNumber'
import Decimal from 'decimal.js'
import { RESOURCE_TABLE_WIDTH, RESOURCE_TYPE_TOOLTIP } from '../constants'

const PAGE_SIZE = 20
const PAGE_NUMBER = 1

const LaborCostTable = ({ mainColumns }) => {
  const [hasMore, setHasMore] = useState(true)
  const [pageNum, setPageNum] = useState(PAGE_NUMBER)
  const [data, setData] = useState([])
  const [loadingTable, setLoadingTable] = useState(false)

  const {
    resourceInfoTableParams,
    dataResourcesInformation,
    loadingDataResourcesInformation,
    listLocationExchangeRateData,
    summaryDeliveryPlan,
  } = useSelector(state => state.businessPlanDelivery)

  useEffect(() => {
    const deliveryList =
      dataResourcesInformation &&
      dataResourcesInformation.deliveryPlanByHeadCountList
        ? dataResourcesInformation.deliveryPlanByHeadCountList
        : []
    setData(deliveryList)
    setHasMore(true)
    setPageNum(PAGE_NUMBER)
  }, [dataResourcesInformation])

  useEffect(() => {
    const tableBody = document.querySelector(
      '.labor-cost-table .ant-table-body'
    )
    if (!tableBody) return
    const handleScroll = () => {
      const isScrolledToBottom =
        tableBody.scrollTop + tableBody.clientHeight >=
        tableBody.scrollHeight - 10

      if (
        tableBody.scrollHeight >= 400 &&
        isScrolledToBottom &&
        hasMore &&
        !loadingTable &&
        data.length >= PAGE_SIZE
      ) {
        loadMoreData(pageNum + 1)
      }
    }

    tableBody.addEventListener('scroll', handleScroll)

    return () => {
      if (tableBody) {
        tableBody.removeEventListener('scroll', handleScroll)
      }
    }
  }, [data, hasMore, loadingTable])

  const loadMoreData = async pageNum => {
    if (loadingTable || !hasMore) return
    setLoadingTable(true)

    const result = await BusinessPlanAPI.getResourcesInformationDeliveryPlan({
      ...resourceInfoTableParams,
      pageNum: pageNum,
      pageSize: PAGE_SIZE,
    })

    if (result.status === ResponseStatusCode.success) {
      setData(prevData => [
        ...prevData,
        ...result.data.body.deliveryPlanByHeadCountList,
      ])
      setPageNum(pageNum)
      setLoadingTable(false)
      if (result.data.body.deliveryPlanByHeadCountList.length < PAGE_SIZE) {
        setHasMore(false)
      }
    } else {
      setLoadingTable(false)
      NotificationManager.error(result.errorMessage)
    }
  }

  const mainColumnsWidth = useMemo(() => {
    let totalWidth = 0
    mainColumns.forEach(item => {
      if (item.children && Array.isArray(item.children)) {
        item.children.forEach(child => {
          totalWidth += child.width
        })
      }
    })
    return totalWidth
  }, [mainColumns])

  const calculateGrossSalary = useCallback(
    (originalSalary, location) => {
      if (!originalSalary || !location) return 0
      const rateItem = listLocationExchangeRateData.find(
        item => item.location === location
      )
      const exchangeRate = rateItem ? rateItem.exchangeRate : 0
      if (!exchangeRate) return 0
      return new Decimal(originalSalary)
        .mul(new Decimal(exchangeRate))
        .toNumber()
    },
    [listLocationExchangeRateData]
  )

  const columns = useMemo(() => {
    if (!dataResourcesInformation || !dataResourcesInformation.listLabelMonth) {
      return [
        {
          title: 'No',
          key: 'ldap',
          align: 'center',
          width: RESOURCE_TABLE_WIDTH.NO,
          render: (_, record, index) => index + 1,
        },
        ...mainColumns,
        { key: 'emptyColumn' },
      ]
    }

    const calculatedRowTotal = data.reduce(
      (sum, item) => sum + Number(item.rowTotal),
      0
    )
    const totalMonthWidth = RESOURCE_TABLE_WIDTH.TABLE - mainColumnsWidth
    const labelMonthCount =
      dataResourcesInformation.listLabelMonth.length > 0
        ? dataResourcesInformation.listLabelMonth.length
        : 1
    const calculatedWidth = Math.max(
      totalMonthWidth / labelMonthCount,
      RESOURCE_TABLE_WIDTH.MAX_MONTH_WIDTH
    )

    const createColumnConfig = (month, listBudgetMMForEachMonth) => ({
      title: listBudgetMMForEachMonth[month] ? (
        <span title={formatFloatNumber(listBudgetMMForEachMonth[month], 0, 3)}>
          {formatFloatNumber(listBudgetMMForEachMonth[month], 0, 3)}
        </span>
      ) : (
        ''
      ),
      align: 'center',
      ellipsis: true,
      children: [
        {
          title: month,
          ellipsis: true,
          dataIndex: ['budgetMMValueDTO', month],
          key: month,
          align: 'center',
          width: calculatedWidth,
          render: (_, record) => {
            const monthEntry = record.budgetMMValueDTO
              ? record.budgetMMValueDTO[month]
              : null
            const budgetMMValue =
              monthEntry && typeof monthEntry.value === 'number'
                ? monthEntry.value
                : ''
            return (
              <span title={formatFloatNumber(budgetMMValue)}>
                {formatFloatNumber(budgetMMValue)}
              </span>
            )
          },
        },
      ],
    })

    const monthsColumns = dataResourcesInformation.listLabelMonth.map(date =>
      createColumnConfig(
        date,
        dataResourcesInformation.listBudgetMMForEachMonth
      )
    )

    const formattedValue =
      formatFloatNumber(summaryDeliveryPlan.directLaborCost, 0, 3) ||
      formatFloatNumber(calculatedRowTotal, 0, 3)

    return [
      ...mainColumns.map(item => {
        if (item.key === 'rowTotal') {
          return {
            ...item,
            title: <span title={formattedValue}>{formattedValue}</span>,
            ellipsis: true,
            children: item.children.map(child => ({
              ...child,
              render: (_, record) => (
                <span title={formatFloatNumber(record.rowTotal, 0, 3)}>
                  {formatFloatNumber(record.rowTotal, 0, 3) || 0}
                </span>
              ),
            })),
          }
        }
        return {
          ...item,
          children: item.children
            ? item.children.map(child => {
                if (child.dataIndex === 'no') {
                  return {
                    ...child,
                    title: 'NO',
                    render: (_, record, index) => index + 1,
                  }
                }
                if (child.dataIndex === 'fill') {
                  return { ...child, title: '', width: 0, render: () => false }
                }
                if (child.dataIndex === 'resourceType') {
                  return {
                    ...child,
                    title: (
                      <div className="d-flex gap-10 align-items-center">
                        <span>{child.title}</span>
                        <Tooltip
                          title={RESOURCE_TYPE_TOOLTIP}
                          overlayClassName="resource-type-tooltip">
                          <Icon
                            type="question-circle"
                            style={{ cursor: 'pointer' }}
                          />
                        </Tooltip>
                      </div>
                    ),
                  }
                }
                if (child.dataIndex === 'grossSalary') {
                  return {
                    ...child,
                    render: (_, record) => {
                      const grossSalary = formatFloatNumber(
                        calculateGrossSalary(
                          record.originalGrossSalary,
                          record.location
                        )
                      )
                      return <span title={grossSalary}>{grossSalary}</span>
                    },
                  }
                }
                if (child.dataIndex === 'originalGrossSalary') {
                  return { ...child, render: text => formatFloatNumber(text) }
                }
                return child
              })
            : [],
        }
      }),
      ...monthsColumns,
    ]
  }, [
    dataResourcesInformation,
    mainColumns,
    mainColumnsWidth,
    data,
    calculateGrossSalary,
    summaryDeliveryPlan,
  ])

  return (
    <div>
      <Table
        className="labor-cost-table"
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{
          x: 'max-content',
          y: 400,
        }}
        loading={loadingDataResourcesInformation || loadingTable}
        rowKey={record => record.deliveryMemberId}
      />
    </div>
  )
}

export default LaborCostTable
