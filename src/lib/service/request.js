import { processResponse } from './encrypt'
import axios from 'axios'
import { HttpStatus } from '../constants/HttpStatus'

export const parseParams = params => {
  let options = ''

  if (params.params) {
    for (const [key, value] of Object.entries(params.params)) {
      if (Array.isArray(value)) {
        for (const element of value) {
          options += `${encodeURIComponent(key)}=${encodeURIComponent(
            element
          )}&`
        }
      } else {
        if (value !== undefined) {
          options += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`
        }
      }
    }
  }

  return options.slice(0, -1)
}

const Request = (api, data, message, customHeaders, cancel) => {
  const { errorMessage, successMessage } = message || {}
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, Origin',
    'author-id': `${(JSON.parse(localStorage.getItem('user')) || { id: 1 }).id}`,
    ...(customHeaders || {}),
  }

  const timeout = 2 * 60 * 1000000 // 33 hours
  // const baseURL = config.ENDPOINT
  const instance = axios.create({
    headers,
    timeout,
    // withCredentials: true,
  })

  instance.interceptors.request.use(request => {
    // Add Authorization header from localStorage
    const token = localStorage.getItem('access_token')
    if (token) {
      request.headers.Authorization = `Bearer ${token}`
    }
    return { ...request }
  })

  instance.interceptors.response.use(
    async response => {
      return processResponse(response)
    },
    async error => {
      // Mock mode: Skip refresh token logic - always authenticated
      // Mock API handles auth via localStorage token (set in index.html)
      // If UNAUTHORIZED in mock mode, just logout (shouldn't happen with mock API)
      
      if (error.response?.status === HttpStatus.UNAUTHORIZED) {
        console.warn('⚠️ Mock Auth: Unauthorized detected in request.js')
        // In mock mode, this shouldn't happen since mock API always returns 200
        // But if it does, just process the response without retry
      }
      
      return processResponse(error.response)
    }
  )

  const url = api.url
  const params = data && data.params ? data.params : data

  switch (api.method) {
    case 'get':
      return instance.get(
        url,
        {
          params: { params },
          paramsSerializer: params => parseParams(params),
        },
        { headers: api.headers }
      )
    case 'post':
      return instance.post(url, params, {
        headers: api.headers,
        ...(cancel
          ? {
              cancelToken: new axios.CancelToken(c => {
                window.cancel = c
              }),
            }
          : {}),
      })
    case 'put':
      return instance.put(url, params, { headers: api.headers })
    case 'delete':
      return instance.delete(url, {
        params: params,
        headers: api.headers,
      })
    default:
      return null
  }
}

export default Request

export function processDataParams(data) {
  let newData = { ...data }
  for (let key in newData) {
    if (Array.isArray(newData[key])) {
      newData[key] = newData[key].join(',') || ''
    }
  }
  return newData
}
