import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  memo,
  useMemo,
} from 'react'
import {
  Table,
  Button,
  InputNumber,
  Icon,
  Select,
  Popover,
  Tooltip,
  Spin,
  Dropdown,
  Input,
  Menu,
} from 'antd'
import { cloneDeep, debounce, set, uniqueId, isEqual } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import {
  getListResource,
  setIsSaveShowedDeliveryPlan,
  setListIdToDeleteResourceInformation,
  setListResource,
  addOrUpdateCreateResource,
  addOrUpdateUpdateResource,
  removeCreateOrUpdateResourceInformation,
  getEmployeePosition,
} from '../../../redux'
import BUSINESS_PLAN_API from '../../../../service/api/businessPlan'
import { ResponseStatusCode } from '../../../../service/constant'
import Request from '../../../..//service/request'
import { NotificationManager } from 'react-notifications'
import Decimal from 'decimal.js'
import { formatFloatNumber } from '../../../../utils/format-utils/ConvertNumber'
import { formatInputNumber, parseInputNumber } from '../../../utils'
import styled from 'styled-components'
import { formatterMMValues, parserMMValues } from '../utils'
import { v4 as uuid } from 'uuid'
import {
  DU_MEMBER_WARNING_MESSAGE,
  RESOURCE_REFERENCE_TYPE_ENUM,
  RESOURCE_TABLE_WIDTH,
  RESOURCE_TYPE_ENUM,
  RESOURCE_TYPE_TOOLTIP,
  RESOURCES_KEYS,
  REVIEWING_WARNING_MESSAGE,
  VALIDATE_REQUIRED_FIELDS_MESSAGE,
} from '../constants'
import moment from 'moment'

const { Option } = Select

const StyledInputNumber = styled(InputNumber)`
  .ant-input-number-handler-wrap {
    display: none;
  }
`
const StyledWarningDiv = styled.div`
  background-color: #e5d166;
  width: 100%;
  height: 100%;
  line-height: 50px;
  position: relative;
  z-index: 1;
  cursor: default;
`
const StyledDisabledIcon = styled(Icon)`
  svg {
    color: #d9d9d9;
    cursor: not-allowed;
  }
`
const PAGE_SIZE = 20
const PAGE_NUMBER = 1

const EditableCell = ({
  editable,
  dataIndex,
  record,
  handleSave,
  children,
  canEdit,
  isInvalid,
  updateListInvalid,
  updateIsSaveShowed,
  ...restProps
}) => {
  const dispatch = useDispatch()
  const [loadingListResource, setLoadingListResource] = useState(false)
  const { listResource } = useSelector(state => state.businessPlanDelivery)

  const saveRow = useCallback(
    row => {
      handleSave({
        key: record.key,
        deliveryMemberId: record.deliveryMemberId,
        ...row,
      })
      updateIsSaveShowed(true)
    },
    [handleSave, record, updateIsSaveShowed]
  )

  const handleInput = useCallback(
    debounce(value => {
      value && updateListInvalid(dataIndex, value, record.key)
      saveRow({ [dataIndex]: value, ldap: value })
    }, 350),
    [updateListInvalid, saveRow]
  )

  const renderSelectUser = useCallback(() => {
    const handleSearchDebounced = debounce(async value => {
      if (value) {
        setLoadingListResource(true)
        await dispatch(getListResource({ name: value.toString().trim() }))
        setLoadingListResource(false)
      }
    }, 800)

    const handleChangedSelect = value => {
      if (!value) {
        saveRow({ [dataIndex]: '', ldap: '' })
        return
      }
      const user = listResource.find(item => item.value === value) || {}

      value && updateListInvalid(dataIndex, value, record.key)
      value &&
        user.location &&
        updateListInvalid('location', user.location, record.key)
      value &&
        user.employeeType &&
        updateListInvalid('employeeType', user.employeeType, record.key)

      saveRow({
        [dataIndex]: value,
        ldap: value,
        userId: user.id,
        location: user.location,
        employeeType: user.employeeType,
        groupId: user.groupId,
      })
    }

    return (
      <Select
        style={{ width: '100%' }}
        className={isInvalid ? 'select-error' : ''}
        showSearch
        allowClear={true}
        filterOption={false}
        value={record[dataIndex] || undefined}
        placeholder="Enter LDAP or Full Name"
        onBlur={() => dispatch(setListResource([]))}
        notFoundContent={loadingListResource && <Spin size="small" />}
        onChange={handleChangedSelect}
        onSearch={handleSearchDebounced}
        disabled={!record['resourceType']}>
        {listResource.length > 0 &&
          listResource.map(item => (
            <Option value={item.value} key={uuid()}>
              <span title={item.name}>{item.name}</span>
            </Option>
          ))}
      </Select>
    )
  }, [
    dataIndex,
    record,
    listResource,
    loadingListResource,
    saveRow,
    isInvalid,
    updateListInvalid,
  ])

  const renderInputGenericResource = useCallback(() => {
    return (
      <Input
        style={{ width: '100%' }}
        placeholder="Enter LDAP or Full Name"
        className={isInvalid ? 'input-error' : ''}
        defaultValue={record[dataIndex]}
        onChange={e => handleInput(e.target.value)}
      />
    )
  }, [record, dataIndex, isInvalid, handleInput])
  return (
    <td {...restProps}>
      {editable
        ? record['resourceType'] === RESOURCE_TYPE_ENUM.GENERIC_RESOURCE
          ? renderInputGenericResource()
          : renderSelectUser()
        : children}
    </td>
  )
}

const HeadCountTable = forwardRef((props, ref) => {
  const { buId, deliveryUnit, mainColumns, canEdit, isExpandPanel, mvv } = props

  const {
    listResourceType,
    listLocation,
    listPosition,
    listRole,
    listEmployeeType,
    dataResourcesInformation,
    loadingDataResourcesInformation,
    resourceInfoTableParams,
    listLocationExchangeRateData,
    loadDataFromValue,
    errorDataSubmitDeliveryPlan,
    summaryDeliveryPlan,
  } = useSelector(state => state.businessPlanDelivery)
  const dispatch = useDispatch()

  const [data, setData] = useState([])
  const [expandedKeys, setExpandedKeys] = useState([])
  const [listInvalid, setListInvalid] = useState({})
  const [hasMore, setHasMore] = useState(true)
  const [pageNum, setPageNum] = useState(PAGE_NUMBER)
  const [loadingTable, setLoadingTable] = useState(false)
  const [loadingExpandedRow, setLoadingExpandedRow] = useState({})
  const [loadingGetPosition, setLoadingGetPosition] = useState(null)
  const [titleRowTotal, setTitleRowTotal] = useState('')
  const [exchangeRates, setExchangeRates] = useState({})
  const [keyReset, setKeyReset] = useState(0)
  const [countGenericResource, setCountGenericResource] = useState(1)

  const fieldsToValidate = [
    'resourceType',
    'location',
    'employeeType',
    'position',
    'role',
  ]

  useImperativeHandle(
    ref,
    () => ({
      validate,
    }),
    [data]
  )

  const validate = () => {
    const errors = {}
    let isValid = true

    data.forEach(row => {
      let rowErrors = {}
      fieldsToValidate.forEach(field => {
        if (!row[field]) {
          rowErrors[field] = true
          isValid = false
        }
      })

      if (
        row.originalGrossSalary === null ||
        row.originalGrossSalary === '' ||
        row.originalGrossSalary === undefined
      ) {
        rowErrors = { ...rowErrors, originalGrossSalary: true }
        isValid = false
      }
      if (!row.resourceFullName) {
        rowErrors = { ...rowErrors, resourceFullName: true }
        isValid = false
      }
      if (Object.keys(rowErrors).length > 0) {
        errors[row.key] = rowErrors
      }
    })

    setListInvalid(errors)
    if (!isValid) {
      NotificationManager.error(VALIDATE_REQUIRED_FIELDS_MESSAGE)
    }
    return isValid
  }

  const updateIsSaveShowed = useCallback(
    value => {
      dispatch(setIsSaveShowedDeliveryPlan(value))
    },
    [dispatch]
  )

  useEffect(() => {
    if (
      !dataResourcesInformation ||
      !dataResourcesInformation.deliveryPlanByHeadCountList
    ) {
      setData([])
      return
    }
    const listError =
      (errorDataSubmitDeliveryPlan && errorDataSubmitDeliveryPlan.data) || []
    const dataWithKeys = dataResourcesInformation.deliveryPlanByHeadCountList
      ? dataResourcesInformation.deliveryPlanByHeadCountList.map(item => {
          const key = uniqueId(
            `${
              item.deliveryMemberId
                ? RESOURCES_KEYS.DELIVERY_MEMBER
                : RESOURCES_KEYS.NEW_DELIVERY_MEMBER
            }-${item.deliveryMemberId}-`
          )
          // if data is from load data from => move it into dataCreateRequest
          if (!item.deliveryMemberId) {
            const { budgetMMValue, role, ...restValue } = item
            updateRow({
              key,
              ...restValue,
              role: role ? role : 'Member',
            })
          }

          if (
            item.resourceType === RESOURCE_TYPE_ENUM.GENERIC_RESOURCE &&
            item.resourceFullName.includes(RESOURCE_TYPE_ENUM.RESOURCE)
          ) {
            setCountGenericResource(prev => prev + 1)
          }

          listError.forEach(error => {
            if (
              +error.groupId === +deliveryUnit.groupId &&
              error.deliveryMemberId === item.deliveryMemberId
            ) {
              error.missingRequiredFields.forEach(field => {
                updateListInvalid(field, '', key)
              })
            }
          })

          return {
            ...item,
            key,
            role: !item.deliveryMemberId ? 'Member' : item.role,
            children: RESOURCE_REFERENCE_TYPE_ENUM.map(type => ({
              key: `${key}-${type}`,
              parentKey: key,
              resourceType: type,
              rowTotal: '',
              budgetMMValueDTO: {},
            })),
          }
        })
      : []
    setTitleRowTotal(
      dataResourcesInformation.deliveryPlanByHeadCountList.reduce(
        (sum, item) => sum + Number(item.rowTotal || 0),
        0
      )
    )
    setHasMore(true)
    setPageNum(PAGE_NUMBER)
    setData(dataWithKeys)
    setExpandedKeys([])
  }, [dataResourcesInformation, errorDataSubmitDeliveryPlan])

  useEffect(() => {
    setExchangeRates(
      !listLocationExchangeRateData
        ? {}
        : listLocationExchangeRateData.reduce(
            (acc, { location, exchangeRate }) => {
              acc[location] = exchangeRate
              return acc
            },
            {}
          )
    )
  }, [listLocationExchangeRateData])

  useEffect(() => {
    const tableBody = document.querySelector(
      '.head-count-table .ant-table-body'
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
        !loadingTable
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

    const result = await Request(
      BUSINESS_PLAN_API.getResourcesInformationDeliveryPlan,
      {
        ...resourceInfoTableParams,
        businessPlanVersionId: Number(buId),
        deliveryUnit: deliveryUnit.groupName || '',
        pageNum: pageNum,
        pageSize: PAGE_SIZE,
      }
    )

    if (result.status === ResponseStatusCode.success) {
      setData(prevData => {
        const newData = [
          ...prevData,
          ...result.data.body.deliveryPlanByHeadCountList.map(item => {
            const key = uniqueId(
              `${
                item.deliveryMemberId
                  ? RESOURCES_KEYS.DELIVERY_MEMBER
                  : RESOURCES_KEYS.NEW_DELIVERY_MEMBER
              }-${item.deliveryMemberId}-`
            )
            return {
              ...item,
              key,
              children: RESOURCE_REFERENCE_TYPE_ENUM.map(type => ({
                key: `${key}-${type}`,
                parentKey: key,
                resourceType: type,
                rowTotal: '',
                budgetMMValueDTO: {},
              })),
            }
          }),
        ]
        return newData
      })
      setExpandedKeys([])
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

  const renderCommonSelect = (record, value, dataIndex) => {
    const selectOptions = renderOptions(dataIndex)
    const error = listInvalid[record.key] && listInvalid[record.key][dataIndex]

    return (
      <Select
        className={error ? 'select-error' : ''}
        style={{ width: '100%' }}
        showSearch
        value={value}
        onChange={value =>
          handleSelectChange(record, record.deliveryMemberId, dataIndex, value)
        }
        optionFilterProp="value"
        filterOption={(input, option) =>
          option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }>
        {selectOptions.map(option => (
          <Option value={option.name} key={`${option.name}-${option.id}`}>
            <span title={option.name}>{option.name}</span>
          </Option>
        ))}
      </Select>
    )
  }

  const updateListInvalid = useCallback((field, value, rowKey) => {
    setListInvalid(prev => ({
      ...prev,
      [rowKey]: {
        ...prev[rowKey],
        [field]: !value,
      },
    }))
  }, [])

  const calculateGrossSalary = useCallback(
    (originalSalary, location) => {
      const exchangeRate = exchangeRates[location]

      if (!exchangeRate || !originalSalary) return 0
      const salary = new Decimal(originalSalary)
      const rate = new Decimal(exchangeRate)
      return salary.mul(rate).toNumber()
    },
    [exchangeRates]
  )

  const renderOptions = field => {
    switch (field) {
      case 'resourceType':
        return listResourceType
      case 'location':
        return listLocation
      case 'employeeType':
        return listEmployeeType
      case 'position':
        return listPosition
      case 'role':
        return listRole
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

  const fetchEmployeePosition = useCallback(
    async (key, value) => {
      try {
        setLoadingGetPosition(key)
        await dispatch(getEmployeePosition({ name: value, mvv }))
      } catch (error) {
        NotificationManager.error(error)
      } finally {
        setLoadingGetPosition(null)
      }
    },
    [mvv, dispatch]
  )

  const columnsConfig = useCallback(() => {
    if (!listLocationExchangeRateData) return
    const isLoading = Object.values(loadingExpandedRow).some(
      value => value === true
    )

    const columns = [
      {
        key: 'warningColumn',
        fixed: 'left',
        title: '',
        width: RESOURCE_TABLE_WIDTH.WARNING,
        align: 'center',
        className: 'head-count-warning-column',
        render: (_, record) =>
          !record.parentKey &&
          (record.groupId !== Number(deliveryUnit.groupId) || !record.userId) &&
          record.resourceType === RESOURCE_TYPE_ENUM.USER && (
            <Tooltip placement="right" title={DU_MEMBER_WARNING_MESSAGE}>
              <StyledWarningDiv>&nbsp;</StyledWarningDiv>
            </Tooltip>
          ),
      },
      {
        title: '',
        key: 'action-columns',
        fixed: 'left',
        children: [
          {
            title: (
              <Icon
                onClick={toggleExpandAll}
                type="right"
                style={{
                  fontSize: '12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transform:
                    expandedKeys.length > 0 ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
              />
            ),
            key: 'expand',
            align: 'center',
            width: RESOURCE_TABLE_WIDTH.ACTION,
          },
          {
            title: canEdit ? (
              <Icon
                type="plus-circle"
                onClick={() => handleAddResourceType()}
              />
            ) : (
              <Tooltip title={REVIEWING_WARNING_MESSAGE}>
                <StyledDisabledIcon type="plus-circle" />
              </Tooltip>
            ),
            key: 'add',
            align: 'center',
            width: RESOURCE_TABLE_WIDTH.ACTION,
            render: (_, record) =>
              !record.parentKey &&
              (canEdit ? (
                <Icon
                  type="minus-circle"
                  onClick={() => handleRemoveResourceType(record.key)}
                />
              ) : (
                <Tooltip title={REVIEWING_WARNING_MESSAGE}>
                  <StyledDisabledIcon type="minus-circle" />
                </Tooltip>
              )),
          },
        ],
      },
      ...mainColumns.map(column => {
        if (column.key === 'rowTotal') {
          return {
            ...column,
            title: (
              <span
                title={
                  summaryDeliveryPlan.mmEffort ||
                  formatFloatNumber(titleRowTotal, 0, 3) ||
                  0
                }>
                {summaryDeliveryPlan.mmEffort ||
                  formatFloatNumber(titleRowTotal, 0, 3) ||
                  0}
              </span>
            ),
            ellipsis: true,
            children: column.children.map(child => {
              return {
                ...child,
                render: (text, record) => {
                  const content =
                    (record.parentKey
                      ? formatFloatNumber(text, 0, 2)
                      : formatFloatNumber(text, 0, 3)) || 0
                  return <span title={content}>{content}</span>
                },
              }
            }),
          }
        }
        return {
          ...column,
          children:
            (column.children &&
              column.children.map(child => {
                if (child.dataIndex === 'no') {
                  return {
                    ...child,
                    render: (_, record, index) =>
                      !record.parentKey && index + 1,
                  }
                }
                if (child.dataIndex === 'fill') {
                  return {
                    ...child,
                    title: canEdit ? 'Fill' : '',
                    width: canEdit ? RESOURCE_TABLE_WIDTH.NO : 0,
                    render: (_, record) =>
                      !record.parentKey &&
                      canEdit && (
                        <Icon
                          type="plus-circle"
                          onClick={() => handleFill(record)}
                        />
                      ),
                  }
                }
                if (
                  ['resourceType', 'location', 'employeeType', 'role'].includes(
                    child.dataIndex
                  )
                ) {
                  return {
                    ...child,
                    title:
                      child.dataIndex === 'resourceType' ? (
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
                      ) : (
                        child.title
                      ),
                    render: (text, record) =>
                      (!record.parentKey &&
                        (!canEdit ? (
                          <span title={text}>{text}</span>
                        ) : (
                          renderCommonSelect(
                            record,
                            record[child.dataIndex],
                            child.dataIndex
                          )
                        ))) ||
                      (child.dataIndex === 'resourceType' && (
                        <div className="d-flex justify-content-between gap-4 align-items-center">
                          <span>{text}</span>
                          <Button
                            onClick={() =>
                              onClickSetData(record.parentKey, record)
                            }
                            disabled={!canEdit}>
                            Set
                          </Button>
                        </div>
                      )),
                  }
                }
                if (child.dataIndex === 'position') {
                  return {
                    ...child,
                    render: (text, record) =>
                      !record.parentKey && canEdit ? (
                        <Select
                          className={
                            listInvalid[record.key] &&
                            listInvalid[record.key].position
                              ? 'select-error'
                              : ''
                          }
                          style={{ width: '100%' }}
                          showSearch
                          filterOption={false}
                          value={record.position || ''}
                          onChange={value =>
                            handleSelectChange(
                              record,
                              record.deliveryMemberId,
                              child.dataIndex,
                              value
                            )
                          }
                          onSearch={debounce(
                            value =>
                              fetchEmployeePosition(record.key, value.trim()),
                            600
                          )}
                          onDropdownVisibleChange={debounce(open => {
                            if (!open) dispatch(getEmployeePosition({ mvv }))
                          }, 300)}
                          loading={loadingGetPosition === record.key}>
                          {listPosition.map(option => (
                            <Option
                              value={option.name}
                              key={`${option.name}-${option.id}`}>
                              <span title={option.name}>{option.name}</span>
                            </Option>
                          ))}
                        </Select>
                      ) : (
                        <span title={text}>{text}</span>
                      ),
                  }
                }
                if (child.dataIndex === 'originalGrossSalary') {
                  return {
                    ...child,
                    render: (_, record) =>
                      !record.parentKey &&
                      (canEdit ? (
                        <StyledInputNumber
                          key={`${record.key}-${child.dataIndex}-${keyReset}`}
                          min={0}
                          className={
                            listInvalid[record.key] &&
                            listInvalid[record.key].originalGrossSalary
                              ? 'input-error'
                              : ''
                          }
                          style={{ width: '100%' }}
                          defaultValue={record.originalGrossSalary}
                          onChange={debounce(
                            value =>
                              handleOGGrossSalaryInput(
                                record,
                                value,
                                child.dataIndex
                              ),
                            350
                          )}
                          formatter={formatInputNumber}
                          parser={parseInputNumber}
                        />
                      ) : (
                        <span
                          title={formatFloatNumber(record.originalGrossSalary)}>
                          {formatFloatNumber(record.originalGrossSalary)}
                        </span>
                      )),
                  }
                }
                if (child.dataIndex === 'grossSalary') {
                  return {
                    ...child,
                    render: (_, record) => {
                      const value = formatFloatNumber(
                        calculateGrossSalary(
                          record.originalGrossSalary,
                          record.location
                        )
                      )
                      return (
                        !record.parentKey && <span title={value}>{value}</span>
                      )
                    },
                  }
                }
                if (child.dataIndex === 'resourceFullName') {
                  return {
                    ...child,
                    ellipsis: true,
                    onCell: record =>
                      !record.parentKey && {
                        record,
                        editable: canEdit,
                        dataIndex: child.dataIndex,
                        handleSave,
                        isInvalid:
                          listInvalid[record.key] &&
                          listInvalid[record.key].resourceFullName,
                        updateListInvalid,
                        updateIsSaveShowed,
                      },
                  }
                }
                return child
              })) ||
            [],
        }
      }),
    ]

    const totalMonthWidth =
      RESOURCE_TABLE_WIDTH.TABLE -
      RESOURCE_TABLE_WIDTH.WARNING -
      2 * RESOURCE_TABLE_WIDTH.ACTION -
      mainColumnsWidth

    const labelMonthCount =
      dataResourcesInformation.listLabelMonth &&
      dataResourcesInformation.listLabelMonth.length > 0
        ? dataResourcesInformation.listLabelMonth.length
        : 1

    const calculatedWidth = Math.max(
      totalMonthWidth / labelMonthCount,
      RESOURCE_TABLE_WIDTH.MAX_MONTH_WIDTH
    )

    const monthsColumns = dataResourcesInformation.listLabelMonth
      ? dataResourcesInformation.listLabelMonth.map(date => {
          return {
            title: (
              <span
                title={formatFloatNumber(
                  dataResourcesInformation.listBudgetMMForEachMonth[date],
                  0,
                  3
                )}>
                {formatFloatNumber(
                  dataResourcesInformation.listBudgetMMForEachMonth[date],
                  0,
                  3
                )}
              </span>
            ),
            align: 'center',
            ellipsis: true,
            key: `title-${date}`,
            children: [
              {
                title: date,
                dataIndex: ['budgetMMValueDTO', date],
                key: date,
                width: calculatedWidth,
                ellipsis: true,
                align: 'center',
                render: (_, record) => {
                  const value =
                    (record.parentKey && record.budgetMMValueDTO[date]) ||
                    (record.budgetMMValueDTO &&
                    record.budgetMMValueDTO[date] &&
                    typeof record.budgetMMValueDTO[date].value === 'number'
                      ? record.budgetMMValueDTO[date].value
                      : '')
                  return !record.parentKey && canEdit ? (
                    <StyledInputNumber
                      style={{
                        fontSize: 'small',
                        maxWidth: RESOURCE_TABLE_WIDTH.MAX_MONTH_WIDTH,
                      }}
                      key={`${record.key}-${date}-${keyReset}`}
                      min={0}
                      defaultValue={value}
                      value={value}
                      onChange={debounce(
                        value =>
                          handleRowChange(
                            record,
                            record.deliveryMemberId,
                            date,
                            value
                          ),
                        350
                      )}
                      formatter={formatterMMValues}
                      parser={parserMMValues}
                    />
                  ) : (
                    <span title={formatFloatNumber(value, 0, 2)}>
                      {formatFloatNumber(value, 0, 2)}
                    </span>
                  )
                },
              },
            ],
          }
        })
      : [
          {
            key: 'emptyColumn2',
          },
        ]

    return [...columns, ...monthsColumns]
  }, [
    data,
    keyReset,
    mainColumns,
    mainColumnsWidth,
    dataResourcesInformation,
    expandedKeys,
    listInvalid,
    canEdit,
    titleRowTotal,
    loadingExpandedRow,
    calculateGrossSalary,
    toggleExpandAll,
    toggleExpandedKeys,
    deliveryUnit,
    listPosition,
    mvv,
    fetchEmployeePosition,
    loadingGetPosition,
    handleSelectChange,
    dispatch,
  ])

  const updateRow = useCallback(
    updatedRow => {
      // check if row is new or old
      if (updatedRow.key.includes(RESOURCES_KEYS.NEW_DELIVERY_MEMBER)) {
        dispatch(addOrUpdateCreateResource(updatedRow))
      } else if (updatedRow.key.includes(RESOURCES_KEYS.DELIVERY_MEMBER)) {
        dispatch(addOrUpdateUpdateResource(updatedRow))
      }
    },
    [dispatch]
  )

  const handleSave = useCallback(
    async (partialRow, isFromSetData = false) => {
      if (!isFromSetData) {
        setData(d => {
          const idx = d.findIndex(r => r.key === partialRow.key)
          if (idx === -1) return d
          const merged = {
            ...d[idx],
            ...partialRow,
            budgetMMValueDTO: {
              ...d[idx].budgetMMValueDTO,
              ...partialRow.budgetMMValueDTO,
            },
          }
          const copy = [...d]
          copy[idx] = merged
          return copy
        })
      }
      updateRow(partialRow)

      // call when change userId
      const prevRow = data.find(item => item.key === partialRow.key)
      const oldUserId = prevRow ? prevRow.userId : null
      if (
        partialRow.userId &&
        partialRow.userId !== oldUserId &&
        expandedKeys.includes(partialRow.key)
      ) {
        await fetchResourceInforReferenceData(partialRow.userId, partialRow.key)
      }
    },
    [updateRow]
  )

  const handleOGGrossSalaryInput = useCallback(
    (record, value, field) => {
      if (value !== null && value !== undefined && value !== '') {
        updateListInvalid(field, true, record.key)
      }
      handleSave({
        key: record.key,
        deliveryMemberId: record.deliveryMemberId,
        originalGrossSalary: value,
        grossSalary: calculateGrossSalary(value, record.location),
        location: record.location,
      })
      updateIsSaveShowed(true)
    },
    [handleSave, updateListInvalid, updateIsSaveShowed]
  )

  const handleRowChange = useCallback(
    (record, deliveryMemberId, month, value) => {
      const updatedId =
        (record.budgetMMValueDTO &&
          record.budgetMMValueDTO[month] &&
          record.budgetMMValueDTO[month].id) ||
        ''
      const date = moment(month, 'MMM-YY')
      const updatedValue = {
        id: updatedId,
        deliveryMemberId,
        value,
        month: date.month() + 1,
        year: date.year(),
      }
      handleSave({
        key: record.key,
        deliveryMemberId,
        budgetMMValueDTO: {
          [month]: updatedValue,
        },
      })
      updateIsSaveShowed(true)
    },
    [handleSave, updateIsSaveShowed]
  )

  function handleSelectChange(record, deliveryMemberId, field, value) {
    if (value) updateListInvalid(field, value, record.key)

    const updatedRow = {
      key: record.key,
      deliveryMemberId,
      location: record.location,
      [field]: value,
    }
    if (field === 'resourceType') {
      if (value === RESOURCE_TYPE_ENUM.GENERIC_RESOURCE) {
        updatedRow.resourceFullName = `${RESOURCE_TYPE_ENUM.RESOURCE} ${countGenericResource}`
        updatedRow.ldap = updatedRow.resourceFullName
        updateListInvalid(
          'resourceFullName',
          updatedRow.resourceFullName,
          record.key
        )
        setCountGenericResource(prev => prev + 1)
      } else {
        updatedRow.resourceFullName = ''
        updatedRow.ldap = ''
      }
    }
    if (field === 'location') {
      updatedRow.grossSalary = calculateGrossSalary(
        record.originalGrossSalary,
        value
      )
    }

    handleSave(updatedRow)
    updateIsSaveShowed(true)
  }

  const handleAddResourceType = () => {
    if (!canEdit) return
    updateIsSaveShowed(true)
    const parentKey = uniqueId(`${RESOURCES_KEYS.NEW_DELIVERY_MEMBER}-`)
    const newRow = {
      key: parentKey,
      deliveryMemberId: null,
      resourceType: '',
      resourceFullName: '',
      ldap: '',
      userId: '',
      groupId: '',
      location: '',
      employeeType: '',
      originalGrossSalary: '',
      grossSalary: '',
      position: '',
      role: 'Member',
      rowTotal: '',
      budgetMMValueDTO: {},
      children: RESOURCE_REFERENCE_TYPE_ENUM.map(type => ({
        key: `${parentKey}-${type}`,
        parentKey: parentKey,
        resourceType: type,
        rowTotal: '',
        budgetMMValueDTO: {},
      })),
    }
    const { children, userId, groupId, ...updatedRow } = newRow
    handleSave(updatedRow)
    setData([newRow, ...data])
  }

  const handleRemoveResourceType = key => {
    if (!canEdit) return
    updateIsSaveShowed(true)
    const itemToRemove = data.find(item => item.key === key)
    if (itemToRemove.deliveryMemberId) {
      dispatch(
        setListIdToDeleteResourceInformation(itemToRemove.deliveryMemberId)
      )
      dispatch(removeCreateOrUpdateResourceInformation(key))
    } else if (key.includes(RESOURCES_KEYS.NEW_DELIVERY_MEMBER)) {
      dispatch(removeCreateOrUpdateResourceInformation(key))
    }
    setData(d => d.filter(item => item.key !== key))
  }

  const onClickSetData = (parentKey, record) => {
    updateIsSaveShowed(true)
    setKeyReset(prev => prev + 1)
    const prevRow = data.find(item => item.key === parentKey)
    const result = dataResourcesInformation.listLabelMonth.reduce(
      (acc, month) => {
        const date = moment(month, 'MMM-YY')
        const value = record.budgetMMValueDTO && record.budgetMMValueDTO[month]
        const idMonth =
          prevRow.budgetMMValueDTO &&
          prevRow.budgetMMValueDTO[month] &&
          prevRow.budgetMMValueDTO[month].id
        if (idMonth || value) {
          // check if idMonth existed -> value will be set to ""
          // check if value is truthy -> apply value into row datas
          acc[month] = {
            id: idMonth || '',
            deliveryMemberId: prevRow.deliveryMemberId,
            value: value || '',
            month: date.month() + 1,
            year: date.year(),
          }
        }

        return acc
      },
      {}
    )
    setData(prev =>
      prev.map(item => {
        if (item.key === parentKey) {
          return {
            ...item,
            budgetMMValueDTO: result,
          }
        }
        return item
      })
    )
    handleSave(
      {
        key: parentKey,
        deliveryMemberId: prevRow.deliveryMemberId,
        rowTotal: record.rowTotal,
        budgetMMValueDTO: result,
      },
      true
    )
  }

  async function toggleExpandedKeys(key, record) {
    const isExpanded = expandedKeys.includes(key)
    const newKeys = isExpanded
      ? expandedKeys.filter(k => k !== key)
      : [...expandedKeys, key]

    // call when change from collapse row to expand
    if (!isExpanded && record.userId) {
      await fetchResourceInforReferenceData(record.userId, key)
    }
    // setExpandAll(!!newKeys.length)
    setExpandedKeys(newKeys)
  }

  const fetchResourceInforReferenceData = useCallback(
    async (userId, rowKey) => {
      if (!userId) return
      if (!deliveryUnit) return
      setLoadingExpandedRow(prev => ({
        ...prev,
        [userId]: true,
      }))
      try {
        const response = await Request(
          BUSINESS_PLAN_API.getResourcesInformationReference,
          {
            businessPlanVersionId: buId,
            deliveryUnit: deliveryUnit.groupName,
            loadDataFromType: loadDataFromValue,
            viewType: 1,
            userId,
          }
        )

        if (response.status === ResponseStatusCode.success) {
          setData(prevData =>
            prevData.map(item =>
              item.userId === userId && item.key === rowKey
                ? {
                    ...item,
                    children: item.children.map(child => {
                      const data = Object.values(response.data).find(
                        data => data.resourceType === child.resourceType
                      )
                      const formattedBudgetMMValue = data.labelMonth
                        ? Object.fromEntries(
                            Object.entries(data.labelMonth).map(
                              ([month, value]) => [
                                month,
                                parseFloat(formatFloatNumber(value)),
                              ]
                            )
                          )
                        : {}
                      return {
                        ...child,
                        rowTotal: data.total,
                        budgetMMValueDTO: formattedBudgetMMValue,
                      }
                    }),
                  }
                : item
            )
          )
        } else {
          NotificationManager.error(response.message)
        }
      } catch (error) {
        NotificationManager.error(error)
      } finally {
        setLoadingExpandedRow(prev => ({
          ...prev,
          [userId]: false,
        }))
      }
    },
    [loadDataFromValue, buId, deliveryUnit]
  )

  async function toggleExpandAll() {
    const rowKeys = data.map(item => item.key)
    if (expandedKeys.length > 0) {
      setExpandedKeys([])
    } else {
      try {
        await Promise.all(
          data.map(item =>
            fetchResourceInforReferenceData(item.userId, item.key)
          )
        )
        setExpandedKeys(rowKeys)
      } catch (error) {
        NotificationManager.error(error)
      } finally {
        setLoadingExpandedRow({})
      }
    }
  }

  const handleExpand = ({ expanded, record }) => {
    const isLoading = !!record.userId && loadingExpandedRow[record.userId]

    return (
      !record.parentKey && (
        <Icon
          onClick={() => toggleExpandedKeys(record.key, record)}
          type="right"
          style={{
            fontSize: '12px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        />
      )
    )
  }

  const handleFill = record => {
    const recodeInit = cloneDeep(record)
    const dataInit = cloneDeep(data)

    function parseMonthYear(key) {
      const [monthStr, yearStr] = key.split('-')
      const monthMap = {
        Jan: 1,
        Feb: 2,
        Mar: 3,
        Apr: 4,
        May: 5,
        Jun: 6,
        Jul: 7,
        Aug: 8,
        Sep: 9,
        Oct: 10,
        Nov: 11,
        Dec: 12,
      }
      return {
        month: monthMap[monthStr],
        year: 2000 + parseInt(yearStr),
      }
    }

    dataResourcesInformation.listLabelMonth.forEach(key => {
      const existingItem = recodeInit.budgetMMValueDTO[key]
      if (!existingItem) {
        const { month, year } = parseMonthYear(key)
        recodeInit.budgetMMValueDTO[key] = {
          id: '',
          deliveryMemberId: recodeInit.deliveryMemberId,
          month,
          year,
          value: 1,
        }
      } else if (
        existingItem &&
        (existingItem.value === null ||
          existingItem.value === undefined ||
          existingItem.value === 0 ||
          existingItem.value === '')
      ) {
        recodeInit.budgetMMValueDTO[key].value = 1
      }
    })

    if (!isEqual(record.budgetMMValueDTO, recodeInit.budgetMMValueDTO)) {
      const updatedDataInTable = dataInit.map(item =>
        item.key === recodeInit.key ? recodeInit : item
      )
      setData(updatedDataInTable)

      const updateRowTableStore = {
        key: recodeInit.key,
        budgetMMValueDTO: recodeInit.budgetMMValueDTO,
        deliveryMemberId: recodeInit.deliveryMemberId,
      }
      updateRow(updateRowTableStore)
      updateIsSaveShowed(true)
    }
  }

  return (
    <div>
      <Table
        className="head-count-table"
        columns={columnsConfig()}
        rowClassName={record =>
          record.parentKey ? 'head-count-table-sub-row' : 'head-count-table-row'
        }
        dataSource={data}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        expandedRowKeys={expandedKeys}
        expandIcon={handleExpand}
        expandIconColumnIndex={1}
        expandIconAsCell={false}
        loading={loadingDataResourcesInformation || loadingTable}
        pagination={false}
        scroll={{
          x: 'max-content',
          y: 400,
        }}
      />
    </div>
  )
})
export default memo(HeadCountTable)
