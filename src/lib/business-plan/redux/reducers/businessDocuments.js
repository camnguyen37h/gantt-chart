// import { createSlice } from '@reduxjs/toolkit'
// import { getBusinessPlanDocuments } from '../asyncThunks'
//
// export const businessDocumentsSlice = createSlice({
//   name: 'businessDocuments',
//   initialState: {
//     listDocuments: [],
//     loading: false,
//     totalDocument: 0,
//   },
//   reducers: {},
//   extraReducers: builder => {
//     builder.addCase(getBusinessPlanDocuments.pending, (state, action) => {
//       state.loading = true
//     })
//
//     builder.addCase(getBusinessPlanDocuments.fulfilled, (state, action) => {
//       state.loading = false
//       state.listDocuments = action.payload.documentDtoList || []
//       state.totalDocument = action.payload.total
//     })
//
//     builder.addCase(getBusinessPlanDocuments.rejected, (state, action) => {
//       state.loading = true
//     })
//   },
// })
//
// export default businessDocumentsSlice.reducer
