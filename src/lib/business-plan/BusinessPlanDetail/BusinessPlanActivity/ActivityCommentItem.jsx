import { DateFormat } from '../../../constants/DateFormat'
import { Avatar, Spin } from 'antd'
import moment from 'moment'
import React from 'react'

function ActivityCommentItem({ dataListComments, loadingComments }) {
  return (
    <div className="activity-list-comments" style={ { padding : "0 8px"}}>
      {dataListComments.map(item => (
        <div className="activity-comment-item" key={item.id}>
          <div className="comment-item-avatar">
            <Avatar icon="user" />
          </div>
          <div className="comment-item-information">
            <div className="information-username-time">
              <span>{item.userName}</span>
              <span>
                {moment(item.createdAt).format(
                  DateFormat.DATE_TIME_MMM_EXCLUDE_SECOND
                )}
              </span>
            </div>
            <p className="information-content">{item.commentContent}</p>
          </div>
        </div>
      ))}

      {loadingComments && <Spin />}
    </div>
  )
}

export default ActivityCommentItem
