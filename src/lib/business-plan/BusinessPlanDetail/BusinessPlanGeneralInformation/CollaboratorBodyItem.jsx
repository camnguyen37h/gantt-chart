import { checkRolePermission } from '../../../../components/common/checkRolePermission'
import {
  ActivityKeyConstants,
  SourceConstants,
} from '../../../constants/ActivityKeyConstants'
import {
  Button,
  ConfigProvider,
  DatePicker,
  Select,
  Table,
  Tooltip,
} from 'antd'
import { cloneDeep, debounce } from 'lodash'
import { NotificationManager } from 'react-notifications'
import { useDispatch, useSelector } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { useBusinessPlanDetails } from '../../hooks'
import { getUserAndDepartmentCollaborator, setValidation } from '../../redux'
import {
  handleAddItemCollaborator,
  handleDeleteItemCollaborator,
  setDataTableCollaborator,
} from '../../redux/reducers/businessGeneralInformation'
import { Fragment } from 'react'
import { statusBusinessPlanDetail } from '../constant'
import moment from 'moment'
import { DateFormat } from '../../../constants/DateFormat'

const { Option } = Select

function CollaboratorBodyItem({
  dataTable,
  title,
  required = false,
  pagination,
  setPagination,
  isAdd = false,
  titleColumn,
  memberType,
  match,
  loadingCollaborator,
  fieldName,
  startDate,
  endDate,
}) {
  const { updateIsSaveShowed, status, listAM, listPreparator } =
    useBusinessPlanDetails()
  // Mock user for demo
  const userPOA = JSON.parse(localStorage.getItem('userPOA')) || { userName: 'Demo User', userId: 1 }
  const { userName } = userPOA

  const isEditInput =
    (checkRolePermission(
      SourceConstants.BUSINESS_PLAN_DETAIL,
      ActivityKeyConstants.EDIT_BUSINESS_PLAN
    ) ||
    listAM && listAM.some(p => p.ldap === userName) ||
    listPreparator && listPreparator.some(p => p.ldap === userName)) &&
    status === statusBusinessPlanDetail.draft

  const dispatch = useDispatch()

  const { listUsername } = useSelector(
    state => state.businessGeneralInformation
  )

  const { validation } = useSelector(state => state.businessPlanDetails)

  const handleReturnIndexItem = (pagination, index) => {
    return (pagination.current - 1) * pagination.pageSize + index + 1
  }

  const handleChangeName = (id, dataSource, listUser, value, fieldName) => {
    const dataClone = cloneDeep(dataSource)
    const selectedItem = dataClone.findIndex(item => item.id === id)

    const userSelected = listUser.find(item => item.userId === value)
    const result = {
      [fieldName]: false,
    }

    if (dataClone.some(item => item.ldap === userSelected.ldap))
      return NotificationManager.error('Please check existed data')

    dataClone[selectedItem] = {
      ...dataClone[selectedItem],
      departmentName: userSelected.departmentName,
      ldap: userSelected.ldap,
      userId: userSelected.userId,
      departmentId: userSelected.departmentId,
    }

    dispatch(
      setDataTableCollaborator({
        fieldName,
        dataClone,
      })
    )

    dispatch(setValidation(result))

    updateIsSaveShowed(true)
  }

  const handleChangeDate = (id, dataSource, rangePickerValue, fieldName) => {
    const dataClone = cloneDeep(dataSource)
    const selectedItem = dataClone.findIndex(item => item.id === id)
    const result = {
      [fieldName]: false,
    }

    dataClone[selectedItem] = {
      ...dataClone[selectedItem],
      startDate: rangePickerValue[0]
        ? rangePickerValue[0].format(DateFormat.YYYY_MM_DD)
        : moment(startDate).format(DateFormat.YYYY_MM_DD),
      endDate: rangePickerValue[1]
        ? rangePickerValue[1].format(DateFormat.YYYY_MM_DD)
        : moment(endDate).format(DateFormat.YYYY_MM_DD),
    }

    dispatch(
      setDataTableCollaborator({
        fieldName,
        dataClone,
      })
    )

    dispatch(setValidation(result))

    updateIsSaveShowed(true)
  }

  const handleSearchUserName = value => {
    dispatch(
      getUserAndDepartmentCollaborator({
        search: value,
      })
    )
  }

  const handleAddItem = (
    dataSource,
    pagination,
    setPagination,
    memberType,
    fieldName
  ) => {
    const dataClone = cloneDeep(dataSource)
    if (!isEditInput) {
      NotificationManager.error(
        status !== statusBusinessPlanDetail.draft
          ? 'Cannot edit as the business plan is being reviewed'
          : "You don't have permission EDIT BUSINESS PLAN"
      )
      return
    }

    let newItem = {
      businessPlanVersionId: parseInt(match.params.buId),
      id: uuid(),
      memberType: memberType,
      userId: '',
      userFullName: '',
      departmentId: '',
      departmentName: '',
      ldap: '',
      startDate: startDate,
      endDate: endDate,
      isDefault: false,
    }
    if (dataClone && dataClone.length === 0) {
      setPagination({
        ...pagination,
        current: 1,
      })
    }

    dispatch(
      handleAddItemCollaborator({
        fieldName,
        dataClone,
        newItem,
      })
    )
    updateIsSaveShowed(true)
  }

  const handleDeleteItem = (
    id,
    dataSource,
    message,
    pagination,
    setPagination,
    required,
    fieldName
  ) => {
    const dataClone = cloneDeep(dataSource)
    if (!isEditInput) {
      NotificationManager.error(
        status !== statusBusinessPlanDetail.draft
          ? 'Cannot edit as the business plan is being reviewed'
          : "You don't have permission EDIT BUSINESS PLAN"
      )

      return
    }
    if (
      dataClone.length % pagination.pageSize === 1 &&
      dataClone[dataClone.length - 1].id === id
    ) {
      if (dataClone.length === 1 && required) {
        NotificationManager.error(message)
        return
      }

      setPagination({
        ...pagination,
        current: pagination.current - 1,
      })
    }

    dispatch(
      handleDeleteItemCollaborator({
        fieldName,
        dataClone,
        id,
      })
    )
    updateIsSaveShowed(true)
  }

  const handleChangeTable = (pagination, setPagination) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    })
  }

  const handleRenderTooltip = (index) => {
    if (
      (titleColumn === 'AM' || titleColumn === 'PM') &&
      handleReturnIndexItem(pagination, index) === 1
    ) {
      return 'In order to change this information, please contact Sale and change in PC (CRM System)'
    }
    if (!isEditInput) {
      if (status !== statusBusinessPlanDetail.draft) {
        return 'Cannot edit as the business plan is being reviewed'
      }
      return "You don't have permission to EDIT BUSINESS PLAN"
    }
    return null
  }

  const columns = [
    {
      title: titleColumn,
      dataIndex: '',
      key: '',
      render: (_, record, index) => {
        return (
          <span>
            {titleColumn}
            {handleReturnIndexItem(pagination, index)}
          </span>
        )
      },
      align: 'left',
      width: 90,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record, index) => {
        return (
          <div className="collaborator-name">
            <Tooltip title={handleRenderTooltip(index)}>
              <Select
                value={record.ldap}
                className="collaborator-select"
                onChange={e =>
                  handleChangeName(
                    record.id,
                    dataTable,
                    listUsername,
                    e,
                    fieldName
                  )
                }
                dropdownRender={menu =>
                  listUsername && listUsername.length > 0 ? (
                    <Fragment>{menu}</Fragment>
                  ) : (
                    <Fragment></Fragment>
                  )
                }
                onSearch={debounce(e => handleSearchUserName(e), 1000)}
                onBlur={() => handleSearchUserName('')}
                filterOption={false}
                showSearch={true}
                size="small"
                disabled={
                  !isEditInput ||
                  ((titleColumn === 'AM' || titleColumn === 'PM') &&
                    handleReturnIndexItem(pagination, index) === 1)
                }>
                {listUsername.map(item => (
                  <Option value={item.userId} key={item.userId}>
                    {item.ldap}
                  </Option>
                ))}
              </Select>
            </Tooltip>
          </div>
        )
      },
      align: 'left',
      width: 105,
    },
    {
      title: 'Start Date - End Date',
      dataIndex: '',
      key: '',
      align: 'left',
      render: (_, record, index) => {
        const rangeValue = [
          moment(record.startDate || startDate),
          moment(record.endDate || endDate),
        ]
        return (
          <div>
            <Tooltip title={handleRenderTooltip()}>
              <DatePicker.RangePicker
                disabledDate={current => {
                  if (startDate && endDate)
                    return (
                      current.isBefore(moment(startDate)) ||
                      current.isAfter(moment(endDate))
                    )
                  if (startDate) return current.isBefore(moment(startDate))
                  if (endDate) return current.isAfter(moment(endDate))
                  return false
                }}
                value={rangeValue}
                onChange={e =>
                  handleChangeDate(record.id, dataTable, e, fieldName)
                }
                suffixIcon={<Fragment></Fragment>}
                format={[
                  DateFormat.DATE_FORWARD_SLASH,
                  DateFormat.DATE_FORWARD_SLASH,
                ]}
                disabled={!isEditInput}
              />
            </Tooltip>
          </div>
        )
      },
      align: 'center',
      width: 220,
    },
    {
      title: 'Department',
      dataIndex: 'department ',
      key: 'department',
      align: 'left',
      render: (_, record, index) => {
        return (
          <div>
            <div className="body-item-table-item">
              <span>{record.departmentName}</span>
              {((titleColumn !== 'AM' && titleColumn !== 'PM') ||
                handleReturnIndexItem(pagination, index) > 1) && (
                <Button
                  onClick={() => {
                    handleDeleteItem(
                      record.id,
                      dataTable,
                      'Need at least an information in required field!',
                      pagination,
                      setPagination,
                      required,
                      fieldName
                    )
                  }}
                  icon="minus-circle"
                  className="body-item-action"
                />
              )}
            </div>
          </div>
        )
      },
      width: 100,
    },
  ]

  return (
    <div className="collaborator-body-item">
      <div className="body-item-top">
        <div className="body-item-title">
          <span>{title}</span>
          {required && <span className={required ? 'required' : ''}>*</span>}
        </div>
        {isAdd && (
          <Button
            onClick={() =>
              handleAddItem(
                dataTable,
                pagination,
                setPagination,
                memberType,
                fieldName
              )
            }
            icon="plus-circle"
            className="body-item-button"
          />
        )}
      </div>
      <div className="body-item-table">
        <ConfigProvider renderEmpty={() => <div></div>}>
          <Table
            rowKey={record => record.id}
            dataSource={dataTable}
            columns={columns}
            rowClassName={`"body-row"`}
            onHeaderRow={_ => {
              return {
                className: 'header-row',
              }
            }}
            onChange={pagination =>
              handleChangeTable(pagination, setPagination)
            }
            pagination={pagination}
            className="custom-table empty-table"
            size="small"
            loading={loadingCollaborator}
          />
        </ConfigProvider>
      </div>
      {required && validation[fieldName] && (
        <span className="text-danger">Please input required fields</span>
      )}
    </div>
  )
}

export default withRouter(CollaboratorBodyItem)
