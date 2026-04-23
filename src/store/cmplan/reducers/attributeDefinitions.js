import { createSlice } from '@reduxjs/toolkit'
import {
  fetchAttributeDefinitions,
  createAttributeDefinition,
  updateAttributeDefinition,
  deleteAttributeDefinition,
} from '../asyncThunks'

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
        state.error = (action.payload && action.payload.message) || 'Failed to load attribute definitions'
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

export default attributeDefinitionsSlice.reducer
