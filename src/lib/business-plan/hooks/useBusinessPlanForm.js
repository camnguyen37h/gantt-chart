import * as redux from '../redux'
import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import * as BusinessPlanAPI from '../businessPlanApiConfig'
import { ResponseStatusCode } from '../../service/constant'
import { NotificationManager } from 'react-notifications'

const useBusinessPlanForm = () => {
  const dispatch = useDispatch()
  const {
    businessPlanItems,
    columns,
    compareBusinessPlanItems,
    compareColumnLabels,
  } = useSelector(state => state.businessPlanDetails)

  const setBusinessPlanItem = useCallback(
    ({ item }) => {
      dispatch(redux.setBusinessPlanItem({ item }))
    },
    [dispatch]
  )

  const setBusinessPlanItems = useCallback(
    ({ form }) => {
      dispatch(redux.setBusinessPlanItems(form))
    },
    [dispatch]
  )

  const getBusinessPlanDetail = useCallback(
    id => {
      dispatch(redux.getBusinessPlanDetail(id))
    },
    [dispatch]
  )

  const getMMBillService = async params => {
    const result = await BusinessPlanAPI.getMMBillService(params)
    if (result.status === ResponseStatusCode.success) {
      return result.data.crmMasterDataMappings
    } else {
      return NotificationManager.error(result.message)
    }
  }

  const addBusinessPlanRow = useCallback(
    ({ sectionKey, rowKey, row }) => {
      dispatch(redux.addBusinessPlanRow({ sectionKey, rowKey, row }))
    },
    [dispatch]
  )

  const updateBusinessPlanRow = useCallback(
    ({ sectionKey, rowKey, row }) => {
      dispatch(redux.updateBusinessPlanRow({ sectionKey, rowKey, row }))
    },
    [dispatch]
  )

  const deleteBusinessPlanRow = useCallback(
    ({ sectionKey, rowKey }) => {
      dispatch(redux.deleteBusinessPlanRow({ sectionKey, rowKey }))
    },
    [dispatch]
  )

  const getCompareBusinessPlanDetail = useCallback(
    (id, params) => {
      dispatch(redux.getCompareBusinessPlanDetail({ id, params }))
    },
    [dispatch]
  )

  const clearCompareBusinessPlan = useCallback(
    id => {
      dispatch(redux.clearCompareBusinessPlan(id))
    },
    [dispatch]
  )

  return {
    businessPlanItems,
    setBusinessPlanItem,
    getBusinessPlanDetail,
    setBusinessPlanItems,
    getMMBillService,
    addBusinessPlanRow,
    updateBusinessPlanRow,
    deleteBusinessPlanRow,
    getCompareBusinessPlanDetail,
    columns,
    compareBusinessPlanItems,
    compareColumnLabels,
    clearCompareBusinessPlan,
  }
}

export default useBusinessPlanForm
