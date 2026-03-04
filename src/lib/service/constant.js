import CryptoJS from 'crypto-js'

export const ResponseStatusCode = {
  success: 200,
  expired: 401,
  forceExpired: 400,
  forbidden: 403
}

export const DateFormatType = 'yyyyMMddhhmmss'

// Using direct paths for demo/mock API
export const API = 'http://localhost:3000'
export const API_GROUP = 'http://localhost:3000'
export const API_MASTERDATA = 'http://localhost:3000'
export const API_SALE = 'http://localhost:3000'
export const API_CRM = 'http://localhost:3000'
export const API_SALE_SYNC = 'http://localhost:3000'
