import { createSlice } from '@reduxjs/toolkit'
import { getBusinessPlanDetailComment, getBusinessPlanHistory } from '../asyncThunks'

export const businessCommentsSlice = createSlice({
  name: 'businessComments',
  initialState: {
    listComments: [],
    loading: false,
    listHistory: [],
    loadingHistory: false,
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getBusinessPlanDetailComment.pending, (state, action) => {
      state.loading = true
    })

    builder.addCase(getBusinessPlanDetailComment.fulfilled, (state, action) => {
      state.loading = false
      state.listComments = action.payload
    })

    builder.addCase(getBusinessPlanDetailComment.rejected, (state, action) => {
      state.loading = false
    })

    builder.addCase(getBusinessPlanHistory.pending, (state, action) => {
      state.loadingHistory = true
    })

    builder.addCase(getBusinessPlanHistory.fulfilled, (state, action) => {
      state.loadingHistory = false
      state.listHistory = action.payload
    })

    builder.addCase(getBusinessPlanHistory.rejected, (state, action) => {
      state.loadingHistory = false
    })
  },
})

export default businessCommentsSlice.reducer
