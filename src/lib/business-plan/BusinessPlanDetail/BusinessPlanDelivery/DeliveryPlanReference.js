import { debounce } from 'lodash'
import { Col, InputNumber, Row, Table } from 'antd'
import './style.css'
import { useDispatch, useSelector } from 'react-redux'
import { formatFloatNumber } from '../../../utils/format-utils/ConvertNumber'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'
import { setIsSaveShowedDeliveryPlan, setUpdateExchangeRate } from '../../redux'
import { formatInputNumber, parseInputNumber } from '../../utils'
import styled from 'styled-components'
import { VALIDATE_REQUIRED_FIELDS_MESSAGE } from './constants'
import { NotificationManager } from 'react-notifications'

const StyledInputNumber = styled(InputNumber)`
  .ant-input-number-handler-wrap {
    display: none;
  }
`

const DeliveryPlanReference = forwardRef((props, ref) => {
  const dispatch = useDispatch()
  const { canEdit, canView } = props
  const [listInvalid, setListInvalid] = useState({})

  const {
    listLocationExchangeRateData,
    listLaborRateData,
    loadingGetReferenceTable,
  } = useSelector(state => state.businessPlanDelivery)

  const handleChangeInputExchangeRate = (value, record, field) => {
    dispatch(
      setUpdateExchangeRate({
        ...record,
        [field]: value,
      })
    )

    setListInvalid(prevErrors => {
      if (
        prevErrors[record.location] &&
        prevErrors[record.location][field] &&
        value !== null &&
        value !== '' &&
        value !== undefined
      ) {
        const newRowErrors = { ...prevErrors[record.location] }
        delete newRowErrors[field]
        return { ...prevErrors, [record.location]: newRowErrors }
      }
      return prevErrors
    })

    updateIsSaveConfirmShowed(true)
  }

  const updateIsSaveConfirmShowed = useCallback(
    value => {
      return dispatch(setIsSaveShowedDeliveryPlan(value))
    },
    [dispatch]
  )

  useImperativeHandle(ref, () => ({
    validate,
  }))

  const validate = () => {
    const errors = {}
    let isValid = true
    listLocationExchangeRateData.forEach(row => {
      const rowErrors = {}

      if (
        row.exchangeRate === null ||
        row.exchangeRate === '' ||
        row.exchangeRate === undefined
      ) {
        rowErrors.exchangeRate = true
        isValid = false
      }

      if (Object.keys(rowErrors).length > 0) {
        errors[row.location] = rowErrors
      }
    })

    setListInvalid(errors)
    if (!isValid) {
      NotificationManager.error(VALIDATE_REQUIRED_FIELDS_MESSAGE)
    }
    return isValid
  }

  const columnsInput = [
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      align: 'left',
      width: '30%',
    },
    {
      title: 'Exchange Rate',
      dataIndex: 'exchangeRate',
      key: 'exchangeRate',
      align: 'left',
      render: (text, record) => {
        return canEdit ? (
          <StyledInputNumber
            style={{ width: '100%', maxWidth: '150px' }}
            min={0}
            value={record.exchangeRate}
            className={
              listInvalid[record.location] &&
              listInvalid[record.location].exchangeRate
                ? 'input-error'
                : ''
            }
            size="small"
            onChange={debounce(
              value =>
                handleChangeInputExchangeRate(value, record, 'exchangeRate'),
              350
            )}
            formatter={formatInputNumber}
            parser={parseInputNumber}
          />
        ) : (
          formatFloatNumber(record.exchangeRate)
        )
      },
    },
  ]

  const columnsView = [
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      align: 'left',
    },
    {
      title: 'Salary Index',
      dataIndex: 'salaryIndex',
      key: 'salaryIndex',
      align: 'left',
      render: text => <div>{formatFloatNumber(text)}</div>,
    },
    {
      title: 'Expense Index',
      dataIndex: 'expenseIndex',
      key: 'expenseIndex',
      align: 'left',
      render: text => <div>{formatFloatNumber(text)}</div>,
    },
  ]

  return (
    <div>
      <Row gutter={[32, 8]}>
        <Col span={12}>
          <Table
            className="delivery-reference-table"
            pagination={false}
            bordered
            columns={columnsInput}
            dataSource={canView ? listLocationExchangeRateData : []}
            rowKey={record => record.location}
            loading={loadingGetReferenceTable}
          />
        </Col>
        <Col span={12}>
          <Table
            className="delivery-reference-table"
            pagination={false}
            bordered
            columns={columnsView}
            dataSource={canView ? listLaborRateData : []}
            rowKey={record => record.location}
          />
        </Col>
      </Row>
    </div>
  )
})
export default DeliveryPlanReference
