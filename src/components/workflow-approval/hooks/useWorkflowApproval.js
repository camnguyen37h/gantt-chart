import { useDispatch, useSelector } from 'react-redux'
import { STEPS_ICON } from '../constants'
import { fetchSpecificPermission, fetchUserWorkflow } from '../redux/asyncThunk'
import { useCallback } from 'react'

const useWorkflowApproval = () => {
  const dispatch = useDispatch()
  const { specificPermissions, listUser } = useSelector(
    state => state.workflowApproval
  )
  const renderStatus = approvalStatuses => {
    const isReject =
      approvalStatuses.length &&
      approvalStatuses.some(item => item === 'REJECTED')
    const isTodo =
      approvalStatuses.length && approvalStatuses.some(item => item === 'TODO')
    const isApprove =
      approvalStatuses.length &&
      approvalStatuses.every(item => item === 'APPROVED')

    if (isReject) return { status: 'error', icon: STEPS_ICON.error }
    if (isTodo) return { status: 'process', icon: STEPS_ICON.process }
    if (isApprove) return { status: 'finish', icon: STEPS_ICON.finish }
    return { status: 'wait', icon: STEPS_ICON.wait }
  }

  const getSpecificPermission = useCallback(() => {
    dispatch(fetchSpecificPermission())
  }, [dispatch])

  const getUserInWorkflow = useCallback(
    params => {
      return dispatch(fetchUserWorkflow(params))
    },
    [dispatch]
  )

  return {
    renderStatus,
    specificPermissions,
    getSpecificPermission,
    listUser,
    getUserInWorkflow,
  }
}

export default useWorkflowApproval
