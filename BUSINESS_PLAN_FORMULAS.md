# 🧮 Business Plan - Formulas & Calculations Guide

## 📐 Tất cả công thức tính toán

### 1. Software Production Revenue Calculation

#### Formula 1.1: Total Revenue per Position
```javascript
Total Revenue = Unit Price × Exchange Rate × (Pipeline Ratio / 100)
```

**Example:**
```
Input:
- Unit Price: 20,000,000 VND
- Exchange Rate: 1
- Pipeline Ratio: 100%

Calculation:
Total = 20,000,000 × 1 × (100/100)
      = 20,000,000 VND
```

**With Pipeline Ratio:**
```
Input:
- Unit Price: 20,000,000 VND
- Exchange Rate: 1
- Pipeline Ratio: 80%

Calculation:
Total = 20,000,000 × 1 × (80/100)
      = 16,000,000 VND
```

---

### 2. MM Bill Calculation

#### Formula 2.1: MM Bill
```javascript
MM Bill = Total Revenue / Unit Price
```

**Example:**
```
Input:
- Total Revenue: 60,000,000 VND
- Unit Price: 20,000,000 VND/MM

Calculation:
MM Bill = 60,000,000 / 20,000,000
        = 3 MM
```

#### Formula 2.2: Average Unit Price
```javascript
Average Unit Price = Total Revenue / Total MM
```

**Example:**
```
Input:
- Total Revenue: 100,000,000 VND
- Total MM: 5 MM

Calculation:
Avg Unit Price = 100,000,000 / 5
               = 20,000,000 VND/MM
```

---

### 3. Deduction Calculation

#### Formula 3.1: Deduction Amount
```javascript
Deduction = Software Production Revenue × (Deduction Rate / 100)
```

**Example:**
```
Input:
- Software Production Rev: 7,500,000,000 VND
- Deduction Rate: 94.67%

Calculation:
Deduction = 7,500,000,000 × (94.67/100)
          = 7,100,250,000 VND
```

---

### 4. Revenue from Work Delivered

#### Formula 4.1: Net Software Revenue
```javascript
Revenue from Work Delivered = Software Production Rev - Deduction
```

**Example:**
```
Input:
- Software Production Rev: 7,500,000,000 VND
- Deduction: 7,100,000,000 VND

Calculation:
Revenue = 7,500,000,000 - 7,100,000,000
        = 400,000,000 VND
```

---

### 5. Total Revenue Calculation

#### Formula 5.1: Grand Total Revenue
```javascript
Total Revenue = Software Production Rev + Other Revenue - Deduction
```

**Example:**
```
Input:
- Software Production Rev: 7,500,000,000 VND
- Other Revenue: 80,000,000 VND
- Deduction: 7,100,000,000 VND

Calculation:
Total = 7,500,000,000 + 80,000,000 - 7,100,000,000
      = 480,000,000 VND
```

#### Formula 5.2: Other Revenue Total
```javascript
Other Revenue = Onsite Fee + Revenue from Equipment + Other Revenues
```

---

### 6. Net Revenue (Profit)

#### Formula 6.1: Net Revenue
```javascript
Net Revenue = Total Revenue - Total Expenses
```

**Example:**
```
Input:
- Total Revenue: 480,000,000 VND
- Total Expenses (Agency): 35,000,000 VND

Calculation:
Net Revenue = 480,000,000 - 35,000,000
            = 445,000,000 VND
```

---

### 7. Department Revenue Breakdown

#### Formula 7.1: Department-specific Revenue
```javascript
Department Revenue = Total Revenue × (Department Ratio / 100)
```

**Example - Calculate for DU1:**
```
Input:
- Total Revenue: 100,000,000 VND
- DU1 Ratio: 30%

Calculation:
DU1 Revenue = 100,000,000 × (30/100)
            = 30,000,000 VND
```

**All Departments:**
```
Total = BJI + Internal + DU1 + DU3 + TDX

Example:
- BJI: 20% → 20,000,000
- Internal: 10% → 10,000,000
- DU1: 30% → 30,000,000
- DU3: 25% → 25,000,000
- TDX: 15% → 15,000,000
Total: 100% → 100,000,000 ✓
```

---

### 8. Monthly Revenue Distribution

#### Formula 8.1: Equal Distribution
```javascript
Monthly Revenue = Total Revenue / Number of Months
```

**Example:**
```
Input:
- Total Revenue: 120,000,000 VND
- Months: 6

Calculation:
Monthly = 120,000,000 / 6
        = 20,000,000 VND/month
```

#### Formula 8.2: Custom Distribution (Sum Check)
```javascript
Total Revenue = Σ(Monthly Revenue[i]) for i = 1 to n
```

**Example:**
```
Monthly breakdown:
- Jan: 15,000,000
- Feb: 20,000,000
- Mar: 25,000,000
- Apr: 20,000,000
- May: 20,000,000
- Jun: 20,000,000

Sum = 15 + 20 + 25 + 20 + 20 + 20
    = 120,000,000 ✓
```

---

### 9. Exchange Rate Conversion

#### Formula 9.1: Foreign Currency to VND
```javascript
VND Amount = Foreign Amount × Exchange Rate
```

**Example - USD to VND:**
```
Input:
- Amount: 1,000 USD
- Exchange Rate: 24,000 VND/USD

Calculation:
VND = 1,000 × 24,000
    = 24,000,000 VND
```

**Example - JPY to VND:**
```
Input:
- Amount: 100,000 JPY
- Exchange Rate: 160 VND/JPY

Calculation:
VND = 100,000 × 160
    = 16,000,000 VND
```

---

### 10. Percentage Calculations

#### Formula 10.1: Percentage of Total
```javascript
Percentage = (Part / Total) × 100
```

**Example:**
```
Input:
- Department Revenue: 30,000,000 VND
- Total Revenue: 100,000,000 VND

Calculation:
Percentage = (30,000,000 / 100,000,000) × 100
           = 30%
```

#### Formula 10.2: Year-over-Year Growth
```javascript
YoY Growth = ((Current - Previous) / Previous) × 100
```

**Example:**
```
Input:
- Current Year: 120,000,000 VND
- Previous Year: 100,000,000 VND

Calculation:
Growth = ((120,000,000 - 100,000,000) / 100,000,000) × 100
       = 20%
```

---

### 11. Average Calculations

#### Formula 11.1: Average Value
```javascript
Average = Σ(Values) / Count
```

**Example - Average Monthly Revenue:**
```
Monthly revenues: [20M, 25M, 30M, 22M, 28M, 25M]

Average = (20 + 25 + 30 + 22 + 28 + 25) / 6
        = 150 / 6
        = 25M VND/month
```

---

### 12. Internal vs External Split

#### Formula 12.1: Internal/External Calculation
```javascript
Internal Amount = Total × (Internal Ratio / 100)
External Amount = Total - Internal Amount
```

**Example:**
```
Input:
- Total: 100,000,000 VND
- Internal Ratio: 60%

Calculation:
Internal = 100,000,000 × (60/100) = 60,000,000 VND
External = 100,000,000 - 60,000,000 = 40,000,000 VND
```

---

## 🎯 Real-World Examples

### Example 1: Complete Onsite Project Calculation

```javascript
// Step 1: Calculate Software Production Revenue
Positions:
- SE02 (DU3): 20M × 1 × 100% = 20M
- SE02 (DU1): 20M × 1 × 100% = 20M  
- BJI: 20M × 1 × 100% = 20M

Total Software Production = 20M + 20M + 20M = 60M

// Step 2: Calculate Deduction (assume 94.67%)
Deduction = 60M × 94.67% = 56.8M

// Step 3: Calculate Revenue from Work
Revenue = 60M - 56.8M = 3.2M

// Step 4: Add Other Revenue
Other Revenue = 0 (for this example)

// Step 5: Calculate Total Revenue
Total = 60M + 0 - 56.8M = 3.2M

// Step 6: Subtract Expenses
Expenses = 0
Net Revenue = 3.2M - 0 = 3.2M
```

### Example 2: Complete Offshore Project Calculation

```javascript
// Step 1: Software Production
Positions:
- SE02: 26M × 1 × 100% = 26M
- PM: 35M × 1 × 100% = 35M
- QA: 22M × 1 × 100% = 22M

Total Software Production = 26M + 35M + 22M = 83M

// Step 2: Deduction (assume 10%)
Deduction = 83M × 10% = 8.3M

// Step 3: Revenue from Work
Revenue = 83M - 8.3M = 74.7M

// Step 4: Other Revenue
Training: 50M
License: 30M
Other Revenue Total = 80M

// Step 5: Total Revenue
Total = 83M + 80M - 8.3M = 154.7M

// Step 6: Expenses
Marketing: 20M
Travel: 15M
Total Expenses = 35M

// Step 7: Net Revenue
Net = 154.7M - 35M = 119.7M
```

---

## 🔢 Validation Rules

### 1. Numeric Validations
```javascript
- Unit Price > 0
- Exchange Rate > 0
- Pipeline Ratio: 0 ≤ x ≤ 100
- Deduction Rate: 0 ≤ x ≤ 100
```

### 2. Sum Validations
```javascript
// Monthly sum must equal total
Σ(Monthly[i]) = Total Revenue

// Department percentages must equal 100%
Σ(Department Ratio[i]) = 100%
```

### 3. Logical Validations
```javascript
// Revenue must be >= Expenses for positive profit
Total Revenue >= Total Expenses

// Deduction cannot exceed Software Production Revenue
Deduction ≤ Software Production Revenue
```

---

## 📊 Formula Cheat Sheet

| Metric | Formula | Example Input | Result |
|--------|---------|---------------|--------|
| **Revenue per Position** | UP × ER × (PR/100) | 20M × 1 × 100% | 20M |
| **MM Bill** | Revenue / UP | 60M / 20M | 3 MM |
| **Deduction** | Rev × (DR/100) | 100M × 10% | 10M |
| **Net Software Rev** | Rev - Deduction | 100M - 10M | 90M |
| **Total Revenue** | SP + OR - Deduction | 100M + 20M - 10M | 110M |
| **Net Profit** | Revenue - Expenses | 110M - 20M | 90M |
| **Department %** | Dept / Total × 100 | 30M / 100M × 100 | 30% |
| **Monthly Avg** | Total / Months | 120M / 6 | 20M |

**Legend:**
- UP = Unit Price
- ER = Exchange Rate
- PR = Pipeline Ratio
- DR = Deduction Rate
- SP = Software Production
- OR = Other Revenue

---

## 🧪 Testing Calculations

### Test Case 1: Basic Revenue
```
Input: UP=20M, ER=1, PR=100%
Expected: 20M
Actual: calculate(20M, 1, 100) → ?
✓ Pass if Actual === Expected
```

### Test Case 2: Pipeline Effect
```
Input: UP=20M, ER=1, PR=50%
Expected: 10M
Actual: calculate(20M, 1, 50) → ?
✓ Pass if Actual === Expected
```

### Test Case 3: Exchange Rate
```
Input: UP=1000, ER=24000, PR=100%
Expected: 24M
Actual: calculate(1000, 24000, 100) → ?
✓ Pass if Actual === Expected
```

---

**All formulas implemented in:** `src/utils/businessPlanCalculations.js`
