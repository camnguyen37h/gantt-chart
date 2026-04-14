import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../utils/cmplan/mockCMPlanApi'

// ── Async Thunks ─────────────────────────────────────────────────────────────
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

// ── Slice ─────────────────────────────────────────────────────────────────────
const attributeDefinitionsSlice = createSlice({
  name: 'attributeDefinitions',
  initialState: {
    items: [],
    loading: false,
    error: null,
    activeClassId: null, // 'global' | class id | null (not filtered)
  },
  reducers: {
    setActiveClassId: (state, action) => {
      state.activeClassId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributeDefinitions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAttributeDefinitions.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAttributeDefinitions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to load attribute definitions'
      })
      .addCase(createAttributeDefinition.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateAttributeDefinition.fulfilled, (state, action) => {
        const index = state.items.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(deleteAttributeDefinition.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload.id)
      })
  },
})

export const { setActiveClassId } = attributeDefinitionsSlice.actions

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllAttributeDefinitions = (state) =>
  state.cmplan.attributeDefinitions.items

export const selectAttrDefsLoading = (state) =>
  state.cmplan.attributeDefinitions.loading

export const selectActiveClassId = (state) =>
  state.cmplan.attributeDefinitions.activeClassId

/** Returns attr defs for a specific class + global ones */
export const selectAttrDefsByClassId = (ciClassId) => (state) => {
  const items = state.cmplan.attributeDefinitions.items
  return items
    .filter((a) => a.ciClassId === ciClassId || a.ciClassId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/** Returns only global (class-agnostic) attr defs */
export const selectGlobalAttrDefs = (state) =>
  state.cmplan.attributeDefinitions.items
    .filter((a) => a.ciClassId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

/** Returns attr defs grouped by ciClassId (null = global) */
export const selectAttrDefsGroupedByClass = (state) => {
  const grouped = { global: [] }
  state.cmplan.attributeDefinitions.items.forEach((a) => {
    if (a.ciClassId === null) {
      grouped.global.push(a)
    } else {
      if (!grouped[a.ciClassId]) grouped[a.ciClassId] = []
      grouped[a.ciClassId].push(a)
    }
  })
  return grouped
}

export default attributeDefinitionsSlice.reducer
