import { checkRolePermission } from '../../../../components/common/checkRolePermission'
import {
  ActivityKeyConstants,
  SourceConstants,
} from '../../../constants/ActivityKeyConstants'
import { formatFloatNumber } from '../../../utils/format-utils/ConvertNumber'
import { Icon, Input, InputNumber, Table, Tooltip } from 'antd'
import { debounce } from 'lodash'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { CAN_NOT_EDIT_REVENUE, REVENUE_TYPE_ID } from '../../constants'
import { useBusinessPlanRevenue } from '../../hooks'
import {
  getBusinessPlanOtherRevenue,
  setCreateOtherRevenuesData,
  setDeleteOtherRevenuesData,
  setIsSaveConfirmShowed,
  setUpdateOtherRevenuesData,
} from '../../redux'
import {
  convertDateTextFormat,
  formatInputNumber,
  parseInputNumber,
} from '../../utils'
import './style.css'

const StyledInputNumber = styled(InputNumber)`
  .ant-input-number-handler-wrap {
    display: none;
  }
`
const TABLE_WIDTH = 1517
const ICON_EXPAND_WIDTH = 80
const REVENUE_NAME_WIDTH = 185
const TOTAL_REVENUE_VALUE_WIDTH = 170
const MIN_WIDTH = 120

const OtherRevenueTable = ({
  isExpandPanel,
  businessVersion,
  projectCode,
  status,
  deliveryUnitDataRevenue,
  keyReset,
}) => {
  const [dataSourceTable, setDataSourceTable] = useState([])
  const [expandedKeys, setExpandedKeys] = useState([])
  const [expandAll, setExpandAll] = useState(false)
  const [rowsData, setRowsData] = useState([])

  const dispatch = useDispatch()
  const {
    dataSourceTableRevenue: mainData,
    isLoading,
    isUpdated,
    listRevenueInvalid,
  } = useSelector(state => state.businessPlanRevenue)
  const updateIsSaveConfirmShowed = useCallback(
    value => {
      return dispatch(setIsSaveConfirmShowed(value))
    },
    [dispatch]
  )

  const { dataSourceValidation } = useBusinessPlanRevenue(listRevenueInvalid, dataSourceTable)

  const generateMonthColumns = (startDate, endDate) => {
    const start = moment(startDate)
    const end = moment(endDate)
    const months = []

    let current = start.clone()

    while (current.isSameOrBefore(end, 'month')) {
      months.push(current.format('MM-YYYY'))
      current.add(1, 'month')
    }

    const monthSums = months.reduce((acc, month) => {
      acc[month] = mainData.revenues.reduce((sum, revenue) => {
        return (
          sum +
          revenue.additionalItems.reduce((itemSum, item) => {
            return (
              itemSum +
              item.revenueDetails.reduce((detailSum, detail) => {
                return detailSum + (detail.date === month ? detail.value : 0)
              }, 0)
            )
          }, 0)
        )
      }, 0)
      return acc
    }, {})

    const totalMonthWidth =
      TABLE_WIDTH -
      ICON_EXPAND_WIDTH -
      REVENUE_NAME_WIDTH -
      TOTAL_REVENUE_VALUE_WIDTH
    const calculatedWidth = Math.max(totalMonthWidth / months.length, MIN_WIDTH)

    return months.map(month => ({
      title: (
        <span title={formatFloatNumber(monthSums[month], 0, 8)}>
          {monthSums[month] ? formatFloatNumber(monthSums[month], 0, 3) : null}
        </span>
      ),
      dataIndex: month,
      ellipsis: true,
      children: [
        {
          title: convertDateTextFormat(month),
          dataIndex: month,
          ellipsis: true,
          width: calculatedWidth,
          key: month,
          align: 'left',
          className: 'text-column-revenue-table',
        },
      ],
    }))
  }

  const handleEdit = useCallback(
    updatedRow => {
      dispatch(setUpdateOtherRevenuesData(updatedRow))
    },
    [dispatch]
  )

  const handleRowChange = useMemo(
    () =>
      debounce((key, field, month, value) => {
        updateIsSaveConfirmShowed(true)
        let updatedRows = []

        setRowsData(prevRows =>
          prevRows.map(row => {
            if (row.key !== key) return row

            const updatedRow = {
              ...row,
              [field]:
                field === 'revenueDetails'
                  ? {
                      ...row.revenueDetails,
                      [month]: {
                        value,
                        revenueTypeId: row.revenueTypeId,
                      },
                    }
                  : value,
            }

            const formattedRow = {
              key: updatedRow.key,
              revenueTypeId: updatedRow.revenueTypeId,
              revenueTypeSpecificId: updatedRow.revenueTypeSpecificId,
              revenueName: updatedRow.revenueName,
              total: updatedRow.total,
              revenueDetails: Object.entries(updatedRow.revenueDetails).map(
                ([date, detail]) => {
                  const [monthNum, year] = date.split('-')
                  return {
                    revenueTypeId: detail.revenueTypeId,
                    revenueTypeSpecificId: updatedRow.revenueTypeSpecificId,
                    revenueName: updatedRow.revenueName,
                    month: parseInt(monthNum, 10),
                    year: parseInt(year, 10),
                    date,
                    value: parseFloat(detail.value) || 0,
                  }
                }
              ),
            }
            updatedRows.push(formattedRow)
            return updatedRow
          })
        )
        updatedRows.forEach(row => handleEdit(row))
      }, 500),
    [handleEdit, updateIsSaveConfirmShowed]
  )

  const canEditRevenueAllStatus =
    checkRolePermission(
      SourceConstants.BUSINESS_PLAN_DETAIL,
      ActivityKeyConstants.EDIT_REVENUE_PLAN_ALL_STATUS
    ) && status !== 'Approved'

  const mapRevenueDetails = (mainDataRevenue, formatRowData) => {
    const start = moment(mainDataRevenue.startDate)
    const end = moment(mainDataRevenue.endDate)

    const months = []
    let cursor = start.clone()
    while (cursor.isBefore(end) || cursor.isSame(end)) {
      months.push(cursor.format('MM-YYYY'))
      cursor.add(1, 'month')
    }

    return mainDataRevenue.revenues.map(revenue => {
      const monthlySums = months.reduce((acc, month) => {
        const totalValueMonthByType = revenue.additionalItems.reduce(
          (itemAcc, item) => {
            return (
              itemAcc +
              item.revenueDetails.reduce((detailAcc, detail) => {
                return detailAcc + (detail.date === month ? detail.value : 0)
              }, 0)
            )
          },
          0
        )
        acc[month] = totalValueMonthByType
          ? formatFloatNumber(totalValueMonthByType, 0, 3)
          : null
        return acc
      }, {})

      const children = formatRowData
        .filter(row => row.type === revenue.type)
        .map(row => {
          const revenueDetailsInputs = {}
          months.forEach(month => {
            const val =
              (row.revenueDetails[month] && row.revenueDetails[month].value) ||
              null
            revenueDetailsInputs[month] =
              status === 'Draft' || canEditRevenueAllStatus ? (
                <StyledInputNumber
                  key={`${row.key}-${val}-${keyReset}`}
                  style={{ fontSize: 'small', maxWidth: MIN_WIDTH }}
                  size="small"
                  defaultValue={val}
                  formatter={formatInputNumber}
                  parser={parseInputNumber}
                  title={formatFloatNumber(val, 0, 8)}
                  onChange={value =>
                    handleRowChange(row.key, 'revenueDetails', month, value)
                  }
                />
              ) : (
                <span title={formatFloatNumber(val, 0, 8)}>
                  {formatFloatNumber(val, 0, 3)}
                </span>
              )
          })

          return {
            key: row.key,
            revenueTypeSpecificId: row.revenueTypeSpecificId,
            total: row.total,
            revenueName:
              status === 'Draft' || canEditRevenueAllStatus ? (
                <Input
                  key={`${row.key}-${row.revenueName}-${keyReset}`}
                  className=""
                  size="small"
                  style={{ fontSize: 'small' }}
                  defaultValue={row.revenueName}
                  title={row.revenueName}
                  onChange={e =>
                    handleRowChange(
                      row.key,
                      'revenueName',
                      null,
                      e.target.value
                    )
                  }
                />
              ) : (
                <span>{row.revenueName}</span>
              ),
            ...revenueDetailsInputs,
          }
        })
      return {
        key: revenue.type,
        revenueName: revenue.type,
        revenueTypeId: revenue.revenueTypeId,
        total: revenue.total,
        ...monthlySums,
        children,
      }
    })
  }

  const handleAddedRowChange = (key, field, month, value) => {
    updateIsSaveConfirmShowed(true)
    dispatch(setCreateOtherRevenuesData({ key, field, month, value }))
  }

  const handleRevenueNameChange = useMemo(
    () =>
      debounce((key, value) => {
        updateIsSaveConfirmShowed(true)
        dispatch(
          setCreateOtherRevenuesData({
            key,
            field: 'revenueName',
            month: null,
            value,
          })
        )
      }, 300),
    [dispatch, updateIsSaveConfirmShowed]
  )

  const handleAddChildRow = record => {
    if (!mainData) return
    expandRowAdded(record.key)
    setDataSourceTable(prevData => {
      const newData = [...prevData]
      const parent = newData.find(item => item.key === record.key)
      const newChildIndex = newData.reduce(
        (acc, item) => acc + (item.children ? item.children.length : 0),
        0
      )
      if (parent) {
        const newChildKey = `${record.key}-new-${
          REVENUE_TYPE_ID[record.key]
        }-${newChildIndex}`
        handleAddedRowChange(newChildKey, 'revenueName', null, '')
        const newChild = {
          key: newChildKey,
          revenueName: (
            <Input
              className=""
              size="small"
              style={{ fontSize: 'small' }}
              onChange={e =>
                handleRevenueNameChange(newChildKey, e.target.value)
              }
            />
          ),
          total: '',
          ...generateMonthColumns(mainData.startDate, mainData.endDate).reduce(
            (acc, col) => {
              acc[col.dataIndex] = (
                <StyledInputNumber
                  style={{ fontSize: 'small', maxWidth: MIN_WIDTH }}
                  size="small"
                  formatter={formatInputNumber}
                  parser={parseInputNumber}
                  onChange={debounce(
                    value =>
                      handleAddedRowChange(
                        newChildKey,
                        'revenueDetails',
                        col.dataIndex,
                        value
                      ),
                    500
                  )}
                />
              )
              return acc
            },
            {}
          ),
        }

        parent.children = [newChild, ...(parent.children || [])]
      }
      return newData
    })
  }

  const handleRemoveChildRow = record => {
    const [type, revenueTypeSpecificIdStr] = record.key.split('-')
    const revenueTypeSpecificId = Number(revenueTypeSpecificIdStr)
    if (record.key.includes('new')) {
      dispatch(setDeleteOtherRevenuesData(record.key))
    } else {
      const removedItem = mainData.revenues
        .filter(revenue => revenue.type === type)
        .flatMap(revenue => revenue.additionalItems)
        .find(item => item.revenueTypeSpecificId === revenueTypeSpecificId)
      if (removedItem) {
        updateIsSaveConfirmShowed(true)
        const removedDataId = removedItem.revenueTypeSpecificId
        dispatch(setDeleteOtherRevenuesData(removedDataId))
      }
    }

    setDataSourceTable(prevData => {
      const newData = prevData.map(item => {
        if (item.children) {
          item.children = item.children.filter(
            child => child.key !== record.key
          )
        }
        return item
      })
      return newData
    })
  }

  const columns = useCallback(
    (expandedKeys, toggleExpand) => {
      if (!mainData) return
      const totalRevenueValue = mainData.revenues.reduce((sum, item) => {
        return sum + parseFloat(item.total)
      }, 0)

      return [
        {
          title: '',
          children: [
            {
              title: (
                <Icon
                  onClick={toggleExpandAll}
                  type="right"
                  style={{
                    fontSize: '12px',
                    cursor: 'pointer',
                    transform: expandAll ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              ),
              dataIndex: 'icon-expand',
              key: 'icon-expand',
              align: 'left',
              width: ICON_EXPAND_WIDTH,
              className: 'text-column-revenue-table',
              render: (text, record) =>
                record.children ? (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}>
                    <Icon
                      onClick={() => toggleExpand(record.key)}
                      type="right"
                      style={{
                        fontSize: '12px',
                        cursor: 'pointer',
                        transform: expandedKeys.includes(record.key)
                          ? 'rotate(90deg)'
                          : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                      }}
                    />

                    <Tooltip
                      placement="leftTop"
                      title={
                        status === 'Draft' || canEditRevenueAllStatus
                          ? ''
                          : CAN_NOT_EDIT_REVENUE
                      }>
                      <span style={{ display: 'inline-block' }}>
                        <Icon
                          type="plus-circle"
                          className={
                            status === 'Draft' || canEditRevenueAllStatus
                              ? ''
                              : 'icon-disabled-action'
                          }
                          style={{ fontSize: '12px' }}
                          onClick={() => handleAddChildRow(record)}
                        />
                      </span>
                    </Tooltip>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}>
                    <div style={{ width: '12px' }}></div>
                    <Tooltip
                      placement="leftTop"
                      title={
                        status === 'Draft' || canEditRevenueAllStatus
                          ? ''
                          : CAN_NOT_EDIT_REVENUE
                      }>
                      <span style={{ display: 'inline-block' }}>
                        <Icon
                          type="minus-circle"
                          className={
                            status === 'Draft' || canEditRevenueAllStatus
                              ? ''
                              : 'icon-disabled-action'
                          }
                          style={{ fontSize: '12px' }}
                          onClick={() => handleRemoveChildRow(record)}
                        />
                      </span>
                    </Tooltip>
                  </div>
                ),
            },
          ],
          fixed: 'left',
        },
        {
          title: 'Total',
          children: [
            {
              title: 'Revenue categories',
              dataIndex: 'revenueName',
              key: 'revenueName',
              align: 'left',
              width: REVENUE_NAME_WIDTH,
              className: 'text-column-revenue-table',
              ellipsis: true,
              render: (_, record) => {
                if (record.revenueName === 'Equipment') {
                  return 'Revenues from Equipment, Internet, Server,...'
                } else if (record.revenueName === 'Other') {
                  return 'Other revenues'
                } else {
                  return record.revenueName
                }
              },
            },
          ],
          fixed: 'left',
        },
        {
          title: (
            <span title={formatFloatNumber(totalRevenueValue, 0, 8)}>
              {formatFloatNumber(totalRevenueValue, 0, 3)}
            </span>
          ),
          children: [
            {
              title: 'Total revenue value',
              dataIndex: 'total',
              key: 'totalRevenueValue',
              align: 'left',
              width: TOTAL_REVENUE_VALUE_WIDTH,
              className: 'text-column-revenue-table',
              render: (text, record) => {
                return record.total ? (
                  <span title={formatFloatNumber(record.total, 0, 8)}>
                    {formatFloatNumber(record.total, 0, 3)}
                  </span>
                ) : null
              },
            },
          ],
          fixed: 'left',
        },
        ...generateMonthColumns(mainData.startDate, mainData.endDate),
      ]
    },
    [mainData, expandAll]
  )

  const toggleExpand = key => {
    setExpandedKeys(prevExpandedKeys =>
      prevExpandedKeys.includes(key)
        ? prevExpandedKeys.filter(k => k !== key)
        : [...prevExpandedKeys, key]
    )
  }

  const expandRowAdded = key => {
    setExpandedKeys(prevExpandedKeys => {
      if (!prevExpandedKeys.includes(key)) {
        return [...prevExpandedKeys, key]
      }
      return prevExpandedKeys
    })
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedKeys([])
    } else {
      const allKeys = dataSourceTable.length
        ? dataSourceTable.map(item => item.key)
        : mainData.revenues.map(item => item.type)
      setExpandedKeys(allKeys)
    }
    setExpandAll(!expandAll)
  }

  useEffect(() => {
    if (mainData) {
      const formatRowData = mainData.revenues.flatMap(revenue =>
        revenue.additionalItems.map(item => ({
          key: `${revenue.type}-${item.revenueTypeSpecificId}`,
          type: revenue.type,
          revenueTypeId: revenue.revenueTypeId,
          revenueTypeSpecificId: item.revenueTypeSpecificId,
          revenueName: item.revenueName,
          total: item.total,
          revenueDetails: item.revenueDetails.reduce((acc, detail) => {
            if (detail.date) {
              acc[detail.date] = {
                revenueTypeId: detail.revenueTypeId,
                value: detail.value,
              }
            }
            return acc
          }, {}),
        }))
      )
      setRowsData(formatRowData)
      setDataSourceTable(mapRevenueDetails(mainData, formatRowData))
    }
  }, [mainData])

  useEffect(() => {
    if (!isExpandPanel) return

    dispatch(
      getBusinessPlanOtherRevenue({
        mvv: projectCode,
        duId: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupId,
        businessVersion: businessVersion,
        isSale: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupSale,
        status,
      })
    )
  }, [isExpandPanel, deliveryUnitDataRevenue.groupId, businessVersion])

  useEffect(() => {
    if (isUpdated) {
      dispatch(
        getBusinessPlanOtherRevenue({
          mvv: projectCode,
          duId: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupId,
          businessVersion: businessVersion,
          isSale: deliveryUnitDataRevenue && deliveryUnitDataRevenue.groupSale,
          status,
        })
      )
      updateIsSaveConfirmShowed(false)
    }
  }, [isUpdated, businessVersion])

  useEffect(() => {
    if (listRevenueInvalid.length > 0) {
      setDataSourceTable(dataSourceValidation)
    }
  }, [listRevenueInvalid])

  return (
    <Table
      columns={columns(expandedKeys, toggleExpand)}
      dataSource={dataSourceTable ? dataSourceTable : []}
      loading={isLoading}
      pagination={false}
      expandedRowKeys={expandedKeys}
      onExpand={(expanded, record) => {
        const keys = expanded
          ? [...expandedKeys, record.key]
          : expandedKeys.filter(key => key !== record.key)
        setExpandedKeys(keys)
      }}
      expandIconColumnIndex={-1}
      expandIconAsCell={false}
      scroll={{ x: 'max-content', y: 400 }}
    />
  )
}
export default OtherRevenueTable
