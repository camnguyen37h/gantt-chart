import { configureStore } from '@reduxjs/toolkit'
import {
  businessDetailsReducer,
  businessApprovalReducer,
  businessGeneralInformationReducer,
  businessPlanRevenueReducer,
  businessPlanDeliveryReducer,
  businessCommentsReducer,
  bussinessPlanHistoryReducer,
} from '../lib/business-plan/redux'
import workflowApprovalReducer from '../components/workflow-approval/redux/reducer'

const store = configureStore({
  reducer: {
    businessPlanDetails: businessDetailsReducer,
    businessApproval: businessApprovalReducer,
    businessGeneralInformation: businessGeneralInformationReducer,
    businessPlanRevenue: businessPlanRevenueReducer,
    businessPlanDelivery: businessPlanDeliveryReducer,
    businessComments: businessCommentsReducer,
    bussinessPlanHistory: bussinessPlanHistoryReducer,
    businessDocuments: () => ({ listDocuments: [] }),
    workflowApproval: workflowApprovalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store
