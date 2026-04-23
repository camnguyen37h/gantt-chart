import { createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'

export const fetchAuditLogByCI = createAsyncThunk(
  'cmplan/ciAuditLog/fetchByCI',
  async (ciId, { rejectWithValue }) => {
    const res = await cmplanApi.auditLog.getByCI(ciId)
    if (!res.success) return rejectWithValue(res.error)
    return { ciId, entries: res.data }
  }
)
