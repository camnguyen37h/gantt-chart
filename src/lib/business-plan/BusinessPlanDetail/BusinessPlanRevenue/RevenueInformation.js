import { SourceConstants } from '../../../constants/ActivityKeyConstants'
import { DateFormat } from '../../../constants/DateFormat'
import * as BusinessPlanAPI from '../../businessPlanApiConfig'
import { ResponseStatusCode } from '../../../service/constant'
import { formatFloatNumber } from '../../../utils/format-utils/ConvertNumber'
import { Col, Radio, Row, Table } from 'antd'
import { isEqual } from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NotificationManager } from 'react-notifications'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { REVENUE_PLAN_TAB } from '../../constants'
import { useBusinessPlanDetails } from '../../hooks'
import { getPositionRevenuePlan, setFiltersRevenue } from '../../redux'
import { convertDateTextFormat, getMonthsBetweenTimestamps } from '../../utils'
import FilterBusinessPlan from '../FilterBusinessPlan/FilterBusinessPlan'
import './style.css'

const PAGE_SIZE = 20
const PAGE_INDEX_START = 0
const SWITCH_LABEL = {
  HEADCOUNT: 'Headcount',
  REVENUE: 'Revenue',
}
const TABLE_WIDTH = 1517
const BASE_WIDTH = 100
const MIN_WIDTH = 100

const transformAvergeColumns = (originalColumns, averagePriceTotalRevenue) => {
  return originalColumns.map(col => {
    const newCol = { ...col }
    if (newCol.children) {
      newCol.children = newCol.children.map(child => {
        return {
          title:
            col.title === 'Total' ? (
              'Average Price'
            ) : col.children[0].title === 'Total' &&
              !isNaN(averagePriceTotalRevenue) ? (
              <span title={formatFloatNumber(averagePriceTotalRevenue, 0, 8)}>
                {formatFloatNumber(Number(averagePriceTotalRevenue), 0, 3)}
              </span>
            ) : (
              ''
            ),
          children: [child],
          className: 'text-column-revenue-table',
        }
      })
    }
    return newCol
  })
}

const columns = [
  {
    title: '',
    children: [
      {
        title: 'Position',
        dataIndex: 'position',
        key: 'position',
        align: 'left',
        width: BASE_WIDTH,
        className: 'text-column-revenue-table',
      },
    ],
    fixed: 'left',
  },
  {
    title: '',
    children: [
      {
        title: 'Unit Price',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        align: 'left',
        width: BASE_WIDTH,
        className: 'text-column-revenue-table',
        render: (_, record) => {
          return (
            <span>
              {record.unitPrice ? formatFloatNumber(record.unitPrice) : ''}
            </span>
          )
        },
      },
    ],
    fixed: 'left',
  },
  {
    title: 'Total',
    children: [
      {
        title: 'Department',
        dataIndex: 'department',
        key: 'department',
        align: 'left',
        width: BASE_WIDTH,
        className: 'text-column-revenue-table',
      },
    ],
    fixed: 'left',
  },
  {
    title: '',
    children: [
      {
        title: 'Exchange Rate',
        dataIndex: 'exchangeRate',
        key: 'exchangeRate',
        align: 'left',
        width: BASE_WIDTH,
        className: 'text-column-revenue-table',
        render: (_, record) => {
          return (
            <span>
              {record.exchangeRate
                ? formatFloatNumber(record.exchangeRate)
                : ''}
            </span>
          )
        },
      },
    ],
  },
  {
    title: '',
    children: [
      {
        title: 'Pipeline Ratio',
        key: 'pipeLineRatio',
        align: 'left',
        width: BASE_WIDTH,
        className: 'text-column-revenue-table',
        render: (_, record) => {
          return (
            <span>
              {record.pipeLineRatio ? `${record.pipeLineRatio}%` : ''}
            </span>
          )
        },
      },
    ],
  },
  {
    title: '',
    children: [
      {
        title: 'Total',
        dataIndex: 'totalRevenue',
        key: 'total',
        align: 'left',
        width: 200,
        className: 'text-column-revenue-table',
      },
    ],
  },
]

const RevenueInformation = ({
  isExpandPanel,
  businessVersion,
  projectCode,
  status,
  deliveryUnitDataRevenue,
  setExpandPanel,
  canView,
}) => {
  const [switchValue, setSwitchValue] = useState(SWITCH_LABEL.HEADCOUNT)
  const [columnConfig, setColumnConfig] = useState(columns)
  const [dataSourceTable, setDataSourceTable] = useState({
    avgPrice: 0,
    startDate: null,
    endDate: null,
    revenueInfos: [],
  })
  const [hasMore, setHasMore] = useState(true)
  const [loadingTable, setLoadingTable] = useState(false)
  const { startDate, endDate } = useBusinessPlanDetails()

  const tableRef = useRef(null)

  const dispatch = useDispatch()
  const {
    summaryRevenuePlan,
    filtersRevenue: filters,
    dataFilterPosition: positionRevenuePlan,
    isLoadingFilterPosition: isLoadingFilterPositionRevenuePlan,
  } = useSelector(state => state.businessPlanRevenue, isEqual)
  const filterRef = useRef()
  const isInitialRender = useRef(true)
  const prevVersionRef = useRef(businessVersion)

  const totalSum =
    (summaryRevenuePlan &&
      summaryRevenuePlan.mmBill &&
      summaryRevenuePlan.mmBill) ||
    null

  const handleSearchPosition = useCallback(
    text => {
      if (!text.length) return
      dispatch(getPositionRevenuePlan({ text, projectCode }))
    },
    [dispatch, projectCode]
  )

  const handlePositionDropdownClose = useCallback(
    open => {
      if (!open) dispatch(getPositionRevenuePlan({ projectCode }))
    },
    [dispatch, projectCode]
  )

  const filterConfig = useMemo(
    () => [
      {
        name: 'position',
        type: 'select',
        options: positionRevenuePlan,
        title: 'Position',
        mode: 'single',
        controlProps: {
          filterOption: false,
          maxTagCount: 1,
          loading: isLoadingFilterPositionRevenuePlan,
          onSearch: handleSearchPosition,
          onDropdownVisibleChange: handlePositionDropdownClose,
        },
      },
    ],
    [
      positionRevenuePlan,
      isLoadingFilterPositionRevenuePlan,
      handleSearchPosition,
      handlePositionDropdownClose,
    ]
  )

  const fetchProductionRevenuePlan = async (start, pageSize, param) => {
    setLoadingTable(true)
    try {
      const result = await BusinessPlanAPI.getProductionRevenue({
        status: status,
        mvv: projectCode,
        duId: param.deliveryUnitDataRevenue.groupId,
        type: param.deliveryUnitDataRevenue.groupSale ? 'Sales' : 'Delivery',
        revenueSwitch: param.switchValue,
        businessVersion: businessVersion,
        pageNum: Math.floor(start / PAGE_SIZE),
        positionId: param.position,
      })

      if (result.status === ResponseStatusCode.success) {
        setDataSourceTable(prevData => {
          const existingKeys = new Set(
            prevData.revenueInfos.map(
              item =>
                `${item.position}-${item.unitPrice}-${item.department}-${item.saleWorkOrderId}`
            )
          )
          const newUniqueInfos = result.data.revenueInfos.filter(
            item =>
              !existingKeys.has(
                `${item.position}-${item.unitPrice}-${item.department}-${item.saleWorkOrderId}`
              )
          )
          return {
            ...prevData,
            avgPrice: result.data.avgPrice,
            startDate: result.data.startDate,
            endDate: result.data.endDate,
            revenueInfos: [...prevData.revenueInfos, ...newUniqueInfos],
          }
        })
        if (start + pageSize > result.data.revenueInfos.length) {
          setHasMore(false)
        }
      } else {
        NotificationManager.error(result.errorMessage)
      }
    } catch (error) {
      NotificationManager.error(error)
    } finally {
      setLoadingTable(false)
    }
  }

  const handleSwitchHeadcountRevenue = useCallback(e => {
    setSwitchValue(e.target.value)
  }, [])

  const handleScroll = useCallback(
    e => {
      const { scrollTop, clientHeight, scrollHeight } = e.target
      if (
        scrollTop + clientHeight >= scrollHeight - 10 &&
        hasMore &&
        !loadingTable
      ) {
        fetchProductionRevenuePlan(
          dataSourceTable.revenueInfos.length,
          PAGE_SIZE,
          {
            switchValue,
            ...filters,
            deliveryUnitDataRevenue,
          }
        )
      }
    },
    [dataSourceTable, hasMore, loadingTable]
  )

  const calculateMonthlyRevenue = (revenueInfos, date) => {
    return revenueInfos.reduce((total, { revenue }) => {
      const revenueData = revenue[date]
      return (
        total +
        (revenueData
          ? switchValue === SWITCH_LABEL.REVENUE
            ? revenueData.revenue
            : revenueData.manMonth
          : 0)
      )
    }, 0)
  }

  const calculateManMonthMonthlyRevenue = (revenueInfos, date) => {
    return revenueInfos.reduce((total, { revenue }) => {
      const revenueData = revenue[date]
      return (
        total +
        (revenueData
          ? switchValue === SWITCH_LABEL.REVENUE
            ? revenueData.manMonth
            : 0
          : 0)
      )
    }, 0)
  }

  const createColumnConfig = (
    date,
    totalRevenue,
    averagePriceRevenue,
    numberOfMonth
  ) => {
    const calculatedWidth =
      Math.max((TABLE_WIDTH - BASE_WIDTH * 6) / numberOfMonth, MIN_WIDTH) + 40
    const baseColumn = {
      title: convertDateTextFormat(date),
      dataIndex: [
        'revenue',
        date,
        switchValue === SWITCH_LABEL.REVENUE ? 'revenue' : 'manMonth',
      ],
      key: date,
      align: 'center',
      className: 'text-column-revenue-table',
      width: calculatedWidth,
      render: (_, record) => {
        if (switchValue === SWITCH_LABEL.REVENUE) {
          const revenueValue =
            record.revenue[date] !== undefined &&
            record.revenue[date].revenue !== null
              ? record.revenue[date].revenue
              : null
          return revenueValue !== null ? (
            <span title={formatFloatNumber(revenueValue, 0, 8)}>
              {formatFloatNumber(revenueValue, 0, 3)}
            </span>
          ) : null
        } else {
          const revenueManMonth =
            record.revenue[date] !== undefined &&
            record.revenue[date].manMonth !== null
              ? record.revenue[date].manMonth
              : null
          return revenueManMonth !== null ? (
            <span title={formatFloatNumber(revenueManMonth, 0, 8)}>
              {formatFloatNumber(revenueManMonth, 0, 3)}
            </span>
          ) : null
        }
      },
    }

    const averagePriceRevenueTitle = isNaN(averagePriceRevenue) ? (
      ''
    ) : (
      <span title={formatFloatNumber(averagePriceRevenue, 0, 8)}>
        {formatFloatNumber(Number(averagePriceRevenue), 0, 3)}
      </span>
    )
    return switchValue === SWITCH_LABEL.REVENUE
      ? {
          title: (
            <span title={formatFloatNumber(totalRevenue, 0, 8)}>
              {totalRevenue ? formatFloatNumber(totalRevenue, 0, 3) : ''}
            </span>
          ),
          children: [
            {
              title: averagePriceRevenueTitle,
              children: [baseColumn],
              align: 'center',
              className: 'text-column-revenue-table',
            },
          ],
          align: 'center',
        }
      : {
          title: (
            <span title={formatFloatNumber(totalRevenue, 0, 8)}>
              {totalRevenue ? formatFloatNumber(totalRevenue, 0, 3) : ''}
            </span>
          ),
          children: [baseColumn],
          align: 'center',
        }
  }

  useEffect(() => {
    if (!dataSourceTable) return

    const keysDate = getMonthsBetweenTimestamps(
      dataSourceTable.startDate,
      dataSourceTable.endDate
    )

    const dataKeyColumn = keysDate.map(date => {
      const totalRevenue = calculateMonthlyRevenue(
        dataSourceTable.revenueInfos,
        date
      )
      const totalManMonthRevenue = calculateManMonthMonthlyRevenue(
        dataSourceTable.revenueInfos,
        date
      )

      const averagePriceRevenue =
        switchValue === SWITCH_LABEL.REVENUE && totalManMonthRevenue
          ? totalRevenue / totalManMonthRevenue
          : 0
      return createColumnConfig(
        date,
        totalRevenue,
        averagePriceRevenue,
        keysDate.length
      )
    })

    const totalSumManMonthRevenue = dataSourceTable.revenueInfos.reduce(
      (sum, item) => {
        const totalByLabel =
          switchValue === SWITCH_LABEL.REVENUE ? item.totalManMonth : 1
        return sum + parseFloat(totalByLabel)
      },
      0
    )
    const averagePriceTotalRevenue =
      switchValue === SWITCH_LABEL.REVENUE && totalSumManMonthRevenue
        ? totalSum / totalSumManMonthRevenue
        : null

    let updatedColumnsHeadcount = columns.map(column => {
      if (column.children.some(child => child.dataIndex === 'unitPrice')) {
        return {
          ...column,
          title: '',
          className: 'text-column-revenue-table',
        }
      }
      if (column.children.some(child => child.dataIndex === 'totalRevenue')) {
        return {
          ...column,
          title:
            totalSum !== null && !isNaN(totalSum) ? (
              <span title={formatFloatNumber(totalSum, 0, 8)}>
                {formatFloatNumber(totalSum, 0, 3)}
              </span>
            ) : (
              ''
            ),
        }
      }
      return column
    })

    if (switchValue === SWITCH_LABEL.HEADCOUNT) {
      updatedColumnsHeadcount = updatedColumnsHeadcount.map(column => ({
        ...column,
        children: column.children.map(child => {
          if (child.dataIndex === 'totalRevenue') {
            return {
              ...child,
              dataIndex: 'totalManMonth',
              render: (_, record) => {
                return (
                  <span title={formatFloatNumber(record.totalManMonth, 0, 8)}>
                    {record.totalManMonth
                      ? formatFloatNumber(record.totalManMonth, 0, 3)
                      : ''}
                  </span>
                )
              },
            }
          }
          return child
        }),
      }))
    }

    const updatedColumnsRevenue = columns.map(column => {
      if (column.children.some(child => child.dataIndex === 'unitPrice')) {
        return {
          ...column,
          title: '',
          className: 'text-column-revenue-table',
        }
      }
      if (column.children.some(child => child.dataIndex === 'totalRevenue')) {
        return {
          ...column,
          title:
            totalSum !== null && !isNaN(totalSum) ? (
              <span title={formatFloatNumber(totalSum, 0, 8)}>
                {formatFloatNumber(totalSum, 0, 3)}
              </span>
            ) : (
              ''
            ),
          children: column.children.map(child => {
            if (child.dataIndex === 'totalRevenue') {
              return {
                ...child,
                render: (_, record, index) => {
                  return (
                    <span title={formatFloatNumber(record.totalRevenue, 0, 8)}>
                      {record.totalRevenue
                        ? formatFloatNumber(record.totalRevenue, 0, 3)
                        : ''}
                    </span>
                  )
                },
              }
            }
            return child
          }),
        }
      }
      return column
    })

    const columnsAverage = transformAvergeColumns(
      updatedColumnsRevenue,
      averagePriceTotalRevenue
    )

    setColumnConfig([
      ...(switchValue === SWITCH_LABEL.REVENUE
        ? columnsAverage
        : updatedColumnsHeadcount),
      ...dataKeyColumn,
    ])
  }, [switchValue, dataSourceTable, totalSum])

  useEffect(() => {
    if (!canView) return
    if (!isExpandPanel) return
    dispatch(getPositionRevenuePlan({ projectCode }))
  }, [isExpandPanel, projectCode])

  useEffect(() => {
    const isVersionChanged = prevVersionRef.current !== businessVersion
    prevVersionRef.current = businessVersion

    if (!canView) return
    if (!isExpandPanel) return
    if (isVersionChanged) return

    fetchProductionRevenuePlan(PAGE_INDEX_START, PAGE_SIZE, {
      switchValue,
      ...filters,
      deliveryUnitDataRevenue,
    })
  }, [
    isExpandPanel,
    switchValue,
    filters,
    businessVersion,
    deliveryUnitDataRevenue.groupId,
  ])

  useEffect(() => {
    const tableBodyRevenue = document.querySelector(
      '.revenue-information-body .ant-table-body'
    )
    if (tableBodyRevenue) {
      tableBodyRevenue.addEventListener('scroll', handleScroll)
    }
    return () => {
      if (tableBodyRevenue) {
        tableBodyRevenue.removeEventListener('scroll', handleScroll)
      }
    }
  }, [handleScroll])

  useEffect(() => {
    setHasMore(true)
    setDataSourceTable({
      avgPrice: 0,
      startDate: null,
      endDate: null,
      revenueInfos: [],
    })
  }, [isExpandPanel, switchValue, filters, deliveryUnitDataRevenue.groupId])

  const handleSearch = useCallback(
    value => {
      dispatch(setFiltersRevenue(value))
    },
    [dispatch]
  )

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    if (filterRef.current) {
      filterRef.current.setFilterOption([])
      filterRef.current.setFilters({})
      setExpandPanel(prevExpandPanel =>
        prevExpandPanel.filter(
          item =>
            item !== REVENUE_PLAN_TAB.SOFTWARE_PRODUCTION_REVENUE_INFORMATION
        )
      )
    }
    dispatch(setFiltersRevenue({}))
  }, [deliveryUnitDataRevenue.groupId])

  return (
    <div>
      <Row>
        <Col span={12} style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <FilterBusinessPlan
              ref={filterRef}
              filterConfig={filterConfig}
              skipFetch
              onSearch={handleSearch}
            />
            <Link
              to={`${
                SourceConstants.DELIVERY_DPM
              }?projectCode=${projectCode}&startDate=${moment(startDate).format(
                DateFormat.YYYY_MM_DD
              )}&endDate=${moment(startDate)
                .add(11, 'months')
                .format(DateFormat.YYYY_MM_DD)}`}
              style={{ textDecoration: 'underline', alignContent: 'center' }}
              target="_blank"
              className="p-0">
              Go to Billing Plan
            </Link>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ textAlign: 'right' }}>
            <Radio.Group
              value={switchValue}
              buttonStyle="solid"
              onChange={handleSwitchHeadcountRevenue}>
              <Radio.Button value={SWITCH_LABEL.HEADCOUNT}>
                Head count
              </Radio.Button>
              <Radio.Button value={SWITCH_LABEL.REVENUE}>Revenue</Radio.Button>
            </Radio.Group>
          </div>
        </Col>
      </Row>
      <Table
        className="revenue-information-body"
        rowKey={rowKey =>
          `${rowKey.position}-${rowKey.unitPrice}-${rowKey.department}-${rowKey.saleWorkOrderId}`
        }
        ref={tableRef}
        pagination={false}
        columns={columnConfig}
        dataSource={
          canView && dataSourceTable ? dataSourceTable.revenueInfos : []
        }
        loading={loadingTable}
        scroll={{ x: 'max-content', y: 400 }}
        showHeader={
          canView &&
          dataSourceTable &&
          dataSourceTable.revenueInfos &&
          dataSourceTable.revenueInfos.length > 0
        }
      />
    </div>
  )
}

export default RevenueInformation
