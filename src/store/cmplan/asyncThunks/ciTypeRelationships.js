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

/** Load CIs for a given CI Type (class name). Keyed by ciType in state.cisByType. */
export const fetchCIsByType = createAsyncThunk(
  'cmplan/ciTypeRelationships/fetchCIsByType',
  async (ciType, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.getByType(ciType)
    if (!res.success) return rejectWithValue(res.error)
    return { ciType, items: res.data }
  }
)
