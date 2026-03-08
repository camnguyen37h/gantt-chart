import * as BusinessPlanAPI from '../../businessPlanApiConfig'
import { ResponseStatusCode } from '../../../service/constant'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { NotificationManager } from 'react-notifications'

const getBusinessPlanListStatus = createAsyncThunk(
  'get/getBusinessPlanListStatus',
  async _ => {
    const result = await BusinessPlanAPI.getStatus()
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

const getBusinessPlanListVersion = createAsyncThunk(
  'get/getBusinessPlanListVersion',
  async _ => {
    const result = await BusinessPlanAPI.getVersion()
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

const getBusinessPlanListCustomerName = createAsyncThunk(
  'get/getBusinessPlanListCustomerName',
  async params => {
    const result = await BusinessPlanAPI.getCustomerName({
      params: {
        search: params.search,
      },
    })

    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

const getBusinessPlanListPlanName = createAsyncThunk(
  'get/getBusinessPlanListPlanName',
  async params => {
    const result = await BusinessPlanAPI.getBusinessPlanName({
      params: {
        search: params.search,
      },
    })
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

const getBusinessPlanListProjectCode = createAsyncThunk(
  'get/getBusinessPlanListProjectCode',
  async params => {
    const result = await BusinessPlanAPI.getProjectCode({
      params: {
        search: params.search,
      },
    })
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

const getBusinessPlanListApprovalStep = createAsyncThunk(
  'get/getBusinessPlanListApprovalStep',
  async _ => {
    const result = await BusinessPlanAPI.getApprovalStep()
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

const postListBusinessPlanList = createAsyncThunk(
  'post/postListBusinessPlanList',
  async params => {
    const result = await BusinessPlanAPI.postListBusinessPlanList(params)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

const getBusinessPlanListDU = createAsyncThunk(
  'get/getBusinessPlanListDU',
  async params => {
    const result = await BusinessPlanAPI.getListDU(params)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

const getBusinessPlanListBU = createAsyncThunk(
  'get/getBusinessPlanListBU',
  async params => {
    const result = await BusinessPlanAPI.getListBU(params)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export {
  getBusinessPlanListStatus,
  getBusinessPlanListVersion,
  getBusinessPlanListCustomerName,
  getBusinessPlanListPlanName,
  getBusinessPlanListProjectCode,
  getBusinessPlanListApprovalStep,
  postListBusinessPlanList,
  getBusinessPlanListDU,
  getBusinessPlanListBU,
}
