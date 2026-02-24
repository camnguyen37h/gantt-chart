import BUSINESS_PLAN_API from '../../../service/api/businessPlan'
import { ResponseStatusCode } from '../../../service/constant'
import Request from '../../../service/request'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { NotificationManager } from 'react-notifications'

export const getBusinessPlanOtherRevenue = createAsyncThunk(
  'get/getBusinessPlanOtherRevenue',
  async param => {
    const result = await Request(BUSINESS_PLAN_API.getOtherRevenue, param)
    if (result.status === ResponseStatusCode.success) {
      return { data: result.data, errorMessage: result.errorMessage }
    } else {
      NotificationManager.error(result.message)
    }
  }
)

export const postBusinessPlanOtherRevenue = createAsyncThunk(
  'post/postBusinessPlanOtherRevenue',
  async ({ params, apiType }) => {
    const result = await Request(BUSINESS_PLAN_API.updateOtherRevenue, params)
    if (result.status === ResponseStatusCode.success) {
      return {
        data: result.data,
        errorMessage: result.errorMessage,
        httpStatus: result.status,
        apiType,
      }
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getBusinessPlanSellingExpenses = createAsyncThunk(
  'get/getBusinessPlanSellingExpenses',
  async param => {
    const result = await Request(BUSINESS_PLAN_API.getSellingPlan, param)
    if (result.status === ResponseStatusCode.success) {
      return { data: result.data, errorMessage: result.errorMessage }
    } else {
      NotificationManager.error(result.message)
    }
  }
)

export const postSubmitBaselineRevenuePlan = createAsyncThunk(
  'post/postSubmitBaselineRevenuePlan',
  async param => {
    const result = await Request(
      BUSINESS_PLAN_API.submitBaselineRevenuePlan,
      param
    )
    if (result.status === ResponseStatusCode.success) {
      return { data: result.data, errorMessage: result.errorMessage }
    } else {
      NotificationManager.error(result.message)
    }
  }
)

export const getPositionRevenuePlan = createAsyncThunk(
  'get/getPositionRevenuePlan',
  async param => {
    const result = await Request(BUSINESS_PLAN_API.getPositionRevenuePlan, {
      name: param.text,
      mvv: param.projectCode,
    })
    if (result.status === ResponseStatusCode.success) {
      return {
        data: result.data.map(item => ({
          id: item.id,
          text: item.name,
          value: item.id,
        })),
        errorMessage: result.errorMessage,
        httpStatus: result.status,
      }
    } else {
      NotificationManager.error(result.message)
    }
  }
)

export const getListDUByVersionRevenue = createAsyncThunk(
  'get/getListDUByVersionRevenue',
  async data => {
    const result = await Request(
      BUSINESS_PLAN_API.getListDUByVersionRevenue,
      data
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getSummaryRevenuePlan = createAsyncThunk(
  'get/getSummaryRevenuePlan',
  async data => {
    const result = await Request(BUSINESS_PLAN_API.getSummaryRevenuePlan, data)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)
