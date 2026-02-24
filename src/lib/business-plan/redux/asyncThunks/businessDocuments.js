// import BUSINESS_PLAN_API from '../../../service/api/businessPlan'
// import { ResponseStatusCode } from '../../../service/constant'
// import Request from '../../../service/request'
// import RequestFile from '../../../service/requestFile'
// import { createAsyncThunk } from '@reduxjs/toolkit'
// import { NotificationManager } from 'react-notifications'
//
// export const getBusinessPlanDocuments = createAsyncThunk(
//   'get/getBusinessPlanDocuments',
//   async id => {
//     const result = await Request(BUSINESS_PLAN_API.getDocuments, id)
//     if (result.status === ResponseStatusCode.success) {
//       return result.data
//     } else {
//       return NotificationManager.error(result.message)
//     }
//   }
// )
//
// export const uploadBusinessPlanDocuments = createAsyncThunk(
//   'post/uploadBusinessPlanDocuments',
//   async id => {
//     const result = await RequestFile(BUSINESS_PLAN_API.uploadDocuments, id)
//     if (result.status === ResponseStatusCode.success) {
//       return result.data
//     } else {
//       return NotificationManager.error(result.message)
//     }
//   }
// )
//
// export const deleteBusinessPlanDocuments = createAsyncThunk(
//   'delete/deleteBusinessPlanDocuments',
//   async id => {
//     const result = await Request(BUSINESS_PLAN_API.deleteDocument(id))
//     if (result.status === ResponseStatusCode.success) {
//       return result.data
//     } else {
//       return NotificationManager.error(result.message)
//     }
//   }
// )
