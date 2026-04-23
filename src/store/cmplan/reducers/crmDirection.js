import { createSlice } from '@reduxjs/toolkit'
import {
  fetchCRMDirections,
  createCRMDirection,
  updateCRMDirection,
  deleteCRMDirection,
} from '../asyncThunks'

const crmDirectionSlice = createSlice({
  name: 'crmDirection',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCRMDirections.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCRMDirections.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCRMDirections.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload && action.payload.message
          ? action.payload.message
          : 'Failed to load CRM directions'
      })
      .addCase(createCRMDirection.pending, (state) => { state.submitting = true })
      .addCase(createCRMDirection.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [...state.items, action.payload]
      })
      .addCase(createCRMDirection.rejected, (state) => { state.submitting = false })
      .addCase(updateCRMDirection.pending, (state) => { state.submitting = true })
      .addCase(updateCRMDirection.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        )
      })
      .addCase(updateCRMDirection.rejected, (state) => { state.submitting = false })
      .addCase(deleteCRMDirection.pending, (state) => { state.submitting = true })
      .addCase(deleteCRMDirection.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload.id)
      })
      .addCase(deleteCRMDirection.rejected, (state) => { state.submitting = false })
  },
})

export default crmDirectionSlice.reducer
