import * as BusinessPlanAPI from '../../businessPlanApiConfig'
import { ResponseStatusCode } from '../../../service/constant'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { NotificationManager } from 'react-notifications'

export const getIndustryDomain = createAsyncThunk(
  'get/getIndustryDomain',
  async _ => {
    const result = await BusinessPlanAPI.getIndustryDomain()
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getIndustryCurrency = createAsyncThunk(
  'get/getIndustryCurrency',
  async _ => {
    const result = await BusinessPlanAPI.getIndustryCurrency()
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getUserAndDepartmentCollaborator = createAsyncThunk(
  'get/getUserAndDepartmentCollaborator',
  async params => {
    const result = await BusinessPlanAPI.getUserAndDepartmentCollaborator(
      params
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getBusinessPlanSettingMaxKPI = createAsyncThunk(
  'get/getBusinessPlanSettingMaxKPI',
  async params => {
    const result = await BusinessPlanAPI.getBusinessPlanSettingMaxKPI(params)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getIndustryCurrencySymbol = () =>
  BusinessPlanAPI.getIndustryCurrency()

export const getAllIndustry = () => BusinessPlanAPI.getIndustryDomain()
