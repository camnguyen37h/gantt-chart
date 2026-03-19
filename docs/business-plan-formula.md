# Business Plan — Công thức tính theo cột và view

## Ký hiệu

| Ký hiệu | Nghĩa |
|---------|-------|
| *(API)* | Lấy trực tiếp từ response API, FE không tính |
| *(nhập)* | Ô nhập liệu của user |
| `Σ DU` | Tổng các cột `DELIVERY_UNIT_*` |
| `Σ non-TOTAL` | Tổng tất cả cột trừ cột TOTAL |
| `Σ rows` | Tổng các row con trong section (= `getTotalColumnAndSet`) |
| `ER` | `exchangeRate` (từ General Information) |
| `SDF` | `softwareDevelopmentFee` (từ General Information) |
| `SPR` | Revenues from work delivered = `ER × SDF` |
| `SPR_On` | SPR của sub-plan Onsite |
| `SPR_Off` | SPR của sub-plan Offshore |

---

## Onsite view — Columns: Total · BU1 (SALE) · Internal · DU1.8 · DJ1

### Section: Unit price & MM Bill

| Row | Total | BU1 (SALE) | Internal | DU1.8 | DJ1 |
|-----|-------|------------|----------|-------|-----|
| Unit price | Lấy giá trị ô `SALE` | *(API)* | — | *(API)* | *(API)* |
| MM effort (MM) | `Σ DU` | *(API)* | — | *(API)* | *(API)* |
| MM bill (MM) | `Σ DU bill` (tổng MM_BILL_* cùng DU) | `Σ DU bill` | — | `Σ MM_BILL_*[DU1.8]` | `Σ MM_BILL_*[DJ1]` |
| *Service rows (MM_BILL_1...)* | `Σ DU` | — | — | *(API)* | *(API)* |

### Section: Revenues

| Row | Total | BU1 (SALE) | Internal | DU1.8 | DJ1 |
|-----|-------|------------|----------|-------|-----|
| **Revenues** *(REVENUES_TOTAL)* | `Σ rows[Total]` | `Σ rows[BU1]` | `Σ rows[Internal]` | `Σ rows[DU1.8]` | `Σ rows[DJ1]` |
| Revenues from work delivered (VND) | `SPR_On` (ER_On × SDF_On) | `SPR_On` | `-(Σ DU values)` | *(API)* | *(API)* |
| Deduction | `(SPR_API[SALE] + Ded_API[SALE]) − SPR_On` | `(SPR_API[SALE] + Ded_API[SALE]) − SPR_On` | — | — | — |
| Onsite fee | `Σ non-TOTAL` | *(API)* | *(API)* | *(API)* | *(API)* |
| Revenues from Equipment, Internet, Server,... | `Σ non-TOTAL` | *(API)* | *(API)* | *(API)* | *(API)* |
| Other revenues | `Σ non-TOTAL` | *(API)* | *(API)* | *(API)* | *(API)* |

### Section: Cost of sales

| Row | Total | BU1 (SALE) | Internal | DU1.8 | DJ1 |
|-----|-------|------------|----------|-------|-----|
| **Cost of sales** *(COST_PRICE_TOTAL)* | — | `Σ rows[BU1]` | `Σ rows[Internal]` | `Σ rows[DU1.8]` | `Σ rows[DJ1]` |
| Cost of sales (Ratecard DU) | — | `-(Σ DU values)` = SPR Internal | `-(Σ DU values)` | — | — |

### Section: Selling expenses

| Row | Total | BU1 (SALE) | Internal | DU1.8 | DJ1 |
|-----|-------|------------|----------|-------|-----|
| **Selling expenses** *(SELLING_EXPENSES_TOTAL)* | `Σ rows[Total]` | `Σ rows[BU1]` | — | — | — |
| Incentives | `= Incentives[SALE]` | `SPR_On × INCENTIVES_RATE / 100` | — | — | — |
| Agency expenses | `= ô SALE` | *(API)* | — | — | — |

### Section: Delivery expenses

| Row | Total | BU1 (SALE) | Internal | DU1.8 | DJ1 |
|-----|-------|------------|----------|-------|-----|
| **Delivery expenses** *(DELIVERY_EXPENSES_TOTAL)* | `Σ rows[Total]` | `Σ rows[BU1]` | `Σ rows[Internal]` | `Σ rows[DU1.8]` | `Σ rows[DJ1]` |
| Direct labor cost | `Σ non-TOTAL` | *(nhập)* | *(nhập)* | *(API)* | *(API)* |
| Outsourcing cost | `Σ non-TOTAL` | *(nhập)* | *(nhập)* | *(API)* | *(API)* |
| Equipment, Internet, Server cost | `Σ non-TOTAL` | *(nhập)* | *(nhập)* | *(API)* | *(API)* |
| Onsite expenses | `Σ non-TOTAL` | *(nhập)* | *(nhập)* | *(API)* | *(API)* |
| Project bonus | `Σ DU bonus` | — | — | `PRODUCTION_MM_BONUS[DU] × MM_BILL[DU]` | `PRODUCTION_MM_BONUS[DU] × MM_BILL[DU]` |
| Overtime | `Σ non-TOTAL` | *(nhập)* | *(nhập)* | *(API)* | *(API)* |
| Non-deductible input VAT | `Σ non-TOTAL` | *(nhập)* | *(nhập)* | *(API)* | *(API)* |
| Other expenses | `Σ non-TOTAL` | *(nhập)* | *(nhập)* | *(API)* | *(API)* |

### Section: Tax expenses

| Row | Total | BU1 (SALE) | Internal | DU1.8 | DJ1 |
|-----|-------|------------|----------|-------|-----|
| **Tax expenses** *(TAX_TOTAL)* | `REVENUES_TOTAL[Total] × PIC_CIT / 100` | `REVENUES_TOTAL[BU1] × PIC_CIT / 100` | — | `REVENUES_TOTAL[DU1.8] × PIC_CIT / 100` | `REVENUES_TOTAL[DJ1] × PIC_CIT / 100` |
| CIT and VAT (%) | *(nhập)* | — | — | — | — |

### Section: Margin

| Row | Total | BU1 (SALE) | Internal | DU1.8 | DJ1 |
|-----|-------|------------|----------|-------|-----|
| Direct Margin | `Rev − CostPrice − Selling − Delivery − Tax` | `Rev − CostPrice − Selling − Delivery − Tax` | `idem` | `idem` | `idem` |
| Direct Margin before Incentives and Project bonus | `DirectMargin + Incentives + ProjectBonus` | `DirectMargin[BU1] + Incentives` | `DirectMargin[Internal]` | `DirectMargin[DU] + ProjectBonus[DU]` | `idem` |
| Allocation of pool and unbillable | `Σ DU` | — | — | `DirectLaborCost × 100 / BILL_RATE_NORM − DirectLaborCost` | `idem` |
| Indirect margin | `DirectMargin − AllocationOfPool` | `= DirectMargin[BU1]` | `= DirectMargin[Internal]` | `DirectMargin[DU] − Allocation[DU]` | `idem` |
| Direct margin % | `DirectMargin / Revenues × 100` | `idem` | `idem` | `idem` | `idem` |
| Direct Margin before Incentives and Project bonus % | `DirectMarginBonus / Revenues × 100` | `idem` | `idem` | `idem` | `idem` |
| Indirect margin % | `IndirectMargin / Revenues × 100` | `= DirectMargin[BU1] / Rev × 100` | `idem` | `IndirectMargin[DU] / Rev × 100` | `idem` |

### Section: Reference

| Row | Total | BU1 (SALE) | Internal | DU1.8 | DJ1 |
|-----|-------|------------|----------|-------|-----|
| Average delivery expenses | `DeliveryTotal / MM_effort_Total` | `CostOfDUSold / MM_bill_Sale` | — | `DeliveryTotal[DU] / MM_effort[DU]` | `idem` |
| Average direct labor cost/MM | `DirectLaborTotal / MM_effort_Total` | `DirectLabor[BU1] / MM_bill_Sale` | — | `DirectLabor[DU] / MM_effort[DU]` | `idem` |
| Billable rate (%) | `MM_bill_Sale / MM_effort_Total × 100` | `MM_bill_Sale / MM_bill_Sale × 100` | — | `MM_bill[DU] / MM_effort[DU] × 100` | `idem` |
| Productivity | `SPR_On / MM_effort_Total` | — | — | `SPR[DU] / MM_effort[DU]` | `idem` |
| Efficiency | `DirectMargin[Total] / MM_effort_Total` | — | — | `DirectMargin[DU] / MM_effort[DU]` | `idem` |
| Incentives rate (%) | — | *(nhập)* | — | — | — |
| Project bonus/MM | — | — | — | *(nhập)* | *(nhập)* |
| Billable rate norm (%) | — | — | — | *(nhập)* | *(nhập)* |

---

## Offshore view — Columns: Total · BU3 (SALE) · Internal · DU1.8

> Cấu trúc công thức **hoàn toàn giống Onsite**, chỉ khác:
> - `SPR = ER_Off × SDF_Off` (exchangeRate và softwareDevelopmentFee của sub-plan Offshore)
> - Cột SALE là **BU3** thay vì BU1
> - Không có cột DJ1

---

## Total view — Columns: Total · BU1 (SALE_45) · BU3 (SALE_40) · Internal · DU1.8 · DJ1 · DU1.8

### Section: Unit price & MM Bill

| Row | Total | BU1 (SALE_45) | BU3 (SALE_40) | Internal | DU* |
|-----|-------|---------------|---------------|----------|-----|
| Unit price | Lấy giá trị ô `SALE` | *(API)* | *(API)* | — | *(API)* |
| MM effort (MM) | `Σ DU` | *(API)* | *(API)* | — | *(API)* |
| MM bill (MM) | `Σ DU bill` | `Σ DU bill` | `Σ DU bill` | — | `Σ MM_BILL_*[DU]` |
| *Service rows* | `Σ DU` | — | — | — | *(API)* |

### Section: Revenues

| Row | Total | BU1 (SALE_45) | BU3 (SALE_40) | Internal | DU* |
|-----|-------|---------------|---------------|----------|-----|
| **Revenues** *(REVENUES_TOTAL)* | `Σ rows[Total]` | `Σ rows[BU1]` | `Σ rows[BU3]` | `Σ rows[Internal]` | `Σ rows[DU]` |
| Revenues from work delivered (VND) | `SPR_On + SPR_Off` | ⚠️ `SPR_On` *(cần fix: lookup locationType)* | ⚠️ `SPR_Off` *(cần fix)* | `-(Σ DU values)` | *(API)* |
| Deduction | `(SPR_API[TOTAL] + Ded_API[TOTAL]) − (SPR_On + SPR_Off)` | ⚠️ đọc cột `TOTAL` thay vì `SALE_45` *(cần fix)* | ⚠️ đọc cột `TOTAL` thay vì `SALE_40` *(cần fix)* | — | — |
| Onsite fee | `Σ non-TOTAL` | *(API)* | *(API)* | *(API)* | *(API)* |
| Revenues from Equipment, Internet, Server,... | `Σ non-TOTAL` | *(API)* | *(API)* | *(API)* | *(API)* |
| Other revenues | `Σ non-TOTAL` | *(API)* | *(API)* | *(API)* | *(API)* |

### Section: Cost of sales

| Row | Total | BU1 (SALE_45) | BU3 (SALE_40) | Internal | DU* |
|-----|-------|---------------|---------------|----------|-----|
| **Cost of sales** | — | `Σ rows[BU1]` | `Σ rows[BU3]` | `Σ rows[Internal]` | `Σ rows[DU]` |
| Cost of sales (Ratecard DU) | — | `-(Σ DU Internal)` | `-(Σ DU Internal)` | `-(Σ DU Internal)` | — |

### Section: Selling expenses

| Row | Total | BU1 (SALE_45) | BU3 (SALE_40) | Internal | DU* |
|-----|-------|---------------|---------------|----------|-----|
| **Selling expenses** | `Σ rows[Total]` | `Σ rows[BU1]` | `Σ rows[BU3]` | — | — |
| Incentives | `= Incentives[SALE]` | ⚠️ `(SPR_On + SPR_Off) × rate` *(cần fix: dùng SPR của đúng BU)* | ⚠️ `idem` *(cần fix)* | — | — |
| Agency expenses | `= ô SALE` | *(API)* | *(API)* | — | — |

### Section: Delivery expenses

| Row | Total | BU1 (SALE_45) | BU3 (SALE_40) | Internal | DU* |
|-----|-------|---------------|---------------|----------|-----|
| **Delivery expenses** | `Σ rows[Total]` | `Σ rows[BU1]` | `Σ rows[BU3]` | `Σ rows[Internal]` | `Σ rows[DU]` |
| Direct labor cost | `Σ non-TOTAL` | *(API)* | *(API)* | *(nhập)* | *(API)* |
| Outsourcing cost | `Σ non-TOTAL` | *(API)* | *(API)* | *(nhập)* | *(API)* |
| Equipment, Internet, Server cost | `Σ non-TOTAL` | *(API)* | *(API)* | *(nhập)* | *(API)* |
| Onsite expenses | `Σ non-TOTAL` | *(API)* | *(API)* | *(nhập)* | *(API)* |
| Project bonus | `Σ DU bonus` | — | — | — | `PRODUCTION_MM_BONUS[DU] × MM_BILL[DU]` |
| Overtime | `Σ non-TOTAL` | *(API)* | *(API)* | *(nhập)* | *(API)* |
| Non-deductible input VAT | `Σ non-TOTAL` | *(API)* | *(API)* | *(nhập)* | *(API)* |
| Other expenses | `Σ non-TOTAL` | *(API)* | *(API)* | *(nhập)* | *(API)* |

### Section: Tax expenses

| Row | Total | BU1 (SALE_45) | BU3 (SALE_40) | Internal | DU* |
|-----|-------|---------------|---------------|----------|-----|
| **Tax expenses** | `REVENUES_TOTAL[Total] × PIC_CIT / 100` | `REVENUES_TOTAL[BU1] × PIC_CIT / 100` | `REVENUES_TOTAL[BU3] × PIC_CIT / 100` | — | `REVENUES_TOTAL[DU] × PIC_CIT / 100` |
| CIT and VAT (%) | *(nhập)* | — | — | — | — |

### Section: Margin

| Row | Total | BU1 (SALE_45) | BU3 (SALE_40) | Internal | DU* |
|-----|-------|---------------|---------------|----------|-----|
| Direct Margin | `Rev − CostPrice − Selling − Delivery − Tax` | `idem` | `idem` | `idem` | `idem` |
| Direct Margin before Incentives and Project bonus | `DM + Incentives + ProjectBonus` | `DM[BU1] + Incentives[BU1]` | `DM[BU3] + Incentives[BU3]` | `DM[Internal]` | `DM[DU] + ProjectBonus[DU]` |
| Allocation of pool and unbillable | `Σ DU` | — | — | — | `DirectLaborCost × 100 / BILL_RATE_NORM − DirectLaborCost` |
| Indirect margin | `DM − Allocation` | `= DM[BU1]` | `= DM[BU3]` | `= DM[Internal]` | `DM[DU] − Allocation[DU]` |
| Direct margin % | `DM / Rev × 100` | `idem` | `idem` | `idem` | `idem` |
| Direct Margin before Incentives and Project bonus % | `DMBonus / Rev × 100` | `idem` | `idem` | `idem` | `idem` |
| Indirect margin % | `IM / Rev × 100` | `= DM[BU1] / Rev × 100` | `= DM[BU3] / Rev × 100` | `idem` | `IM[DU] / Rev × 100` |

### Section: Reference

| Row | Total | BU1 (SALE_45) | BU3 (SALE_40) | Internal | DU* |
|-----|-------|---------------|---------------|----------|-----|
| Average delivery expenses | `DeliveryTotal / MM_effort_Total` | `CostOfDUSold / MM_bill_Sale` | `idem` | — | `DeliveryTotal[DU] / MM_effort[DU]` |
| Average direct labor cost/MM | `DirectLaborTotal / MM_effort_Total` | `DirectLabor[SALE] / MM_bill_Sale` | `idem` | — | `DirectLabor[DU] / MM_effort[DU]` |
| Billable rate (%) | `MM_bill_Sale / MM_effort_Total × 100` | `MM_bill_Sale / MM_bill_Sale × 100` | `idem` | — | `MM_bill[DU] / MM_effort[DU] × 100` |
| Productivity | `(SPR_On + SPR_Off) / MM_effort_Total` | — | — | — | `SPR[DU] / MM_effort[DU]` |
| Efficiency | `DM[Total] / MM_effort_Total` | — | — | — | `DM[DU] / MM_effort[DU]` |
| Incentives rate (%) | — | *(nhập — chỉ ở Onsite/Offshore)* | — | — | — |
| Project bonus/MM | — | — | — | — | *(nhập)* |
| Billable rate norm (%) | — | — | — | — | *(nhập)* |

---

## OB view — Columns: Total · BU1 (SALE_45) · BU3 (SALE_40) · Internal · DU1.8 · DJ1 · DU1.8

> Cấu trúc công thức **hoàn toàn giống Total view**.  
> Dữ liệu API khác (OB = Order Backlog), nhưng logic FE tính toán là như nhau.

---

## Tổng hợp các ô ⚠️ cần fix cho SALE_XX trong Total/OB

| Row | Column | Vấn đề hiện tại | Fix cần thiết |
|-----|--------|-----------------|---------------|
| Revenues from work delivered | SALE_XX | Dùng `viewMode='Total'` → fallback global state | Cần map `SALE_XX → locationType`, rồi dùng `SPR` của đúng sub-plan |
| Deduction | SALE_XX | Đọc cột `TOTAL` thay vì `SALE_XX` | Cần đọc `SALE_XX`, `SPR_API`, `Ded_API` theo đúng cột |
| Incentives | SALE_XX | Tính `(SPR_On + SPR_Off) × rate` cho cả 2 cột | Cần dùng `SPR` của đúng sub-plan cho từng `SALE_XX` |

> **Root cause chung:** Cần build map `saleColumnLocationType: { 'SALE_45': 'Onsite', 'SALE_40': 'Offshore' }`  
> từ `columnLabels[].id` ↔ `generalInfos[].listAM[0].departmentId` ↔ `generalInfos[].mvvLocationType`.
