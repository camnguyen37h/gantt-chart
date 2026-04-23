import { createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'

export const fetchCITypes = createAsyncThunk(
  'cmplan/ciTypes/fetchAll',
  async (_, { rejectWithValue }) => {
    const res = await cmplanApi.ciTypes.getAll()
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const createCIType = createAsyncThunk(
  'cmplan/ciTypes/create',
  async (payload, { rejectWithValue }) => {
    const res = await cmplanApi.ciTypes.create(payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const updateCIType = createAsyncThunk(
  'cmplan/ciTypes/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await cmplanApi.ciTypes.update(id, payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const deleteCIType = createAsyncThunk(
  'cmplan/ciTypes/delete',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.ciTypes.remove(id)
    if (!res.success) return rejectWithValue(res.error)
    return { id }
  }
)
