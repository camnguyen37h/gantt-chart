/**
 * Mock API for Business Plan Data
 * Provides sample data for Onsite and Offshore work types
 */

import { calculateTotalRevenue } from './businessPlanCalculations';

// Mock database for Onsite work type
const onsiteData = {
  summary: {
    mmBill: 11.5,
    softwareProductionRev: 7500000000,
    deduction: 7100000000,
    onsiteFee: 0,
    revenueFromEquipment: 0,
    mmBillValue: 0,
    otherRev: 0,
    agencyExpenses: 0
  },
  
  softwareProduction: [
    {
      id: 1,
      position: 'SE02',
      unitPrice: 20000000,
      department: 'DU3',
      exchangeRate: 1,
      pipelineRatio: 100,
      total: 0,
      months: {
        'Jan-2026': 1.5,
        'Feb-2026': 1.5,
        'Mar-2026': 0,
        'Apr-2026': 0,
        'May-2026': 0,
        'Jun-2026': 0
      }
    },
    {
      id: 2,
      position: 'SE02',
      unitPrice: 20000000,
      department: 'DU1',
      exchangeRate: 1,
      pipelineRatio: 100,
      total: 0,
      months: {
        'Jan-2026': 1.5,
        'Feb-2026': 1.5,
        'Mar-2026': 0,
        'Apr-2026': 0,
        'May-2026': 0,
        'Jun-2026': 0
      }
    },
    {
      id: 3,
      position: 'BJI',
      unitPrice: 20000000,
      department: 'BJI',
      exchangeRate: 1,
      pipelineRatio: 100,
      total: 0,
      months: {
        'Jan-2026': 6,
        'Feb-2026': 6,
        'Mar-2026': 0,
        'Apr-2026': 0,
        'May-2026': 0,
        'Jun-2026': 0
      }
    }
  ],
  
  otherRevenue: [
    {
      id: 1,
      revenue: 'Onsite Fee',
      onsiteFee: 0,
      revenueFrom: '',
      otherRevenues: 0,
      totalRevenue: 0,
      months: {
        'Jan-2026': 0,
        'Feb-2026': 0,
        'Mar-2026': 0,
        'Apr-2026': 0,
        'May-2026': 0,
        'Jun-2026': 0
      }
    },
    {
      id: 2,
      revenue: 'Revenue from Equipment',
      onsiteFee: 0,
      revenueFrom: '',
      otherRevenues: 0,
      totalRevenue: 0,
      months: {
        'Jan-2026': 0,
        'Feb-2026': 0,
        'Mar-2026': 0,
        'Apr-2026': 0,
        'May-2026': 0,
        'Jun-2026': 0
      }
    },
    {
      id: 3,
      revenue: 'Other revenues',
      onsiteFee: 0,
      revenueFrom: '',
      otherRevenues: 0,
      totalRevenue: 0,
      months: {
        'Jan-2026': 0,
        'Feb-2026': 0,
        'Mar-2026': 0,
        'Apr-2026': 0,
        'May-2026': 0,
        'Jun-2026': 0
      }
    }
  ],
  
  sellingExpenses: [
    {
      id: 1,
      category: 'Agency Expense',
      totalExpense: 0,
      months: {
        'Jan-2026': 0,
        'Feb-2026': 0,
        'Mar-2026': 0,
        'Apr-2026': 0,
        'May-2026': 0,
        'Jun-2026': 0
      }
    }
  ]
};

// Mock database for Offshore work type
const offshoreData = {
  summary: {
    mmBill: 11.5,
    softwareProductionRev: 7500000000,
    deduction: 7180091500,
    onsiteFee: 0,
    revenueFromEquipment: 0,
    mmBillValue: 0,
    otherRev: 0,
    agencyExpenses: 0
  },
  
  softwareProduction: [
    {
      id: 1,
      position: 'SE02',
      unitPrice: 26000000,
      department: 'TDX',
      exchangeRate: 1,
      pipelineRatio: 100,
      total: 0,
      months: {
        'Jan-2026': 1.5,
        'Feb-2026': 1.5,
        'Mar-2026': 1.5,
        'Apr-2026': 1.5,
        'May-2026': 1.5,
        'Jun-2026': 1.5
      }
    },
    {
      id: 2,
      position: 'PM',
      unitPrice: 35000000,
      department: 'TDX',
      exchangeRate: 1,
      pipelineRatio: 100,
      total: 0,
      months: {
        'Jan-2026': 1,
        'Feb-2026': 1,
        'Mar-2026': 1,
        'Apr-2026': 1,
        'May-2026': 1,
        'Jun-2026': 1
      }
    },
    {
      id: 3,
      position: 'QA',
      unitPrice: 22000000,
      department: 'TDX',
      exchangeRate: 1,
      pipelineRatio: 100,
      total: 0,
      months: {
        'Jan-2026': 2,
        'Feb-2026': 2,
        'Mar-2026': 2,
        'Apr-2026': 2,
        'May-2026': 2,
        'Jun-2026': 2
      }
    }
  ],
  
  otherRevenue: [
    {
      id: 1,
      revenue: 'Training Revenue',
      onsiteFee: 0,
      revenueFrom: 'Client Training',
      otherRevenues: 50000000,
      totalRevenue: 50000000,
      months: {
        'Jan-2026': 10000000,
        'Feb-2026': 10000000,
        'Mar-2026': 10000000,
        'Apr-2026': 10000000,
        'May-2026': 5000000,
        'Jun-2026': 5000000
      }
    },
    {
      id: 2,
      revenue: 'License Revenue',
      onsiteFee: 0,
      revenueFrom: 'Software License',
      otherRevenues: 30000000,
      totalRevenue: 30000000,
      months: {
        'Jan-2026': 5000000,
        'Feb-2026': 5000000,
        'Mar-2026': 5000000,
        'Apr-2026': 5000000,
        'May-2026': 5000000,
        'Jun-2026': 5000000
      }
    }
  ],
  
  sellingExpenses: [
    {
      id: 1,
      category: 'Marketing Expense',
      totalExpense: 20000000,
      months: {
        'Jan-2026': 3500000,
        'Feb-2026': 3500000,
        'Mar-2026': 3000000,
        'Apr-2026': 3000000,
        'May-2026': 3500000,
        'Jun-2026': 3500000
      }
    },
    {
      id: 2,
      category: 'Travel Expense',
      totalExpense: 15000000,
      months: {
        'Jan-2026': 2500000,
        'Feb-2026': 2500000,
        'Mar-2026': 2500000,
        'Apr-2026': 2500000,
        'May-2026': 2500000,
        'Jun-2026': 2500000
      }
    }
  ]
};

/**
 * Fetch business plan data based on work type
 * @param {string} workType - 'onsite' or 'offshore'
 * @returns {Promise<object>} Business plan data
 */
export const fetchBusinessPlanData = async (workType = 'onsite') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = workType === 'onsite' 
        ? JSON.parse(JSON.stringify(onsiteData))
        : JSON.parse(JSON.stringify(offshoreData));
      
      // Calculate totals for software production
      data.softwareProduction = data.softwareProduction.map(position => ({
        ...position,
        total: calculateTotalRevenue(position.unitPrice, position.exchangeRate, position.pipelineRatio)
      }));
      
      resolve(data);
    }, 500);
  });
};

/**
 * Fetch combined data for both work types
 * @returns {Promise<object>} Combined business plan data
 */
export const fetchCombinedBusinessPlanData = async () => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const onsiteResult = await fetchBusinessPlanData('onsite');
      const offshoreResult = await fetchBusinessPlanData('offshore');
      
      resolve({
        onsite: onsiteResult,
        offshore: offshoreResult,
        combined: mergeBusiPlanData(onsiteResult, offshoreResult)
      });
    }, 800);
  });
};

/**
 * Merge onsite and offshore data
 * @param {object} onsiteData - Onsite data
 * @param {object} offshoreData - Offshore data
 * @returns {object} Merged data
 */
const mergeBusiPlanData = (onsiteData, offshoreData) => {
  return {
    summary: {
      mmBill: onsiteData.summary.mmBill + offshoreData.summary.mmBill,
      softwareProductionRev: onsiteData.summary.softwareProductionRev + offshoreData.summary.softwareProductionRev,
      deduction: onsiteData.summary.deduction + offshoreData.summary.deduction,
      onsiteFee: onsiteData.summary.onsiteFee + offshoreData.summary.onsiteFee,
      revenueFromEquipment: onsiteData.summary.revenueFromEquipment + offshoreData.summary.revenueFromEquipment,
      mmBillValue: onsiteData.summary.mmBillValue + offshoreData.summary.mmBillValue,
      otherRev: onsiteData.summary.otherRev + offshoreData.summary.otherRev,
      agencyExpenses: onsiteData.summary.agencyExpenses + offshoreData.summary.agencyExpenses
    },
    softwareProduction: [...onsiteData.softwareProduction, ...offshoreData.softwareProduction],
    otherRevenue: [...onsiteData.otherRevenue, ...offshoreData.otherRevenue],
    sellingExpenses: [...onsiteData.sellingExpenses, ...offshoreData.sellingExpenses]
  };
};

/**
 * Save business plan data
 * @param {string} workType - 'onsite' or 'offshore'
 * @param {object} data - Data to save
 * @returns {Promise<object>} Save result
 */
export const saveBusinessPlanData = async (workType, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Saving business plan data for:', workType, data);
      
      // Update mock database
      if (workType === 'onsite') {
        Object.assign(onsiteData, data);
      } else {
        Object.assign(offshoreData, data);
      }
      
      resolve({
        success: true,
        message: 'Business plan saved successfully',
        workType,
        timestamp: new Date().toISOString()
      });
    }, 300);
  });
};

/**
 * Get department breakdown
 * @param {string} workType - 'onsite' or 'offshore'
 * @returns {Promise<object>} Department breakdown
 */
export const getDepartmentBreakdown = async (workType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = workType === 'onsite' ? onsiteData : offshoreData;
      
      const breakdown = {
        Total: 0,
        BJI: 0,
        Internal: 0,
        DU1: 0,
        DU3: 0,
        TDX: 0
      };
      
      data.softwareProduction.forEach(position => {
        const revenue = calculateTotalRevenue(
          position.unitPrice,
          position.exchangeRate,
          position.pipelineRatio
        );
        
        if (breakdown[position.department] !== undefined) {
          breakdown[position.department] += revenue;
        }
        breakdown.Total += revenue;
      });
      
      resolve(breakdown);
    }, 200);
  });
};

/**
 * Get monthly revenue distribution
 * @param {string} workType - 'onsite' or 'offshore'
 * @returns {Promise<Array>} Monthly revenue data
 */
export const getMonthlyRevenue = async (workType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = workType === 'onsite' ? onsiteData : offshoreData;
      const months = ['Jan-2026', 'Feb-2026', 'Mar-2026', 'Apr-2026', 'May-2026', 'Jun-2026'];
      
      const monthlyData = months.map(month => {
        let total = 0;
        
        // Sum from software production
        data.softwareProduction.forEach(position => {
          if (position.months && position.months[month]) {
            total += position.unitPrice * position.months[month];
          }
        });
        
        // Add other revenue
        data.otherRevenue.forEach(revenue => {
          if (revenue.months && revenue.months[month]) {
            total += parseFloat(revenue.months[month]) || 0;
          }
        });
        
        return {
          month,
          revenue: total
        };
      });
      
      resolve(monthlyData);
    }, 200);
  });
};

/**
 * Export business plan data
 * @param {string} workType - 'onsite' or 'offshore'
 * @param {string} format - 'json' or 'csv'
 * @returns {Promise<object>} Export result
 */
export const exportBusinessPlanData = async (workType, format = 'json') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = workType === 'onsite' ? onsiteData : offshoreData;
      
      resolve({
        success: true,
        data,
        format,
        fileName: `business_plan_${workType}_${new Date().toISOString()}.${format}`,
        timestamp: new Date().toISOString()
      });
    }, 500);
  });
};
