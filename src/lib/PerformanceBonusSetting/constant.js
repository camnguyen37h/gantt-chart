export const PERFORMANCE_BONUS_SETTING_KEYS = {
  PERFORMANCE_BONUS_SETTING: 'PERFORMANCE_BONUS_SETTING',
  RATING_BACKDATE: 'RATING_BACKDATE',
  PERFORMANCE_SCORE_SETTING: 'PERFORMANCE_SCORE_SETTING',
}

export const PERFORMANCE_BONUS_SETTING_CONFIG_KEYS = {
  MIN_PERFORMANCE_BONUS: {
    title: 'Min Value',
    key: 'MIN_PERFORMANCE_BONUS',
  },
  MAX_PERFORMANCE_BONUS: {
    title: 'Max Value',
    key: 'MAX_PERFORMANCE_BONUS',
  },
  DEFAULT_PERFORMANCE_BONUS: {
    title: 'Default Value',
    key: 'DEFAULT_PERFORMANCE_BONUS',
  },
}

export const MESSAGE_MIN_GREATER_THAN_MAX =
  'Min value must be less than max value'
export const MESSAGE_PLACE_HOLDER_INPUT = 'Please input here'
export const VALIDATE_REQUIRED = field => `${field} is required`
export const VALIDATE_OUT_OF_RANGE = (
  min = PERFORMANCE_LIMIT[0],
  max = PERFORMANCE_LIMIT[1]
) => `Only allow number from ${min} to ${max}, include decimal value`
export const PERFORMANCE_LIMIT = [0, 9999.99]
