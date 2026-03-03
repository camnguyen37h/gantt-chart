import {
  ResponseStatusCode,
} from './constant'

export function processResponse(response) {
  const { status, data } = response

  if (status === ResponseStatusCode.success) {
    return {
      status: data.httpStatus || data.status || status,
      data: data.data === undefined || data.data === null ? data : data.data,
      message: data.message || data.errorMessage,
      total: data.total || data.totalElements || 0,
    }
  } else {
    return {
      status: status,
      data: data.data,
      message:
        data.errorMessage ||
        data.message ||
        data.error ||
        data.details ||
        (typeof data === 'string' ? data : 'Server Error'),
    }
  }
}