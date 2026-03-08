import * as BusinessPlanAPI from '../../businessPlanApiConfig'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ResponseStatusCode } from '../../../service/constant'
import { NotificationManager } from 'react-notifications'

export const getHistoryDeliveryPlan = createAsyncThunk(
  'get/getHistoryDeliveryPlan',
  async (
    { businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale },
    { rejectWithValue }
  ) => {
    const result = await BusinessPlanAPI.getHistoryDeliveryPlan(
      businessPlanVersionId,
      deliveryUnit,
      pageNum,
      pageSize,
      isSale
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
    const result = await BusinessPlanAPI.getHistoryRevenuePlan(
      businessPlanVersionId,
      deliveryUnit,
      pageNum,
      pageSize,
      isSale
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
