# Mock API Configuration Guide

## 🎯 Overview

Mock API đã được cấu hình **HYBRID MODE** - tự động sử dụng Mock cho những endpoints đã implement, fallback về Real API cho các endpoints còn lại.

## 📁 Files Architecture

```
src/lib/business-plan/
├── mockBusinessPlanData.js          # Mock data definitions
├── mockBusinessPlanApi.js           # Mock API implementations (18 functions)
├── mockRequestAdapter.js            # Adapter để Mock API tương thích với Request()
└── businessPlanApiConfig.js         # ⭐ Main config - Hybrid API switcher
```

## 🔄 How It Works

### 1. Config Toggle

**File:** `businessPlanApiConfig.js`

```javascript
export const USE_MOCK_API = true;  // Set to false để dùng Real API
```

### 2. Hybrid API Selection (Using Proxy)

```javascript
const BUSINESS_PLAN_API = USE_MOCK_API 
  ? new Proxy(realBusinessPlanAPI, {
      get(target, prop) {
        // Nếu có Mock endpoint → Dùng Mock
        if (mockAPIEndpoints[prop]) {
          console.log(`🔷 Using Mock API for: ${prop}`);
          return mockAPIEndpoints[prop];
        }
        
        // Không thì → Fall back về Real API
        console.log(`🔶 Using Real API for: ${prop}`);
        return target[prop];
      }
    })
  : realBusinessPlanAPI;
```

### 3. Request Interceptor

**File:** `request.js` (line 30-36)

```javascript
const Request = (api, data, message, customHeaders, cancel) => {
  // Check if this is a mock API call
  if (api && api.__isMock && typeof api.__mockFunction === 'function') {
    console.log('🔷 Mock API Call:', api.url);
    return api.__mockFunction();
  }
  
  // Otherwise, proceed with normal axios request
  // ...
}
```

## ✅ Currently Mocked Endpoints

| Endpoint | Status | Description |
|----------|--------|-------------|
| `getBusinessPlanDetail` | ✅ Mock | Lấy chi tiết Business Plan |
| `getOtherRevenue` | ✅ Mock | Lấy other revenue |
| `updateOtherRevenue` | ✅ Mock | Lưu other revenue |
| `getSellingPlan` | ✅ Mock | Lấy selling expenses |
| `saveSellingPlan` | ✅ Mock | Lưu selling expenses |
| `getRevenueSummary` | ✅ Mock | Tính tổng revenue (auto-calculate) |
| `getMMBills` | ✅ Mock | Lấy MM bills |
| `getDeliveryPlanSummary` | ✅ Mock | Tính tổng delivery (auto-calculate) |
| `getProductionRevenue` | ✅ Mock | Lấy production revenue |
| `saveProductionRevenue` | ✅ Mock | Lưu production revenue |
| `getDepartmentsByBPVersion` | ✅ Mock | Lấy danh sách departments |
| `getAllPositions` | ✅ Mock | Lấy danh sách positions |
| `getAllCurrencies` | ✅ Mock | Lấy danh sách currencies |
| `getAllIndustries` | ✅ Mock | Lấy danh sách industries |
| `getAllApprovalSteps` | ✅ Mock | Lấy workflow steps |
| `getUserActionHistory` | ✅ Mock | Lấy activity history |

## 🔶 Real API Fallback Endpoints

Các endpoints này vẫn gọi Real API (chưa implement mock):

- `getBusinessPlanWorkflow` (approval workflow)
- `getBusinessPlanDetailComments` (comments)
- `postBusinessPlanDetailComment` (add comment)
- `getHistory` (version history)
- `getIndustryDomain` (industry settings)
- `getIndustryCurrency` (currency settings)
- `getUserAndDepartmentCollaborator` (collaborators)
- `getBusinessPlanSettingMaxKPI` (KPI settings)
- `getResourcesInformationDeliveryPlan` (delivery resources)
- `getListResourceType` (resource types)
- `getListResource` (resource list)
- `getLocation` (locations)
- `getEmployeeType` (employee types)
- `getEmployeePosition` (positions)
- `getEmployeeRole` (roles)
- `getOtherExpensesTable` (other expenses)
- ... và các endpoints khác

## 🧪 Testing Mock API

### 1. Check Console Logs

Khi mở DevTools Console, bạn sẽ thấy:

```
🔷 Using Mock API for: getBusinessPlanDetail
🔷 Mock API Call: MOCK_API:getBusinessPlanDetail
🔶 Using Real API for: getBusinessPlanWorkflow
```

### 2. Verify Mock Data

```javascript
// Mock Business Plan ID: 436
// URL: http://localhost:3001/business-plan/436

// Expected data:
{
  projectCode: "GLBTM2500093",
  status: "Approved",
  version: 1,
  generalInfo: {
    listAM: [...],
    totalContractPrice: 1000000,
    exchangeRate: 23000,
    // ...
  },
  businessPlanItem: [...]
}
```

### 3. Test Data Editing

1. Navigate to `/business-plan/436`
2. Edit any revenue/delivery value
3. Click "Save" button
4. Check Console → Should see `🔷 Mock API Call`
5. Data should persist in-memory (refresh to see original data)

## 📝 Adding New Mock Endpoints

### Step 1: Add Mock Function

**File:** `mockBusinessPlanApi.js`

```javascript
export const getNewEndpoint = async (params) => {
  await delay(300);
  
  return {
    data: [...],
    total: 0
  };
};
```

### Step 2: Add to Config

**File:** `businessPlanApiConfig.js`

```javascript
const mockAPIEndpoints = {
  // ... existing endpoints
  
  getNewEndpoint: (params) => createMockEndpoint(
    () => mockApi.getNewEndpoint(params), 
    'getNewEndpoint'
  )(),
};
```

### Step 3: Test

Gọi API từ component → Console log sẽ hiển thị `🔷 Using Mock API for: getNewEndpoint`

## 🎯 Benefits

1. **Development Independence**: Không cần backend running
2. **Consistent Data**: Mock data luôn đồng nhất để test
3. **Fast Iteration**: Không có network delay thật
4. **Auto-calculation**: Revenue/Delivery summary tự động tính
5. **Gradual Migration**: Thêm mock endpoints từng cái một
6. **Zero Config Switch**: Chỉ cần toggle `USE_MOCK_API`

## 🚀 Deployment

### Development (với Mock):
```javascript
// businessPlanApiConfig.js
export const USE_MOCK_API = true;
```

### Production (Real API):
```javascript
// businessPlanApiConfig.js
export const USE_MOCK_API = false;
```

## 🐛 Debugging

### Problem: Mock API không được gọi

**Check 1:** Verify import
```javascript
// ❌ Wrong
import BUSINESS_PLAN_API from '../../../service/api/businessPlan'

// ✅ Correct
import BUSINESS_PLAN_API from '../../businessPlanApiConfig'
```

**Check 2:** Check console log
```javascript
// Should see:
🔷 Using Mock API for: getBusinessPlanDetail
🔷 Mock API Call: MOCK_API:getBusinessPlanDetail
```

**Check 3:** Verify Request interceptor
```javascript
// File: request.js, line ~30
if (api && api.__isMock && typeof api.__mockFunction === 'function') {
  console.log('🔷 Mock API Call:', api.url);
  return api.__mockFunction();
}
```

### Problem: Data không persist sau Save

**Expected:** Mock API lưu data in-memory, sẽ mất khi refresh page

**Solution:** 
- Check Console xem `saveProductionRevenue` có được gọi không
- Verify response status 200
- Mock data chỉ persist trong cùng session (refresh = reset)

## 📚 Related Documentation

- [BUSINESS_PLAN_DATA_FLOW.md](BUSINESS_PLAN_DATA_FLOW.md) - Luồng xử lý data chi tiết
- [BUSINESS_PLAN_MOCK_SUMMARY.md](BUSINESS_PLAN_MOCK_SUMMARY.md) - Mock API overview
- [BUSINESS_PLAN_DEMO.js](BUSINESS_PLAN_DEMO.js) - Usage examples

---

**Last Updated:** March 6, 2026  
**Status:** ✅ Fully Functional (Hybrid Mode)
