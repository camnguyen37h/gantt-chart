/**
 * Format float number to 2 decimal places
 * @param {number} value - Value to format
 * @returns {number} Formatted number
 */
export const formatFloatNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  return parseFloat(value.toFixed(2));
};

/**
 * Create a consistent date key for lookup
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {string} Date key in format "YYYY-MM"
 */
function createDateKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Compare function for sorting by year and month
 * @param {Object} a - First data point
 * @param {Object} b - Second data point
 * @returns {number} Comparison result
 */
function compareByYearMonth(a, b) {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  return a.month - b.month;
}

/**
 * Get the min and max year/month from data
 * @param {Array} data - Array of monthly data
 * @returns {Object} Object containing start and end year/month
 */
function getDateRange(data) {
  const sorted = [...data].sort(compareByYearMonth);
  
  return {
    start: { year: sorted[0].year, month: sorted[0].month },
    end: { year: sorted[sorted.length - 1].year, month: sorted[sorted.length - 1].month }
  };
}

/**
 * Create a Map for O(1) lookup of data by year-month key
 * @param {Array} data - Array of monthly data
 * @returns {Map} Map with year-month keys
 */
function createDataLookup(data) {
  const lookup = new Map();
  
  data.forEach(item => {
    const key = createDateKey(item.year, item.month);
    lookup.set(key, item);
  });
  
  return lookup;
}

/**
 * Check if date1 is after date2
 * @param {number} year1 - First year
 * @param {number} month1 - First month
 * @param {number} year2 - Second year
 * @param {number} month2 - Second month
 * @returns {boolean} True if date1 is after date2
 */
function isDateAfter(year1, month1, year2, month2) {
  return year1 > year2 || (year1 === year2 && month1 > month2);
}

/**
 * Get next month
 * @param {number} year - Current year
 * @param {number} month - Current month
 * @returns {Object} Next year and month
 */
function getNextMonth(year, month) {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

/**
 * Create a default record for missing month
 * @param {number} year - Year
 * @param {number} month - Month
 * @param {*} defaultValue - Default value for fields
 * @returns {Object} Default record object
 */
function createDefaultRecord(year, month, defaultValue) {
  return {
    year,
    month,
    planHeadCount: defaultValue,
    actualHeadCount: defaultValue,
    planManMonth: defaultValue,
    actualManMonth: defaultValue
  };
}

/**
 * Fill all missing months between start and end date
 * @param {Object} dateRange - Start and end dates
 * @param {Map} dataLookup - Lookup map for existing data
 * @param {*} defaultValue - Default value for missing fields
 * @returns {Array} Complete array with all months filled
 */
function fillMissingMonths(dateRange, dataLookup, defaultValue) {
  const result = [];
  const { start, end } = dateRange;
  
  let currentYear = start.year;
  let currentMonth = start.month;
  
  while (!isDateAfter(currentYear, currentMonth, end.year, end.month)) {
    const key = createDateKey(currentYear, currentMonth);
    const existingData = dataLookup.get(key);
    
    result.push(
      existingData || createDefaultRecord(currentYear, currentMonth, defaultValue)
    );
    
    // Move to next month
    ({ year: currentYear, month: currentMonth } = getNextMonth(currentYear, currentMonth));
  }
  
  return result;
}

/**
 * Normalize monthly data by filling missing months with default values
 * @param {Array} data - Array of monthly data objects
 * @param {Object} options - Configuration options
 * @param {*} options.defaultValue - Default value for missing fields (default: null)
 * @returns {Array} Normalized data with all months filled
 */
export function normalizeData(data, options = {}) {
  const { defaultValue = null } = options;

  // Early return for empty data
  if (!data || data.length === 0) {
    return [];
  }

  const dateRange = getDateRange(data);
  const dataLookup = createDataLookup(data);
  
  return fillMissingMonths(dateRange, dataLookup, defaultValue);
}
