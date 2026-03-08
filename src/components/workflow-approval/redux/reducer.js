import { createSlice } from '@reduxjs/toolkit'
import { fetchSpecificPermission, fetchUserWorkflow } from './asyncThunk'
const initialState = {
  specificPermissions: [],
  listUser: {
    data: [],
    loading: false
  },
}
const workflowApprovalSlice = createSlice({
  name: 'workflowApprovalSlice',
  initialState,
  extraReducers: builder => {
    builder.addCase(fetchSpecificPermission.fulfilled, (state, { payload }) => {
      state.specificPermissions = payload || []
    })
    builder.addCase(fetchUserWorkflow.pending, (state, { payload }) => {
      state.listUser.loading = true
    })
    builder.addCase(fetchUserWorkflow.fulfilled, (state, { payload }) => {
      state.listUser.data = payload || []
      state.listUser.loading = false
    })
    builder.addCase(fetchUserWorkflow.rejected, (state, { payload }) => {
      state.listUser.loading = false
    })
  },
})

export default workflowApprovalSlice.reducer
