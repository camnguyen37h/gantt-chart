import { formatFloatNumber } from '../../../utils/format-utils/ConvertNumber'
import { Col, Icon, Row, Spin, Tooltip } from 'antd'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSummaryRevenuePlan } from '../../redux'
import './style.css'
import { RevenueSummaryTooltip } from './constant'

const CustomDescription = ({ title, value }) => {
  return (
    <div>
      <Row>
        <Col span={4} style={{ marginBottom: 4 }}>
          {title}
        </Col>
        <Col span={4}>
          <Row type="flex" align="middle">
            <Col span={16}>
              <Tooltip title={RevenueSummaryTooltip[title]}>
                <Icon type="question-circle" style={{ cursor: 'pointer' }} />
              </Tooltip>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'left' }}>
                {value < 0
                  ? `(${formatFloatNumber(Math.abs(value), 0, 3)})`
                  : formatFloatNumber(value, 0, 3)}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

const RevenueSummary = ({ businessVersion }) => {
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
          <CustomDescription title="MM bill" value={mmBill} />
          <CustomDescription
            title="Software production revenues"
            value={softwareProductionRevenues}
          />
          {deliveryUnitDataRevenue.groupSale && (
            <CustomDescription title="Deduction" value={deduction} />
          )}
          <CustomDescription title="Onsite fee" value={onsiteFee} />
          <CustomDescription
            title="Revenues from Equipment, Internet, Server, ..."
            value={equipmentRevenue}
          />
          <CustomDescription title="Other revenues" value={otherRevenues} />
          {deliveryUnitDataRevenue.groupSale && (
            <CustomDescription title="Agency expenses" value={agencyExpenses} />
          )}
        </div>
      )}
    </div>
  )
}

export default RevenueSummary
