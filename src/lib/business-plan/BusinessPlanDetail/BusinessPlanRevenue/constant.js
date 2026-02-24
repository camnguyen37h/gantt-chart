export const RevenueSummaryTooltip = {
  'MM bill': (
    <div>
      <div>MM bill (MM): Số effort sẽ được KH thanh toán</div>
      <ul>
        <li>MM Bill BU = Σ MM Bill DU</li>
        <li>MM Bill DU = Σ MM Bill DU theo revenue plan của DU</li>
        <li>Dữ liệu được tính toán theo data user nhập trên Billing Plan</li>
      </ul>
    </div>
  ),
  'Software production revenues': (
    <div>
      <div>Revenues from work delivered:</div>
      <ul>
        <li>
          (BU) Revenues from work delivered = Exchange rate * software
          development fee (Thuộc section General Information)
        </li>
        <li>
          (DU) Revenues from work delivered = Σ(Đơn giá DU bán cho BU x MM Bill
          x Pipeline Status Ratio) (Theo dữ liệu nhập trên Billing Plan)
        </li>
      </ul>
    </div>
  ),
  Deduction: (
    <div>
      <div>Deduction:</div>
      <ul>
        <li>
          (BU) Deduction = Σ(Đơn giá BU bán cho khách hàng x MM Bill x Pipeline
          Status Ratio) - (BU) Revenues from work delivered
        </li>
      </ul>
    </div>
  ),
  'Onsite fee': (
    <div>
      <div>Onsite fee:</div>
      <ul>
        <li>
          (BU)/(DU) onsite fee = Data onsite fee user nhập trong revenue plan
          của đơn vị tương ứng
        </li>
        <li>
          (BU)/(DU) onsite fee là hoạt động onsite được Khách hàng đồng ý thanh
          toán. Onsite fee có thể bao gồm vé máy bay, per diem, phí lưu trú, đi
          lại...
        </li>
      </ul>
    </div>
  ),
  'Revenues from Equipment, Internet, Server, ...': (
    <div>
      <div>Revenues from Equipment, Internet, Server,...:</div>
      <ul>
        <li>
          (BU)/(DU) Revenues from Equipment, Internet, Server = Data Revenues
          from Equipment, Internet, Server user nhập trong revenue plan của đơn
          vị tương ứng
        </li>
        <li>
          (BU)/(DU) Revenues from Equipment, Internet, Server là doanh thu từ
          cho thuê thiết bị, cung ứng dịch vụ đường truyền, xây dựng ODC
        </li>
      </ul>
    </div>
  ),
  'Other revenues': (
    <div>
      <div>Other revenues:</div>
      <ul>
        <li>
          (BU)/(DU) other revenues = Data other revenues user nhập trong revenue
          plan của đơn vị tương ứng
        </li>
        <li>
          (BU)/(DU) other revenues là các doanh thu khác (nếu có) (ví dụ, BOT)
        </li>
      </ul>
    </div>
  ),
  'Agency expenses': (
    <div>
      <div>Agency expenses:</div>
      <ul>
        <li>
          (BU) agency expenses là chi phí hoa hồng chi trả cho môi giới kinh
          doanh (agency, advisor)
        </li>
      </ul>
    </div>
  ),
}
export const DeliverySummaryTooltip = {
  'MM effort': (
    <div>
      <div>MM effort (MM): Số effort sử dụng để thực hiện công việc</div>
      <ul>
        <li>
          MM Effort DU = Σ MM Effort của DU theo data user nhập trong Delivery
          Plan – Resource Information
        </li>
      </ul>
    </div>
  ),
  'Direct labor cost': (
    <div>
      <div>Công thức tính Direct labor cost:</div>
      <ul>
        <li>
          Direct labor Cost = Labor Rate x MM Effort (Chỉ tính toán theo data
          của nhân sự có employee type là In-house)
        </li>
        <li>
          Nếu nhân sự có employee type = In-house {'->'} Labor rate = Salary
          index x Gross Salary (VND) + Expense Index
        </li>
        <li>
          Giá trị của Salary index và Expense index dựa theo location của nhân
          sự đó
        </li>
        <li>
          Dữ liệu được tính toán theo data user điền trong Delivery Plan -
          Section Resource Information
        </li>
      </ul>
    </div>
  ),
  'Outsourcing cost': (
    <div>
      <div>Công thức tính Outsourcing cost :</div>
      <ul>
        <li>
          Outsourcing Cost = Labor Rate x MM Effort (Chỉ tính toán theo data của
          nhân sự có employee type là Outsourced)
        </li>
        <li>
          Nếu nhân sự có employee type = Outsourced {'->'} Labor rate = Gross
          Salary (VND)
        </li>
        <li>
          Dữ liệu được tính toán theo data user điền trong Delivery Plan -
          Section Resource Information
        </li>
      </ul>
    </div>
  ),
  'Equipment, Internet, Server cost': (
    <div>
      <ul>
        <li>
          (BU)/(DU) Equipment, Internet, Server cost = Data Equipment, Internet,
          Server cost user nhập trong delivery plan của đơn vị tương ứng
        </li>
        <li>
          (BU)/(DU) Equipment, Internet, Server cost là Chi phí mua thiết bị,
          internet, server, license, phần mềm, ... phục vụ dự án
        </li>
      </ul>
    </div>
  ),
  'Onsite expense': (
    <div>
      <div>
        Onsite development cost (Onsite allowance, per diem, travelling,
        accommodation, etc.): Chi phí onsite, công tác của nhân sự thực hiện dự
        án.
      </div>
      <div>
        Chi phí công tác có thể bao gồm vé máy bay, per diem, phí lưu trú, đi
        lại, ... và cần bổ sung bảng tính chi tiết.
      </div>
      <div>Chi phí onsite bao gồm phụ cấp onsite, gửi xe, ...</div>
      <ul>
        <li>
          (BU)/(DU) onsite development cost = Data onsite development cost user
          nhập trong delivery plan của đơn vị tương ứng
        </li>
      </ul>
    </div>
  ),
  Overtime: (
    <div>
      <div>Overtime - Chi phí làm thêm giờ (nếu có) :</div>
      <ul>
        <li>Theo data user nhập trong delivery plan của đơn vị tương ứng</li>
      </ul>
    </div>
  ),
  'Non-deductible input VAT': (
    <div>
      <div>
        Non-deductible input VAT: Chi phí thuế Giá trị gia tăng/thuế tiêu thụ
        đầu vào không được khấu trừ - áp dụng các dự án với khách hàng tại Việt
        Nam
      </div>
      <ul>
        <li>
          (BU)/(DU) Non-deductible input VAT = Data Non-deductible input VAT
          user nhập trong delivery plan của đơn vị tương ứng
        </li>
      </ul>
    </div>
  ),
  'Other expenses': (
    <div>
      <ul>
        <li>
          (BU)/(DU) other expenses = Data other expenses user nhập trong
          delivery plan của đơn vị tương ứng
        </li>
      </ul>
    </div>
  ),
}
export const renderFieldName = field => {
  let title
  switch (field) {
    case 'userName':
      title = 'LDAP'
      break
    case 'locationName':
      title = 'Location'
      break
    case 'typeResourceId':
      title = 'Resource Type'
      break
    case 'resourceType':
      title = 'Resource Type'
      break
    case 'originalGrossSalary':
      title = 'Original Employee Cost'
      break
    case 'grossSalaryVnd':
      title = 'Employee Cost (VND)'
      break
    case 'position':
      title = 'Position'
      break
    case 'role':
      title = 'Role'
      break
    case 'CostName':
      title = 'Expense Name'
      break
    case 'costTypeSpecificName':
      title = 'Expense Name'
      break
    case 'typeid':
      title = 'Employee Type'
      break
    case 'employeeType':
      title = 'Employee Type'
      break
    default:
      title = field
      break
  }
  return title
}
