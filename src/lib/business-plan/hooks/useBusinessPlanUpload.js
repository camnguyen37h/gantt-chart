// const { useCallback, useEffect, useState } = require('react')
// const { useDispatch, useSelector } = require('react-redux')
// import * as commonActions from 'Redux/asyncThunk/commonAsyncThunk'
// import BUSINESS_PLAN_API from '../../service/api/businessPlan'
// import Request from '../../service/request'
// import { ResponseStatusCode } from '../../service/constant'
//
// const useBusinessPlanUpload = versionId => {
//   const dispatch = useDispatch()
//   const [listDu, setListDu] = useState([])
//   const { fileTypes } = useSelector(state => state.commonReducer)
//
//   const getListGroupUpload = async versionId => {
//     const result = await Request(BUSINESS_PLAN_API.getListGroupUpload, {
//       params: { versionId },
//     })
//     if (result.status === ResponseStatusCode.success) {
//       setListDu(result.data)
//     } else {
//       return result.message
//     }
//   }
//
//   const getListFileType = useCallback(() => {
//     return dispatch(commonActions.getListFileType())
//   }, [dispatch])
//
//   useEffect(() => {
//     getListGroupUpload(versionId)
//     getListFileType()
//   }, [])
//
//   return {
//     listDu,
//     fileTypes,
//     getListGroupUpload,
//     getListFileType,
//   }
// }
//
// export default useBusinessPlanUpload
