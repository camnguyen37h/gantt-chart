import { createSlice } from '@reduxjs/toolkit'
import {
  fetchCITypes,
  createCIType,
  updateCIType,
  deleteCIType,
} from '../asyncThunks'

const ciTypesSlice = createSlice({
  name: 'ciTypes',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCITypes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCITypes.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCITypes.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload && action.payload.message) || 'Failed to load CI classes'
      })
      .addCase(createCIType.pending, (state) => { state.submitting = true })
      .addCase(createCIType.fulfilled, (state, action) => {
        state.submitting = false
        state.items.push(action.payload)
      })
      .addCase(createCIType.rejected, (state) => { state.submitting = false })
      .addCase(updateCIType.pending, (state) => { state.submitting = true })
      .addCase(updateCIType.fulfilled, (state, action) => {
        state.submitting = false
        const index = state.items.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(updateCIType.rejected, (state) => { state.submitting = false })
      .addCase(deleteCIType.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload.id)
      })
  },
})

export default ciTypesSlice.reducer
