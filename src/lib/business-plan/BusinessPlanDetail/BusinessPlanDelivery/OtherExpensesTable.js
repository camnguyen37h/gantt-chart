import { uniqueId } from 'lodash'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { NotificationManager } from 'react-notifications'
import { Icon, Input, Table, Tooltip } from 'antd'
import { useDispatch, useSelector, useStore } from 'react-redux'
import {
  setIsSaveShowedDeliveryPlan,
  getOtherExpensesTable,
  addUpdateOtherExpense,
  addCreateOtherExpense,
  removeUpdateOtherExpense,
  removeCreateOtherExpense,
} from '../../redux'
import { formatFloatNumber } from '../../../utils/format-utils/ConvertNumber'
import { formatInputNumber, parseInputNumber } from '../../utils'
import {
  ACTION_NOT_AVAILABLE_MESSAGE,
  DUPLICATED_COSTNAMES_MESSAGE,
  OTHER_EXPENSE_TABLE_WIDTH,
  OTHER_EXPENSES_KEYS,
  REVIEWING_WARNING_MESSAGE,
  VALIDATE_REQUIRED_FIELDS_MESSAGE,
} from './constants'
import { ALL_OPTION_VALUE } from '../../constants'
import { useBusinessPlanDetails } from '../../hooks'
import { StyledDisabledIcon, StyledInputNumber } from './styled'
import { useElementSize } from '../../../../hooks'
const OtherExpensesTable = forwardRef(
  (
    { isExpandPanel, canEdit, canView, buId, deliveryUnitDataDelivery },
    ref
  ) => {
    const dispatch = useDispatch()
    const store = useStore()
    const {
      dataListOtherExpenses,
      labelMonthOtherExpenses,
      getOtherExpensesTableLoading,
      duValueDelivery,
    } = useSelector(state => state.businessPlanDelivery)
    const { status } = useBusinessPlanDetails()

    const listCreateOtherExpenses = useSelector(
      state =>
        state.businessPlanDelivery.dataCreateRequest.listOtherExpensesTableData
    )
    const listUpdateOtherExpenses = useSelector(
      state =>
        state.businessPlanDelivery.dataUpdateRequest.listOtherExpensesTableData
    )

    const [expandedKeys, setExpandedKeys] = useState([])
    const [listInvalid, setListInvalid] = useState({})
    const [listDuplicated, setListDuplicated] = useState({})
    const [data, setData] = useState([])
    const prevBuIdRef = useRef(buId)
    const dataRef = useRef([])

    const { containerRef, size } = useElementSize()

    useEffect(() => {
      dataRef.current = data
    }, [data])

    const updateIsSaveConfirmShowed = useCallback(
      value => {
        return dispatch(setIsSaveShowedDeliveryPlan(value))
      },
      [dispatch]
    )

    useEffect(() => {
      const isVersionChanged = prevBuIdRef.current !== buId
      prevBuIdRef.current = buId

      if (!isExpandPanel) return
      if (!deliveryUnitDataDelivery) return
      if (
        isVersionChanged &&
        deliveryUnitDataDelivery.groupName !== ALL_OPTION_VALUE
      )
        return

      dispatch(
        getOtherExpensesTable({
          deliveryUnit:
            deliveryUnitDataDelivery.groupName === ALL_OPTION_VALUE
              ? undefined
              : deliveryUnitDataDelivery.groupName,
          businessPlanVersionId: Number(buId),
          pageNum: 1,
          pageSize: 10,
        })
      )
    }, [deliveryUnitDataDelivery, buId, isExpandPanel, dispatch])

    useEffect(() => {
      if (dataListOtherExpenses.length === 0) {
        setData([])
        return
      }

      setData(
        dataListOtherExpenses.map(item => ({
          key: item.expenseCategoriesEnum,
          otherExpenseId: item.otherExpenseId,
          expenseCategoriesEnum: item.expenseCategoriesEnum,
          totalExpenseValue: item.totalExpenseValue || '',

          children:
            (item.categoriesDataList &&
              item.categoriesDataList.map(child => ({
                ...child,
                parentKey: item.expenseCategoriesEnum,
                key: uniqueId(
                  `${OTHER_EXPENSES_KEYS.UPDATE_EXPENSE_COSTNAME}-${item.expenseCategoriesEnum}-`
                ),
              }))) ||
            [],
        }))
      )
    }, [dataListOtherExpenses])

    const toggleExpandAll = () => {
      const allKeys = dataListOtherExpenses.map(
        item => item.expenseCategoriesEnum
      )
      setExpandedKeys(prev => (prev.length > 0 ? [] : allKeys))
    }

    const toggleExpandedKeys = key => {
      setExpandedKeys(prevExpandedKeys =>
        prevExpandedKeys.includes(key)
          ? prevExpandedKeys.filter(k => k !== key)
          : [...prevExpandedKeys, key]
      )
    }

    const handleAddSubTableRow = parent => {
      if (!canEdit) return
      updateIsSaveConfirmShowed(true)
      setExpandedKeys(prevExpandedKeys => {
        if (!prevExpandedKeys.includes(parent.key)) {
          return [...prevExpandedKeys, parent.key]
        }
        return prevExpandedKeys
      })
      const newChildKey = uniqueId(
        `${OTHER_EXPENSES_KEYS.NEW_EXPENSE_COSTNAME}-${parent.key}-`
      )
      const newSubCategoryItem = {
        key: newChildKey,
        parentKey: parent.key,
        expenseCategoriesEnum: '',
        costName: '',
        totalExpenseValue: '',
        otherExpensesMonthlyDTO: {},
      }
      setData(prevRows => {
        const data = prevRows.map(prevRow =>
          prevRow.key === parent.key
            ? {
                ...prevRow,
                children: prevRow.children
                  ? [newSubCategoryItem, ...prevRow.children]
                  : [newSubCategoryItem],
              }
            : prevRow
        )
        return data
      })
      const newPayload = {
        expenseCategoriesEnum: parent.expenseCategoriesEnum,
        key: parent.key,
        otherExpenseId: parent.otherExpenseId,
        totalExpenseValue: parent.totalExpenseValue,
        categoriesDataList: [
          {
            key: newChildKey,
            parentKey: parent.expenseCategoriesEnum,
            costName: '',
            otherExpensesMonthlyDTO: {},
          },
        ],
      }
      dispatch(addCreateOtherExpense(newPayload))
    }

    const handleSave = useCallback(
      (updatedRow, isUpdate) => {
        if (isUpdate) dispatch(addUpdateOtherExpense(updatedRow))
        else dispatch(addCreateOtherExpense(updatedRow))
      },
      [dispatch]
    )

    const handleChangeCostName = useCallback(
      (record, field, value) => {
        updateIsSaveConfirmShowed(true)
        const parentRow = dataRef.current.find(
          row => row.key === record.parentKey
        )
        if (!parentRow) return

        const isUpdate = record.key.includes(
          OTHER_EXPENSES_KEYS.UPDATE_EXPENSE_COSTNAME
        )

        if (value !== null && value !== undefined && value.trim() !== '') {
          setListInvalid(prevErrors => ({
            ...prevErrors,
            [record.key]: {
              ...prevErrors[record.key],
              costName: !value,
            },
          }))
          setListDuplicated(prevErrors => {
            const newRowErrors = { ...prevErrors }
            delete newRowErrors[record.parentKey]
            return newRowErrors
          })
        }

        handleSave(
          {
            expenseCategoriesEnum: parentRow.expenseCategoriesEnum,
            totalExpenseValue: parentRow.totalExpenseValue,
            otherExpenseId: parentRow.otherExpenseId,
            categoriesDataList: [
              {
                key: record.key,
                otherExpenseId: record.otherExpenseId,
                parentKey: record.parentKey,
                costName: value.trim(),
              },
            ],
          },
          isUpdate
        )
      },
      [handleSave, updateIsSaveConfirmShowed]
    )

    const handleChangeRow = useCallback(
      (record, month, value) => {
        if (Number.isNaN(value) || value === null || value === undefined) return
        updateIsSaveConfirmShowed(true)

        const parentRow = dataRef.current.find(
          row => row.key === record.parentKey
        )
        if (!parentRow) return

        const { expenseCategoriesEnum, totalExpenseValue, otherExpenseId } =
          parentRow

        const isUpdate = record.key.includes(
          OTHER_EXPENSES_KEYS.UPDATE_EXPENSE_COSTNAME
        )
        handleSave(
          {
            expenseCategoriesEnum,
            totalExpenseValue,
            otherExpenseId,
            categoriesDataList: [
              {
                key: record.key,
                parentKey: record.parentKey,
                otherExpenseId: record.otherExpenseId,
                otherExpensesMonthlyDTO: {
                  [month]: {
                    ...record.otherExpensesMonthlyDTO[month],
                    value,
                  },
                },
              },
            ],
          },
          isUpdate
        )
      },
      [handleSave, updateIsSaveConfirmShowed]
    )

    const handleDeleteSubData = subRow => {
      if (!subRow) return
      updateIsSaveConfirmShowed(true)
      setListInvalid(prevErrors => {
        const newRowErrors = { ...prevErrors }
        delete newRowErrors[subRow.key]
        return newRowErrors
      })
      setData(prevRows =>
        prevRows.map(prevRow => {
          if (prevRow.key === subRow.parentKey) {
            return {
              ...prevRow,
              children: prevRow.children.filter(
                item => item.key !== subRow.key
              ),
            }
          }
          return prevRow
        })
      )
      if (subRow.key.includes(OTHER_EXPENSES_KEYS.UPDATE_EXPENSE_COSTNAME)) {
        dispatch(removeUpdateOtherExpense(subRow))
      } else dispatch(removeCreateOtherExpense(subRow))
    }

    useImperativeHandle(
      ref,
      () => ({
        validate,
      }),
      [listCreateOtherExpenses, listUpdateOtherExpenses, data, validate]
    )

    const validate = () => {
      let allValid = true
      if (!isExpandPanel) return allValid

      // Access fresh state from store, not cached useSelector value
      const latestState = store.getState().businessPlanDelivery
      const latestCreate =
        latestState.dataCreateRequest.listOtherExpensesTableData
      const latestUpdate =
        latestState.dataUpdateRequest.listOtherExpensesTableData

      const existedDatas = data.flatMap(row => row.children)

      const editingRows = [...latestCreate, ...latestUpdate].flatMap(
        row => row.categoriesDataList
      )
      const invalidList = editingRows.reduce((acc, row) => {
        if (row.hasOwnProperty('costName') && !row.costName) {
          if (!acc[row.key]) acc[row.key] = {}
          acc[row.key] = { costName: true }
          allValid = false
        }
        return acc
      }, {})
      const duplicateInvalidList = checkForDuplicateCostNames([
        ...existedDatas,
        ...editingRows,
      ])
      setListInvalid(invalidList)
      setListDuplicated(duplicateInvalidList)
      if (!allValid) {
        NotificationManager.error(VALIDATE_REQUIRED_FIELDS_MESSAGE)
        allValid = false
      }
      if (Object.keys(duplicateInvalidList).length) {
        NotificationManager.error(DUPLICATED_COSTNAMES_MESSAGE)
        allValid = false
      }
      return allValid
    }
    const checkForDuplicateCostNames = editingRows => {
      const costNameMap = {}
      const invalidList = {}

      editingRows.forEach(row => {
        if (row.costName) {
          const { parentKey, costName } = row
          if (!costNameMap[parentKey]) {
            costNameMap[parentKey] = {}
          }

          costNameMap[parentKey][costName] =
            (costNameMap[parentKey][costName] || 0) + 1
        }
      })
      const normalizeCostName = name =>
        name.trim().replace(/\s+/g, ' ').toLowerCase()
      // Check for duplicates in costName within the same parentKey
      Object.entries(costNameMap).forEach(([parentKey, names]) => {
        for (const [name, count] of Object.entries(names)) {
          if (count >= 2) {
            editingRows.forEach(row => {
              if (
                row.parentKey === parentKey &&
                normalizeCostName(row.costName) === normalizeCostName(name)
              ) {
                if (!invalidList[parentKey]) {
                  invalidList[parentKey] = {} // Create parentKey if it doesn't exist
                }
                invalidList[parentKey][row.key] = { costName: true } // Mark as invalid
              }
            })
          }
        }
      })

      return invalidList
    }

    const totalMonthValues = useMemo(() => {
      const monthlyTotals = {}
      dataListOtherExpenses.forEach(({ categoriesDataList }) => {
        if (categoriesDataList) {
          categoriesDataList.forEach(({ otherExpensesMonthlyDTO }) => {
            Object.entries(otherExpensesMonthlyDTO).forEach(
              ([month, { value }]) => {
                if (!monthlyTotals[month]) {
                  monthlyTotals[month] = 0
                }
                monthlyTotals[month] += value // Sum the values for each month
              }
            )
          })
        }
      })

      return monthlyTotals
    }, [dataListOtherExpenses])

    const totalMonthRow = useMemo(() => {
      return dataListOtherExpenses.reduce(
        (acc, { expenseCategoriesEnum, categoriesDataList }) => {
          if (categoriesDataList) {
            categoriesDataList.forEach(({ otherExpensesMonthlyDTO }) => {
              Object.entries(otherExpensesMonthlyDTO).forEach(
                ([month, { value }]) => {
                  acc[expenseCategoriesEnum] = acc[expenseCategoriesEnum] || {}
                  acc[expenseCategoriesEnum][month] =
                    (acc[expenseCategoriesEnum][month] || 0) + value
                }
              )
            })
          }
          return acc
        },
        {}
      )
    }, [dataListOtherExpenses])

    const calculatedMonthWidth = useMemo(() => {
      const monthWidth =
        labelMonthOtherExpenses.length > 0
          ? Math.max(
              (size.width -
                2 * OTHER_EXPENSE_TABLE_WIDTH.ACTION -
                OTHER_EXPENSE_TABLE_WIDTH.EXPENSE_CATEGORIES -
                OTHER_EXPENSE_TABLE_WIDTH.TOTAL_EXPENSE) /
                labelMonthOtherExpenses.length,
              OTHER_EXPENSE_TABLE_WIDTH.MONTH
            )
          : 0
      return monthWidth
    }, [size, labelMonthOtherExpenses])

    const columnsConfig = useCallback(
      (expandedKeys, toggleExpandedKeys) => {
        return [
          {
            title: '',
            fixed: 'left',
            children: [
              {
                title: (
                  <Icon
                    onClick={toggleExpandAll}
                    type="right"
                    style={{
                      fontSize: '12px',
                      cursor: 'pointer',
                      transform:
                        expandedKeys.length > 0
                          ? 'rotate(90deg)'
                          : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                ),
                dataIndex: 'expand',
                key: 'expand',
                width: OTHER_EXPENSE_TABLE_WIDTH.ACTION,
                render: (_, record) => {
                  return (
                    !record.parentKey && (
                      <Icon
                        onClick={() => toggleExpandedKeys(record.key)}
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
                    )
                  )
                },
              },
              {
                dataIndex: 'add',
                key: 'add',
                width: OTHER_EXPENSE_TABLE_WIDTH.ACTION,
                render: (_, record) =>
                  canEdit ? (
                    record.parentKey ? (
                      <Icon
                        type="minus-circle"
                        onClick={() => handleDeleteSubData(record)}
                      />
                    ) : (
                      <Icon
                        type="plus-circle"
                        onClick={() => handleAddSubTableRow(record)}
                      />
                    )
                  ) : (
                    <Tooltip
                      title={
                        duValueDelivery === 'All' || status === 'Draft'
                          ? REVIEWING_WARNING_MESSAGE
                          : ACTION_NOT_AVAILABLE_MESSAGE
                      }>
                      <StyledDisabledIcon
                        type={record.parentKey ? 'minus-circle' : 'plus-circle'}
                      />
                    </Tooltip>
                  ),
              },
            ],
          },
          {
            title: '',
            fixed: 'left',
            children: [
              {
                title: 'Expense categories',
                dataIndex: 'expenseCategoriesEnum',
                key: 'expenseCategoriesEnum',
                align: 'left',
                width: OTHER_EXPENSE_TABLE_WIDTH.EXPENSE_CATEGORIES,
                render: (_, record) => {
                  const isError =
                    (listInvalid[record.key] &&
                      listInvalid[record.key].costName) ||
                    (listDuplicated[record.parentKey] &&
                      listDuplicated[record.parentKey][record.key] &&
                      listDuplicated[record.parentKey][record.key].costName)
                  return record.parentKey ? (
                    canEdit ? (
                      <Input
                        className={isError ? 'input-error' : ''}
                        defaultValue={record.costName}
                        onBlur={e =>
                          handleChangeCostName(
                            record,
                            'costName',
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      record.costName
                    )
                  ) : (
                    record.expenseCategoriesEnum
                  )
                },
              },
            ],
          },
          {
            title: 'Total',
            ellipsis: true,
            key: 'total',
            align: 'center',
            fixed: 'left',
            children: [
              {
                title: 'Total expense value',
                dataIndex: 'totalExpenseValue',
                key: 'totalExpenseValue',
                align: 'center',
                width: OTHER_EXPENSE_TABLE_WIDTH.TOTAL_EXPENSE,
                render: text => (
                  <span title={formatFloatNumber(text)}>
                    {formatFloatNumber(text)}
                  </span>
                ),
              },
            ],
          },
          ...(labelMonthOtherExpenses.length > 0
            ? labelMonthOtherExpenses.map(date => {
                return {
                  title: (
                    <span
                      title={
                        totalMonthValues[date] &&
                        formatFloatNumber(totalMonthValues[date])
                      }>
                      {Number.isNaN(totalMonthValues[date]) ||
                      !totalMonthValues[date]
                        ? ''
                        : formatFloatNumber(totalMonthValues[date])}
                    </span>
                  ),
                  ellipsis: true,
                  align: 'center',
                  children: [
                    {
                      title: date,
                      dataIndex: ['otherExpensesMonthlyDTO', date],
                      key: date,
                      align: 'center',
                      ellipsis: true,
                      width: calculatedMonthWidth,
                      render: (_, record) => {
                        const defaultValue =
                          (record.parentKey &&
                            record.otherExpensesMonthlyDTO &&
                            record.otherExpensesMonthlyDTO[date] &&
                            record.otherExpensesMonthlyDTO[date].value) ||
                          ''
                        const totalMonth =
                          (totalMonthRow &&
                            totalMonthRow[record.key] &&
                            formatFloatNumber(
                              totalMonthRow[record.key][date]
                            )) ||
                          ''
                        return (
                          (record.parentKey &&
                            (canEdit ? (
                              <StyledInputNumber
                                style={{ width: '100%', maxWidth: '150px' }}
                                defaultValue={defaultValue}
                                formatter={formatInputNumber}
                                parser={parseInputNumber}
                                onBlur={e => {
                                  const val = parseInputNumber(e.target.value)
                                  handleChangeRow(record, date, val)
                                }}
                              />
                            ) : (
                              <span title={formatFloatNumber(defaultValue)}>
                                {formatFloatNumber(defaultValue)}
                              </span>
                            ))) || <span title={totalMonth}>{totalMonth}</span>
                        )
                      },
                    },
                  ],
                }
              })
            : [
                {
                  title: '',
                  key: 'empty',
                },
              ]),
        ]
      },
      [
        data,
        canEdit,
        listInvalid,
        listDuplicated,
        labelMonthOtherExpenses,
        totalMonthValues,
        totalMonthRow,
        handleChangeCostName,
        handleChangeRow,
        duValueDelivery,
        handleAddSubTableRow,
        handleDeleteSubData,
        status,
        toggleExpandAll,
        calculatedMonthWidth,
      ]
    )

    return (
      <div ref={containerRef}>
        <Table
          className="other-expenses-table"
          rowClassName={record =>
            record.parentKey ? 'other-expenses-sub-row' : 'other-expenses-row'
          }
          columns={columnsConfig(expandedKeys, toggleExpandedKeys)}
          onExpand={(expanded, record) => {
            const keys = expanded
              ? [...expandedKeys, record.key]
              : expandedKeys.filter(key => key !== record.key)
            setExpandedKeys(keys)
          }}
          expandedRowKeys={expandedKeys}
          expandIconColumnIndex={-1}
          expandIconAsCell={false}
          dataSource={data}
          pagination={false}
          scroll={{
            x: 'max-content',
            y: 400,
          }}
          loading={getOtherExpensesTableLoading}
        />
      </div>
    )
  }
)

export default memo(OtherExpensesTable)
