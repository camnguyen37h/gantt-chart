import { createSlice } from '@reduxjs/toolkit'
import { fetchCITypeRelationships, fetchCIsByType } from '../asyncThunks'

const ciTypeRelationshipsSlice = createSlice({
  name: 'ciTypeRelationships',
  initialState: {
    items: [],
    loading: false,
    error: null,
    cisByType: {}, // { [key]: CI[] }
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
      .addCase(fetchCIsByType.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCIsByType.fulfilled, (state, action) => {
        const { key, data } = action.payload
        state.cisByType[key] = data || []
        state.loading = false
      })
      .addCase(fetchCIsByType.rejected, (state) => {
        state.loading = false
      })
  },
})

export default ciTypeRelationshipsSlice.reducer
