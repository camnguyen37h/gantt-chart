/**
 * Business Plan Mock API - Usage Examples
 * This file demonstrates how to use the Business Plan Mock API system
 * 
 * Copy these examples into your components as needed
 */

import {
  getBusinessPlanDetail,
  saveBusinessPlan,
  getProductionRevenue,
  saveProductionRevenue,
  getOtherRevenue,
  saveOtherRevenue,
  getSellingPlan,
  saveSellingPlan,
  getRevenueSummary,
  getMMBills,
  getDeliveryPlanSummary,
  exportBusinessPlan,
  getDepartmentsByBPVersion,
  getAllPositions,
  getAllCurrencies,
  getAllIndustries,
  getAllApprovalSteps,
  getUserActionHistory,
} from './lib/business-plan/businessPlanApiConfig';

// ============================================================================
// EXAMPLE 1: Fetch Business Plan Detail
// ============================================================================
export const example1_FetchBusinessPlanDetail = async () => {
  console.log('=== Example 1: Fetch Business Plan Detail ===');
  
  try {
    const businessPlan = await getBusinessPlanDetail(436);
    
    console.log('Project Code:', businessPlan.projectCode);
    console.log('Status:', businessPlan.status);
    console.log('Business Plan Name:', businessPlan.generalInfo.businessPlanName);
    console.log('Customer:', businessPlan.generalInfo.customerName);
    console.log('Contract Price:', businessPlan.generalInfo.totalContractPrice);
    console.log('Account Managers:', businessPlan.generalInfo.listAM.length);
    console.log('Team Leads:', businessPlan.generalInfo.listTeamLead.length);
    
    return businessPlan;
  } catch (error) {
    console.error('Error fetching business plan:', error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 2: Get Revenue Summary
// ============================================================================
export const example2_GetRevenueSummary = async () => {
  console.log('=== Example 2: Get Revenue Summary ===');
  
  try {
    const summary = await getRevenueSummary(436);
    
    console.log('Total Production Revenue:', summary.totalProductionRevenue.toLocaleString());
    console.log('Total Other Revenue:', summary.totalOtherRevenue.toLocaleString());
    console.log('Total Revenue:', summary.totalRevenue.toLocaleString());
    console.log('Total Selling Expense:', summary.totalSellingExpense.toLocaleString());
    console.log('Net Revenue:', summary.netRevenue.toLocaleString());
    console.log('Profit Margin:', summary.profitMargin + '%');
    
    return summary;
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 3: Update Production Revenue
// ============================================================================
export const example3_UpdateProductionRevenue = async () => {
  console.log('=== Example 3: Update Production Revenue ===');
  
  try {
    // 1. Get current production revenue
    const currentRevenue = await getProductionRevenue(436);
    console.log('Current revenue items:', currentRevenue.revenueInfos.length);
    
    // 2. Add new revenue item
    const newRevenueItem = {
      saleWorkOrderId: "271628",
      groupId: null,
      pipelineKey: "WO-7823",
      position: "QA Engineer",
      unitPrice: 3500000,
      rateCard: null,
      department: "BU2",
      exchangeRate: 1,
      pipeLineRatio: 100,
      totalManMonth: 8,
      totalRevenue: 28000000,
      revenue: {
        "01-2026": { manMonth: 1, revenue: 3500000 },
        "02-2026": { manMonth: 1, revenue: 3500000 },
        "03-2026": { manMonth: 1, revenue: 3500000 },
        "04-2026": { manMonth: 1, revenue: 3500000 },
        "05-2026": { manMonth: 1, revenue: 3500000 },
        "06-2026": { manMonth: 1, revenue: 3500000 },
        "07-2026": { manMonth: 1, revenue: 3500000 },
        "08-2026": { manMonth: 1, revenue: 3500000 },
      }
    };
    
    // 3. Update revenue data
    const updatedRevenue = {
      ...currentRevenue,
      revenueInfos: [...currentRevenue.revenueInfos, newRevenueItem]
    };
    
    // 4. Save updated revenue
    const saveResult = await saveProductionRevenue(436, updatedRevenue);
    console.log('Save success:', saveResult.success);
    console.log('Message:', saveResult.message);
    
    // 5. Verify summary updated automatically
    const updatedSummary = await getRevenueSummary(436);
    console.log('Updated Total Revenue:', updatedSummary.totalRevenue.toLocaleString());
    
    return saveResult;
  } catch (error) {
    console.error('Error updating production revenue:', error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 4: Save Other Revenue
// ============================================================================
export const example4_SaveOtherRevenue = async () => {
  console.log('=== Example 4: Save Other Revenue ===');
  
  try {
    // 1. Get current other revenue
    const currentOtherRevenue = await getOtherRevenue(436);
    console.log('Current other revenue items:', currentOtherRevenue.otherRevenueInfos.length);
    
    // 2. Add new other revenue
    const newOtherRevenueItem = {
      id: 3,
      groupId: null,
      revenueSource: "License Fee",
      currency: "VND",
      exchangeRate: 1,
      totalRevenue: 40000000,
      revenue: {
        "01-2026": 10000000,
        "04-2026": 10000000,
        "07-2026": 10000000,
        "10-2026": 10000000,
      }
    };
    
    // 3. Update other revenue
    const updatedOtherRevenue = {
      ...currentOtherRevenue,
      otherRevenueInfos: [...currentOtherRevenue.otherRevenueInfos, newOtherRevenueItem]
    };
    
    // 4. Save
    const saveResult = await saveOtherRevenue(436, updatedOtherRevenue);
    console.log('Save success:', saveResult.success);
    
    return saveResult;
  } catch (error) {
    console.error('Error saving other revenue:', error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 5: Update Selling Plan (Expenses)
// ============================================================================
export const example5_UpdateSellingPlan = async () => {
  console.log('=== Example 5: Update Selling Plan ===');
  
  try {
    // 1. Get current selling plan
    const currentSellingPlan = await getSellingPlan(436);
    console.log('Current expense items:', currentSellingPlan.sellingExpenseInfos.length);
    
    // 2. Update first expense item
    const updatedSellingPlan = {
      ...currentSellingPlan,
      sellingExpenseInfos: currentSellingPlan.sellingExpenseInfos.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            totalExpense: 25000000, // Increase expense
            expense: {
              ...item.expense,
              "05-2026": 5000000, // Add new month
            }
          };
        }
        return item;
      })
    };
    
    // 3. Save
    const saveResult = await saveSellingPlan(436, updatedSellingPlan);
    console.log('Save success:', saveResult.success);
    
    // 4. Check updated net revenue
    const summary = await getRevenueSummary(436);
    console.log('Updated Net Revenue:', summary.netRevenue.toLocaleString());
    console.log('Updated Profit Margin:', summary.profitMargin + '%');
    
    return saveResult;
  } catch (error) {
    console.error('Error updating selling plan:', error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 6: Save Business Plan
// ============================================================================
export const example6_SaveBusinessPlan = async () => {
  console.log('=== Example 6: Save Business Plan ===');
  
  try {
    // 1. Get current business plan
    const currentPlan = await getBusinessPlanDetail(436);
    
    // 2. Update general info
    const updatedPlan = {
      ...currentPlan,
      generalInfo: {
        ...currentPlan.generalInfo,
        businessPlanName: "Updated Business Plan Name",
        totalContractPrice: 15000000, // Increase contract price
      }
    };
    
    // 3. Save
    const saveResult = await saveBusinessPlan(436, updatedPlan);
    console.log('Save success:', saveResult.success);
    console.log('Message:', saveResult.message);
    
    return saveResult;
  } catch (error) {
    console.error('Error saving business plan:', error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 7: Export Business Plan
// ============================================================================
export const example7_ExportBusinessPlan = async () => {
  console.log('=== Example 7: Export Business Plan ===');
  
  try {
    // Export to Excel
    const excelResult = await exportBusinessPlan(436, 'excel');
    console.log('Excel Export:');
    console.log('  File Name:', excelResult.data.fileName);
    console.log('  File URL:', excelResult.data.fileUrl);
    console.log('  File Size:', (excelResult.data.fileSize / 1024).toFixed(2) + ' KB');
    
    // Export to PDF
    const pdfResult = await exportBusinessPlan(436, 'pdf');
    console.log('PDF Export:');
    console.log('  File Name:', pdfResult.data.fileName);
    console.log('  File URL:', pdfResult.data.fileUrl);
    
    return { excelResult, pdfResult };
  } catch (error) {
    console.error('Error exporting business plan:', error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 8: Get Master Data (Departments, Positions, etc.)
// ============================================================================
export const example8_GetMasterData = async () => {
  console.log('=== Example 8: Get Master Data ===');
  
  try {
    // Get all master data in parallel
    const [departments, positions, currencies, industries, approvalSteps] = await Promise.all([
      getDepartmentsByBPVersion(436),
      getAllPositions(),
      getAllCurrencies(),
      getAllIndustries(),
      getAllApprovalSteps(),
    ]);
    
    console.log('Departments:', departments.length);
    departments.forEach(dept => console.log(`  - ${dept.code}: ${dept.name}`));
    
    console.log('Positions:', positions.length);
    positions.slice(0, 3).forEach(pos => 
      console.log(`  - ${pos.name}: ${pos.unitPrice.toLocaleString()} VND/MM`)
    );
    
    console.log('Currencies:', currencies.length);
    currencies.forEach(curr => console.log(`  - ${curr.code} (${curr.symbol})`));
    
    console.log('Industries:', industries.length);
    industries.forEach(ind => console.log(`  - ${ind.name}`));
    
    console.log('Approval Steps:', approvalSteps.length);
    approvalSteps.forEach(step => console.log(`  - Step ${step.order}: ${step.stepName}`));
    
    return { departments, positions, currencies, industries, approvalSteps };
  } catch (error) {
    console.error('Error fetching master data:', error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 9: Get Delivery Plan and MM Bills
// ============================================================================
export const example9_GetDeliveryData = async () => {
  console.log('=== Example 9: Get Delivery Plan and MM Bills ===');
  
  try {
    const [deliveryPlan, mmBills] = await Promise.all([
      getDeliveryPlanSummary(436),
      getMMBills(436),
    ]);
    
    console.log('Delivery Plan Summary:');
    console.log('  Total Projects:', deliveryPlan.totalProjects);
    console.log('  Active:', deliveryPlan.activeProjects);
    console.log('  Completed:', deliveryPlan.completedProjects);
    
    console.log('Projects:');
    deliveryPlan.projects.forEach(proj => {
      console.log(`  - ${proj.projectCode}: ${proj.projectName} (${proj.progress}%)`);
    });
    
    console.log('\nMM Bills:');
    console.log('  Total MM Bill:', mmBills.totalMMBill);
    mmBills.departmentBreakdown.forEach(dept => {
      console.log(`  - ${dept.department}: ${dept.mmBill} MM`);
    });
    
    return { deliveryPlan, mmBills };
  } catch (error) {
    console.error('Error fetching delivery data:', error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 10: Get User Action History
// ============================================================================
export const example10_GetActionHistory = async () => {
  console.log('=== Example 10: Get User Action History ===');
  
  try {
    const history = await getUserActionHistory(436);
    
    console.log('Action History (' + history.length + ' items):');
    history.forEach(action => {
      const date = new Date(action.timestamp).toLocaleDateString();
      console.log(`  - ${date}: ${action.action} by ${action.user} (${action.ldap})`);
      console.log(`    Details: ${action.details}`);
    });
    
    return history;
  } catch (error) {
    console.error('Error fetching action history:', error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 11: Complete Workflow - Create and Update Business Plan
// ============================================================================
export const example11_CompleteWorkflow = async () => {
  console.log('=== Example 11: Complete Workflow ===');
  
  try {
    // Step 1: Fetch initial data
    console.log('\n1. Fetching initial business plan...');
    const initialPlan = await getBusinessPlanDetail(436);
    console.log('   Project:', initialPlan.projectCode);
    
    // Step 2: Get master data for dropdowns
    console.log('\n2. Loading master data...');
    const [positions, departments, currencies] = await Promise.all([
      getAllPositions(),
      getDepartmentsByBPVersion(436),
      getAllCurrencies(),
    ]);
    console.log('   Loaded:', positions.length, 'positions,', departments.length, 'departments');
    
    // Step 3: Update production revenue
    console.log('\n3. Updating production revenue...');
    const currentRevenue = await getProductionRevenue(436);
    const newRevenue = {
      ...currentRevenue,
      revenueInfos: [
        ...currentRevenue.revenueInfos,
        {
          saleWorkOrderId: "NEW_WO_001",
          pipelineKey: "WO-NEW-001",
          position: positions[0].name,
          unitPrice: positions[0].unitPrice,
          department: departments[0].code,
          exchangeRate: 1,
          pipeLineRatio: 100,
          totalManMonth: 10,
          totalRevenue: positions[0].unitPrice * 10,
          revenue: {
            "01-2026": { manMonth: 2, revenue: positions[0].unitPrice * 2 },
            "02-2026": { manMonth: 2, revenue: positions[0].unitPrice * 2 },
            "03-2026": { manMonth: 2, revenue: positions[0].unitPrice * 2 },
            "04-2026": { manMonth: 2, revenue: positions[0].unitPrice * 2 },
            "05-2026": { manMonth: 2, revenue: positions[0].unitPrice * 2 },
          }
        }
      ]
    };
    await saveProductionRevenue(436, newRevenue);
    console.log('   Production revenue updated');
    
    // Step 4: Add other revenue
    console.log('\n4. Adding other revenue...');
    const currentOtherRevenue = await getOtherRevenue(436);
    const newOtherRevenue = {
      ...currentOtherRevenue,
      otherRevenueInfos: [
        ...currentOtherRevenue.otherRevenueInfos,
        {
          id: Date.now(),
          revenueSource: "Support & Maintenance",
          currency: currencies[0].code,
          exchangeRate: 1,
          totalRevenue: 20000000,
          revenue: {
            "01-2026": 5000000,
            "04-2026": 5000000,
            "07-2026": 5000000,
            "10-2026": 5000000,
          }
        }
      ]
    };
    await saveOtherRevenue(436, newOtherRevenue);
    console.log('   Other revenue added');
    
    // Step 5: Get final summary
    console.log('\n5. Getting final revenue summary...');
    const finalSummary = await getRevenueSummary(436);
    console.log('   Total Revenue:', finalSummary.totalRevenue.toLocaleString(), 'VND');
    console.log('   Net Revenue:', finalSummary.netRevenue.toLocaleString(), 'VND');
    console.log('   Profit Margin:', finalSummary.profitMargin + '%');
    
    // Step 6: Export to Excel
    console.log('\n6. Exporting business plan...');
    const exportResult = await exportBusinessPlan(436, 'excel');
    console.log('   Exported to:', exportResult.data.fileName);
    
    console.log('\n✅ Complete workflow finished successfully!');
    
    return {
      initialPlan,
      finalSummary,
      exportResult,
    };
  } catch (error) {
    console.error('Error in complete workflow:', error);
    throw error;
  }
};

// ============================================================================
// Run All Examples
// ============================================================================
export const runAllExamples = async () => {
  console.log('\n'.repeat(2));
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║        Business Plan Mock API - Usage Examples                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  try {
    await example1_FetchBusinessPlanDetail();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    await example2_GetRevenueSummary();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    await example3_UpdateProductionRevenue();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    await example4_SaveOtherRevenue();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    await example5_UpdateSellingPlan();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    await example6_SaveBusinessPlan();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    await example7_ExportBusinessPlan();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    await example8_GetMasterData();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    await example9_GetDeliveryData();
    console.log('\n' + '─'.repeat(60) + '\n');
    await example10_GetActionHistory();
    console.log('\n' + '─'.repeat(60) + '\n');
    
    await example11_CompleteWorkflow();
    
    console.log('\n'.repeat(2));
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  All Examples Completed! ✅                     ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
  }
};

// To run in browser console:
// import { runAllExamples } from '@/lib/business-plan/BUSINESS_PLAN_DEMO';
// runAllExamples();
