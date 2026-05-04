import { createSlice } from '@reduxjs/toolkit'
import { fetchCITypeRelationships, fetchCIsByType } from '../asyncThunks'

const ciTypeRelationshipsSlice = createSlice({
  name: 'ciTypeRelationships',
  initialState: {
    items: [],
    loading: false,
    error: null,
    cisByType: {}, // { [ciType]: { items: CI[], loading: bool } }
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
        state.cisByType[ciType] = {
          items: (state.cisByType[ciType] && state.cisByType[ciType].items) || [],
          loading: true,
        }
      })
      .addCase(fetchCIsByType.fulfilled, (state, action) => {
        const { ciType, items } = action.payload
        state.cisByType[ciType] = { items, loading: false }
      })
      .addCase(fetchCIsByType.rejected, (state, action) => {
        const ciType = action.meta.arg && action.meta.arg.ciType
        if (!ciType) return
        state.cisByType[ciType] = {
          items: (state.cisByType[ciType] && state.cisByType[ciType].items) || [],
          loading: false,
        }
      })
  },
})

export default ciTypeRelationshipsSlice.reducer
