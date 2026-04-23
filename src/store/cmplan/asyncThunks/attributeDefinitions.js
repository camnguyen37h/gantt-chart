import { createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'

export const fetchAttributeDefinitions = createAsyncThunk(
  'cmplan/attributeDefinitions/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    const res = await cmplanApi.attributeDefinitions.getAll(filters)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const createAttributeDefinition = createAsyncThunk(
  'cmplan/attributeDefinitions/create',
  async (payload, { rejectWithValue }) => {
    const res = await cmplanApi.attributeDefinitions.create(payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const updateAttributeDefinition = createAsyncThunk(
  'cmplan/attributeDefinitions/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await cmplanApi.attributeDefinitions.update(id, payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const deleteAttributeDefinition = createAsyncThunk(
  'cmplan/attributeDefinitions/delete',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.attributeDefinitions.remove(id)
    if (!res.success) return rejectWithValue(res.error)
    return { id }
  }
)
