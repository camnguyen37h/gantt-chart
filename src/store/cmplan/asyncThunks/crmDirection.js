import { createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'

export const fetchCRMDirections = createAsyncThunk(
  'cmplan/crmDirection/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    const response = await cmplanApi.crmDirection.getAll(filters)
    if (!response.success) return rejectWithValue(response.error)
    return response.data
  }
)

export const createCRMDirection = createAsyncThunk(
  'cmplan/crmDirection/create',
  async (payload, { rejectWithValue }) => {
    const response = await cmplanApi.crmDirection.create(payload)
    if (!response.success) return rejectWithValue(response.error)
    return response.data
  }
)

export const updateCRMDirection = createAsyncThunk(
  'cmplan/crmDirection/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const response = await cmplanApi.crmDirection.update(id, payload)
    if (!response.success) return rejectWithValue(response.error)
    return response.data
  }
)

export const deleteCRMDirection = createAsyncThunk(
  'cmplan/crmDirection/delete',
  async (id, { rejectWithValue }) => {
    const response = await cmplanApi.crmDirection.remove(id)
    if (!response.success) return rejectWithValue(response.error)
    return { id }
  }
)
