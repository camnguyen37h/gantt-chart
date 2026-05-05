import { createSlice } from '@reduxjs/toolkit'
import { fetchCITypeRelationships, fetchCIsByType } from '../asyncThunks'

const ciTypeRelationshipsSlice = createSlice({
  name: 'ciTypeRelationships',
  initialState: {
    items: [],
    loading: false,
    error: null,
    cisByType: {}, // { [ciType]: { items: CI[], loading: bool, hasMore: bool, page: number } }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCITypeRelationships.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCITypeRelationships.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCITypeRelationships.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload && action.payload.message) || 'Failed to load CI type relationships'
      })
      .addCase(fetchCIsByType.pending, (state, action) => {
        const ciType = action.meta.arg && action.meta.arg.ciType
        if (!ciType) return
        const { cisByType } = state
        cisByType[ciType] = { ...(cisByType[ciType] || {}), loading: true }
      })
      .addCase(fetchCIsByType.fulfilled, (state, action) => {
        const { ciType, items, hasMore, page } = action.payload
        const { cisByType } = state
        const prev = cisByType[ciType]
        const existing = (prev && page > 1) ? prev.items : []
        cisByType[ciType] = {
          items: [...existing, ...items],
          hasMore,
          page,
          loading: false,
        }
        state.loading = false
      })
      .addCase(fetchCIsByType.rejected, (state, action) => {
        const ciType = action.meta.arg && action.meta.arg.ciType
        if (!ciType) return
        const { cisByType } = state
        cisByType[ciType] = { ...(cisByType[ciType] || {}), loading: false }
        state.loading = false
      })
  },
})

export default ciTypeRelationshipsSlice.reducer
