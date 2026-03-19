import { formatFloatNumber } from '../../../utils/format-utils/ConvertNumber'
import { Col, Icon, Row, Spin, Tooltip } from 'antd'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSummaryRevenuePlan } from '../../redux'
import useBusinessPlanPermission from '../../hooks/useBusinessPlanPermission'
import './style.css'
import { RevenueSummaryTooltip } from './constant'

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
              {value < 0
                ? `(${formatFloatNumber(Math.abs(value), 0, 3)})`
                : formatFloatNumber(value, 0, 3)}
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

const RevenueSummary = ({ businessVersion }) => {
  const dispatch = useDispatch()
  const perms = useBusinessPlanPermission('revenuePlan', null)
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

  const canView = perms.canViewSection('SUMMARY')

  return (
    <div>
      <Spin spinning={loading} />
      {!loading && (
        canView ? (
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
        ) : (
          <div style={{ padding: '12px', color: '#999', textAlign: 'center' }}>
            Bạn không có quyền xem phần này.
          </div>
        )
      )}
    </div>
  )
}

export default RevenueSummary
