/**
 * Business Plan Calculation Utilities
 * Contains formulas for calculating revenue, expenses, and other financial metrics
 */

/**
 * Format number as currency (VND)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format number with decimals
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Calculate MM Bill (Man-Month Bill)
 * Formula: Total unit prices / MM effort
 * @param {number} unitPrice - Unit price per MM
 * @param {number} mmEffort - MM effort value
 * @returns {number} MM Bill
 */
export const calculateMMBill = (unitPrice, mmEffort) => {
  if (!mmEffort || mmEffort === 0) return 0;
  return unitPrice / mmEffort;
};

/**
 * Calculate Software Production Revenue
 * Formula: Unit Price * Exchange Rate * (Pipeline Ratio / 100)
 * @param {number} unitPrice - Unit price
 * @param {number} exchangeRate - Exchange rate
 * @param {number} pipelineRatio - Pipeline ratio percentage
 * @returns {number} Software Production Revenue
 */
export const calculateTotalRevenue = (unitPrice, exchangeRate, pipelineRatio) => {
  return unitPrice * exchangeRate * (pipelineRatio / 100);
};

/**
 * Calculate revenue with exchange rate
 * @param {number} amount - Original amount
 * @param {number} exchangeRate - Exchange rate
 * @returns {number} Amount in VND
 */
export const calculateExchangeAmount = (amount, exchangeRate = 1) => {
  return amount * exchangeRate;
};

/**
 * Calculate Deduction
 * Formula: Software Production Rev * Deduction Rate
 * @param {number} softwareProductionRev - Software production revenue
 * @param {number} deductionRate - Deduction rate (percentage)
 * @returns {number} Deduction amount
 */
export const calculateDeduction = (softwareProductionRev, deductionRate = 0) => {
  return softwareProductionRev * (deductionRate / 100);
};

/**
 * Calculate Revenue from Work Delivered
 * Formula: Software Production Rev - Deduction
 * @param {number} softwareProductionRev - Software production revenue
 * @param {number} deduction - Deduction amount
 * @returns {number} Revenue from work delivered
 */
export const calculateRevenueFromWorkDelivered = (softwareProductionRev, deduction) => {
  return softwareProductionRev - deduction;
};

/**
 * Calculate Total Revenue
 * Formula: Software Production Rev + Other Revenue - Deduction
 * @param {number} softwareProductionRev - Software production revenue
 * @param {number} otherRevenue - Other revenue
 * @param {number} deduction - Deduction amount
 * @returns {number} Total revenue
 */
export const calculateTotalRevenueAll = (softwareProductionRev, otherRevenue, deduction) => {
  return softwareProductionRev + otherRevenue - deduction;
};

/**
 * Calculate Net Revenue (Revenue - Expenses)
 * @param {number} totalRevenue - Total revenue
 * @param {number} totalExpenses - Total expenses
 * @returns {number} Net revenue
 */
export const calculateNetRevenue = (totalRevenue, totalExpenses) => {
  return totalRevenue - totalExpenses;
};

/**
 * Calculate monthly revenue distribution
 * @param {number} totalRevenue - Total revenue
 * @param {number} months - Number of months
 * @param {string} distributionType - 'equal' or 'custom'
 * @returns {Array} Array of monthly revenues
 */
export const distributeMonthlyRevenue = (totalRevenue, months = 12, distributionType = 'equal') => {
  if (distributionType === 'equal') {
    const monthlyAmount = totalRevenue / months;
    return Array(months).fill(monthlyAmount);
  }
  
  // For custom distribution, return empty array to be filled by user
  return Array(months).fill(0);
};

/**
 * Calculate Pipeline Ratio adjusted amount
 * @param {number} baseAmount - Base amount
 * @param {number} pipelineRatio - Pipeline ratio percentage
 * @returns {number} Adjusted amount
 */
export const applyPipelineRatio = (baseAmount, pipelineRatio = 100) => {
  return baseAmount * (pipelineRatio / 100);
};

/**
 * Calculate MM from revenue and unit price
 * Formula: Revenue / Unit Price
 * @param {number} revenue - Total revenue
 * @param {number} unitPrice - Unit price per MM
 * @returns {number} Man-Months
 */
export const calculateMMFromRevenue = (revenue, unitPrice) => {
  if (!unitPrice || unitPrice === 0) return 0;
  return revenue / unitPrice;
};

/**
 * Calculate department-specific revenue
 * @param {number} totalRevenue - Total revenue
 * @param {string} department - Department code
 * @param {object} departmentRatios - Ratios for each department
 * @returns {number} Department revenue
 */
export const calculateDepartmentRevenue = (totalRevenue, department, departmentRatios = {}) => {
  const ratio = departmentRatios[department] || 0;
  return totalRevenue * (ratio / 100);
};

/**
 * Calculate Internal vs External split
 * @param {number} totalAmount - Total amount
 * @param {number} internalRatio - Internal ratio percentage
 * @returns {object} { internal, external }
 */
export const calculateInternalExternal = (totalAmount, internalRatio = 50) => {
  const internal = totalAmount * (internalRatio / 100);
  const external = totalAmount - internal;
  return { internal, external };
};

/**
 * Sum array of values
 * @param {Array} values - Array of numbers
 * @returns {number} Sum
 */
export const sumValues = (values) => {
  return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
};

/**
 * Calculate average of array
 * @param {Array} values - Array of numbers
 * @returns {number} Average
 */
export const calculateAverage = (values) => {
  if (!values || values.length === 0) return 0;
  return sumValues(values) / values.length;
};

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0;
  return (part / total) * 100;
};

/**
 * Calculate year-over-year growth
 * @param {number} currentValue - Current year value
 * @param {number} previousValue - Previous year value
 * @returns {number} Growth percentage
 */
export const calculateYoYGrowth = (currentValue, previousValue) => {
  if (!previousValue || previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};

/**
 * Calculate compound values (for summary calculations)
 * @param {object} positions - Array of position objects
 * @returns {object} Calculated summary
 */
export const calculateSummaryFromPositions = (positions) => {
  let totalRevenue = 0;
  let totalMM = 0;
  
  positions.forEach(position => {
    const revenue = calculateTotalRevenue(
      position.unitPrice,
      position.exchangeRate,
      position.pipelineRatio
    );
    totalRevenue += revenue;
    
    const mm = calculateMMFromRevenue(revenue, position.unitPrice);
    totalMM += mm;
  });
  
  return {
    totalRevenue,
    totalMM,
    averageUnitPrice: positions.length > 0 ? totalRevenue / totalMM : 0
  };
};

/**
 * Validate numeric input
 * @param {any} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Is valid
 */
export const isValidNumber = (value, min = -Infinity, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Round to specific decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export const roundTo = (value, decimals = 2) => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};
