import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../utils/cmplan/mockCMPlanApi'

// ── Async Thunks ─────────────────────────────────────────────────────────────
export const fetchCIRuleConfigs = createAsyncThunk(
  'cmplan/ciRuleConfig/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    const res = await cmplanApi.ciRuleConfig.getAll(filters)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const createCIRuleConfig = createAsyncThunk(
  'cmplan/ciRuleConfig/create',
  async (payload, { rejectWithValue }) => {
    const res = await cmplanApi.ciRuleConfig.create(payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const updateCIRuleConfig = createAsyncThunk(
  'cmplan/ciRuleConfig/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await cmplanApi.ciRuleConfig.update(id, payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const deleteCIRuleConfig = createAsyncThunk(
  'cmplan/ciRuleConfig/delete',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.ciRuleConfig.remove(id)
    if (!res.success) return rejectWithValue(res.error)
    return { id }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────
const ciRuleConfigSlice = createSlice({
  name: 'ciRuleConfig',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetchAll
    builder
      .addCase(fetchCIRuleConfigs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCIRuleConfigs.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCIRuleConfigs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to load CI rule configs'
      })

    // create
    builder
      .addCase(createCIRuleConfig.pending, (state) => { state.submitting = true })
      .addCase(createCIRuleConfig.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [...state.items, action.payload]
      })
      .addCase(createCIRuleConfig.rejected, (state) => { state.submitting = false })

    // update
    builder
      .addCase(updateCIRuleConfig.pending, (state) => { state.submitting = true })
      .addCase(updateCIRuleConfig.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        )
      })
      .addCase(updateCIRuleConfig.rejected, (state) => { state.submitting = false })

    // delete
    builder
      .addCase(deleteCIRuleConfig.pending, (state) => { state.submitting = true })
      .addCase(deleteCIRuleConfig.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload.id)
      })
      .addCase(deleteCIRuleConfig.rejected, (state) => { state.submitting = false })
  },
})

export default ciRuleConfigSlice.reducer

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCIRuleConfigs = (state) => state.cmplan.ciRuleConfig.items
export const selectCIRuleConfigLoading = (state) => state.cmplan.ciRuleConfig.loading
export const selectCIRuleConfigSubmitting = (state) => state.cmplan.ciRuleConfig.submitting
