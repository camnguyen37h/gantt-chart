import { useMemo } from 'react'
import { shallowEqual, useSelector } from 'react-redux'

const selectProjectBasicInfo = (state) =>
  (state.cmplan && state.cmplan.projectBasicInfo && state.cmplan.projectBasicInfo.data) || null

/**
 * Function-component equivalent of the legacy class-component pattern:
 *
 *   static getStores() { return [ProjectBasicInfoStore] }
 *   static calculateState() {
 *     return { projectBasicInfo: ProjectBasicInfoStore.getState().projectBasicInfo }
 *   }
 *
 * Returns the raw `projectBasicInfo` object plus the two fields most callers
 * need: `pStartDate` and `pEndDate` (both ISO strings or `null`).
 */
const useProjectBasicInfo = () => {
  const projectBasicInfo = useSelector(selectProjectBasicInfo, shallowEqual)
  return useMemo(
    () => ({
      projectBasicInfo,
      pStartDate: projectBasicInfo ? projectBasicInfo.pStartDate : null,
      pEndDate: projectBasicInfo ? projectBasicInfo.pEndDate : null,
    }),
    [projectBasicInfo]
  )
}

export default useProjectBasicInfo
