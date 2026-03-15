import { createAsyncThunk } from '@reduxjs/toolkit'
import { ResponseStatusCode } from '../../../service/constant'
import { NotificationManager } from 'react-notifications'
import * as BusinessPlanAPI from '../../businessPlanApiConfig'

export const getResourcesInformationDeliveryPlan = createAsyncThunk(
  'get/getResourcesInformationDeliveryPlan',
  async params => {
    const result = await BusinessPlanAPI.getResourcesInformationDeliveryPlan(
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
    const result = await BusinessPlanAPI.getListResourceType()
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
    const result = await BusinessPlanAPI.getListResource(params)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getLocation = createAsyncThunk('get/getLocation', async params => {
  const result = await BusinessPlanAPI.getLocation(params)
  if (result.status === ResponseStatusCode.success) {
    return result.data
  } else {
    return NotificationManager.error(result.message)
  }
})

export const getEmployeeType = createAsyncThunk(
  'get/getEmployeeType',
  async params => {
    const result = await BusinessPlanAPI.getEmployeeType(params)
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
    const result = await BusinessPlanAPI.getEmployeePosition(params)
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
    const result = await BusinessPlanAPI.getEmployeeRole(params)
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
    const result = await BusinessPlanAPI.getOtherExpensesTable(params)
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
    const result = await BusinessPlanAPI.saveDeliveryPlan(params)
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
    const result = await BusinessPlanAPI.getResourcesInformationReference(
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
    const result = await BusinessPlanAPI.getListDUByVersionDelivery(data)
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
    const result = await BusinessPlanAPI.getSummaryDeliveryPlan(
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
    const result = await BusinessPlanAPI.getLocationExchangeRate(data)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)
