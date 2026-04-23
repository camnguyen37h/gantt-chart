import { createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'

export const fetchCIRuleConfigs = createAsyncThunk(
  'cmplan/ciRuleConfig/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    const res = await cmplanApi.ciRuleConfig.getAll(filters)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const createCIRuleConfig = createAsyncThunk(
  'cmplan/ciRuleConfig/create',
  async (payload, { rejectWithValue }) => {
    const res = await cmplanApi.ciRuleConfig.create(payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const updateCIRuleConfig = createAsyncThunk(
  'cmplan/ciRuleConfig/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await cmplanApi.ciRuleConfig.update(id, payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const deleteCIRuleConfig = createAsyncThunk(
  'cmplan/ciRuleConfig/delete',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.ciRuleConfig.remove(id)
    if (!res.success) return rejectWithValue(res.error)
    return { id }
  }
)
