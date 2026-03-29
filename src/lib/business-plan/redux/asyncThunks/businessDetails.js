import { createAsyncThunk } from '@reduxjs/toolkit'
import { ResponseStatusCode } from '../../../service/constant'
import * as BusinessPlanAPI from '../../businessPlanApiConfig'
import { NotificationManager } from 'react-notifications'
import { decryptRawBpData } from '../../../crypto/decryptSectionList'

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

export const getCompareBusinessPlanDetail = createAsyncThunk(
  'get/getCompareBusinessPlanDetail',
  async ({ id, params }) => {
    const result = await BusinessPlanAPI.getBusinessPlanDetailByViewMode(
      id,
      params
    )
    if (result.status === ResponseStatusCode.success) {
      return decryptRawBpData(result.data)
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getBusinessPlanDetailByViewMode = createAsyncThunk(
  'get/getBusinessPlanDetailByViewMode',
  async ({ id, params }) => {
    const result = await BusinessPlanAPI.getBusinessPlanDetailByViewMode(
      id,
      params
    )
    if (result.status === ResponseStatusCode.success) {
      const data = await decryptRawBpData(result.data)
      return { data, errorMessage: result.errorMessage }
    } else {
      if (result.status === ResponseStatusCode.forbidden) {
        window.location.href = '/error/access-deny'
      }
      return NotificationManager.error(result.message)
    }
  }
)

export const fetchAllViewModesData = createAsyncThunk(
  'get/fetchAllViewModesData',
  async ({ id }) => {
    const viewModes = ['Total', 'OB', 'Onsite', 'Offshore']
    const results = await Promise.all(
      viewModes.map(view =>
        BusinessPlanAPI.getBusinessPlanDetailByViewMode(id, { view })
      )
    )
    // Collect successful raw responses
    const rawMap = viewModes.reduce((acc, view, index) => {
      const result = results[index]
      if (result && result.status === ResponseStatusCode.success) {
        acc[view] = result.data
      }
      return acc
    }, {})
    // Decrypt all views in parallel
    const decryptedEntries = await Promise.all(
      Object.keys(rawMap).map(async view => [view, await decryptRawBpData(rawMap[view])])
    )
    return Object.fromEntries(decryptedEntries)
  }
)

export const getBusinessPlanDetailVersion = id =>
  Request(BUSINESS_PLAN_API.getBusinessPlanDetail(id))
