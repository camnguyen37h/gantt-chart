import { createSlice } from '@reduxjs/toolkit'
import { fetchCITypeRelationships, fetchCIsByType } from '../asyncThunks'

const ciTypeRelationshipsSlice = createSlice({
  name: 'ciTypeRelationships',
  initialState: {
    items: [],
    loading: false,
    error: null,
    cisByType: {}, // { [panelId]: CI[] }
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
      .addCase(fetchCIsByType.pending, () => {})
      .addCase(fetchCIsByType.fulfilled, (state, action) => {
        const { panelId = 'default' } = action.meta.arg
        state.cisByType[panelId] = action.payload || []
      })
      .addCase(fetchCIsByType.rejected, () => {})
  },
})

export default ciTypeRelationshipsSlice.reducer
