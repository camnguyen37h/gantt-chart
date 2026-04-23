import { createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'

export const fetchConfigurationItems = createAsyncThunk(
  'cmplan/configurationItems/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.getAll(params)
    if (!res.success) return rejectWithValue(res.error)
    return { items: res.data, total: res.total, page: res.page, pageSize: res.pageSize }
  }
)

export const fetchCIDetail = createAsyncThunk(
  'cmplan/configurationItems/fetchById',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.getById(id)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const createConfigurationItem = createAsyncThunk(
  'cmplan/configurationItems/create',
  async (payload, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.create(payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const updateConfigurationItem = createAsyncThunk(
  'cmplan/configurationItems/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.update(id, payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const deleteConfigurationItem = createAsyncThunk(
  'cmplan/configurationItems/delete',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.remove(id)
    if (!res.success) return rejectWithValue(res.error)
    return { id }
  }
)

export const fetchDashboardStats = createAsyncThunk(
  'cmplan/configurationItems/fetchStats',
  async (_, { rejectWithValue }) => {
    const res = await cmplanApi.compliance.getStats()
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)
