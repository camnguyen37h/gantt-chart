import { configureStore } from '@reduxjs/toolkit'
import {
  businessDetailsReducer,
  businessApprovalReducer,
  businessGeneralInformationReducer,
  businessPlanRevenueReducer,
  businessPlanDeliveryReducer,
} from '../lib/business-plan/redux'

const store = configureStore({
  reducer: {
    businessPlanDetails: businessDetailsReducer,
    businessApproval: businessApprovalReducer,
    businessGeneralInformation: businessGeneralInformationReducer,
    businessPlanRevenue: businessPlanRevenueReducer,
    businessPlanDelivery: businessPlanDeliveryReducer,
    businessDocuments: () => ({ listDocuments: [] }),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store
