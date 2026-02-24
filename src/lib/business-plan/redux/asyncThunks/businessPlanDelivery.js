import { createAsyncThunk } from '@reduxjs/toolkit'
import Request from '../../../service/request'
import { ResponseStatusCode } from '../../../service/constant'
import { NotificationManager } from 'react-notifications'
import BUSINESS_PLAN_API from '../../../service/api/businessPlan'

export const getResourcesInformationDeliveryPlan = createAsyncThunk(
  'get/getResourcesInformationDeliveryPlan',
  async params => {
    const result = await Request(
      BUSINESS_PLAN_API.getResourcesInformationDeliveryPlan,
      params
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getListResourceType = createAsyncThunk(
  'get/getListResourceType',
  async () => {
    const result = await Request(BUSINESS_PLAN_API.getListResourceType)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getListResource = createAsyncThunk(
  'get/getListResource',
  async params => {
    const result = await Request(BUSINESS_PLAN_API.getListResource, params)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getLocation = createAsyncThunk('get/getLocation', async params => {
  const result = await Request(BUSINESS_PLAN_API.getLocation, params)
  if (result.status === ResponseStatusCode.success) {
    return result.data
  } else {
    return NotificationManager.error(result.message)
  }
})

export const getEmployeeType = createAsyncThunk(
  'get/getEmployeeType',
  async params => {
    const result = await Request(BUSINESS_PLAN_API.getEmployeeType, params)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getEmployeePosition = createAsyncThunk(
  'get/getEmployeePosition',
  async params => {
    const result = await Request(BUSINESS_PLAN_API.getEmployeePosition, params)
    if (result.status === ResponseStatusCode.success) {
      return {
        data: result.data,
        errorMessage: result.errorMessage,
        httpStatus: result.status,
      }
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getEmployeeRole = createAsyncThunk(
  'get/getEmployeeRole',
  async params => {
    const result = await Request(BUSINESS_PLAN_API.getEmployeeRole, params)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getOtherExpensesTable = createAsyncThunk(
  'get/getOtherExpensesTable',
  async params => {
    const result = await Request(
      BUSINESS_PLAN_API.getOtherExpensesTable,
      params
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const saveDeliveryPlan = createAsyncThunk(
  'post/saveDeliveryPlan',
  async params => {
    const result = await Request(BUSINESS_PLAN_API.saveDeliveryPlan, params)
    if (result.status === ResponseStatusCode.success) {
      NotificationManager.success(result.data)
    } else if (result.status !== ResponseStatusCode.forceExpired) {
      NotificationManager.error(result.message)
    }
    return result
  }
)

export const getResourcesInformationReference = createAsyncThunk(
  'get/getResourcesInformationReference',
  async params => {
    const result = await Request(
      BUSINESS_PLAN_API.getResourcesInformationReference,
      params
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getListDUByVersionDelivery = createAsyncThunk(
  'get/getListDUByVersionDelivery',
  async data => {
    const result = await Request(
      BUSINESS_PLAN_API.getListDUByVersionDelivery,
      data
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getSummaryDeliveryPlan = createAsyncThunk(
  'get/getSummaryDeliveryPlan',
  async businessPlanVersionId => {
    const result = await Request(
      BUSINESS_PLAN_API.getSummaryDeliveryPlan,
      businessPlanVersionId
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getLocationExchangeRate = createAsyncThunk(
  'get/getLocationExchangeRate',
  async data => {
    const result = await Request(
      BUSINESS_PLAN_API.getLocationExchangeRate,
      data
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)
