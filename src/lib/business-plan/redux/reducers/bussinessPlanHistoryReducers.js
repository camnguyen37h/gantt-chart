import { createSlice } from '@reduxjs/toolkit'
import { getUserActionHistory } from '../asyncThunks/bussinessPlanHistoryThunks'

const initialState = {
  data: [],
  loading: false,
  totalPage: 0,
}

const bussinessPlanHistorySlice = createSlice({
  name: 'bussinessPlanHistory',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getUserActionHistory.pending, state => {
      state.loading = true
    })
    builder.addCase(getUserActionHistory.fulfilled, (state, { payload }) => {
      state.data =
        (payload.data && payload.data.body.userActionHistoryDtoList) || []
      state.totalPage = payload.data.total || 0
      state.loading = false
    })
    builder.addCase(getUserActionHistory.rejected, state => {
      state.loading = false
    })
  },
})

export default bussinessPlanHistorySlice.reducer
