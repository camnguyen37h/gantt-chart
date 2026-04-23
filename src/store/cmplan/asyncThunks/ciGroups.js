import { createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'

export const fetchCIGroups = createAsyncThunk(
  'cmplan/ciGroups/fetchAll',
  async (_, { rejectWithValue }) => {
    const res = await cmplanApi.groups.getAll()
    if (!res.success) return rejectWithValue(res.message)
    return res.data
  }
)

export const createCIGroup = createAsyncThunk(
  'cmplan/ciGroups/create',
  async (payload, { rejectWithValue }) => {
    const res = await cmplanApi.groups.create(payload)
    if (!res.success) return rejectWithValue(res.message)
    return res.data
  }
)

export const updateCIGroup = createAsyncThunk(
  'cmplan/ciGroups/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await cmplanApi.groups.update(id, payload)
    if (!res.success) return rejectWithValue(res.message)
    return res.data
  }
)

export const deleteCIGroup = createAsyncThunk(
  'cmplan/ciGroups/delete',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.groups.remove(id)
    if (!res.success) return rejectWithValue(res.message)
    return id
  }
)
