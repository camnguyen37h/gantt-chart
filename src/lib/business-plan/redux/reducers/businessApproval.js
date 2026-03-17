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
        if (!payload || !payload.data) return

        const ogSteps = Object.values(payload.data)
        const filteredSteps = ogSteps.filter(
          item => !item.stateName.match(/Draft|Approved/)
        )

        // The API returns one step object per workflow per position.
        // e.g. "BU/DU Lead" at (stateOrder=100, order=1) appears as step 8448 (G3 workflow)
        // AND step 8579 (G1+GKR workflow). Merge same-position steps into one logical step
        // so the UI renders a single unified timeline row per position.
        const positionMap = {}
        filteredSteps.forEach(step => {
          const posKey = step.stateOrder + '|' + step.order
          if (!positionMap[posKey]) {
            positionMap[posKey] = { ...step, map: {} }
          }
          const target = positionMap[posKey]
          Object.keys(step.map).forEach(gKey => {
            if (!target.map[gKey]) {
              target.map[gKey] = []
            }
            if (gKey === 'None') {
              // FC / BOM / CEO approvers are shared across workflows.
              // Deduplicate by ldap so the same person is not shown twice.
              const seen = new Set(target.map[gKey].map(a => a.ldap))
              step.map[gKey].forEach(approver => {
                if (!seen.has(approver.ldap)) {
                  target.map[gKey].push(approver)
                  seen.add(approver.ldap)
                }
              })
            } else {
              // DU-level gKeys (G1, G3, GKR …) belong to distinct workflows — always concat.
              target.map[gKey] = target.map[gKey].concat(step.map[gKey])
            }
          })
        })

        const mergedSteps = Object.values(positionMap).sort((a, b) => {
          if (a.stateOrder !== b.stateOrder) return a.stateOrder - b.stateOrder
          return a.order - b.order
        })

        const indexSelected = mergedSteps.findLastIndex(item =>
          Object.values(item.map).some(data => data.length > 0)
        )

        const mappedSteps = mergedSteps.map((item, index) => {
          if (index > indexSelected) {
            return { ...item, status: 'wait' }
          }
          return item
        })

        // Find the first DU step — a step where map has non-None keys whose
        // approvers carry departmentName values that differ from the gKey itself
        // (i.e. DU-level departments, not G-level).
        const duStep = mappedSteps.find(step =>
          Object.keys(step.map).some(
            gKey =>
              gKey !== 'None' &&
              step.map[gKey].length > 0 &&
              step.map[gKey][0].departmentName !== gKey
          )
        )

        const listWorkOrderRes = cloneDeep(payload.workOrder)
        Object.keys(listWorkOrderRes).forEach(gKey => {
          listWorkOrderRes[gKey] = listWorkOrderRes[gKey].map(wo => {
            const gKeyApprovers = duStep && duStep.map[gKey]
            const length = gKeyApprovers
              ? gKeyApprovers.filter(
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
