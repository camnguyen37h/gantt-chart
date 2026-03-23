# Business Plan — Bảng API vs FE theo từng ô

## Ký hiệu

| Ký hiệu | Nghĩa |
|---------|-------|
| `API` | Giá trị lấy từ backend (user nhập → lưu BE, hoặc BE tính sẵn) |
| `FE` | FE tự tính theo công thức (không lưu BE, ghi đè API value) |
| `—` | Luôn null / ô không hiển thị |
| *(nhập)* | User input (editable cell), lưu lên BE → `API` |

> **Cách hoạt động:** FE gọi `getFormula(sectionKey, rowKey, columnKey)`.  
> - Nếu có công thức → giá trị `FE` (override dữ liệu API).  
> - Nếu trả về `undefined` → hiển thị giá trị `API` từ store.

---

## Cấu trúc cột theo view

| View | TOTAL | SALE | INTERNAL | DU |
|------|-------|------|----------|----|
| **Onsite** | 1 cột | 1 cột *(Onsite BU)* | 1 cột | N cột *(DU Onsite)* |
| **Offshore** | 1 cột | 1 cột *(Offshore BU)* | 1 cột | M cột *(DU Offshore)* |
| **Total** | 1 cột | 2 cột *(Onsite BU + Offshore BU)* | 1 cột | N+M cột |
| **OB** | 1 cột | 2 cột *(Onsite BU + Offshore BU)* | 1 cột | N+M cột |

> - Tất cả cột `DU` trong cùng view áp dụng chung một logic công thức (computed trên từng `columnKey`).  
> - Total/OB có 2 cột `SALE` — logic như nhau, ngoại trừ các row ⚠️ ở phần cuối.  
> - Cột `SALE` (key thực: `SALE_65`, `SALE_169`...) được normalize về `'sale'` trong formula config.

---

## View: Onsite / Offshore

> Onsite và Offshore có **cùng logic công thức**, chỉ khác số DU columns và locationType.

---

### Header rows *(hiển thị dải trên đầu bảng — MetricHeaderRow)*

| Items | rowKey | TOTAL | SALE | INTERNAL | DU |
|-------|--------|-------|------|----------|----|
| Unit price | `UNIT_PRICE` | `FE` ¹ | `API` | `—` | `API` |
| Billable rate | `BILLABLE_RATE` | `FE` | `FE` | `—` | `FE` |
| Direct margin before incentives and project bonus rate | `DIRECT_MARGIN_BONUS_RATE` | `FE` | `FE` | `FE` | `FE` |

> ¹ `UNIT_PRICE.TOTAL` = đọc lại giá trị cột `SALE` từ store (không tính mới).

---

### Section: Unit price & MM Bill

| Items | rowKey | TOTAL | SALE | INTERNAL | DU |
|-------|--------|-------|------|----------|----|
| Unit price | `UNIT_PRICE` | `FE` ¹ | `API` | `—` | `API` |
| MM effort (MM) | `MM_PRODUCTION` | `FE` ² | `FE` ³ | `—` | `API` |
| MM bill (MM) | `MM_BILL` | `FE` ⁴ | `FE` ⁴ | `—` | `FE` ⁵ |
| ↳ *Service rows* (MM_BILL_1, MM_BILL_2...) | `MM_BILL_N` | `FE` ⁶ | `—` | `—` | `API` *(nhập)* |

> ¹ `UNIT_PRICE.TOTAL` = `getItemValue('UNIT_PRICE', 'SALE')` — lấy lại giá trị ô SALE.  
> ² `MM_PRODUCTION.TOTAL` = `Σ DELIVERY_UNIT_* cells` của row MM_PRODUCTION.  
> ³ `MM_PRODUCTION.SALE` = `Σ MM_BILL.DU values` (= đồng nhất với MM_BILL.SALE).  
> ⁴ `MM_BILL.TOTAL` = `MM_BILL.SALE` = `Σ { MM_BILL.DU[i] }` = tổng các DU bill value.  
> ⁵ `MM_BILL.DU` = `Σ MM_BILL_N.DU` = tổng tất cả service row tại cùng cột DU.  
> ⁶ `MM_BILL_N.TOTAL` = `Σ DU cells` trong service row đó.

---

### Section: Revenues

| Items | rowKey | TOTAL | SALE | INTERNAL | DU |
|-------|--------|-------|------|----------|----|
| **Revenues** | `REVENUES_TOTAL` | `FE` ¹ | `FE` ¹ | `FE` ¹ | `FE` ¹ |
| Revenues from work delivered (VND) | `SOFTWARE_PRODUCTION_REVENUES` | `FE` ² | `FE` ² | `FE` ³ | `FE` ⁴ |
| Deduction | `DEDUCTION` | `FE` ⁵ | `FE` ⁵ | `—` | `—` |
| Onsite fee | `ONSITE_FEE` | `FE` ⁶ | `API` | `API` | `API` |
| Revenues from Equipment, Internet, Server... | `EQUIPMENT_FEE` | `FE` ⁶ | `API` | `API` | `API` |
| Other revenues | `OTHER_FEE` | `FE` ⁶ | `API` | `API` | `API` |
| ↳ *Service rows* (OTHER_FEE_1...) | dynamic | `FE` ⁷ | `API` *(nhập)* | `API` *(nhập)* | `API` *(nhập)* |

> ¹ `REVENUES_TOTAL.*` = `Σ tất cả row con` trong section REVENUES tại cùng cột (không tính chính nó).  
> ² `SOFTWARE_PRODUCTION_REVENUES.TOTAL/SALE` = `ER × SDF` (exchangeRate × softwareDevelopmentFee từ General Info).  
> ³ `SOFTWARE_PRODUCTION_REVENUES.INTERNAL` = `− (Σ DU cells)` = âm tổng các DU.  
> ⁴ `SOFTWARE_PRODUCTION_REVENUES.DU` = đọc lại giá trị DU đã lưu (= API value, nhưng đi qua formula).  
> ⁵ `DEDUCTION.TOTAL/SALE` = `(API[SPR] + API[Deduction]) − FE[SPR]` — điều chỉnh dựa trên ER×SDF tính được.  
> ⁶ `ONSITE_FEE/EQUIPMENT_FEE/OTHER_FEE.TOTAL` = `Σ non-TOTAL cells` trong cùng row.  
> ⁷ Service row TOTAL = `Σ non-TOTAL cells` trong service row đó.

---

### Section: Cost of sales

| Items | rowKey | TOTAL | SALE | INTERNAL | DU |
|-------|--------|-------|------|----------|----|
| **Cost of sales** | `COST_PRICE_TOTAL` | `—` ¹ | `FE` ² | `FE` ² | `FE` ² |
| Cost of sales (Ratecard DU) | `COST_OF_DU_SOLD` | `—` ¹ | `FE` ³ | `FE` ⁴ | `API` |

> ¹ `COST_PRICE_TOTAL.TOTAL` và `COST_OF_DU_SOLD.TOTAL` không có công thức FE → null / không hiển thị.  
> ² `COST_PRICE_TOTAL.SALE/INTERNAL/DU` = `Σ rows` = tổng các row con tại cùng cột.  
> ³ `COST_OF_DU_SOLD.SALE` = `SPR.INTERNAL` (negated DU sum của SOFTWARE_PRODUCTION_REVENUES).  
> ⁴ `COST_OF_DU_SOLD.INTERNAL` = `− (Σ DU cells)` = âm tổng DU value.

---

### Section: Selling expenses

| Items | rowKey | TOTAL | SALE | INTERNAL | DU |
|-------|--------|-------|------|----------|----|
| **Selling expenses** | `SELLING_EXPENSES_TOTAL` | `FE` ¹ | `FE` ¹ | `—` | `—` |
| Incentives | `INCENTIVES` | `FE` ² | `FE` ³ | `—` | `—` |
| Agency / Distribution expenses | `AGENCY_EXPENSE` | `FE` ⁴ | `API` | `—` | `—` |

> ¹ `SELLING_EXPENSES_TOTAL.TOTAL/SALE` = `Σ rows` = tổng tất cả row con (INCENTIVES + AGENCY_EXPENSE).  
> ² `INCENTIVES.TOTAL` = `INCENTIVES.SALE`.  
> ³ `INCENTIVES.SALE` = `SPR × INCENTIVES_RATE / 100` (INCENTIVES_RATE từ Reference section).  
> ⁴ `AGENCY_EXPENSE.TOTAL` = giá trị cột SALE.

---

### Section: Delivery expenses

| Items | rowKey | TOTAL | SALE | INTERNAL | DU |
|-------|--------|-------|------|----------|----|
| **Delivery expenses** | `DELIVERY_EXPENSES_TOTAL` | `FE` ¹ | `FE` ¹ | `FE` ¹ | `FE` ¹ |
| Direct labor cost | `DIRECT_LABOR_COST` | `FE` ² | `API` | `API` | `API` |
| Outsourcing cost | `OUTSOURCING_COST` | `FE` ² | `API` | `API` | `API` |
| Equipment, Internet, Server cost | `EQUIPMENT_INTERNET_SERVER_COST` | `FE` ² | `API` | `API` | `API` |
| Onsite expenses | `ONSITE_DEVELOPMENT_COST` | `FE` ² | `API` | `API` | `API` |
| Project bonus | `PROJECT_BONUS` | `FE` ³ | `—` | `—` | `FE` ⁴ |
| Overtime | `OVERTIME` | `FE` ² | `API` | `API` | `API` |
| Non-deductible input VAT | `NON_DEDUCTION_VAT` | `FE` ² | `API` | `API` | `API` |
| Seniority bonus | `SENIORITY_BONUS` | `FE` ² | `API` | `API` | `API` |
| Other expenses | `OTHER_EXPENSES` | `FE` ² | `API` | `API` | `API` |
| ↳ *Service rows* | dynamic | `FE` ⁵ | `API` *(nhập)* | `API` *(nhập)* | `API` *(nhập)* |

> ¹ `DELIVERY_EXPENSES_TOTAL.*` = `Σ rows` = tổng tất cả row con tại cùng cột.  
> ² `*.TOTAL` = `Σ non-TOTAL cells` trong cùng row (SALE + INTERNAL + tất cả DU).  
> ³ `PROJECT_BONUS.TOTAL` = `Σ PROJECT_BONUS.DU[i]`.  
> ⁴ `PROJECT_BONUS.DU` = `PRODUCTION_MM_BONUS_RATE[DU] × MM_BILL[DU]` (BONUS từ Reference input).  
> ⁵ Service row TOTAL = `Σ tất cả non-TOTAL cells` trong service row.

---

### Section: Tax expenses

| Items | rowKey | TOTAL | SALE | INTERNAL | DU |
|-------|--------|-------|------|----------|----|
| **Tax expenses** | `TAX_TOTAL` | `FE` ¹ | `FE` ¹ | `—` | `FE` ¹ |
| CIT and VAT (%) | `PIC_CIT` | `API` *(nhập)* | `—` | `—` | `—` |

> ¹ `TAX_TOTAL.*` = `REVENUES_TOTAL[cùng cột] × PIC_CIT / 100`.  
> Internal column không có thuế (không có công thức cho cột INTERNAL).

---

### Section: Margin

| Items | rowKey | TOTAL | SALE | INTERNAL | DU |
|-------|--------|-------|------|----------|----|
| Direct Margin | `DIRECT_MARGIN` | `FE` ¹ | `FE` ¹ | `FE` ¹ | `FE` ¹ |
| Direct Margin (incl. bonus) | `DIRECT_MARGIN_BONUS` | `FE` ² | `FE` ³ | `FE` ³ | `FE` ⁴ |
| Allocation of pool & unbillable | `ALLOCATION_OF_POOL_AND_UNBILLABLE` | `FE` ⁵ | `—` | `—` | `FE` ⁶ |
| Indirect margin | `INDIRECT_MARGIN` | `FE` ⁷ | `FE` ⁷ | `FE` ⁷ | `FE` ⁷ |
| Direct margin % | `DIRECT_MARGIN_RATE` | `FE` ⁸ | `FE` ⁸ | `FE` ⁸ | `FE` ⁸ |
| Direct margin (incl. bonus) % | `DIRECT_MARGIN_BONUS_RATE` | `FE` ⁸ | `FE` ⁸ | `FE` ⁸ | `FE` ⁸ |
| Indirect margin % | `INDIRECT_MARGIN_RATE` | `FE` ⁸ | `FE` ⁸ | `FE` ⁸ | `FE` ⁸ |

> ¹ `DIRECT_MARGIN` = `Revenues − CostOfSales − SellingExpenses − DeliveryExpenses − Tax` tại cùng cột.  
> ² `DIRECT_MARGIN_BONUS.TOTAL` = `Σ DIRECT_MARGIN_BONUS.DU[i]`.  
> ³ `DIRECT_MARGIN_BONUS.SALE/INTERNAL` = `DirectMargin[SALE/INTERNAL] + Incentives[SALE]`.  
> ⁴ `DIRECT_MARGIN_BONUS.DU` = `DirectMargin[DU] + ProjectBonus[DU]`.  
> ⁵ `ALLOCATION.TOTAL` = `Σ ALLOCATION.DU[i]`.  
> ⁶ `ALLOCATION.DU` = `DirectLaborCost[DU] × (100 / BILLABLE_RATE_NORM[DU] − 1)`.  
> ⁷ `INDIRECT_MARGIN` = `DirectMarginBonus − Allocation` tại cùng cột.  
> ⁸ `*_RATE` = `giá trị tương ứng / REVENUES_TOTAL[cùng cột] × 100`.

---

### Section: Reference *(các ô nhập nằm cuối bảng)*

| Items | rowKey | TOTAL | SALE | INTERNAL | DU |
|-------|--------|-------|------|----------|----|
| Average delivery expenses | `DELIVERY_AVERAGE_EXPENSES` | `FE` ¹ | `FE` ² | `—` | `FE` ³ |
| Average salary cost/MM | `SALARY_AVERAGE_EXPENSES` | `FE` ¹ | `FE` ² | `—` | `FE` ³ |
| Billable rate (%) | `BILLABLE_RATE` | `FE` ⁴ | `FE` ⁵ | `—` | `FE` ⁶ |
| Productivity | `PRODUCTIVITY` | `FE` ⁷ | `—` | `—` | `FE` ⁷ |
| Efficiency | `EFFICIENCY` | `FE` ⁸ | `—` | `—` | `FE` ⁸ |
| Incentives rate (%) | `INCENTIVES_RATE` | `—` | `API` *(nhập)* | `—` | `—` |
| Project bonus/MM | `PRODUCTION_MM_BONUS` | `—` | `—` | `—` | `API` *(nhập)* |
| Billable rate norm (%) | `BILLABLE_RATE_NORM` | `—` | `—` | `—` | `API` *(nhập)* |

> ¹ `*.TOTAL` = `DeliveryExpenses[TOTAL] / MM_PRODUCTION[TOTAL]` (hoặc DirectLaborCost tương ứng).  
> ² `*.SALE` = `CostOfDUSold[SALE] / MM_BILL[SALE]` (hoặc DirectLaborCost[SALE]).  
> ³ `*.DU` = `giá trị chi phí tương ứng[DU] / MM_PRODUCTION[DU]`.  
> ⁴ `BILLABLE_RATE.TOTAL` = `MM_BILL[SALE] / MM_PRODUCTION[TOTAL] × 100`.  
> ⁵ `BILLABLE_RATE.SALE` = `MM_BILL[SALE] / MM_BILL[SALE] × 100` = 100%.  
> ⁶ `BILLABLE_RATE.DU` = `MM_BILL[DU] / MM_PRODUCTION[DU] × 100`.  
> ⁷ `PRODUCTIVITY.*` = `SPR[cùng cột] / MM_PRODUCTION[cùng cột]`.  
> ⁸ `EFFICIENCY.*` = `DirectMargin[cùng cột] / MM_PRODUCTION[cùng cột]`.

---

## View: Total / OB

> **Cấu trúc FE/API giống Onsite/Offshore**, ngoại trừ 3 row bên dưới có sự khác biệt do 2 cột SALE và 2 locationType.

### Điểm khác biệt so với Onsite/Offshore

| Section | Row | Column | Onsite/Offshore | Total/OB | ⚠️ Vấn đề |
|---------|-----|--------|-----------------|----------|-----------|
| Revenues | Revenues from work delivered | SALE | `ER_locType × SDF_locType` | `Σ(ER_On×SDF_On + ER_Off×SDF_Off)` | Cả 2 cột SALE hiển thị cùng giá trị (tổng 2 locType) |
| Revenues | Deduction | SALE | đọc cột `SALE` từ API | đọc cột **`TOTAL`** từ API ⚠️ | Cả 2 cột SALE đọc cùng 1 ô TOTAL thay vì đọc SALE_XX riêng |
| Selling expenses | Incentives | SALE | `SPR_locType × INCENTIVES_RATE` | `(SPR_On+SPR_Off) × INCENTIVES_RATE` ⚠️ | Cả 2 cột SALE dùng tổng SPR, chưa tách theo BU riêng |

> **Root cause:** Một số công thức không nhận biết context `columnKey = SALE_XX` trong Total/OB view.  
> Cần build mapping `{ 'SALE_65': 'Onsite', 'SALE_169': 'Offshore' }` từ columnLabels để fix chính xác.

### Tóm tắt nhanh per-section (Total/OB)

| Section | Tất cả cột FE/API | Ghi chú |
|---------|-------------------|---------|
| Unit price & MM Bill | Giống Onsite/Offshore | — |
| Revenues | Giống Onsite/Offshore | SALE: xem bảng khác biệt ⚠️ |
| Cost of sales | Giống Onsite/Offshore | — |
| Selling expenses | Giống Onsite/Offshore | SALE Incentives: xem ⚠️ |
| Delivery expenses | Giống Onsite/Offshore | — |
| Tax expenses | Giống Onsite/Offshore | — |
| Margin | Giống Onsite/Offshore | — |
| Reference | Giống Onsite/Offshore | — |

---

## Tổng kết — Số ô FE vs API

| Loại ô | Ví dụ điển hình |
|--------|-----------------|
| **Luôn FE** | REVENUES_TOTAL, DELIVERY_EXPENSES_TOTAL, DIRECT_MARGIN, tất cả `*_RATE` |
| **Luôn API** | DU input rows (DIRECT_LABOR_COST.DU, OVERTIME.DU...), Reference inputs (INCENTIVES_RATE, BILLABLE_RATE_NORM, PRODUCTION_MM_BONUS) |
| **TOTAL = FE, các cột còn lại = API** | DIRECT_LABOR_COST, OUTSOURCING_COST, EQUIPMENT_INTERNET_SERVER_COST, OVERTIME, NON_DEDUCTION_VAT, OTHER_EXPENSES, ONSITE_FEE, EQUIPMENT_FEE, OTHER_FEE |
| **TOTAL = API (null)** | COST_PRICE_TOTAL.TOTAL, COST_OF_DU_SOLD.TOTAL |
| **DU = FE, SALE/INTERNAL = API** | MM_BILL.DU, PROJECT_BONUS.DU, ALLOCATION.DU, BILLABLE_RATE.DU |
| **Chỉ TOTAL = null** | COST_PRICE_TOTAL, COST_OF_DU_SOLD |
