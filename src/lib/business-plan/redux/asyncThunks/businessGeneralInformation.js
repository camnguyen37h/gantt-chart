import BUSINESS_PLAN_API from '../../../service/api/businessPlan'
import { ResponseStatusCode } from '../../../service/constant'
import Request from '../../../service/request'
import { createAsyncThunk } from '@reduxjs/toolkit'
import {NotificationManager} from "react-notifications";

export const getIndustryDomain = createAsyncThunk(
  'get/getIndustryDomain',
  async _ => {
    const result = await Request(BUSINESS_PLAN_API.getIndustryDomain)
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
    const result = await Request(BUSINESS_PLAN_API.getIndustryCurrency)
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
    const result = await Request(
      BUSINESS_PLAN_API.getUserAndDepartmentCollaborator,
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
    const result = await Request(
      BUSINESS_PLAN_API.getBusinessPlanSettingMaxKPI,
      params
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getIndustryCurrencySymbol = () =>
  Request(BUSINESS_PLAN_API.getIndustryCurrency)

export const getAllIndustry = () => Request(BUSINESS_PLAN_API.getIndustryDomain)
