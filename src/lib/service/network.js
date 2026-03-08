import axios from 'axios'
import { NotificationManager } from 'react-notifications'
import { HttpStatus } from '../../../constants/HttpStatus'
import LoginActions from '@/actions/LoginActions'
import { parseParams } from './request'
import { processResponse } from './encrypt'

const createAxiosInstance = (customHeaders = {}) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, Origin',
    'author-id': `${user.id || ''}`,
    ...customHeaders,
  }

  return axios.create({
    headers,
    timeout: 2 * 60 * 1000000, // 33 hours
  })
}

const attachRequestInterceptor = instance => {
  instance.interceptors.request.use(request => {
    // Add Authorization header from localStorage
    const token = localStorage.getItem('access_token')
    if (token) {
      request.headers.Authorization = `Bearer ${token}`
    }
    return request
  })
}

const attachResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    async response => processResponse(response),
    async error => {
      const { response } = error

      // Mock mode: Skip refresh token logic - always authenticated
      // Mock API handles auth via localStorage token (set in index.html)
      // No need to call refresh token API in standalone mock mode
      
      if (response && response.status === HttpStatus.UNAUTHORIZED) {
        console.warn('⚠️ Mock Auth: Unauthorized detected, logging out...')
        LoginActions.signOut()
        return
      }

      const data = response?.data || {}
      NotificationManager.error(
        typeof data === 'string'
          ? data
          : data.errorMessage ||
              data.message ||
              data.error ||
              data.details ||
              'Server Error'
      )

      throw error
    }
  )
}

const Network = ({
  url,
  method = 'get',
  data,
  customHeaders,
  cancel,
  headers,
}) => {
  const instance = createAxiosInstance(customHeaders)

  attachRequestInterceptor(instance)
  attachResponseInterceptor(instance)

  const params = data

  switch (method.toLowerCase()) {
    case 'get':
      return instance.get(url, {
        params: { params },
        paramsSerializer: parseParams,
        headers: headers,
      })
    case 'post':
      return instance.post(url, params, {
        headers: headers,
        ...(cancel && {
          cancelToken: new axios.CancelToken(c => {
            window.cancel = c
          }),
        }),
      })
    case 'put':
      return instance.put(url, params, { headers: headers })
    case 'delete':
      return instance.delete(url, {
        params,
        headers: headers,
      })
    default:
      return instance.get(url, {
        params: { params },
        paramsSerializer: parseParams,
        headers: headers,
      })
  }
}

export default Network
