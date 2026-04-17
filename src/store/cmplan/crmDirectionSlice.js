import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../utils/cmplan/mockCMPlanApi'

// ── Async Thunks ─────────────────────────────────────────────────────────────
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

// ── Slice ─────────────────────────────────────────────────────────────────────
const crmDirectionSlice = createSlice({
  name: 'crmDirection',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCRMDirections.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCRMDirections.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCRMDirections.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload && action.payload.message
          ? action.payload.message
          : 'Failed to load CRM directions'
      })

    builder
      .addCase(createCRMDirection.pending, (state) => { state.submitting = true })
      .addCase(createCRMDirection.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [...state.items, action.payload]
      })
      .addCase(createCRMDirection.rejected, (state) => { state.submitting = false })

    builder
      .addCase(updateCRMDirection.pending, (state) => { state.submitting = true })
      .addCase(updateCRMDirection.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        )
      })
      .addCase(updateCRMDirection.rejected, (state) => { state.submitting = false })

    builder
      .addCase(deleteCRMDirection.pending, (state) => { state.submitting = true })
      .addCase(deleteCRMDirection.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload.id)
      })
      .addCase(deleteCRMDirection.rejected, (state) => { state.submitting = false })
  },
})

export default crmDirectionSlice.reducer

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCRMDirections = (state) => state.cmplan.crmDirection.items
export const selectCRMDirectionLoading = (state) => state.cmplan.crmDirection.loading
export const selectCRMDirectionSubmitting = (state) => state.cmplan.crmDirection.submitting
