import { WORK_FLOW_API } from '../../../lib/service/api/WorkFlow'
import { ResponseStatusCode } from '../../../lib/service/constant'
import Request from '../../../lib/service/request'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { NotificationManager } from 'react-notifications'

export const fetchSpecificPermission = createAsyncThunk(
  'get/fetchSpecificPermission',
  async () => {
    const result = await Request(WORK_FLOW_API.getSpecificPermission)
    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)

export const fetchUserWorkflow = createAsyncThunk(
  'get/fetchUserWorkflow',
  async params => {
    const result = await Request(WORK_FLOW_API.getUserInWorkflow, params)

    if (result.status === ResponseStatusCode.success) {
      return result.data
    } else {
      return NotificationManager.error(result.message)
    }
  }
)
