# Business Plan Mock API System

Comprehensive mock API implementation for Business Plan module to enable offline development and testing without backend dependencies.

## 📁 File Structure

```
src/lib/business-plan/
├── mockBusinessPlanData.js       # Mock data definitions
├── mockBusinessPlanApi.js        # Mock API implementations
├── businessPlanApiConfig.js      # API switcher configuration
└── BUSINESS_PLAN_MOCK_API.md     # This documentation
```

## 🚀 Quick Start

### 1. Import API Functions

```javascript
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
  exportBusinessPlan,
} from '@/lib/business-plan/businessPlanApiConfig';
```

### 2. Use in Components

```javascript
const BusinessPlanComponent = () => {
  const [businessPlan, setBusinessPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getBusinessPlanDetail(436);
        setBusinessPlan(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return <div>{/* Your component JSX */}</div>;
};
```

### 3. Use in Redux AsyncThunk

```javascript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getBusinessPlanDetail } from '@/lib/business-plan/businessPlanApiConfig';

export const fetchBusinessPlanThunk = createAsyncThunk(
  'businessPlan/fetch',
  async (businessPlanId, { rejectWithValue }) => {
    try {
      const data = await getBusinessPlanDetail(businessPlanId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## 📋 Available API Functions

### Business Plan Management

#### `getBusinessPlanDetail(businessPlanId)`
Get complete business plan details including general info, versions, and members.

**Parameters:**
- `businessPlanId` (number): Business Plan ID

**Returns:** Promise<Object>

**Example:**
```javascript
const plan = await getBusinessPlanDetail(436);
console.log(plan.projectCode); // "GLBTM2500093"
console.log(plan.generalInfo.businessPlanName); // "Myfirstmillion Onsite"
```

#### `saveBusinessPlan(businessPlanId, businessPlanData)`
Save or update business plan.

**Parameters:**
- `businessPlanId` (number|null): Business Plan ID (null for new plan)
- `businessPlanData` (Object): Business plan data to save

**Returns:** Promise<Object>

**Example:**
```javascript
const result = await saveBusinessPlan(436, {
  generalInfo: {
    businessPlanName: "Updated Plan Name",
    customerName: "Updated Customer"
  }
});
console.log(result.success); // true
```

#### `exportBusinessPlan(businessPlanId, format)`
Export business plan to file.

**Parameters:**
- `businessPlanId` (number): Business Plan ID
- `format` (string): Export format ('pdf' or 'excel')

**Returns:** Promise<Object>

**Example:**
```javascript
const result = await exportBusinessPlan(436, 'excel');
console.log(result.data.fileName); // "BusinessPlan_GLBTM2500093_1234567890.excel"
```

### Revenue Management

#### `getProductionRevenue(businessPlanId)`
Get production revenue data with monthly breakdown.

**Returns:** Promise<Object>

**Example:**
```javascript
const revenue = await getProductionRevenue(436);
console.log(revenue.revenueInfos[0].position); // "Senior Engineer"
console.log(revenue.revenueInfos[0].totalRevenue); // 60000000
```

#### `saveProductionRevenue(businessPlanId, revenueData)`
Save production revenue and auto-recalculate summary.

**Parameters:**
- `businessPlanId` (number): Business Plan ID
- `revenueData` (Object): Production revenue data

**Returns:** Promise<Object>

#### `getOtherRevenue(businessPlanId)`
Get other revenue (training, consulting, etc.).

**Returns:** Promise<Object>

#### `saveOtherRevenue(businessPlanId, revenueData)`
Save other revenue and auto-recalculate summary.

**Parameters:**
- `businessPlanId` (number): Business Plan ID
- `revenueData` (Object): Other revenue data

**Returns:** Promise<Object>

#### `getRevenueSummary(businessPlanId)`
Get calculated revenue summary with profit margin.

**Returns:** Promise<Object>

**Example:**
```javascript
const summary = await getRevenueSummary(436);
console.log(summary.totalRevenue); // 188000000
console.log(summary.profitMargin); // 81.38
```

### Selling Plan Management

#### `getSellingPlan(businessPlanId)`
Get selling expenses plan.

**Returns:** Promise<Object>

#### `saveSellingPlan(businessPlanId, sellingPlanData)`
Save selling plan and auto-recalculate summary.

**Parameters:**
- `businessPlanId` (number): Business Plan ID
- `sellingPlanData` (Object): Selling plan data

**Returns:** Promise<Object>

### Other Data

#### `getMMBills(businessPlanId)`
Get MM bills breakdown by department.

**Returns:** Promise<Object>

#### `getDeliveryPlanSummary(businessPlanId)`
Get delivery plan summary with project list.

**Returns:** Promise<Object>

#### `getDepartmentsByBPVersion(businessPlanVersionId)`
Get departments filtered by business plan version.

**Returns:** Promise<Array>

#### `getAllPositions()`
Get all available positions with unit prices.

**Returns:** Promise<Array>

#### `getAllCurrencies()`
Get all supported currencies.

**Returns:** Promise<Array>

#### `getAllIndustries()`
Get all industry categories.

**Returns:** Promise<Array>

#### `getAllApprovalSteps()`
Get workflow approval steps.

**Returns:** Promise<Array>

#### `uploadDocument(businessPlanId, file)`
Upload document to business plan.

**Parameters:**
- `businessPlanId` (number): Business Plan ID
- `file` (File): File object to upload

**Returns:** Promise<Object>

#### `getUserActionHistory(businessPlanId)`
Get user action history for business plan.

**Returns:** Promise<Array>

## ⚙️ Configuration

### Switch Between Mock and Real API

Edit `businessPlanApiConfig.js`:

```javascript
// Use mock API
const USE_MOCK_API = true;

// Use real API
const USE_MOCK_API = false;
```

### Network Delay Simulation

Edit `mockBusinessPlanApi.js`:

```javascript
// Default delay
const NETWORK_DELAY_MS = 500;

// Customize per function
await delay(1000); // 1 second delay
```

## 🔧 Customization

### Add New Mock Data

Edit `mockBusinessPlanData.js`:

```javascript
export const mockNewData = {
  // Your mock data structure
};
```

### Add New API Function

1. **Add to mockBusinessPlanApi.js:**

```javascript
export const newApiFunction = async (params) => {
  await delay();
  
  // Your implementation
  
  return result;
};
```

2. **Export from businessPlanApiConfig.js:**

```javascript
export const newApiFunction = api.newApiFunction;
```

3. **Use in your components:**

```javascript
import { newApiFunction } from '@/lib/business-plan/businessPlanApiConfig';

const result = await newApiFunction(params);
```

## 📊 Mock Data Structure

### Business Plan Detail
- `id`: Business Plan ID
- `projectCode`: Project code
- `status`: Approval status
- `version`: Current version
- `generalInfo`: General information (AM, PM, Preparator, dates, etc.)
- `versions`: List of all versions

### Production Revenue
- `revenueInfos[]`: Array of revenue items
  - `saleWorkOrderId`: Work order ID
  - `pipelineKey`: Pipeline key
  - `position`: Job position
  - `unitPrice`: Price per MM
  - `department`: Department code
  - `totalManMonth`: Total man-months
  - `totalRevenue`: Total revenue
  - `revenue{}`: Monthly breakdown (MM-YYYY format)

### Revenue Summary
- `totalProductionRevenue`: Sum of production revenue
- `totalOtherRevenue`: Sum of other revenue
- `totalRevenue`: Total revenue
- `totalSellingExpense`: Total expenses
- `netRevenue`: Net revenue after expenses
- `profitMargin`: Profit margin percentage

## 🎯 Features

✅ **Complete CRUD Operations:** Create, Read, Update, Delete for all business plan entities

✅ **Automatic Calculations:** Revenue summary auto-updates when saving production/other revenue or selling plan

✅ **Network Delay Simulation:** Realistic delays (300-1500ms) for different operations

✅ **In-Memory Storage:** Data persists within session for testing flows

✅ **Deep Cloning:** JSON parse/stringify prevents reference mutations

✅ **Error Handling:** Proper error messages for not found cases

✅ **Flexible Configuration:** Easy switching between mock and real API

## 🚦 Best Practices

1. **Always use businessPlanApiConfig.js** - Don't import from mockBusinessPlanApi.js directly
2. **Handle errors properly** - Use try-catch blocks
3. **Show loading states** - API calls have simulated delays
4. **Deep clone when mutating** - Don't mutate returned data directly
5. **Test offline** - Use mock API for development without backend

## 🔄 Migration to Real API

When backend is ready:

1. Create `realBusinessPlanApi.js` with same function signatures
2. Implement real API calls using axios/fetch
3. Update `businessPlanApiConfig.js`:
   ```javascript
   import * as realApi from './realBusinessPlanApi';
   const USE_MOCK_API = false;
   const api = USE_MOCK_API ? mockApi : realApi;
   ```
4. No changes needed in components!

## 📝 Example: Complete Flow

```javascript
import {
  getBusinessPlanDetail,
  getProductionRevenue,
  saveProductionRevenue,
  getRevenueSummary
} from '@/lib/business-plan/businessPlanApiConfig';

const BusinessPlanDemo = () => {
  const [loading, setLoading] = useState(false);

  const handleUpdateRevenue = async () => {
    setLoading(true);
    try {
      // 1. Get current business plan
      const plan = await getBusinessPlanDetail(436);
      console.log('Plan:', plan.projectCode);

      // 2. Get production revenue
      const revenue = await getProductionRevenue(436);
      console.log('Current Revenue:', revenue.revenueInfos.length, 'items');

      // 3. Update revenue
      const updatedRevenue = {
        ...revenue,
        revenueInfos: [
          ...revenue.revenueInfos,
          {
            saleWorkOrderId: "NEW001",
            position: "Junior Engineer",
            unitPrice: 3000000,
            totalManMonth: 6,
            totalRevenue: 18000000,
            // ... other fields
          }
        ]
      };

      // 4. Save updated revenue
      const saveResult = await saveProductionRevenue(436, updatedRevenue);
      console.log('Save Result:', saveResult.success);

      // 5. Get updated summary (auto-calculated)
      const summary = await getRevenueSummary(436);
      console.log('New Total Revenue:', summary.totalRevenue);
      console.log('Profit Margin:', summary.profitMargin + '%');

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleUpdateRevenue} disabled={loading}>
      {loading ? 'Processing...' : 'Update Revenue'}
    </button>
  );
};
```

## 🐛 Troubleshooting

**API returns undefined:**
- Check USE_MOCK_API is set to true
- Verify function is exported from businessPlanApiConfig.js

**Data doesn't persist:**
- Mock uses in-memory storage, data resets on page refresh
- This is expected behavior for mock API

**Delays too long/short:**
- Adjust NETWORK_DELAY_MS in mockBusinessPlanApi.js
- Customize delay per function if needed

---

**Created:** 2024
**Purpose:** Offline development and testing for Business Plan module
**Pattern:** Follows PerformanceBonusSetting mock API architecture
