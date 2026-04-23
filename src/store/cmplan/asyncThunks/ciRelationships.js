import { createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'

export const fetchAllRelationships = createAsyncThunk(
  'cmplan/ciRelationships/fetchAll',
  async (_, { rejectWithValue }) => {
    const res = await cmplanApi.relationships.getAll()
    if (!res.success) return rejectWithValue(res.message)
    return res.data
  }
)

export const createRelationship = createAsyncThunk(
  'cmplan/ciRelationships/create',
  async (payload, { rejectWithValue }) => {
    const res = await cmplanApi.relationships.create(payload)
    if (!res.success) return rejectWithValue(res.message)
    return res.data
  }
)

export const deleteRelationship = createAsyncThunk(
  'cmplan/ciRelationships/delete',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.relationships.remove(id)
    if (!res.success) return rejectWithValue(res.message)
    return id
  }
)

export const updateRelationship = createAsyncThunk(
  'cmplan/ciRelationships/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await cmplanApi.relationships.update(id, payload)
    if (!res.success) return rejectWithValue((res.error && res.error.message) || 'Update failed')
    return res.data
  }
)

export const fetchExistingRelationshipPairs = createAsyncThunk(
  'cmplan/ciRelationships/fetchExistingPairs',
  async (_, { rejectWithValue }) => {
    const res = await cmplanApi.relationships.getExistingPairs()
    if (!res.success) return rejectWithValue(res.message)
    return res.data
  }
)

export const bulkCreateRelationships = createAsyncThunk(
  'cmplan/ciRelationships/bulkCreate',
  async (relationships, { rejectWithValue }) => {
    const res = await cmplanApi.relationships.bulkCreate(relationships)
    if (!res.success) return rejectWithValue((res.error && res.error.message) || 'Bulk create failed')
    return res.data
  }
)
