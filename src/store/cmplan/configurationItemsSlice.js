import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cmplanApi } from '../../utils/cmplan/mockCMPlanApi'

// ── Async Thunks ─────────────────────────────────────────────────────────────
export const fetchConfigurationItems = createAsyncThunk(
  'cmplan/configurationItems/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.getAll(params)
    if (!res.success) return rejectWithValue(res.error)
    return { items: res.data, total: res.total, page: res.page, pageSize: res.pageSize }
  }
)

export const fetchCIDetail = createAsyncThunk(
  'cmplan/configurationItems/fetchById',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.getById(id)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const createConfigurationItem = createAsyncThunk(
  'cmplan/configurationItems/create',
  async (payload, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.create(payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const updateConfigurationItem = createAsyncThunk(
  'cmplan/configurationItems/update',
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.update(id, payload)
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

export const deleteConfigurationItem = createAsyncThunk(
  'cmplan/configurationItems/delete',
  async (id, { rejectWithValue }) => {
    const res = await cmplanApi.configurationItems.remove(id)
    if (!res.success) return rejectWithValue(res.error)
    return { id }
  }
)

export const fetchDashboardStats = createAsyncThunk(
  'cmplan/configurationItems/fetchStats',
  async (_, { rejectWithValue }) => {
    const res = await cmplanApi.compliance.getStats()
    if (!res.success) return rejectWithValue(res.error)
    return res.data
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────
const configurationItemsSlice = createSlice({
  name: 'configurationItems',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    submitting: false,
    error: null,
    filters: {
      ciClassId: undefined,
      status: undefined,
      criticality: undefined,
      environment: undefined,
      search: '',
    },
    pagination: { page: 1, pageSize: 20 },
    selectedItem: null,
    dashboardStats: null,
    statsLoading: false,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1 // reset to page 1 on filter change
    },
    resetFilters: (state) => {
      state.filters = {
        ciClassId: undefined,
        status: undefined,
        criticality: undefined,
        environment: undefined,
        search: '',
      }
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
      // fetchAll
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
        state.error = action.payload?.message || 'Failed to load configuration items'
      })
      // fetchById
      .addCase(fetchCIDetail.fulfilled, (state, action) => {
        state.selectedItem = action.payload
      })
      // create
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
        state.error = action.payload?.message || 'Failed to create CI'
      })
      // update
      .addCase(updateConfigurationItem.pending, (state) => {
        state.submitting = true
      })
      .addCase(updateConfigurationItem.fulfilled, (state, action) => {
        state.submitting = false
        const index = state.items.findIndex((ci) => ci.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload
        }
      })
      .addCase(updateConfigurationItem.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload?.message || 'Failed to update CI'
      })
      // delete (soft)
      .addCase(deleteConfigurationItem.fulfilled, (state, action) => {
        state.items = state.items.filter((ci) => ci.id !== action.payload.id)
        state.total = Math.max(0, state.total - 1)
      })
      // dashboard stats
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

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCIItems = (state) => state.cmplan.configurationItems.items
export const selectCITotal = (state) => state.cmplan.configurationItems.total
export const selectCILoading = (state) => state.cmplan.configurationItems.loading
export const selectCISubmitting = (state) => state.cmplan.configurationItems.submitting
export const selectCIFilters = (state) => state.cmplan.configurationItems.filters
export const selectCIPagination = (state) => state.cmplan.configurationItems.pagination
export const selectSelectedCI = (state) => state.cmplan.configurationItems.selectedItem
export const selectDashboardStats = (state) => state.cmplan.configurationItems.dashboardStats
export const selectStatsLoading = (state) => state.cmplan.configurationItems.statsLoading

export default configurationItemsSlice.reducer
