# 🚀 Business Plan - Quick Start Guide

## ⚡ Sử dụng ngay (5 phút)

### Bước 1: Import component

```jsx
// src/App.js
import React from 'react';
import BusinessPlan from './pages/BusinessPlan';

function App() {
  return (
    <div className="App">
      <BusinessPlan />
    </div>
  );
}

export default App;
```

### Bước 2: Chạy ứng dụng

```bash
npm start
```

### Bước 3: Test các tính năng

---

## 🎯 Test Workflow cơ bản

### Test 1: Switch Work Type (Onsite ↔ Offshore)

```
1. Mở Business Plan page
2. Thấy button "Onsite" và "Offshore" ở header
3. Click "Onsite" → Load data Onsite
4. Click "Offshore" → Load data Offshore khác
5. ✅ Data thay đổi khi switch
```

### Test 2: Switch View Mode (Total ↔ OB)

```
1. Thấy button "Total" và "OB"
2. Click "Total" → View tổng hợp
3. Click "OB" → View cân đối số
4. ✅ UI thay đổi theo view mode
```

### Test 3: View Summary Section

```
1. Expand "Summary" section
2. Thấy các metrics:
   - MM bill: 11.5
   - Software production rev: 7,500,000,000
   - Deduction: 7,100,000,000
   - Other revenue items
3. ✅ Tất cả numbers được format đúng
```

### Test 4: Software Production Revenue

```
1. Scroll đến "Software Production Revenue Info"
2. Thấy table với columns:
   - Position, Unit Price, Department, Exchange Rate, Pipeline Ratio, Total
3. Thử edit một field (nếu có quyền)
4. Click "Add Position" → Thêm row mới
5. Click 🗑️ → Xóa row
6. ✅ CRUD operations hoạt động
```

### Test 5: Permission System

```
Test với ADMIN user (default):
✅ Thấy tất cả buttons
✅ Có thể edit tất cả fields
✅ Thấy financial data (numbers)

Test với DEVELOPER user:
❌ Buttons disabled
❌ Financial data hiển thị ***
❌ Cannot edit
```

---

## 🧮 Test Công thức tính toán

### Test Calculation 1: Software Production Revenue

```javascript
Input:
- Position: "SE02"
- Unit Price: 20,000,000
- Exchange Rate: 1
- Pipeline Ratio: 100%

Expected Total:
20,000,000 × 1 × (100/100) = 20,000,000

✅ Check: Total column hiển thị 20,000,000
```

### Test Calculation 2: Pipeline Ratio Effect

```javascript
Input:
- Unit Price: 20,000,000
- Exchange Rate: 1
- Pipeline Ratio: 50%

Expected Total:
20,000,000 × 1 × (50/100) = 10,000,000

✅ Check: Total giảm 50%
```

### Test Calculation 3: Exchange Rate

```javascript
Input:
- Unit Price: 1,000 USD
- Exchange Rate: 24,000
- Pipeline Ratio: 100%

Expected Total:
1,000 × 24,000 × 1 = 24,000,000 VND

✅ Check: Total tính đúng theo tỷ giá
```

---

## 🔐 Test Permission Scenarios

### Scenario 1: Admin User (Full Access)

```jsx
const adminUser = {
  role: 'ADMIN',
  permissions: [
    'VIEW_TOTAL', 'VIEW_OB', 'VIEW_ONSITE', 'VIEW_OFFSHORE',
    'VIEW_FINANCIAL_DATA', 'EDIT_BUSINESS_PLAN'
  ]
};

<BusinessPlan currentUser={adminUser} />

Expected:
✅ Thấy tất cả tabs
✅ Thấy tất cả work types
✅ Thấy tất cả numbers (không có ***)
✅ Có thể edit
✅ Có thể add/delete rows
```

### Scenario 2: PM User (Limited Access)

```jsx
const pmUser = {
  role: 'PM',
  department: 'DU1',
  permissions: [
    'VIEW_TOTAL', 'VIEW_ONSITE', 'VIEW_FINANCIAL_DATA',
    'EDIT_BUSINESS_PLAN'
  ]
};

<BusinessPlan currentUser={pmUser} />

Expected:
✅ Thấy Total view
✅ Thấy Onsite work type
❌ Không thấy OB view
❌ Không thấy Offshore work type
✅ Có thể edit
✅ Thấy financial data
```

### Scenario 3: Developer (View Only)

```jsx
const devUser = {
  role: 'DEVELOPER',
  department: 'DU3',
  permissions: ['VIEW_OWN_DEPARTMENT']
};

<BusinessPlan currentUser={devUser} />

Expected:
❌ Không thấy Total view
❌ Không thấy financial data (hiển thị ***)
❌ Không thể edit (buttons disabled)
✅ Chỉ thấy data của DU3
```

---

## 📊 Test Data Flow

### Flow 1: Load Onsite Data

```
User clicks "Onsite"
        ↓
fetchBusinessPlanData('onsite')
        ↓
Returns:
{
  summary: { mmBill: 11.5, softwareProductionRev: 7500000000, ... },
  softwareProduction: [
    { position: 'SE02', unitPrice: 20000000, department: 'DU3', ... }
  ],
  otherRevenue: [...],
  sellingExpenses: [...]
}
        ↓
Render all sections
```

### Flow 2: Save Changes

```
User edits position data
        ↓
User clicks "Save Changes"
        ↓
Check permission (canEdit?)
        ↓
If YES:
  - saveBusinessPlanData(workType, data)
  - Show success message
If NO:
  - Alert "Bạn không có quyền chỉnh sửa!"
```

---

## 🎨 UI Elements Test

### Header Controls
```
✅ Title: "Business Plan"
✅ Work Type buttons: [Onsite] [Offshore]
✅ View Mode buttons: [Total] [OB]
✅ Active button có background xanh
```

### Tabs
```
✅ 3 tabs: Business plan | Revenue Plan | Delivery Plan
✅ Active tab có border-bottom xanh
✅ Tab actions: [Total] [OB] [Onsite] [Offshore]
```

### Summary Section
```
✅ Grid layout with metrics
✅ Info icons (ⓘ) có tooltip
✅ Positive values màu xanh lá
✅ Negative values màu đỏ
✅ Total item có background xanh nhạt
```

### Tables
```
✅ Sticky header khi scroll
✅ Editable inputs
✅ Add button hiển thị nếu có quyền
✅ Delete button (🗑️) cho mỗi row
✅ Total row có background khác
✅ Hover effect trên rows
```

---

## 🔄 Step-by-Step Workflows

### Workflow 1: Thêm Position mới cho Onsite

```
Bước 1: Click "Onsite" work type
Bước 2: Scroll đến "Software Production Revenue Info"
Bước 3: Click "+ Add Position"
Bước 4: Điền thông tin:
        - Position: "SE03"
        - Unit Price: 25000000
        - Department: "DU1"
        - Exchange Rate: 1
        - Pipeline Ratio: 100
Bước 5: Check Total tự động tính = 25,000,000
Bước 6: Click "Save Changes"
Bước 7: ✅ Thấy "Lưu thành công!"
```

### Workflow 2: Thêm Other Revenue

```
Bước 1: Scroll đến "Other Revenue"
Bước 2: Click "+ Add Revenue"
Bước 3: Điền:
        - Revenue: "Consulting Fee"
        - Total revenue value: 50000000
Bước 4: Click "Show Monthly Details"
Bước 5: Điền monthly breakdown:
        - Jan-2026: 10000000
        - Feb-2026: 10000000
        - ... (tổng = 50000000)
Bước 6: Click "Save Changes"
Bước 7: ✅ Saved
```

### Workflow 3: Thêm Selling Expense

```
Bước 1: Scroll đến "Selling Expenses"
Bước 2: Click "+ Add Expense"
Bước 3: Điền:
        - Category: "Office Rent"
        - Total Expense Value: 30000000
Bước 4: Click "Show Monthly Details"
Bước 5: Điền monthly:
        - Mỗi tháng: 5000000 (6 months = 30M)
Bước 6: Click "Save Changes"
Bước 7: ✅ Saved
```

---

## 🎯 Verification Checklist

### ✅ Components Rendered
```
□ BusinessPlan main page
□ Summary section
□ Software Production Revenue section
□ Other Revenue section
□ Selling Expenses section
□ Header with controls
□ Tabs navigation
```

### ✅ Data Loading
```
□ Onsite data loads correctly
□ Offshore data loads correctly
□ Data switches when changing work type
□ Loading spinner appears during fetch
```

### ✅ Calculations
```
□ Total revenue calculated correctly
□ Pipeline ratio applies correctly
□ Exchange rate multiplies correctly
□ Monthly totals sum correctly
```

### ✅ Permissions
```
□ Admin sees everything
□ PM has limited access
□ Developer cannot edit
□ Financial data masked for no-permission users
□ Buttons disabled when no permission
```

### ✅ CRUD Operations
```
□ Can add new position
□ Can delete position
□ Can edit fields
□ Can save changes
□ Cannot delete if no permission
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Bạn không có quyền xem dữ liệu tài chính"
**Nguyên nhân:** User không có permission VIEW_FINANCIAL_DATA  
**Giải pháp:** 
```javascript
const user = {
  ...currentUser,
  permissions: [...currentUser.permissions, 'VIEW_FINANCIAL_DATA']
};
```

### Issue 2: Buttons disabled
**Nguyên nhân:** User không có EDIT permission  
**Giải pháp:**
```javascript
permissions: ['EDIT_BUSINESS_PLAN']
```

### Issue 3: Không thấy Offshore tab
**Nguyên nhân:** Không có VIEW_OFFSHORE permission  
**Giải pháp:**
```javascript
permissions: ['VIEW_OFFSHORE']
```

### Issue 4: Financial data shows ***
**Nguyên nhân:** canViewFinancial = false  
**Giải pháp:** Add VIEW_FINANCIAL_DATA permission

---

## 💡 Pro Tips

1. **Test với nhiều roles:** Thử ADMIN, MANAGER, PM, DEVELOPER
2. **Check calculations:** Verify mọi formula bằng calculator
3. **Test edge cases:** Empty data, very large numbers, 0 values
4. **Mobile testing:** Check responsive design
5. **Console logs:** Mở DevTools để xem data flow

---

## 🔗 Next Steps

Sau khi test cơ bản:
1. Đọc BUSINESS_PLAN_FORMULAS.md để hiểu chi tiết công thức
2. Đọc BUSINESS_PLAN_PERMISSIONS.md để config permissions
3. Tích hợp với backend API (thay mock data)
4. Custom styling theo brand
5. Thêm export functionality

---

## ✅ Quick Test Script

Copy và chạy test này:

```javascript
// Test 1: Load Onsite
console.log('Test 1: Loading Onsite data...');
// Click Onsite button → Check data loads

// Test 2: Load Offshore  
console.log('Test 2: Loading Offshore data...');
// Click Offshore button → Check data loads

// Test 3: Add Position
console.log('Test 3: Adding position...');
// Click Add Position → Fill data → Save

// Test 4: Permission Check
console.log('Test 4: Checking permissions...');
// Try with different user roles

console.log('✅ All tests completed!');
```

**Happy Testing! 🎉**
