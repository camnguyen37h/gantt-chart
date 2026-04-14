import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../utils/cmplan/mockCMPlanApi'

// ── Async Thunks ─────────────────────────────────────────────────────────────
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

// ── Slice ─────────────────────────────────────────────────────────────────────
const ciGroupsSlice = createSlice({
  name: 'ciGroups',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCIGroups.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCIGroups.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCIGroups.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createCIGroup.pending, (state) => {
        state.submitting = true
      })
      .addCase(createCIGroup.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [action.payload, ...state.items]
      })
      .addCase(createCIGroup.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(updateCIGroup.pending, (state) => {
        state.submitting = true
      })
      .addCase(updateCIGroup.fulfilled, (state, action) => {
        state.submitting = false
        const idx = state.items.findIndex((g) => g.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateCIGroup.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(deleteCIGroup.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g.id !== action.payload)
      })
  },
})

export default ciGroupsSlice.reducer

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCIGroups = (state) => state.cmplan.ciGroups.items
export const selectCIGroupsLoading = (state) => state.cmplan.ciGroups.loading
export const selectCIGroupsSubmitting = (state) => state.cmplan.ciGroups.submitting
