import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../utils/cmplan/mockCMPlanApi'

// ── Thunks ────────────────────────────────────────────────────────────────────
export const fetchAuditLogByCI = createAsyncThunk(
  'cmplan/ciAuditLog/fetchByCI',
  async (ciId, { rejectWithValue }) => {
    const res = await cmplanApi.auditLog.getByCI(ciId)
    if (!res.success) return rejectWithValue(res.error)
    return { ciId, entries: res.data }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────
const ciAuditLogSlice = createSlice({
  name: 'ciAuditLog',
  initialState: {
    byCI: {},      // { [ciId]: Entry[] }
    loading: {},   // { [ciId]: bool }
  },
  reducers: {
    // Optimistically prepend a new entry (used after CI/rel mutations)
    appendAuditEntry(state, action) {
      const { ciId, entry } = action.payload
      if (state.byCI[ciId]) {
        state.byCI[ciId] = [entry, ...state.byCI[ciId]]
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogByCI.pending, (state, action) => {
        state.loading[action.meta.arg] = true
      })
      .addCase(fetchAuditLogByCI.fulfilled, (state, action) => {
        const { ciId, entries } = action.payload
        state.loading[ciId] = false
        state.byCI[ciId] = entries
      })
      .addCase(fetchAuditLogByCI.rejected, (state, action) => {
        state.loading[action.meta.arg] = false
      })
  },
})

export const { appendAuditEntry } = ciAuditLogSlice.actions
export default ciAuditLogSlice.reducer

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAuditLogByCI = (ciId) => (state) =>
  state.cmplan.ciAuditLog.byCI[ciId] || []

export const selectAuditLogLoading = (ciId) => (state) =>
  state.cmplan.ciAuditLog.loading[ciId] || false
