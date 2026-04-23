import { createSlice } from '@reduxjs/toolkit'
import {
  fetchConfigurationItems,
  fetchCIDetail,
  createConfigurationItem,
  updateConfigurationItem,
  deleteConfigurationItem,
  fetchDashboardStats,
} from '../asyncThunks'

const INITIAL_FILTERS = {
  ciTypeId: undefined,
  status: undefined,
  criticality: undefined,
  environment: undefined,
  search: '',
}

const configurationItemsSlice = createSlice({
  name: 'configurationItems',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    submitting: false,
    error: null,
    filters: { ...INITIAL_FILTERS },
    pagination: { page: 1, pageSize: 20 },
    selectedItem: null,
    dashboardStats: null,
    statsLoading: false,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    resetFilters: (state) => {
      state.filters = { ...INITIAL_FILTERS }
      state.pagination.page = 1
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfigurationItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConfigurationItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
        state.pagination.page = action.payload.page
        state.pagination.pageSize = action.payload.pageSize
      })
      .addCase(fetchConfigurationItems.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload && action.payload.message) || 'Failed to load configuration items'
      })
      .addCase(fetchCIDetail.fulfilled, (state, action) => {
        state.selectedItem = action.payload
      })
      .addCase(createConfigurationItem.pending, (state) => {
        state.submitting = true
      })
      .addCase(createConfigurationItem.fulfilled, (state, action) => {
        state.submitting = false
        state.items = [action.payload, ...state.items]
        state.total += 1
      })
      .addCase(createConfigurationItem.rejected, (state, action) => {
        state.submitting = false
        state.error = (action.payload && action.payload.message) || 'Failed to create CI'
      })
      .addCase(updateConfigurationItem.pending, (state) => {
        state.submitting = true
      })
      .addCase(updateConfigurationItem.fulfilled, (state, action) => {
        state.submitting = false
        const index = state.items.findIndex((ci) => ci.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selectedItem && state.selectedItem.id === action.payload.id) {
          state.selectedItem = action.payload
        }
      })
      .addCase(updateConfigurationItem.rejected, (state, action) => {
        state.submitting = false
        state.error = (action.payload && action.payload.message) || 'Failed to update CI'
      })
      .addCase(deleteConfigurationItem.fulfilled, (state, action) => {
        state.items = state.items.filter((ci) => ci.id !== action.payload.id)
        state.total = Math.max(0, state.total - 1)
      })
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.dashboardStats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state) => {
        state.statsLoading = false
      })
  },
})

export const {
  setFilters,
  resetFilters,
  setPagination,
  setSelectedItem,
  clearSelectedItem,
} = configurationItemsSlice.actions

export default configurationItemsSlice.reducer
