export const DateFormat = {
  YYYY_MM_DD: 'YYYY-MM-DD',
  DD_MM_YYYY: 'DD-MM-YYYY',
  MM_YYYY: 'MM-YYYY',
  MMM_YYYY: 'MMM-YYYY',
  YYYY_MM: 'YYYY-MM',
  MMYYYY: 'MMYYYY',
  ddd: 'ddd',
  DD_MMM_YYYY: 'DD MMM, YYYY',
  HH: 'HH',
  MM: 'mm',
  MMM_DD_YYYY: 'MMM DD, YY',
  MONTH: 'MM',
  YEAR: 'YYYY',
  MMM: 'MMM',
  //Start-DB2-Timesheet-2019
  HH_MM_MMM_DD_YYYY: 'hh:mm MMMM DD, YYYY',
  HH_mm_ss_DD_MM_YYYY: 'HH:mm:ss DD/MM/YYYY',
  YYYY_WO: 'YYYY-wo',
  hh_mm_DD_MM_YYYY: 'hh:mm DD-MM-YYYY',
  //end-DB2-Timesheet-2019
  INVALID_DATE: 'Invalid date',
  DATE_FORWARD_SLASH: 'DD/MM/YYYY',
  MONTH_FORWARD_SLASH: 'MM/YYYY',
  DATE_TIME: 'DD/MM/YYYY hh:mm:ss',
  DATE_TIME_APM: 'DD/MM/YYYY HH:mm:ss A',
  DATE_TIME_APM_EXCLUDE_APM: 'DD/MM/YYYY HH:mm:ss',
  DATE_TIME_EXCLUDE_SECOND: 'DD/MM/YYYY hh:mm A',
  DATE_TIME_MMM_EXCLUDE_SECOND: 'DD MMM YYYY hh:mm A',
  TIME_APM: 'hh:mm:ss A',
  DD_MMM_YY_HH_MM_A_SLASH: 'DD/MMM/YY hh:mm A',
  HH_MM_A: 'hh:mm A',
  MONTH_YEAR: 'MMM YYYY',
  // Week Picker
  WEEK_PICKER: '[W]WW/GGGG',
  DATE_FORWARD_SLASH_REVERSE: 'YYYY/MM/DD',
}

/**
 * Format float number to 2 decimal places
 * @param {number} number - Number to format
 * @returns {string} Formatted number string with 2 decimal places
 */
export const formatFloatNumber = number => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0.00'
  }
  return Number(number).toFixed(2)
}
