import { createSlice } from '@reduxjs/toolkit'
import React from 'react'
import {
  getBusinessPlanListApprovalStep,
  getBusinessPlanListCustomerName,
  getBusinessPlanListDU,
  getBusinessPlanListBU,
  getBusinessPlanListPlanName,
  getBusinessPlanListProjectCode,
  getBusinessPlanListStatus,
  getBusinessPlanListVersion,
  postListBusinessPlanList,
} from '../asyncThunk/BusinessPlanListAsyncThunk'

export const BusinessPlanListSlice = createSlice({
  name: 'businessPlanList',
  initialState: {
    listStatus: [],
    listStatusSearched: [],
    listVersion: [],
    listVersionSearched: [],
    listCustomerName: [],
    listBusinessPlanName: [],
    listProjectCode: [],
    listApprovalStep: [],
    listApprovalSearched: [],
    listDU: [],
    listBU: [],
    listBusinessPlan: {},
    loadingFilter: false,
    loadingTable: false,
    paramsSearch: {},
  },
  reducers: {
    handleSearchWithoutParams(state, action) {
      const { filterName, text, filterNameSearched } = action.payload

      if (!text || !text.trim()) {
        state[filterNameSearched] = state[filterName]
        return
      }

      const res = state[filterName].filter(item =>
        item.value.toString().toLowerCase().includes(text.toLowerCase().trim())
      )

      state[filterNameSearched] = res
    },
    setParamsSearch(state, action) {
      state.paramsSearch = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(getBusinessPlanListStatus.pending, (state, action) => {
      state.loadingFilter = true
    })
    builder.addCase(getBusinessPlanListStatus.fulfilled, (state, action) => {
      state.loadingFilter = false
      state.listStatusSearched = action.payload
      state.listStatus = action.payload
    })
    builder.addCase(getBusinessPlanListStatus.rejected, (state, action) => {
      state.loadingFilter = false
    })
    builder.addCase(getBusinessPlanListVersion.pending, (state, action) => {
      state.loadingFilter = true
    })
    builder.addCase(getBusinessPlanListVersion.fulfilled, (state, action) => {
      state.loadingFilter = false
      state.listVersionSearched = action.payload
      state.listVersion = action.payload
    })
    builder.addCase(getBusinessPlanListVersion.rejected, (state, action) => {
      state.loadingFilter = false
    })
    builder.addCase(
      getBusinessPlanListCustomerName.pending,
      (state, action) => {
        state.loadingFilter = true
      }
    )
    builder.addCase(
      getBusinessPlanListCustomerName.fulfilled,
      (state, action) => {
        state.loadingFilter = false
        state.listCustomerName = action.payload
      }
    )
    builder.addCase(
      getBusinessPlanListCustomerName.rejected,
      (state, action) => {
        state.loadingFilter = false
      }
    )
    builder.addCase(getBusinessPlanListPlanName.pending, (state, action) => {
      state.loadingFilter = true
    })
    builder.addCase(getBusinessPlanListPlanName.fulfilled, (state, action) => {
      state.loadingFilter = false
      state.listBusinessPlanName = action.payload
    })
    builder.addCase(getBusinessPlanListPlanName.rejected, (state, action) => {
      state.loadingFilter = false
    })
    builder.addCase(getBusinessPlanListProjectCode.pending, (state, action) => {
      state.loadingFilter = true
    })
    builder.addCase(
      getBusinessPlanListProjectCode.fulfilled,
      (state, action) => {
        state.loadingFilter = false
        state.listProjectCode = action.payload
      }
    )
    builder.addCase(
      getBusinessPlanListProjectCode.rejected,
      (state, action) => {
        state.loadingFilter = false
      }
    )

    builder.addCase(
      getBusinessPlanListApprovalStep.pending,
      (state, action) => {
        state.loadingFilter = true
      }
    )
    builder.addCase(
      getBusinessPlanListApprovalStep.fulfilled,
      (state, action) => {
        state.loadingFilter = false
        state.listApprovalSearched = action.payload
        state.listApprovalStep = action.payload
      }
    )
    builder.addCase(
      getBusinessPlanListApprovalStep.rejected,
      (state, action) => {
        state.loadingFilter = false
      }
    )

    builder.addCase(postListBusinessPlanList.pending, (state, action) => {
      state.loadingTable = true
    })
    builder.addCase(postListBusinessPlanList.fulfilled, (state, action) => {
      state.loadingTable = false
      state.listBusinessPlan = action.payload
    })
    builder.addCase(postListBusinessPlanList.rejected, (state, action) => {
      state.loadingTable = false
    })
    // list du
    builder.addCase(getBusinessPlanListDU.pending, (state, action) => {
      state.loadingFilter = true
    })
    builder.addCase(getBusinessPlanListDU.fulfilled, (state, action) => {
      state.loadingFilter = false
      state.listDU = action.payload
    })
    builder.addCase(getBusinessPlanListDU.rejected, (state, action) => {
      state.loadingFilter = false
    })
    // list Bu
    builder.addCase(getBusinessPlanListBU.pending, (state, action) => {
      state.loadingFilter = true
    })
    builder.addCase(getBusinessPlanListBU.fulfilled, (state, action) => {
      state.loadingFilter = false
      state.listBU = action.payload
    })
    builder.addCase(getBusinessPlanListBU.rejected, (state, action) => {
      state.loadingFilter = false
    })
  },
})

export const { handleSearchWithoutParams, setParamsSearch } =
  BusinessPlanListSlice.actions

export default BusinessPlanListSlice.reducer
