import { ResponseStatusCode } from '../../../lib/service/constant'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { NotificationManager } from 'react-notifications'
import * as BusinessPlanAPI from '../../../lib/business-plan/businessPlanApiConfig'

export const fetchSpecificPermission = createAsyncThunk(
  'get/fetchSpecificPermission',
  async () => {
    const result = await BusinessPlanAPI.getStatus()
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const fetchUserWorkflow = createAsyncThunk(
  'get/fetchUserWorkflow',
  async params => {
    const result = await BusinessPlanAPI.getVersion(params)

    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)
