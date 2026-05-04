import { createSlice } from '@reduxjs/toolkit'

/**
 * Mock slice that stands in for the legacy Flux `ProjectBasicInfoStore`.
 * Provides the project's effective period (pStartDate / pEndDate) used to
 * constrain Applied / Expired date selection across CMPlan screens.
 *
 * In production this would be hydrated from the Project API; here we ship a
 * sensible default so the form behaves correctly out of the box.
 */
const projectBasicInfoSlice = createSlice({
  name: 'projectBasicInfo',
  initialState: {
    data: {
      pStartDate: '2026-01-01T00:00:00Z',
      pEndDate: '2026-12-31T23:59:59Z',
    },
  },
  reducers: {
    setProjectBasicInfo(state, action) {
      state.data = action.payload
    },
  },
})

export const { setProjectBasicInfo } = projectBasicInfoSlice.actions
export default projectBasicInfoSlice.reducer
