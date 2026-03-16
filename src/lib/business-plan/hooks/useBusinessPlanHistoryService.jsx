import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserActionHistory } from '../redux/asyncThunks/bussinessPlanHistoryThunks'

const useBusinessPlanHistoryService = () => {
  const {
    data = [],
    loading = false,
    totalPage,
  } = useSelector(state => state.bussinessPlanHistory || {})
  const dispatch = useDispatch()

  const fetchUserActionHistory = useCallback(
    (businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale, module) =>
      dispatch(
        getUserActionHistory({
          businessPlanVersionId,
          deliveryUnit,
          pageNum,
          pageSize,
          isSale,
          module,
        })
      ),
    [dispatch]
  )

  return {
    fetchUserActionHistory,
    data,
    loading,
    totalPage,
  }
}

export default useBusinessPlanHistoryService
