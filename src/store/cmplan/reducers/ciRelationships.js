import { createSlice } from '@reduxjs/toolkit'
import {
  fetchAllRelationships,
  fetchRelationships,
  createRelationship,
  deleteRelationship,
  updateRelationship,
  fetchExistingRelationshipPairs,
  bulkCreateRelationships,
} from '../asyncThunks'

const ciRelationshipsSlice = createSlice({
  name: 'ciRelationships',
  initialState: {
    items: [],
    total: 0,
    existingPairs: [],
    loading: false,
    existingPairsLoading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRelationships.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllRelationships.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAllRelationships.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchRelationships.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRelationships.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchRelationships.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createRelationship.pending, (state) => {
        state.submitting = true
      })
      .addCase(createRelationship.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [...state.items, action.payload]
      })
      .addCase(createRelationship.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(deleteRelationship.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload)
      })
      .addCase(updateRelationship.pending, (state) => {
        state.submitting = true
      })
      .addCase(updateRelationship.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((r) =>
          r.id === action.payload.id ? action.payload : r
        )
      })
      .addCase(updateRelationship.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(fetchExistingRelationshipPairs.pending, (state) => {
        state.existingPairsLoading = true
        state.error = null
      })
      .addCase(fetchExistingRelationshipPairs.fulfilled, (state, action) => {
        state.existingPairsLoading = false
        state.existingPairs = action.payload
      })
      .addCase(fetchExistingRelationshipPairs.rejected, (state, action) => {
        state.existingPairsLoading = false
        state.error = action.payload
      })
      .addCase(bulkCreateRelationships.pending, (state) => {
        state.submitting = true
      })
      .addCase(bulkCreateRelationships.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [...state.items, ...action.payload.created]
        state.existingPairs = [...state.existingPairs, ...action.payload.createdPairs]
      })
      .addCase(bulkCreateRelationships.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
  },
})

export default ciRelationshipsSlice.reducer
