import { createSlice } from '@reduxjs/toolkit'
import { fetchBusinessPlanWorkflow } from '../asyncThunks'
import { mergeStepsByPosition } from '../../utils'

const initialState = {
  listWorkOrder: [],
  listStep: [],
  loading: false,
}

const businessApprovalSlice = createSlice({
  name: 'businessApproval',
  initialState,
  extraReducers: builder => {
    builder.addCase(fetchBusinessPlanWorkflow.pending, state => {
      state.loading = true
    })
    builder.addCase(
      fetchBusinessPlanWorkflow.fulfilled,
      (state, { payload }) => {
        state.loading = false
        if (!payload || !payload.data) return

        const activeSteps = Object.values(payload.data).filter(
          item => !item.stateName.match(/Draft|Approved/)
        )

        const mergedSteps = mergeStepsByPosition(activeSteps)

        const lastActiveIndex = mergedSteps.reduceRight(
          (found, item, i) =>
            found === -1 && Object.values(item.map).some(arr => arr.length > 0)
              ? i
              : found,
          -1
        )

        const listStep = mergedSteps.map((item, index) =>
          index > lastActiveIndex ? { ...item, status: 'wait' } : item
        )

        const duStep = listStep.find(step =>
          Object.keys(step.map).some(
            gKey =>
              gKey !== 'None' &&
              step.map[gKey].length > 0 &&
              step.map[gKey][0].departmentName !== gKey
          )
        )

        const listWorkOrder = Object.fromEntries(
          Object.entries(payload.workOrder).map(([gKey, wos]) => {
            const approvers = duStep && duStep.map[gKey]
            return [
              gKey,
              wos.map(wo => ({
                ...wo,
                length: approvers
                  ? approvers.filter(a => a.departmentName === wo.duName)
                      .length - 1
                  : 0,
              })),
            ]
          })
        )

        state.listStep = listStep
        state.listWorkOrder = listWorkOrder
      }
    )
    builder.addCase(fetchBusinessPlanWorkflow.rejected, state => {
      state.loading = false
    })
  },
})

export default businessApprovalSlice.reducer
