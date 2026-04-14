import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../utils/cmplan/mockCMPlanApi'

// ── Async Thunks ─────────────────────────────────────────────────────────────
export const fetchCIClasses = createAsyncThunk(
  'cmplan/ciClasses/fetchAll',
  async (_, { rejectWithValue }) => {
    const res = await cmplanApi.ciClasses.getAll()
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const createCIClass = createAsyncThunk(
  'cmplan/ciClasses/create',
  async (payload, { rejectWithValue }) => {
    const res = await cmplanApi.ciClasses.create(payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const updateCIClass = createAsyncThunk(
  'cmplan/ciClasses/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await cmplanApi.ciClasses.update(id, payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const deleteCIClass = createAsyncThunk(
  'cmplan/ciClasses/delete',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.ciClasses.remove(id)
    if (!res.success) return rejectWithValue(res.error)
    return { id }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────
const ciClassesSlice = createSlice({
  name: 'ciClasses',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchCIClasses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCIClasses.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCIClasses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to load CI classes'
      })
      // create
      .addCase(createCIClass.pending, (state) => { state.submitting = true })
      .addCase(createCIClass.fulfilled, (state, action) => {
        state.submitting = false
        state.items.push(action.payload)
      })
      .addCase(createCIClass.rejected, (state) => { state.submitting = false })
      // update
      .addCase(updateCIClass.pending, (state) => { state.submitting = true })
      .addCase(updateCIClass.fulfilled, (state, action) => {
        state.submitting = false
        const index = state.items.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(updateCIClass.rejected, (state) => { state.submitting = false })
      // delete
      .addCase(deleteCIClass.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload.id)
      })
  },
})

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCIClasses = (state) => state.cmplan.ciClasses.items
export const selectCIClassesLoading = (state) => state.cmplan.ciClasses.loading
export const selectCIClassesSubmitting = (state) => state.cmplan.ciClasses.submitting
export const selectCIClassById = (id) => (state) =>
  state.cmplan.ciClasses.items.find((c) => c.id === id)

export default ciClassesSlice.reducer
