import { Steps, Icon } from 'antd'
import styled from 'styled-components'

import { STEPS_ICON } from './constants'
import useWorkflowApproval from './hooks/useWorkflowApproval'
import ApprovalList from './components/ApprovalList'
import { useEffect, Fragment } from 'react'

const { Step } = Steps

const StyleSteps = styled(Steps)`
  .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
    color: #4caf50;
  }
  .ant-steps-item-finish
    > .ant-steps-item-container
    > .ant-steps-item-tail::after {
    background-color: #4caf50;
  }

  .ant-steps-item:last-child {
    flex: 1;
    .ant-steps-item-container > .ant-steps-item-tail {
      display: block;
      &:after {
        content: none;
      }
    }
  }

  .ant-steps-item-content {
    .ant-steps-item-title {
      font-size: 14px;
      line-height: 24px;
      font-weight: 500;
    }
  }
`

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  margin-top: 16px;
  width: calc(100% - 60px);
  min-width: 600px;

  .grid-list {
    display: flex;
    gap: 3px;
    flex-direction: column;
    padding-left: 6px;

    &.grid-list-wo {
      padding-left: 0;
    }

    .grid-group {
      padding-left: 4px;
      display: flex;
      gap: 3px;
      flex-direction: column;
    }
  }

  .grid-item {
    padding: 4px;
    border-radius: 8px;
    background-color: #ffffff;
    border: 1px solid #e1e1e1;
  }
  .grid-item.no-action {
    max-width: 140px;
  }
  .grid-item.actions-1 {
    max-width: 160px;
  }
  .grid-item.actions-2 {
    max-width: 180px;
  }
  .grid-item.actions-3 {
    max-width: 200px;
  }
`

const StyledWOList = styled.div`
  .wo-item {
    background: #ebf3ff;
    color: #338bf8;
    text-align: center;
    width: 130px;
    font-weight: 500;
  }
`

const WorkflowApproval = ({
  listStep,
  listDU,
  hideApproverList,
  enableActions,
  onApprove,
  onReject,
  onAssign,
  onClickApprove,
  onClickReject,
  onClickAssign,
  customLeft,
}) => {
  const { renderStatus, getSpecificPermission } = useWorkflowApproval()

  useEffect(() => {
    getSpecificPermission()
  }, [getSpecificPermission])

  const isEmptyListDu = !listDU || Object.keys(listDU).length === 0

  return (
    <div>
      {listStep.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <StyledGrid>
            <div></div>
            <StyleSteps labelPlacement="vertical">
              {listStep.map(item => {
                const { map, status, approvalList: approvalListItem } = item
                const approvalList = Object.values(map || {})
                const approvalStatuses = approvalListItem
                  ? approvalListItem.map(approver => approver.processStatus)
                  : approvalList.reduce((res, item) => {
                      return [
                        ...res,
                        ...item.map(approver => approver.processStatus),
                      ]
                    }, [])

                const config = renderStatus(approvalStatuses)

                return (
                  <Step
                    key={item.stepName}
                    status={status || config.status}
                    icon={
                      <Icon type={status ? STEPS_ICON[status] : config.icon} />
                    }
                    title={item.stepName}
                  />
                )
              })}
            </StyleSteps>
          </StyledGrid>
          <StyledGrid className={hideApproverList ? 'd-none' : ''}>
            <StyledWOList className={'grid-list grid-list-wo'}>
              {!isEmptyListDu
                ? Object.values(listDU)
                    .flat()
                    .map((item, index) => (
                      <Fragment key={item.duName || `du-${index}`}>
                        <div className="wo-item grid-item">{item.duName}</div>
                        {item.length > 0 &&
                          new Array(item.length)
                            .fill('')
                            .map((_, idx) => (
                              <div
                                key={`spacer-${index}-${idx}`}
                                style={{ height: 29 }}></div>
                            ))}
                      </Fragment>
                    ))
                : customLeft
                ? customLeft
                : null}
            </StyledWOList>
            <ApprovalList
              {...{
                listStep,
                listDU,
                enableActions,
                onApprove,
                onReject,
                onAssign,
                onClickApprove,
                onClickAssign,
                onClickReject,
              }}
            />
          </StyledGrid>
        </div>
      )}
    </div>
  )
}

export default WorkflowApproval
