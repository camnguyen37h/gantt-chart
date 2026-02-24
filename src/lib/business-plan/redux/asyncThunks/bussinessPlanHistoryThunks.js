import BUSINESS_PLAN_API from '../../../service/api/businessPlan'
import Request from '../../../service/request'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ResponseStatusCode } from '../../../service/constant'
import { NotificationManager } from 'react-notifications'

export const getHistoryDeliveryPlan = createAsyncThunk(
  'get/getHistoryDeliveryPlan',
  async (
    { businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale },
    { rejectWithValue }
  ) => {
    const result = await Request(
      BUSINESS_PLAN_API.getHistoryDeliveryPlan(
        businessPlanVersionId,
        deliveryUnit,
        pageNum,
        pageSize,
        isSale
      )
    )
    if (result.status === ResponseStatusCode.success) {
      return {
        data: result.data,
        total: result.data.total,
      }
    } else {
      NotificationManager.error(result.message)
      return rejectWithValue()
    }
  }
)
export const getHistoryRevenuePlan = createAsyncThunk(
  'get/getHistoryRevenuePlan',
  async (
    { businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale },
    { rejectWithValue }
  ) => {
    const result = await Request(
      BUSINESS_PLAN_API.getHistoryRevenuePlan(
        businessPlanVersionId,
        deliveryUnit,
        pageNum,
        pageSize,
        isSale
      )
    )
    if (result.status === ResponseStatusCode.success) {
      return {
        data: result.data,
        total: result.data.total,
      }
    } else {
      NotificationManager.error(result.message)
      return rejectWithValue()
    }
  }
)
