import CryptoJS from 'crypto-js'
// import { JSEncrypt } from 'jsencrypt'
import {
  EncryptConstants,
  DateFormatType,
  ResponseStatusCode,
} from './constant'

export const aesPub = getAESKey()

export function processRequest(data) {
  //skip process if not request body
  if (!data) {
    return null
  }
  const now = new Date()
  const timestamp = now.getTime()
  let result = {}
  let requestData = null
  let encodeKey = null
  // Put aesKey to body
  const dataWithAESKey = { ...data, aesKey: aesPub }
  requestData = encryptAES(
    JSON.stringify(Object.assign({}, dataWithAESKey)),
    aesPub
  )
  encodeKey = encryptRSA(aesPub)
  Object.assign(result, EncryptConstants.params, {
    requestId: `${timestamp}`,
    timestamp: formatDate(now, DateFormatType),
    requestData,
    encodeKey,
  })
  result.sign = addSign(result)
  return result
}

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

function decodeAES(value, aesPubStr) {
  const aesKey = CryptoJS.enc.Utf8.parse(aesPubStr)
  const decrypted = CryptoJS.AES.decrypt(value, aesKey, {
    iv: CryptoJS.enc.Utf8.parse(EncryptConstants.ivKey),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding,
  })
  return CryptoJS.enc.Utf8.stringify(decrypted).trim()
}

function encryptAES(value, aesPubStr) {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.AES.encrypt(value, CryptoJS.enc.Utf8.parse(aesPubStr), {
      iv: CryptoJS.enc.Utf8.parse(EncryptConstants.ivKey),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding,
    }).ciphertext
  )
}

function getAESKey() {
  let key = []
  for (let i = 0; i < 16; i++) {
    let num = Math.floor(Math.random() * 26)
    let charStr = String.fromCharCode(97 + num)
    key.push(charStr.toUpperCase())
  }
  return key.join('')
}

// function encryptRSA(value) {
//   const encryptObj = new JSEncrypt()
//   encryptObj.setPublicKey(EncryptConstants.publicKey)
//   return encryptObj.encrypt(value)
// }

function addSign(params) {
  let source = ''
  Object.keys(params)
    .sort()
    .forEach(key => {
      source += `${key}=${params[key]}, `
    })
  source = source.slice(0, -2)
  return CryptoJS.SHA256(`{${source}}`).toString(CryptoJS.enc.Hex)
}

function formatDate(date, format = 'yyyy-MM-dd') {
  try {
    let monthArr = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    let o = {
      yyyy: date.getFullYear(),
      MMM: monthArr[date.getMonth()],
      MM: dateFormatZero(date.getMonth() + 1),
      dd: dateFormatZero(date.getDate()),
      hh: dateFormatZero(date.getHours()),
      mm: dateFormatZero(date.getMinutes()),
      ss: dateFormatZero(date.getSeconds()),
    }

    for (let k in o) {
      format = format.replace(k, o[k])
    }
    return format
  } catch (e) {
    console.log(e.message)
    return ''
  }
}
function dateFormatZero(str) {
  str = str.toString()
  return str.length === 1 ? '0' + str : str
}
