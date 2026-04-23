import { createSlice } from '@reduxjs/toolkit'
import {
  fetchCIGroups,
  createCIGroup,
  updateCIGroup,
  deleteCIGroup,
} from '../asyncThunks'

const ciGroupsSlice = createSlice({
  name: 'ciGroups',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCIGroups.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCIGroups.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCIGroups.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createCIGroup.pending, (state) => {
        state.submitting = true
      })
      .addCase(createCIGroup.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [action.payload, ...state.items]
      })
      .addCase(createCIGroup.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(updateCIGroup.pending, (state) => {
        state.submitting = true
      })
      .addCase(updateCIGroup.fulfilled, (state, action) => {
        state.submitting = false
        const idx = state.items.findIndex((g) => g.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateCIGroup.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(deleteCIGroup.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g.id !== action.payload)
      })
  },
})

export default ciGroupsSlice.reducer
