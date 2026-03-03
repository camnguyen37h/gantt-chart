import BUSINESS_PLAN_API from '../../../service/api/businessPlan'
import { ResponseStatusCode } from '../../../service/constant'
import Request from '../../../service/request'
import { createAsyncThunk } from '@reduxjs/toolkit'
import {NotificationManager} from "react-notifications";

export const getBusinessPlanDetailComment = createAsyncThunk(
  'get/getBusinessPlanDetailComment',
  async id => {
    const result = await Request(
      BUSINESS_PLAN_API.getBusinessPlanDetailComments,
      id
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const postBusinessPlanComment = createAsyncThunk(
  'post/postBusinessPlanComment',
  async params => {
    const result = await Request(
      BUSINESS_PLAN_API.postBusinessPlanDetailComment,
      params
    )
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const getBusinessPlanHistory = createAsyncThunk(
  'get/getBusinessPlanHistory',
  async id => {
    const result = await Request(BUSINESS_PLAN_API.getHistory(id))
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)
