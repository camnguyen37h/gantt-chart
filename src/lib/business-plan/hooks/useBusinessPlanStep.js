import * as BusinessPlanAPI from '../businessPlanApiConfig'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ResponseStatusCode } from '../../service/constant'
import { fetchBusinessPlanWorkflow } from '../redux'
import { NotificationManager } from 'react-notifications'

const useBusinessPlanStep = () => {
  const dispatch = useDispatch()
  const { listWorkOrder, listStep, loading } = useSelector(
    state => state.businessApproval
  )

  const approveRejectWO = async params => {
    const result = await BusinessPlanAPI.approveRejectWO(params)
    if (result.status === ResponseStatusCode.success) {
      NotificationManager.success(result.data.message || 'Success')
      return result.data
    } else {
      return NotificationManager.error(result.message || 'Failed')
    }
  }

  const getBusinessPlanWorkflow = useCallback(
    params => {
      return dispatch(fetchBusinessPlanWorkflow(params))
    },
    [dispatch]
  )

  return {
    approveRejectWO,
    getBusinessPlanWorkflow,
    listWorkOrder,
    listStep,
    loadingApproval: loading,
  }
}

export default useBusinessPlanStep
