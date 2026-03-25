# Fixes & Solutions

## 1. Score Setting — Auto-fill Description từ template string

**File:** `src/lib/performance-score-setting/PerformanceScoreSettingForm.jsx`

**Hướng xử lý:**
- Khi user gõ vào ô **Score**, ô **Description** tự fill theo dạng `Definition of <tên score>`
- Chỉ tự fill khi Description đang trống hoặc vẫn đang là giá trị tự fill từ trước — nếu user đã tự gõ tay thì không ghi đè
- Dùng `form.setFieldsValue` để set giá trị Description từ bên ngoài ô input (vì cả 2 ô đều là Ant Design Form field được quản lý bởi `getFieldDecorator`)

---

## 2. Business Plan Detail

**Thư mục:** `src/lib/business-plan/BusinessPlanDetail/`

### Tổng quan

Trang chi tiết Business Plan gồm 2 phần chính: **General Information** và **bảng Business Plan** dạng multirow-multicolumn. Dữ liệu lưu trong Redux, được chuẩn hoá thành nested object `businessPlanItems[sectionKey].data[rowKey].data[]` (mảng cells).

### Data Flow

1. Mount → dispatch API lấy data theo `buId`
2. Data normalize vào Redux (`businessPlanItems`)
3. User edit cell → update Redux trực tiếp
4. Save/Submit → serialize lại thành params → gọi API

### Render bảng (`BusinessPlanFormSection`)

- Loop qua sections → rows → cells
- Mỗi cell gọi `getFormula()` để lấy giá trị tính toán; nếu không có formula thì dùng `.value` thô
- Cell editable hay readonly do `useBusinessPlanPermission` quyết định theo role và scope

### View Mode (OB / Onsite / Total / ...)

- Mỗi mode là một tab riêng, load data song song
- OB mode có cấu trúc column khác các mode còn lại — một số row không tồn tại column tương ứng
- **Fix crash OB:** Trong `getTotalColumnAndSet` (useFormula.js), thêm null guard sau `.find()`: nếu `childItem` là `undefined` thì trả `0` thay vì crash. Đồng thời chỉ gọi `getFormula` một lần, lưu vào biến để tái dùng.

### Compare Mode

- Merge columns từ 2 version để hiển thị song song
- Tính diff = `current - compare`, hiển thị bên dưới mỗi cell

### Công thức (`useFormula`)

- `getFormula()` tra cứu config theo `sectionKey + rowKey + columnKey`, gọi hàm tương ứng
- Dùng `Decimal.js` cho phép toán chính xác
- Các phép tính: cộng tổng (sum), nhân (UnitPrice × MM), chia (Revenue / MMBill), kết hợp nhiều bước
- Không có cache — recalc mỗi render, dùng `useMemo` ở tầng trên để kiểm soát

### Permission

- `useBusinessPlanPermission` check role + scope (Onsite / Offshore / Total)
- Quyết định cell nào editable, data nào bị ẩn/mask
