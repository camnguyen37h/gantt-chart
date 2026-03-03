import { processResponse } from './encrypt'
const axios = require('axios')
import { URIProperty } from '../utils/URIProperty'
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
    'Access-Control-Allow-Origin': process.env.ORIGIN_HEADER,
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, Origin',
    'author-id': `${JSON.parse(localStorage.getItem('user')).id}`,
    ...(customHeaders || {}),
  }

  const timeout = 2 * 60 * 1000000 // 33 hours
  // const baseURL = config.ENDPOINT
  const instance = axios.create({
    headers,
    timeout,
    // withCredentials: true,
  })

  const extraInstance = axios.create({
    headers,
    timeout,
    // withCredentials: true,
  })

  instance.interceptors.request.use(request => {
    if (
      ![URIProperty.loginDashboard(), URIProperty.getNewToken()].includes(
        request.url
      )
    ) {
      request.headers.Authorization = `Bearer ${localStorage.getItem(
        'access_token'
      )}`
    }

    return { ...request }
  })

  extraInstance.interceptors.request.use(request => {
    if (
      ![URIProperty.loginDashboard(), URIProperty.getNewToken()].includes(
        request.url
      )
    ) {
      request.headers.Authorization = `Bearer ${localStorage.getItem(
        'access_token'
      )}`
    }

    return { ...request }
  })

  instance.interceptors.response.use(
    async response => {
      return processResponse(response)
    },
    async error => {
      if (
        error.response.status === HttpStatus.UNAUTHORIZED &&
        error.config.url !== '/refresh-token'
      ) {
        if (!window.refreshTokenPromise) {
          // check for an existing in-progress request
          // if nothing is in-progress, start a new refresh token request
          window.refreshTokenPromise = axios
            .post(URIProperty.getNewToken(), {
              accessToken: localStorage.getItem('access_token'),
              refreshToken: localStorage.getItem('refreshToken'),
            })
            .then(response => {
              window.refreshTokenPromise = null // clear state
              localStorage.setItem('access_token', response.data.accessToken)
              localStorage.setItem('refreshToken', response.data.refreshToken)
              return response.data.accessToken // resolve with the new token
            })
            .catch(error => {
              // LoginActions.signOut()
              return false
            })
        }

        return window.refreshTokenPromise.then(token => {
          if (!token) return
          return extraInstance.request(error.config)
        })
      }
      return processResponse(error.response)
    }
  )

  extraInstance.interceptors.response.use(
    async response => {
      return processResponse(response)
    },
    error => {
      if (
        error.response.status === HttpStatus.UNAUTHORIZED &&
        error.config.url !== '/refresh-token'
      ) {
        // LoginActions.signOut()
        return
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
