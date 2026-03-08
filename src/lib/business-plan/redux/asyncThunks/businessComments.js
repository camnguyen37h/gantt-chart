import * as BusinessPlanAPI from '../../businessPlanApiConfig'
import { ResponseStatusCode } from '../../../service/constant'
import { createAsyncThunk } from '@reduxjs/toolkit'
import {NotificationManager} from "react-notifications";

export const getBusinessPlanDetailComment = createAsyncThunk(
  'get/getBusinessPlanDetailComment',
  async id => {
    const result = await BusinessPlanAPI.getBusinessPlanDetailComments(id)
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
    const result = await BusinessPlanAPI.postBusinessPlanDetailComment(params)
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
    const result = await BusinessPlanAPI.getHistory(id)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)
