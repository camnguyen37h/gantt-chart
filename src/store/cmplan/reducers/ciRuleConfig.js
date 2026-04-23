import { createSlice } from '@reduxjs/toolkit'
import {
  fetchCIRuleConfigs,
  createCIRuleConfig,
  updateCIRuleConfig,
  deleteCIRuleConfig,
} from '../asyncThunks'

const ciRuleConfigSlice = createSlice({
  name: 'ciRuleConfig',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCIRuleConfigs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCIRuleConfigs.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCIRuleConfigs.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload && action.payload.message) || 'Failed to load CI rule configs'
      })
      .addCase(createCIRuleConfig.pending, (state) => { state.submitting = true })
      .addCase(createCIRuleConfig.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [...state.items, action.payload]
      })
      .addCase(createCIRuleConfig.rejected, (state) => { state.submitting = false })
      .addCase(updateCIRuleConfig.pending, (state) => { state.submitting = true })
      .addCase(updateCIRuleConfig.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        )
      })
      .addCase(updateCIRuleConfig.rejected, (state) => { state.submitting = false })
      .addCase(deleteCIRuleConfig.pending, (state) => { state.submitting = true })
      .addCase(deleteCIRuleConfig.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload.id)
      })
      .addCase(deleteCIRuleConfig.rejected, (state) => { state.submitting = false })
  },
})

export default ciRuleConfigSlice.reducer
