import { Icon, Table } from 'antd'
import React, { useState, useEffect, useRef } from 'react'
import './style.css'
import useBusinessPlanHistoryService from '../../hooks/useBusinessPlanHistoryService'
import { useSelector } from 'react-redux'
import { useCallback } from 'react'
import { uniqueId } from 'lodash'
import { renderFieldName } from './constant'

const BusinessPlanHistoryTable = ({
  DeliveryUnit,
  BusinessPlanVersionId,
  isSale,
}) => {
  const [expandedKeys, setExpandedKeys] = useState([])
  const [expandAll, setExpandAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const prevVersionRef = useRef(BusinessPlanVersionId)

  const { isUpdated, isUpdatedSellingExpenses } = useSelector(
    state => state.businessPlanRevenue
  )
  const { activePanel } = useSelector(state => state.businessPlanDetails)

  const { data, fetchUserActionHistory, loading, totalPage } =
    useBusinessPlanHistoryService()

  useEffect(() => {
    const isVersionChanged = prevVersionRef.current !== BusinessPlanVersionId
    prevVersionRef.current = BusinessPlanVersionId

    if (isVersionChanged) return

    if (activePanel === 'Delivery') {
      fetchUserActionHistory(
        BusinessPlanVersionId,
        DeliveryUnit,
        currentPage,
        pageSize,
        isSale,
        'DELIVERY_PLAN'
      )
    } else if (
      activePanel === 'Revenue' ||
      isUpdated ||
      isUpdatedSellingExpenses
    ) {
      fetchUserActionHistory(
        BusinessPlanVersionId,
        DeliveryUnit,
        currentPage,
        pageSize,
        isSale,
        'REVENUE_PLAN'
      )
    }
  }, [
    activePanel,
    DeliveryUnit,
    BusinessPlanVersionId,
    isSale,
    fetchUserActionHistory,
    currentPage,
    pageSize,
    isUpdated,
    isUpdatedSellingExpenses,
  ])
  const handleChangePage = useCallback(pagination => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }, [])

  const mapDataDetails = useCallback(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }

    return data.map(item => {
      const parseJSON = str => {
        try {
          const obj = JSON.parse(str)
          delete obj.revenueTypeId

          let primaryKey = ''
          if (obj.revenueName !== undefined && obj.revenueName !== null) {
            obj['Revenue Name'] = obj.revenueName
            primaryKey = 'Revenue Name'
          } else if (
            obj.deliveryName !== undefined &&
            obj.deliveryName !== null
          ) {
            obj['Delivery Name'] = obj.deliveryName
            primaryKey = 'Delivery Name'
          }
          delete obj.revenueName
          delete obj.deliveryName

          const sortedObj = primaryKey
            ? Object.fromEntries([
                [primaryKey, obj[primaryKey]],
                ...Object.entries(obj).filter(([key]) => key !== primaryKey),
              ])
            : obj

          return sortedObj
        } catch (error) {
          return {}
        }
      }

      const processValues = (oldValueString, newValueString) => {
        let oldValues = parseJSON(oldValueString)
        let newValues = parseJSON(newValueString)

        const {
          id: idOld,
          costTypeName: costTypeNameOld,
          grossSalaryVnd: grossSalaryVndOld,
          ...oldValuesWithoutId
        } = oldValues
        const {
          id: idNew,
          costTypeName: costTypeNameNew,
          grossSalaryVnd: grossSalaryVndNew,
          ...newValuesWithoutId
        } = newValues

        if (!oldValuesWithoutId.items) oldValuesWithoutId.items = {}
        if (!newValuesWithoutId.items) newValuesWithoutId.items = {}

        if (!oldValueString) {
          Object.keys(newValuesWithoutId).forEach(key => {
            if (key !== 'items') oldValuesWithoutId[key] = null
          })
        }

        if (!newValueString) {
          Object.keys(oldValuesWithoutId).forEach(key => {
            if (key !== 'items') newValuesWithoutId[key] = null
          })
        }

        return { oldValuesWithoutId, newValuesWithoutId }
      }

      const { oldValuesWithoutId, newValuesWithoutId } = processValues(
        item.oldValueString,
        item.newValueString
      )

      const children = [
        {
          key: `${item.id || uniqueId()}-title`,
          className: 'sub-row-header',
          titleField: 'Field',
          titleOldValue: 'Old Value',
          titleNewValue: 'New Value',
        },
      ]

      const processFields = (oldObj, newObj, parentKey = '') => {
        const allKeys = [
          ...new Set([
            ...Object.keys(oldObj || {}),
            ...Object.keys(newObj || {}),
          ]),
        ]

        allKeys.forEach(key => {
          const displayKey =
            key.toLowerCase() === 'revenueName' ? 'deliveryName' : key
          const fullKey = parentKey ? `${displayKey}` : displayKey
          const oldValue = oldObj ? oldObj[key] : ''
          const newValue = newObj ? newObj[key] : ''

          if (oldValue !== newValue) {
            if (
              typeof oldValue === 'object' &&
              oldValue !== null &&
              !Array.isArray(oldValue)
            ) {
              processFields(oldValue, newValue, fullKey)
            } else {
              children.push({
                key: `${item.id || uniqueId()}-${fullKey}`,
                field: fullKey,
                oldValue: oldValue || '',
                newValue: newValue || '',
              })
            }
          }
        })
      }

      processFields(oldValuesWithoutId, newValuesWithoutId)

      return {
        isParent: true,
        key: `${item.id || uniqueId()}`,
        actionTime: item.actionTime,
        author: item.author,
        entity: item.entity,
        children,
      }
    })
  }, [data])

  const columns = useCallback(
    (expandedKeys, toggleExpand) => [
      {
        title: (
          <div style={{ display: 'flex', cursor: 'pointer' }}>
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
          </div>
        ),
        dataIndex: 'icon-expand',
        key: 'icon-expand',
        align: 'left',
        width: '1%',
        className: 'text-column-revenue-table',
        render: (text, record) =>
          record.children ? (
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
          ) : null,
      },
      {
        title: 'Action Time',
        dataIndex: 'actionTime',
        key: 'actionTime',
        align: 'left',
        width: '33%',
        className: 'text-column-revenue-table',
        render: (_, record) => {
          const { isParent } = record
          return isParent ? (
            record.actionTime
          ) : (
            <div>
              <div style={{ fontWeight: 'bold' }}>{record.titleField}</div>
              {record.field && <div>{renderFieldName(record.field)}</div>}
            </div>
          )
        },
      },
      {
        title: 'Author',
        dataIndex: 'author',
        key: 'author',
        align: 'left',
        width: '33%',
        className: 'text-column-revenue-table',
        render: (_, record) => {
          const { isParent } = record
          return isParent ? (
            record.author
          ) : (
            <div>
              <div style={{ fontWeight: 'bold' }}>{record.titleOldValue}</div>
              {record.oldValue && <div>{record.oldValue}</div>}
            </div>
          )
        },
      },
      {
        title: 'Entity',
        dataIndex: 'entity',
        key: 'entity',
        align: 'left',
        width: '33%',
        className: 'text-column-revenue-table',
        render: (_, record) => {
          const { isParent } = record
          return isParent ? (
            record.entity
          ) : (
            <div>
              <div style={{ fontWeight: 'bold' }}>{record.titleNewValue}</div>
              {record.newValue && <div>{record.newValue}</div>}
            </div>
          )
        },
      },
    ],
    [expandAll, mapDataDetails]
  )
  const toggleExpand = key => {
    setExpandedKeys(prevExpandedKeys => {
      const isExpanded = prevExpandedKeys.includes(key)
      if (isExpanded) {
        const item = mapDataDetails().find(i => i.key === key)
        const childKeys = item ? item.children.map(child => child.key) : []
        return prevExpandedKeys.filter(k => k !== key && !childKeys.includes(k))
      } else {
        const item = mapDataDetails().find(i => i.key === key)
        const childKeys = item ? item.children.map(child => child.key) : []
        return [...prevExpandedKeys, key, ...childKeys]
      }
    })
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedKeys([])
    } else {
      const allKeys = mapDataDetails().reduce((acc, item) => {
        return [...acc, item.key, ...item.children.map(child => child.key)]
      }, [])
      setExpandedKeys(allKeys)
    }
    setExpandAll(!expandAll)
  }

  return (
    <Table
      className="revenue-history-table"
      columns={columns(expandedKeys, toggleExpand)}
      dataSource={mapDataDetails() || []}
      onChange={handleChangePage}
      expandedRowKeys={expandedKeys}
      onExpand={(expanded, record) => {
        const keys = expanded
          ? [...expandedKeys, record.key]
          : expandedKeys.filter(key => key !== record.key)
        setExpandedKeys(keys)
      }}
      expandIconColumnIndex={-1}
      expandIconAsCell={false}
      scroll={{ x: 'max-content', y: 500 }}
      rowClassName={record => record.className || ''}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalPage,
      }}
      loading={loading}
    />
  )
}

export default BusinessPlanHistoryTable
