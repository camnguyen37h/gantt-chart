import axios from 'axios'
import { NotificationManager } from 'react-notifications'
import { URIProperty } from '../utils/URIProperty'
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
    const skipAuth = [URIProperty.loginDashboard(), URIProperty.getNewToken()]
    if (!skipAuth.includes(request.url)) {
      request.headers.Authorization = `Bearer ${localStorage.getItem(
        'access_token'
      )}`
    }
    return request
  })
}

const attachResponseInterceptor = (instance, isExtra = false) => {
  instance.interceptors.response.use(
    async response => processResponse(response),
    async error => {
      const { response, config } = error

      if (
        response.status === HttpStatus.UNAUTHORIZED &&
        config.url !== '/refresh-token'
      ) {
        if (!isExtra) {
          if (!window.refreshTokenPromise) {
            window.refreshTokenPromise = axios
              .post(URIProperty.getNewToken(), {
                accessToken: localStorage.getItem('access_token'),
                refreshToken: localStorage.getItem('refreshToken'),
              })
              .then(res => {
                window.refreshTokenPromise = null
                localStorage.setItem('access_token', res.data.accessToken)
                localStorage.setItem('refreshToken', res.data.refreshToken)
                return res.data.accessToken
              })
              .catch(() => {
                LoginActions.signOut()
                return false
              })
          }

          return window.refreshTokenPromise.then(token => {
            if (!token) return
            const retryInstance = createAxiosInstance()
            attachRequestInterceptor(retryInstance)
            return retryInstance.request(config)
          })
        } else {
          LoginActions.signOut()
          return
        }
      }

      const data = response.data || {}
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
  const extraInstance = createAxiosInstance(customHeaders)

  attachRequestInterceptor(instance)
  attachRequestInterceptor(extraInstance)
  attachResponseInterceptor(instance, false)
  attachResponseInterceptor(extraInstance, true)

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
  }
}

export default Network
