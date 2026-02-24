import { MODULE_COMMENT_TYPE } from '../../../constants/CommentConstant'
import { Avatar, Button, Icon, Input, Tabs } from 'antd'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  getBusinessPlanDetailComment,
  postBusinessPlanComment,
} from '../../redux'
import { commentSubmitSVG } from '../SVGIcon'
import ActivityCommentItem from './ActivityCommentItem'
import HistoryTable from './HistoryTable'
import './style.css'

const { TabPane } = Tabs

function BusinessPlanActivity({ match }) {
  const dispatch = useDispatch()
  const { listComments, loading } = useSelector(state => state.businessComments)
  const [inputValue, setInputValue] = useState('')

  const handleChangeInput = value => {
    setInputValue(value)
  }

  const handleSubmitComment = async () => {
    if (!inputValue.trim()) {
      return
    }
    await dispatch(
      postBusinessPlanComment({
        referenceId: match.params.buId,
        commentContent: inputValue,
        moduleTypeEnum: MODULE_COMMENT_TYPE.BUSINESS_PLAN_DETAIL,
      })
    )
    await dispatch(
      getBusinessPlanDetailComment({
        referenceId: match.params.buId,
        module: MODULE_COMMENT_TYPE.BUSINESS_PLAN_DETAIL,
      })
    )
    setInputValue('')
  }

  useEffect(() => {
    dispatch(
      getBusinessPlanDetailComment({
        referenceId: match.params.buId,
        module: MODULE_COMMENT_TYPE.BUSINESS_PLAN_DETAIL,
      })
    )
  }, [match.params.buId])

  return (
    <div className="business-plan-activity">
      <Tabs defaultActiveKey="1" className="business-plan-tab" animated={false}>
        <TabPane tab="Comments" key="1">
          <div className="business-activity-comments">
            <div className="activity-add-cmt">
              <div className="add-cmt-avatar">
                <Avatar src="/img/business-plan-detail/AvatarComment.svg" />
              </div>
              <div className="add-cmt-input">
                <Input
                  onChange={e => handleChangeInput(e.target.value)}
                  placeholder="Add your comment"
                  value={inputValue}
                  suffix={
                    <Button
                      className="cmt-button"
                      onClick={handleSubmitComment}>
                      <Icon component={commentSubmitSVG} />
                    </Button>
                  }
                />
              </div>
            </div>
            <ActivityCommentItem
              dataListComments={listComments}
              loadingComments={loading}
            />
          </div>
        </TabPane>
        <TabPane tab="History" key="2">
          <div className="business-activity-history">
            <HistoryTable />
          </div>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default withRouter(BusinessPlanActivity)
