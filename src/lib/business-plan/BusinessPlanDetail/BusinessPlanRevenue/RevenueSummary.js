import { formatFloatNumber } from '../../../utils/format-utils/ConvertNumber'
import { Col, Icon, Row, Spin, Tooltip } from 'antd'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSummaryRevenuePlan } from '../../redux'
import { MASKED_VALUE } from '../../permissions/viewPermissions'
import './style.css'
import { RevenueSummaryTooltip } from './constant'

const formatNumericValue = value => {
  if (typeof value !== 'number') return value
  return value < 0
    ? '(' + formatFloatNumber(Math.abs(value), 0, 3) + ')'
    : formatFloatNumber(value, 0, 3)
}

const CustomDescription = ({ title, value }) => {
  return (
    <Row>
      <Col span={5} style={{ marginBottom: 4 }}>
        {title}
      </Col>
      <Col span={7}>
        <Row type="flex" align="middle">
          <Col span={4} type="flex" align="middle">
            <Tooltip title={RevenueSummaryTooltip[title]}>
              <Icon
                type="question-circle"
                style={{ cursor: 'pointer', padding: '4px' }}
              />
            </Tooltip>
          </Col>
          <Col span={7}>
            <div style={{ textAlign: 'left' }}>
              {formatNumericValue(value)}
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

const RevenueSummary = ({ businessVersion, canViewRevenue }) => {
  const dispatch = useDispatch()
  const {
    summaryRevenuePlan,
    deliveryUnitDataRevenue,
    isUpdated,
    isUpdatedSellingExpenses,
  } = useSelector(state => state.businessPlanRevenue)

  useEffect(() => {
    if (isUpdated || isUpdatedSellingExpenses) {
      dispatch(
        getSummaryRevenuePlan({
          businessPlanVersionId: businessVersion,
          duSelected: {
            ...deliveryUnitDataRevenue,
            groupId: parseInt(deliveryUnitDataRevenue.groupId),
          },
        })
      )
    }
  }, [isUpdated, isUpdatedSellingExpenses])

  const {
    mmBill,
    softwareProductionRevenues,
    deduction,
    onsiteFee,
    equipmentRevenue,
    otherRevenues,
    agencyExpenses,
    loading,
  } = summaryRevenuePlan

  return (
    <div>
      <Spin spinning={loading} />
      {!loading && (
        <div>
          <CustomDescription title="MM bill" value={canViewRevenue ? mmBill : MASKED_VALUE} />
          <CustomDescription
            title="Software production revenues"
            value={canViewRevenue ? softwareProductionRevenues : MASKED_VALUE}
          />
          {deliveryUnitDataRevenue.groupSale && (
            <CustomDescription title="Deduction" value={canViewRevenue ? deduction : MASKED_VALUE} />
          )}
          <CustomDescription title="Onsite fee" value={canViewRevenue ? onsiteFee : MASKED_VALUE} />
          <CustomDescription
            title="Revenues from Equipment, Internet, Server, ..."
            value={canViewRevenue ? equipmentRevenue : MASKED_VALUE}
          />
          <CustomDescription title="Other revenues" value={canViewRevenue ? otherRevenues : MASKED_VALUE} />
          {deliveryUnitDataRevenue.groupSale && (
            <CustomDescription title="Agency expenses" value={canViewRevenue ? agencyExpenses : MASKED_VALUE} />
          )}
        </div>
      )}
    </div>
  )
}

export default RevenueSummary
