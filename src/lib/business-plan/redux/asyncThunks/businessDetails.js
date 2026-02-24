import { createAsyncThunk } from '@reduxjs/toolkit'
import Request from '../../../service/request'
import { ResponseStatusCode } from '../../../service/constant'
import BUSINESS_PLAN_API from '../../../service/api/businessPlan'
import { NotificationManager } from 'react-notifications'

export const getBusinessPlanDetail = createAsyncThunk(
  'get/getBusinessPlanDetail',
  async id => {
    const result = await Request(BUSINESS_PLAN_API.getBusinessPlanDetail(id))
    if (result.status === ResponseStatusCode.success) {
      return { data: result.data, errorMessage: result.errorMessage }
    } else {
      if (result.status === ResponseStatusCode.forbidden) {
        window.location.href = '/error/access-deny'
      }
      return NotificationManager.error(result.message)
    }
  }
)

export const getCompareBusinessPlanDetail = createAsyncThunk(
  'get/getCompareBusinessPlanDetail',
  async id => {
    const result = await Request(BUSINESS_PLAN_API.getBusinessPlanDetail(id))
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getBusinessPlanDetailVersion = id =>
  Request(BUSINESS_PLAN_API.getBusinessPlanDetail(id))
