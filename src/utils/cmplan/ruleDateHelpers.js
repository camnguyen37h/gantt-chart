import moment from 'moment'

export const DATE_FORMAT = 'MM/DD/YYYY'

export const toMoment = (iso) => (iso ? moment(iso) : null)

export const toIso = (date) => (date ? date.toISOString() : undefined)

export const isOutsideProjectRange = (date, min, max) => {
  if (!date) return false
  if (min && date.isBefore(min.clone().startOf('day'))) return true
  if (max && date.isAfter(max.clone().endOf('day'))) return true
  return false
}

/**
 * Builds the `disabledDate` predicate for the Applied Date picker:
 *   - rejects dates outside the project window
 *   - rejects dates after an already-chosen Expired Date
 */
export const buildAppliedDateGuard = ({ pStartMoment, pEndMoment, expiredMoment }) =>
  (current) => {
    if (!current) return false
    if (isOutsideProjectRange(current, pStartMoment, pEndMoment)) return true
    if (expiredMoment && current.isAfter(expiredMoment.clone().endOf('day'))) return true
    return false
  }

/**
 * Builds the `disabledDate` predicate for the Expired Date picker:
 *   - rejects dates outside the project window
 *   - rejects dates strictly before today (today itself remains selectable)
 *   - rejects dates strictly before an already-chosen Applied Date
 */
export const buildExpiredDateGuard = ({ pStartMoment, pEndMoment, appliedMoment }) =>
  (current) => {
    if (!current) return false
    if (isOutsideProjectRange(current, pStartMoment, pEndMoment)) return true
    if (current.isBefore(moment().startOf('day'))) return true
    if (appliedMoment && current.isBefore(appliedMoment.clone().startOf('day'))) return true
    return false
  }

/**
 * Snaps a manually-typed date back to the supplied fallback when the date
 * falls outside the project window. Used to prevent the user from typing a
 * date the picker would otherwise have disabled.
 */
export const snapDateIntoRange = (date, fallback, pStartMoment, pEndMoment) =>
  (isOutsideProjectRange(date, pStartMoment, pEndMoment) ? fallback : date)
