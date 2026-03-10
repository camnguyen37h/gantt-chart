import { createAsyncThunk } from '@reduxjs/toolkit'
import { ResponseStatusCode } from '../../../service/constant'
import * as BusinessPlanAPI from '../../businessPlanApiConfig'
import { NotificationManager } from 'react-notifications'

export const getBusinessPlanDetail = createAsyncThunk(
  'get/getBusinessPlanDetail',
  async id => {
    const result = await BusinessPlanAPI.getBusinessPlanDetail(id)
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

export const getBusinessPlanDetailByViewMode = createAsyncThunk(
  'get/getBusinessPlanDetailByViewMode',
  async ({ id, viewMode }) => {
    const result = await BusinessPlanAPI.getBusinessPlanDetailByViewMode(id, viewMode)
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
    const result = await BusinessPlanAPI.getBusinessPlanDetail(id)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getBusinessPlanDetailVersion = id =>
  BusinessPlanAPI.getBusinessPlanDetail(id)
