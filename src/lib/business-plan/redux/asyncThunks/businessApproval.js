import BUSINESS_PLAN_API from '../../../service/api/businessPlan'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { NotificationManager } from 'react-notifications'
import { ResponseStatusCode } from '../../../service/constant'
import Request from '../../../service/request'

export const fetchBusinessPlanWorkflow = createAsyncThunk(
  'get/fetchBusinessPlanWorkflow',
  async params => {
    const result = await Request(
      BUSINESS_PLAN_API.getBusinessPlanWorkflow,
      params
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)
