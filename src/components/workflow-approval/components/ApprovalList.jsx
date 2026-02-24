import { useState, Fragment } from 'react'
import styled from 'styled-components'
import useWorkflowApproval from '../hooks/useWorkflowApproval'
import { Modal, Select } from 'antd'
import { debounce } from 'lodash'
import ApprovalItem from './ApprovalItem'

const StyledApprovalList = styled.div`
  display: flex;
  gap: 4px;
  & > div {
    flex: 1;
  }
`

const ApprovalList = ({
  listStep,
  listDU,
  enableActions,
  onReject,
  onApprove,
  onAssign,
  onClickApprove: onClickApproveProp,
  onClickReject: onClickRejectProp,
  onClickAssign: onClickAssignProp,
}) => {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [action, setAction] = useState('')
  const [person, setPerson] = useState()
  const [actionLoading, setActionLoading] = useState(false)
  const { listUser, getUserInWorkflow } = useWorkflowApproval()
  const isEmptyListDu = !listDU

  const handleSearchMember = debounce(e => {
    getUserInWorkflow({
      search: e,
    })
  }, 1000)

  const handleChangeMember = ldap => {
    setPerson({ ...person, ldap })
  }

  const handleAssign = async () => {
    setActionLoading(true)
    await onAssign(person)
    setAssignModalVisible(false)
    setActionLoading(false)
  }

  const handleCancelAssign = () => {
    setAssignModalVisible(false)
  }

  const handleReject = async () => {
    try {
      setActionLoading(true)
      await onReject(person)
      setConfirmModalVisible(false)
      setActionLoading(false)
    } catch (e) {
      console.log(e)
    }
  }

  const handleApprove = async () => {
    try {
      setActionLoading(true)
      await onApprove(person)
      setConfirmModalVisible(false)
      setActionLoading(false)
    } catch (e) {
      console.log(e)
    }
  }

  const onClickAssign = approver => {
    if (onClickAssignProp) {
      onClickAssignProp(approver)
      return
    }
    setAssignModalVisible(true)
    setPerson(approver)
  }

  const onClickReject = approver => {
    if (onClickRejectProp) {
      onClickRejectProp(approver)
      return
    }
    setConfirmModalVisible(true)
    setPerson(approver)
    setAction('REJECTED')
  }

  const onClickApprove = approver => {
    if (onClickApproveProp) {
      onClickApproveProp(approver)
      return
    }
    setConfirmModalVisible(true)
    setPerson(approver)
    setAction('APPROVED')
  }

  return (
    <StyledApprovalList>
      {Object.values(listStep).map(step => {
        if (isEmptyListDu) {
          return (
            <div className="grid-list">
              {step && step.approvalList.length > 0 && (
                <div className="grid-group">
                  {step.approvalList.map(approver => (
                    <ApprovalItem
                      approver={approver}
                      enableActions={enableActions}
                      onClickAssign={approver =>
                        onClickAssign({ ...approver, stepName: step.stepName })
                      }
                      onClickApprove={approver =>
                        onClickApprove({ ...approver, stepName: step.stepName })
                      }
                      onClickReject={approver =>
                        onClickReject({ ...approver, stepName: step.stepName })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )
        }
        if (Object.keys(step.map).includes('None')) {
          const allWO = Object.values(listDU).flat()
          const allWOLength = allWO.reduce((res, wo) => {
            return res + (wo.length || 0)
          }, allWO.length)

          return (
            <div className="grid-list">
              {step.map.None && step.map.None.length > 0 && (
                <div className="grid-group">
                  {step.map.None.map(approver => (
                    <ApprovalItem
                      approver={approver}
                      enableActions={enableActions}
                      onClickAssign={approver =>
                        onClickAssign({ ...approver, stepName: step.stepName })
                      }
                      onClickApprove={approver =>
                        onClickApprove({ ...approver, stepName: step.stepName })
                      }
                      onClickReject={approver =>
                        onClickReject({ ...approver, stepName: step.stepName })
                      }
                    />
                  ))}
                  {allWOLength > step.map.None.length &&
                    new Array(allWOLength - step.map.None.length)
                      .fill('')
                      .map(() => <div style={{ height: 29 }}></div>)}
                </div>
              )}
            </div>
          )
        }

        return (
          <div className="grid-list">
            {Object.keys(listDU).map(gKey => {
              const isDU = step.map[gKey]
                ? step.map[gKey][0].departmentName !== gKey
                : false
              if (isDU) {
                return listDU[gKey].map(wo => {
                  return (
                    step.map[gKey] &&
                    step.map[gKey].length > 0 && (
                      <div className="grid-group">
                        {step.map[gKey]
                          .filter(
                            approver => approver.departmentName === wo.duName
                          )
                          .map(approver => (
                            <ApprovalItem
                              approver={approver}
                              enableActions={enableActions}
                              onClickAssign={approver =>
                                onClickAssign({
                                  ...approver,
                                  stepName: step.stepName,
                                })
                              }
                              onClickApprove={approver =>
                                onClickApprove({
                                  ...approver,
                                  stepName: step.stepName,
                                })
                              }
                              onClickReject={approver =>
                                onClickReject({
                                  ...approver,
                                  stepName: step.stepName,
                                })
                              }
                            />
                          ))}
                      </div>
                    )
                  )
                })
              }

              const gWO = listDU[gKey]
              const gWOLength = gWO.reduce((res, wo) => {
                return res + (wo.length || 0)
              }, gWO.length)
              return (
                step.map[gKey] &&
                step.map[gKey].length > 0 && (
                  <div className="grid-group">
                    {step.map[gKey].map(approver => (
                      <ApprovalItem
                        approver={approver}
                        enableActions={enableActions}
                        onClickAssign={approver =>
                          onClickAssign({
                            ...approver,
                            stepName: step.stepName,
                          })
                        }
                        onClickApprove={approver =>
                          onClickApprove({
                            ...approver,
                            stepName: step.stepName,
                          })
                        }
                        onClickReject={approver =>
                          onClickReject({
                            ...approver,
                            stepName: step.stepName,
                          })
                        }
                      />
                    ))}
                    {gWOLength > step.map[gKey].length &&
                      new Array(gWOLength - step.map[gKey].length)
                        .fill('')
                        .map(() => <div style={{ height: 29 }}></div>)}
                  </div>
                )
              )
            })}
          </div>
        )
      })}
      <Modal
        title={'Confirmation'}
        visible={confirmModalVisible}
        destroyOnClose
        okButtonProps={{
          type: action === 'REJECTED' ? 'danger' : 'primary',
          loading: actionLoading,
        }}
        okText={action === 'REJECTED' ? 'Reject' : 'Approve'}
        onOk={action === 'REJECTED' ? handleReject : handleApprove}
        onCancel={() => setConfirmModalVisible(false)}>
        {action === 'REJECTED' ? (
          <div>Are you sure you want to reject?</div>
        ) : (
          <div>Are you sure you want to approve?</div>
        )}
      </Modal>
      <Modal
        visible={assignModalVisible}
        onOk={handleAssign}
        onCancel={handleCancelAssign}
        okButtonProps={{
          loading: actionLoading,
        }}
        destroyOnClose
        title="Assign approval person for business plan">
        <div>
          <Select
            dropdownRender={menu =>
              listUser.data && listUser.data.length > 0 ? (
                <Fragment>{menu}</Fragment>
              ) : (
                <Fragment></Fragment>
              )
            }
            className="workflow-modal-select"
            onChange={e => handleChangeMember(e)}
            onSearch={handleSearchMember}
            onBlur={() => handleSearchMember('')}
            placeholder="Select Member"
            showSearch={true}
            filterOption={false}
            loading={listUser.loading}>
            {Array.isArray(listUser.data) &&
              listUser.data &&
              listUser.data.map(item => (
                <Select.Option value={item.userName} key={item.userId}>
                  {item.fullName}
                </Select.Option>
              ))}
          </Select>
        </div>
      </Modal>
    </StyledApprovalList>
  )
}

export default ApprovalList
