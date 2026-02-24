import { createSlice } from '@reduxjs/toolkit'
import {
  getHistoryDeliveryPlan,
  getHistoryRevenuePlan,
} from '../asyncThunks/bussinessPlanHistoryThunks'

const initialState = {
  data: [],
  loading: false,
  totalPage: 0,
};

const bussinessPlanHistorySlice = createSlice({
  name: 'bussinessPlanHistory',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getHistoryDeliveryPlan.pending, state => {
      state.loading = true
    }),
      builder.addCase(
        getHistoryDeliveryPlan.fulfilled,
        (state, { payload }) => {
          state.data = payload.data && payload.data.body.userActionHistoryDtoList || []
          state.totalPage = payload.data.total || 0
          state.loading = false
        }
      ),
      builder.addCase(getHistoryDeliveryPlan.rejected, state => {
        state.loading = false
      }),
      builder.addCase(getHistoryRevenuePlan.pending, state => {
        state.loading = true
      }),
      builder.addCase(getHistoryRevenuePlan.fulfilled, (state, { payload }) => {
        state.data = payload.data && payload.data.body.userActionHistoryDtoList || []
        state.totalPage = payload.data.total || 0
        state.loading = false
      }),
      builder.addCase(getHistoryRevenuePlan.rejected, state => {
        state.loading = false
      })
  },
})

export default bussinessPlanHistorySlice.reducer
