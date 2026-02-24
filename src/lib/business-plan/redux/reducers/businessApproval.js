import { createSlice } from '@reduxjs/toolkit'
import { fetchBusinessPlanWorkflow } from '../asyncThunks'
import cloneDeep from 'lodash/cloneDeep'
const initialState = {
  listWorkOrder: [],
  listStep: [],
  loading: false,
}
const businessApprovalSlice = createSlice({
  name: 'businessApproval',
  initialState,
  extraReducers: builder => {
    builder.addCase(fetchBusinessPlanWorkflow.pending, (state, { payload }) => {
      state.loading = true
    })
    builder.addCase(
      fetchBusinessPlanWorkflow.rejected,
      (state, { payload }) => {
        state.loading = false
      }
    )
    builder.addCase(
      fetchBusinessPlanWorkflow.fulfilled,
      (state, { payload }) => {
        if (!payload) return
        const ogSteps = Object.values(payload.data)
        const filteredSteps = ogSteps.filter(
          item => !item.stateName.match(/Draft|Approved/)
        )
        filteredSteps.sort((a, b) => {
          if (a.stateOrder !== b.stateOrder) {
            return a.stateOrder - b.stateOrder
          } else {
            return a.order - b.order
          }
        })

        const indexSelected = filteredSteps.findLastIndex(item =>
          Object.values(item.map).some(data => data.length > 0)
        )

        const mappedSteps = filteredSteps.map((item, index) => {
          if (index > indexSelected) {
            return { ...item, status: 'wait' }
          }
          return item
        })

        const duStep = mappedSteps.find(step => {
          return Object.keys(step.map).some(
            gKey => gKey !== 'None' && step.map[gKey][0].departmentName !== gKey
          )
        })

        const listWorkOrderRes = cloneDeep(payload.workOrder)
        Object.keys(listWorkOrderRes).forEach(gKey => {
          listWorkOrderRes[gKey] = listWorkOrderRes[gKey].map(wo => {
            const length = duStep
              ? duStep.map[gKey].filter(
                  item => item.departmentName === wo.duName
                ).length - 1
              : 0
            return { ...wo, length }
          })
        })

        state.listStep = mappedSteps
        state.listWorkOrder = listWorkOrderRes
        state.loading = false
      }
    )
  },
})

export default businessApprovalSlice.reducer
