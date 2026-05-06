import { createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../../utils/cmplan/mockCMPlanApi'

/** Load the full (sourceType, relType, targetType) triple matrix. */
export const fetchCITypeRelationships = createAsyncThunk(
  'cmplan/ciTypeRelationships/fetchAll',
  async (_, { rejectWithValue }) => {
    const res = await cmplanApi.ciTypeRelationships.getAll()
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

/** Load all CIs for a given CI Type, optionally filtered by searchText. Keyed by "panel|ciType|searchText" in state.cisByType. */
export const fetchCIsByType = createAsyncThunk(
  'cmplan/ciTypeRelationships/fetchCIsByType',
  async ({ panel = 'default', ciType, searchText = '' }, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.getByType(ciType, searchText)
    if (!res.success) return rejectWithValue(res.error)
    const key = `${panel}|${ciType}|${searchText}`
    return { key, data: res.data.data }
  }
)
