// import FileSaver from 'file-saver'
// import { ResponseStatusCode } from './constant'
// import { processResponse } from './encrypt'
// const axios = require('axios')
// import { URIProperty } from '../../utils/URIProperty'
//
// const RequestFile = (api, data) => {
//   const headers = {
//     'Content-Type': 'multipart/form-data',
//     'Cache-Control': 'no-cache',
//     'Access-Control-Allow-Credentials': 'true',
//     'Access-Control-Allow-Origin': process.env.ORIGIN_HEADER,
//     'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, Origin',
//     'author-id': `${JSON.parse(localStorage.getItem('user')).id}`,
//   }
//
//   const timeout = 2 * 60 * 1000000 // 33 hours
//   const instance = axios.create({
//     headers,
//     timeout,
//     // withCredentials: true,
//   })
//
//   instance.interceptors.request.use(request => {
//     if (request.url !== URIProperty.loginDashboard()) {
//       request.headers.Authorization = `Bearer ${localStorage.getItem(
//         'access_token'
//       )}`
//     }
//     return {
//       ...request,
//       headers: {
//         ...request.headers,
//       },
//       data: data,
//     }
//   })
//
//   instance.interceptors.response.use(
//     response => {
//       const { status, data } = response
//       if (status === ResponseStatusCode.success) {
//         return processResponse(response)
//       } else {
//         return Promise.reject({
//           status: status,
//           message: data.message,
//           data: data.data,
//         })
//       }
//     },
//     error => {
//       return Promise.reject(error)
//     }
//   )
//
//   const url = api.url
//   const params = data && data.params ? data.params : null
//
//   switch (api.method) {
//     case 'get':
//       return instance.get(url, {
//         params: { params },
//         paramsSerializer: params => parseParams(params),
//       })
//     case 'post':
//       return instance.post(url, params, { headers: api.headers })
//     case 'put':
//       return instance.put(url, params, { headers: api.headers })
//     case 'delete':
//       return instance.delete(url, { params, headers: api.headers })
//     default:
//       return null
//   }
// }
//
// export const handleDownloadFile = async (linkFile, nameFile) => {
//   const response = await axios.get(linkFile, { responseType: 'blob' })
//   FileSaver.saveAs(response.data, nameFile)
// }
// export default RequestFile
