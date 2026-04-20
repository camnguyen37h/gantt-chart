import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../utils/cmplan/mockCMPlanApi'

// ── Async Thunks ─────────────────────────────────────────────────────────────
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
    if (!res.success) return rejectWithValue(res.error?.message || 'Update failed')
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
    if (!res.success) return rejectWithValue(res.error && res.error.message || 'Bulk create failed')
    return res.data
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────
const ciRelationshipsSlice = createSlice({
  name: 'ciRelationships',
  initialState: {
    items: [],
    existingPairs: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRelationships.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllRelationships.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAllRelationships.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createRelationship.pending, (state) => {
        state.submitting = true
      })
      .addCase(createRelationship.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [...state.items, action.payload]
      })
      .addCase(createRelationship.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(deleteRelationship.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload)
      })
      .addCase(updateRelationship.pending, (state) => {
        state.submitting = true
      })
      .addCase(updateRelationship.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((r) =>
          r.id === action.payload.id ? action.payload : r
        )
      })
      .addCase(updateRelationship.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(fetchExistingRelationshipPairs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExistingRelationshipPairs.fulfilled, (state, action) => {
        state.loading = false
        state.existingPairs = action.payload
      })
      .addCase(fetchExistingRelationshipPairs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(bulkCreateRelationships.pending, (state) => {
        state.submitting = true
      })
      .addCase(bulkCreateRelationships.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [...state.items, ...action.payload.created]
        // Use pair strings returned by API directly — no FE string construction
        state.existingPairs = [...state.existingPairs, ...action.payload.createdPairs]
      })
      .addCase(bulkCreateRelationships.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
  },
})

export default ciRelationshipsSlice.reducer

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllRelationships = (state) => state.cmplan.ciRelationships.items
export const selectExistingRelationshipPairs = (state) => state.cmplan.ciRelationships.existingPairs
export const selectRelationshipsLoading = (state) => state.cmplan.ciRelationships.loading
export const selectRelationshipsSubmitting = (state) => state.cmplan.ciRelationships.submitting

/** Returns all relationships where ciId is either source or target */
export const selectRelationshipsByCI = (ciId) => (state) =>
  state.cmplan.ciRelationships.items.filter(
    (r) => r.sourceId === ciId || r.targetId === ciId
  )
