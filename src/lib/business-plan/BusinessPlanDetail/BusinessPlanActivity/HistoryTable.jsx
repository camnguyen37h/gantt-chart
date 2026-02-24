import { DateFormat } from '../../../constants/DateFormat'
import { Avatar, Divider, Spin, Table } from 'antd'
import moment from 'moment'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { getBusinessPlanHistory } from '../../redux'
import { formatFloatNumber } from '../../../utils/format-utils/ConvertNumber'

function HistoryTable({ match }) {
  const dispatch = useDispatch()

  const { listHistory, loadingHistory } = useSelector(
    state => state.businessComments
  )

  const columns = [
    {
      title: 'Field',
      dataIndex: 'display',
      key: 'display',
      align: 'left',
    },
    {
      title: 'Original Value',
      dataIndex: 'oldValue',
      key: 'oldValue',
      align: 'left',
      render: (text, record) => {
        return (
          <span>
            {record && record.oldValue
              ? formatFloatNumber(record.oldValue, 0, 3)
              : record.oldStringValue}
          </span>
        )
      },
    },
    {
      title: 'New Value',
      dataIndex: 'newValue',
      key: 'newValue',
      align: 'left',
      render: (text, record) => {
        return (
          <span>
            {record && record.newValue
              ? formatFloatNumber(record.newValue, 0, 3)
              : record.newStringValue}
          </span>
        )
      },
    },
  ]

  useEffect(() => {
    dispatch(getBusinessPlanHistory(match.params.buId))
  }, [match.params.buId])

  return (
    <div>
      <div className="d-flex justify-content-center my-0">
        <Spin spinning={loadingHistory} />
      </div>
      {listHistory.map(item => (
        <div className="history-table">
          <div className="history-action">
            <div className="action-actor">
              <Avatar size={20} icon="user" />
              <span className="history-username">{item.fullName}</span>
            </div>
            <span className="history-item">-</span>
            <span className="history-item">{item.display}</span>
            <span className="history-item">-</span>
            <span className="history-item">
              {moment(item.createdAt).format(
                DateFormat.DD_MMM_YY_HH_MM_A_SLASH
              )}
            </span>
          </div>
          {item.historyType === 'MADE_CHANGE' && (
            <Table
              dataSource={item.details || []}
              columns={columns}
              rowClassName="body-row"
              onHeaderRow={_ => {
                return {
                  className: 'header-row',
                }
              }}
              loading={loadingHistory}
              pagination={false}
              bordered={false}
            />
          )}
          <Divider style={{ margin: '8px 0' }} />
        </div>
      ))}
    </div>
  )
}

export default withRouter(HistoryTable)
