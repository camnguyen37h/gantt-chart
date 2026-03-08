import * as BusinessPlanAPI from '../../businessPlanApiConfig'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { NotificationManager } from 'react-notifications'
import { ResponseStatusCode } from '../../../service/constant'

export const fetchBusinessPlanWorkflow = createAsyncThunk(
  'get/fetchBusinessPlanWorkflow',
  async params => {
    const result = await BusinessPlanAPI.getBusinessPlanWorkflow(params)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)
