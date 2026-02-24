import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getHistoryDeliveryPlan, getHistoryRevenuePlan } from '../redux/asyncThunks/bussinessPlanHistoryThunks';

const useBussinessPlanHistoryService = () => {
  const { data = [], loading = false, totalPage} = useSelector(
    (state) => state.bussinessPlanHistory || {}
  );  
  const dispatch = useDispatch();

  const fetchHistoryDeliveryPlan = useCallback(
    (businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale) => dispatch(getHistoryDeliveryPlan({businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale })),
    [dispatch]
  );

  const fetchHistoryRevenuePlan = useCallback(
    (businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale) => dispatch(getHistoryRevenuePlan({ businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale })),
    [dispatch]
  );

  return { fetchHistoryDeliveryPlan, fetchHistoryRevenuePlan, data, loading, totalPage };
};

export default useBussinessPlanHistoryService;
