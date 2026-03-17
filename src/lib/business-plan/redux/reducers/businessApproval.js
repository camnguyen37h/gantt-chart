import { createSlice } from '@reduxjs/toolkit'
import { fetchBusinessPlanWorkflow } from '../asyncThunks'

const initialState = {
  listWorkOrder: [],
  listStep: [],
  loading: false,
}

// Merge two approver arrays for the same gKey.
// "None" keys (FC/BOM/CEO) are shared across workflows — deduplicate by ldap.
// DU-level keys (G1/G3/GKR) are distinct workflows — always concat.
function mergeApprovers(existing, incoming, gKey) {
  if (gKey !== 'None') return existing.concat(incoming)
  const seen = new Set(existing.map(a => a.ldap))
  const deduped = incoming.filter(a => !seen.has(a.ldap))
  return deduped.length ? existing.concat(deduped) : existing
}

// Group steps sharing the same (stateOrder, order) position into one merged step.
function mergeStepsByPosition(steps) {
  const positionMap = {}
  steps.forEach(step => {
    const posKey = `${step.stateOrder}|${step.order}`
    if (!positionMap[posKey]) {
      positionMap[posKey] = { ...step, map: {} }
    }
    const target = positionMap[posKey]
    Object.keys(step.map).forEach(gKey => {
      target.map[gKey] = mergeApprovers(target.map[gKey] ?? [], step.map[gKey], gKey)
    })
  })
  return Object.values(positionMap).sort((a, b) =>
    a.stateOrder !== b.stateOrder ? a.stateOrder - b.stateOrder : a.order - b.order
  )
}

const businessApprovalSlice = createSlice({
  name: 'businessApproval',
  initialState,
  extraReducers: builder => {
    builder.addCase(fetchBusinessPlanWorkflow.pending, state => {
      state.loading = true
    })
    builder.addCase(fetchBusinessPlanWorkflow.rejected, state => {
      state.loading = false
    })
    builder.addCase(fetchBusinessPlanWorkflow.fulfilled, (state, { payload }) => {
      if (!payload?.data) return

      const activeSteps = Object.values(payload.data).filter(
        item => !item.stateName.match(/Draft|Approved/)
      )

      const mergedSteps = mergeStepsByPosition(activeSteps)

      const lastActiveIndex = mergedSteps.reduceRight(
        (found, item, i) =>
          found === -1 && Object.values(item.map).some(arr => arr.length > 0) ? i : found,
        -1
      )

      const listStep = mergedSteps.map((item, index) =>
        index > lastActiveIndex ? { ...item, status: 'wait' } : item
      )

      // First step with DU-scoped approvers (departmentName ≠ gKey → DU level, not G level)
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
          const approvers = duStep?.map[gKey]
          return [
            gKey,
            wos.map(wo => ({
              ...wo,
              length: approvers
                ? approvers.filter(a => a.departmentName === wo.duName).length - 1
                : 0,
            })),
          ]
        })
      )

      state.listStep = listStep
      state.listWorkOrder = listWorkOrder
      state.loading = false
    })
  },
})

export default businessApprovalSlice.reducer
