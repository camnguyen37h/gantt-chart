import * as BusinessPlanAPI from '../../businessPlanApiConfig'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ResponseStatusCode } from '../../../service/constant'
import { NotificationManager } from 'react-notifications'

export const getUserActionHistory = createAsyncThunk(
  'get/getUserActionHistory',
  async (
    { businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale, module },
    { rejectWithValue }
  ) => {
    const result = await BusinessPlanAPI.getUserActionHistory(
      businessPlanVersionId,
      deliveryUnit,
      pageNum,
      pageSize,
      module,
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
