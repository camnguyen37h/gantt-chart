import {
  Col,
  Icon,
  Input,
  Radio,
  Row,
  Table,
  Tooltip
} from "antd"
import {
  forwardRef,
  Fragment,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react"
import {
  ACTION_NOT_AVAILABLE_MESSAGE,
  DUPLICATED_COSTNAMES_OVERTIME_MESSAGE,
  OTHER_EXPENSE_TABLE_WIDTH,
  OVERTIME_ENUM,
  OVERTIME_EXPENSES_KEYS,
  OVERTIME_VIEW_TYPE,
  REVIEWING_WARNING_MESSAGE,
  TOTAL_OVERTIME_VALUE_TOOLTIP,
  VALIDATE_REQUIRED_FIELDS_MESSAGE
} from "./constants"
import { useDispatch, useSelector, useStore } from "react-redux"
import { ALL_OPTION_VALUE } from "../../constants"
import { isNaN, uniqueId } from "lodash"
import PropTypes from "prop-types"
import {
  addNewOvertimeItem,
  getOvertimeData,
  removeOvertimeItem,
  setIsSaveShowedDeliveryPlan,
  updateExistedOvertimeItem
} from "../../redux"
import { StyledDisabledIcon, StyledInputNumber } from "./styled"
import { formatFloatNumber } from "../../../utils/format-utils/ConvertNumber"
import { parseInputNumberMM } from "../../utils"
import { statusBusinessPlanDetail } from "../constant"
import { useBusinessPlanDetails } from "../../hooks"
import { formatterMMValues, parserMMValues } from "./utils"
import { NotificationManager } from "react-notifications"
import { useElementSize } from "../../../../hooks"

const TextSkeleton = ({ width = 100 }) => (
  <span
    style={{
      display: 'inline-block',
      width,
      height: 14,
      borderRadius: 4,
      background: 'linear-gradient(90deg, #eee, #f5f5f5, #eee)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite'
    }}
  />
);

const Overtime = forwardRef(
  (
    {
      isExpandPanel,
      buId,
      deliveryUnitDataDelivery,
      canEdit,
      canView
    },
    ref
  ) => {
    const dispatch = useDispatch()
    const prevBuIdRef = useRef(buId)
    const dataRef = useRef([])

    const {
      getOvertimeDataLoading,
      dataListOvertime,
      labelMonthOvertime,
      averageEachResource,
      duValueDelivery,
      isSaveShowedDeliveryPlan
    } = useSelector(state => state.businessPlanDelivery)
    const { status } = useBusinessPlanDetails()
    const store = useStore()

    const { containerRef, size } = useElementSize()
    const [valueRadio, setValueRadio] = useState(OVERTIME_VIEW_TYPE.HEAD_COUNT)
    const [listInvalid, setListInvalid] = useState([])
    const [listDuplicated, setListDuplicated] = useState({})
    const [data, setData] = useState([])

    useEffect(() => {
      dataRef.current = data
    }, [data])

    const calculateTotalExpenseRow = useCallback(
      otherExpensesMonthlyDTO => {
        let total = 0
        Object.values(otherExpensesMonthlyDTO).forEach(({ valueMM }) => {
          total += valueMM || 0
        })
        return total
      }, []
    )

    const updateListDuplicate = useCallback(
      record => {
        setListDuplicated(prev => {
          Object.keys(prev).forEach(valueCostName => {

            if (prev[valueCostName] && prev[valueCostName].includes(record.key)) {
              prev[valueCostName] = prev[valueCostName].filter(v => v !== record.key);
              if (prev[valueCostName].length <= 1) delete prev[valueCostName];
            }
          });
          return prev
        })
      },
      []
    )



    const validate = useCallback(() => {
      if (!isExpandPanel) return true

      const latestState = store.getState().businessPlanDelivery;
      const editingRows = [
        ...latestState.dataCreateRequest.listOtherExpensesTableData,
        ...latestState.dataUpdateRequest.listOtherExpensesTableData,
      ]
        .filter(item => item.expenseCategoriesEnum === OVERTIME_ENUM)
        .flatMap(item => item.categoriesDataList);

      const invalidList = checkInvalidList(editingRows)

      const duplicateInvalidList = checkForDuplicateCostNames([
        ...data,
        ...editingRows,
      ])

      setListInvalid(invalidList)
      setListDuplicated(duplicateInvalidList)

      if (invalidList.length > 0) {
        NotificationManager.error(VALIDATE_REQUIRED_FIELDS_MESSAGE)
      }
      if (Object.keys(duplicateInvalidList).length) {
        NotificationManager.error(DUPLICATED_COSTNAMES_OVERTIME_MESSAGE)
      }
      return invalidList.length === 0 && Object.keys(duplicateInvalidList).length === 0
    }, [isExpandPanel, store, data, setListInvalid, setListDuplicated])

    useImperativeHandle(
      ref,
      () => ({
        validate,
      }),
      [validate]
    )

    useEffect(() => {
      const isVersionChanged = prevBuIdRef.current !== buId
      prevBuIdRef.current = buId

      if (
        !isExpandPanel
        || !deliveryUnitDataDelivery
        || (
          isVersionChanged && deliveryUnitDataDelivery.groupName !== ALL_OPTION_VALUE
        )
      ) return
      setData([])

      dispatch(getOvertimeData({
        deliveryUnit:
          deliveryUnitDataDelivery.groupName === ALL_OPTION_VALUE
            ? undefined
            : deliveryUnitDataDelivery.groupName,
        businessPlanVersionId: Number(buId),
        pageNum: 1,
        pageSize: 10,
      }))
    }, [
      valueRadio, // get data again when change valueRadio
      deliveryUnitDataDelivery,
      buId,
      isExpandPanel,
      dispatch,
    ])

    useEffect(() => {
      if (dataListOvertime.length === 0) {
        setData([])
        return
      }
      setData(
        dataListOvertime.map(item => ({
          key: item.otherExpenseId,
          ...item,
          totalExpenseValueMM: item.otherExpensesMonthlyDTO && calculateTotalExpenseRow(item.otherExpensesMonthlyDTO),
        }))
      )
    }, [dataListOvertime, calculateTotalExpenseRow])



    const checkInvalidList = (editingRows = []) => {
      return editingRows.reduce((acc, row) => {
        if (
          row.hasOwnProperty('costName')
          && (row['costName'] === '' || row['costName'] === null || row['costName'] === undefined)
          && !acc.includes(row.key)
        )
          acc.push(row.key)
        return acc
      }, []) || []
    }

    const checkForDuplicateCostNames = editingRows => {
      const normalizeCostName = (value = '') => {
        return value
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ');
      }

      const grouped = Object.fromEntries(
        Object.entries(
          editingRows.reduce((acc, item) => {

            if (!item.costName || !item.costName.trim()) return acc;
            const k = normalizeCostName(item.costName);
            if (!acc[k]) {
              acc[k] = new Set();
            }
            acc[k].add(item.key);
            return acc;
          }, {})
        )
          .filter(([, set]) => set.size >= 2)
          .map(([k, set]) => [k, [...set]])
      );

      return grouped
    }

    const totalMonthValues = useMemo(
      () => {
        const monthlyTotalHeadcount = {}
        const monthlyTotalOTCost = {}
        const total = {
          [OVERTIME_VIEW_TYPE.HEAD_COUNT]: 0,
          [OVERTIME_VIEW_TYPE.OT_COST]: 0
        }
        dataListOvertime.forEach(({ otherExpensesMonthlyDTO }) => {
          Object.entries(otherExpensesMonthlyDTO).forEach(
            ([month, { value, valueMM }]) => {
              if (!monthlyTotalHeadcount[month]) {
                monthlyTotalHeadcount[month] = 0
              }
              if (!monthlyTotalOTCost[month]) {
                monthlyTotalOTCost[month] = 0
              }

              monthlyTotalHeadcount[month] += valueMM
              monthlyTotalOTCost[month] += value
              total[OVERTIME_VIEW_TYPE.HEAD_COUNT] += valueMM
              total[OVERTIME_VIEW_TYPE.OT_COST] += value
            }
          )
        })
        return {
          [OVERTIME_VIEW_TYPE.HEAD_COUNT]: monthlyTotalHeadcount,
          [OVERTIME_VIEW_TYPE.OT_COST]: monthlyTotalOTCost,
          total
        }
      },
      [dataListOvertime]
    )

    const calculatedMonthWidth = useMemo(
      () => {
        const monthWidth =
          labelMonthOvertime.length > 0
          && Math.max(
            (size.width -
              OTHER_EXPENSE_TABLE_WIDTH.ACTION -
              OTHER_EXPENSE_TABLE_WIDTH.EXPENSE_CATEGORIES -
              OTHER_EXPENSE_TABLE_WIDTH.TOTAL_EXPENSE) /
            labelMonthOvertime.length,
            OTHER_EXPENSE_TABLE_WIDTH.MONTH
          )
        return monthWidth
      },
      [size, labelMonthOvertime]
    )

    const isHeadcountTab = valueRadio === OVERTIME_VIEW_TYPE.HEAD_COUNT
    const formatValue = (value) => isHeadcountTab ? formatFloatNumber(value, 0, 6) : formatFloatNumber(value, 0, 2)

    const onChangeRadio = ({ target: { value } }) => {
      setValueRadio(value)
    }

    const handleAddOvertimeItem = () => {
      updateIsSaveConfirmShowed(true)

      const newKey = uniqueId(`${OVERTIME_EXPENSES_KEYS.NEW_OVERTIME_COSTNAME}-`)

      const newItem = {
        costName: '',
        key: newKey,
        otherExpenseId: null,
        otherExpensesMonthlyDTO: {},
        totalExpenseValueMM: 0,
      }

      setData(prev => [newItem, ...prev])
      dispatch(addNewOvertimeItem(newItem))
    }

    const handleRemoveOvertimeItem = (record) => {
      updateIsSaveConfirmShowed(true)

      setData(prev => prev.filter(item => item.key !== record.key))

      dispatch(removeOvertimeItem(record))
    }



    const updateIsSaveConfirmShowed = useCallback(
      value => {
        return dispatch(setIsSaveShowedDeliveryPlan(value))
      },
      [dispatch]
    )



    const handleSave = useCallback(
      (updatedRow, isUpdate) => {
        if (isUpdate) {
          dispatch(updateExistedOvertimeItem(updatedRow))
        } else {
          dispatch(addNewOvertimeItem(updatedRow))
        }
      },
      [dispatch]
    )

    const handleChangeCostName = useCallback((record, value) => {
      updateIsSaveConfirmShowed(true)

      const currentRow = dataRef.current.find(row => row.key === record.key)
      if (!currentRow) return

      const isUpdate = !!record.otherExpenseId

      if (value !== null && value !== undefined && value.trim() !== '') {
        setListInvalid(prev => prev.filter(item => item !== record.key))
        updateListDuplicate(record)
      }

      handleSave(
        {
          key: record.key,
          costName: value.trim(),
          otherExpenseId: record.otherExpenseId,
        },
        isUpdate
      )
    }, [updateIsSaveConfirmShowed, updateListDuplicate, handleSave])

    const handleChangeExpenseValue = useCallback((record, month, value) => {
      if (Number.isNaN(value) || value === null || value === undefined) return
      updateIsSaveConfirmShowed(true)

      const currentRow = dataRef.current.find(row => row.key === record.key)
      if (!currentRow) return

      const isUpdate = !!record.otherExpenseId

      handleSave(
        {
          key: record.key,
          otherExpenseId: record.otherExpenseId,
          otherExpensesMonthlyDTO: {
            [month]: {
              ...record.otherExpensesMonthlyDTO[month],
              valueMM: value,
            },
          },
        },
        isUpdate
      )
    }, [handleSave, updateIsSaveConfirmShowed])

    const columnsConfig = useCallback(
      (valueRadio) => {
        return [
          ...(isHeadcountTab ? [{
            key: 'action',
            fixed: 'left',
            align: 'center',
            children: [
              {
                title: canEdit ? (
                  <Icon
                    style={{ top: 2, position: 'relative' }}
                    type="plus-circle"
                    onClick={() => handleAddOvertimeItem()}
                  />
                ) : (
                  <Tooltip
                    title={
                      duValueDelivery === ALL_OPTION_VALUE || status === statusBusinessPlanDetail.draft
                        ? REVIEWING_WARNING_MESSAGE
                        : ACTION_NOT_AVAILABLE_MESSAGE
                    }
                  >
                    <StyledDisabledIcon type="plus-circle" />
                  </Tooltip>
                ),
                align: 'center',
                key: 'action',
                fixed: 'left',
                width: OTHER_EXPENSE_TABLE_WIDTH.ACTION,
                render: (_, record) => canEdit ? (
                  <Icon
                    type="minus-circle"
                    onClick={() => handleRemoveOvertimeItem(record)}
                  />
                ) : (
                  <Tooltip
                    title={
                      duValueDelivery === ALL_OPTION_VALUE || status === statusBusinessPlanDetail.draft
                        ? REVIEWING_WARNING_MESSAGE
                        : ACTION_NOT_AVAILABLE_MESSAGE
                    }
                  >
                    <StyledDisabledIcon type="minus-circle" />
                  </Tooltip>
                ),
              }
            ]
          }] : []),
          {
            title: 'Total',
            fixed: 'left',
            key: 'otherExpenseTotal',
            children: [
              {
                title: 'Overtime Expenses',
                dataIndex: 'costName',
                fixed: 'left',
                align: 'left',
                width: OTHER_EXPENSE_TABLE_WIDTH.EXPENSE_CATEGORIES,
                render: (_, record) => {
                  const isError =
                    (listInvalid.length > 0 &&
                      listInvalid.includes(record.key)) ||
                    (listDuplicated &&
                      Object.values(listDuplicated).some(arr => arr.includes(record.key)))

                  return (
                    canEdit
                    && isHeadcountTab
                  ) ? (
                    <Input
                      className={isError ? 'input-error' : ''}
                      defaultValue={record.costName}
                      onBlur={e =>
                        handleChangeCostName(record, e.target.value)
                      }
                    />
                  ) : (
                    record.costName
                  )
                }
              },
            ]
          },
          {
            title: getOvertimeDataLoading
              ? <TextSkeleton />
              : (
                <span
                  title={formatValue(totalMonthValues.total[valueRadio])}
                >
                  {formatValue(totalMonthValues.total[valueRadio])}
                </span>
              ),
            fixed: 'left',
            key: 'total',
            align: 'center',
            children: [
              {
                title: (
                  <div className="d-flex align-items-center gap-8">
                    <span>Total value</span>
                  </div>
                ),
                dataIndex: isHeadcountTab
                  ? 'totalExpenseValueMM'
                  : 'totalExpenseValue',
                fixed: 'left',
                align: 'center',
                width: OTHER_EXPENSE_TABLE_WIDTH.TOTAL_EXPENSE,
                render: text => {
                  const displayValue = formatValue(text)

                  return (
                    <span title={displayValue}>
                      {displayValue}
                    </span>
                  )
                },
              }
            ]
          },
          ...(
            labelMonthOvertime.length > 0
              ? labelMonthOvertime.map(
                (item, index) => {

                  const valueTitleMonth = totalMonthValues[valueRadio][item];
                  const displayValueTitleMonth =
                    isNaN(valueTitleMonth) || !valueTitleMonth
                      ? ''
                      : formatValue(valueTitleMonth)

                  return {
                    title: getOvertimeDataLoading
                    ? <TextSkeleton />
                    : (
                      <span title={displayValueTitleMonth}>
                        {displayValueTitleMonth}
                      </span>
                    ),
                    align: 'center',
                    ellipsis: true,
                    children: [
                      {
                        title: item,
                        dataIndex: ['otherExpensesMonthlyDTO', item],
                        align: 'center',
                        ellipsis: true,
                        width: calculatedMonthWidth,
                        render: (_, record) => {
                          const displayField = isHeadcountTab
                            ? 'valueMM'
                            : 'value'

                          const defaultValue = (record.otherExpensesMonthlyDTO
                            && record.otherExpensesMonthlyDTO[item]
                            && record.otherExpensesMonthlyDTO[item][displayField])
                            || ''

                          const displayValue = formatValue(defaultValue)

                          return canEdit && isHeadcountTab
                            ? (
                              <StyledInputNumber
                                style={{ width: '100%', maxWidth: '150px' }}
                                defaultValue={defaultValue}
                                formatter={formatterMMValues}
                                parser={parserMMValues}
                                onBlur={e => {
                                  const val = parseInputNumberMM(e.target.value);
                                  handleChangeExpenseValue(record, item, val);
                                }}
                              />
                            ) : (
                              <span title={displayValue}>
                                {displayValue}
                              </span>
                            )
                        }
                      }
                    ]
                  }
                }
              )
              : []
          )
        ]
      },
      [
        data,
        canEdit,
        status,
        listInvalid,
        listDuplicated,
        duValueDelivery,
        labelMonthOvertime,
        totalMonthValues,
        isHeadcountTab,
        calculatedMonthWidth,
        formatValue,
        getOvertimeDataLoading,
        handleAddOvertimeItem,
        handleChangeCostName,
        handleChangeExpenseValue,
        handleRemoveOvertimeItem
      ]
    )



    return (
      <Fragment>
        <Row className="d-flex align-items-center">
          {
            getOvertimeDataLoading ? (
              <Col span={12}>
                <TextSkeleton
                  width={500}
                />
              </Col>
            ) : (
              <Fragment>
                <Col span={5}>
                  OT Unit Cost
                </Col>
                <Col span={1} type="flex" align="middle">
                  <Tooltip
                    overlayStyle={{ maxWidth: 460 }}
                    title={
                      TOTAL_OVERTIME_VALUE_TOOLTIP
                    }
                  >
                    <Icon
                      type="question-circle"
                      style={{ cursor: 'pointer', padding: '4px' }}
                    />
                  </Tooltip>
                </Col>
                <Col span={6}>
                    <div style={{ textAlign: 'left' }}>
                      {Number.isNaN(averageEachResource)
                        ? ''
                        : formatFloatNumber(averageEachResource, 0, 3)}
                    </div>
                </Col>
              </Fragment>
            )
          }
          <Col span={12} style={{ textAlign: "end" }}>
            <Radio.Group
              onChange={onChangeRadio}
              defaultValue={valueRadio}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value={OVERTIME_VIEW_TYPE.HEAD_COUNT}>
                Head count
              </Radio.Button>
              <Radio.Button
                value={OVERTIME_VIEW_TYPE.OT_COST}
                disabled={
                  isHeadcountTab &&
                  isSaveShowedDeliveryPlan
                }
              >
                OT cost
              </Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div ref={containerRef}>
              <Table
                className="overtime-table"
                columns={columnsConfig(valueRadio)}
                dataSource={data}
                pagination={false}
                scroll={{
                  x: 'max-content',
                  y: 400,
                }}
                loading={getOvertimeDataLoading}
              />
            </div>
          </Col>
        </Row>
      </Fragment>
    )
  }
)

export default memo(Overtime)

Overtime.propTypes = {
  buId: PropTypes.string,
  isExpandPanel: PropTypes.bool.isRequired,
  deliveryUnitDataDelivery: PropTypes.object,
  canEdit: PropTypes.bool,
  canView: PropTypes.bool,
}

TextSkeleton.propTypes = {
  width: PropTypes.number,
}