import { checkRolePermission } from '../../components/common/checkRolePermission'
import {
  ActivityKeyConstants,
  SourceConstants,
} from '../constants/ActivityKeyConstants'
import { Divider } from 'antd'

export const ALL_OPTION_VALUE = 'All'
export const ALL_OPTION = { groupId: ALL_OPTION_VALUE, groupName: 'All' }

export const STATUS_COLOR = {
  VERIFICATION: { color: '#1890FF', backgroundColor: '#CDEDFF' },
  APPROVED: { color: '#4CAF50', backgroundColor: '#D9F7BE' },
  DRAFT: { color: '#101C2D', backgroundColor: '#D9D9D9' },
  PEER_REVIEW: { color: '#FA8C16', backgroundColor: '#FFF1B8' },
}

export const STATUS_COLOR_DETAIL = {
  VERIFICATION: { backgroundColor: 'blue' },
  APPROVED: { backgroundColor: 'green' },
  DRAFT: {},
  'PEER REVIEW': { backgroundColor: 'orange' },
}

export const STATUS_COLOR_PROJECT_TYPE = {
  Onsite: { backgroundColor: 'green' },
  Offshore: { backgroundColor: 'blue' },
}

export const MVV_TYPE_BADGE = {
  onsite: { color: '#1890FF', backgroundColor: '#CDEDFF' },
  offshore: { color: '#4CAF50', backgroundColor: '#D9F7BE' },
}

export const STATUS_COLOR_ICON = {
  APPROVED: { color: '#4CAF50' },
  REJECTED: { color: '#FF5252' },
  TODO: { color: '#1890FF' },
  WAIT: { color: '#BFBFBF' },
}

export const STEPS_ICON = {
  finish: 'check-circle',
  error: 'close-circle',
  process: 'sync',
  wait: 'clock-circle',
}

export const getRowConfig = () => {
  const displayDivide = (divisor, dividend) => {
    return (
      <div className="text-center">
        <span style={{ fontSize: 13 }}>{divisor}</span>
        <Divider className="mt-1 mb-0" />
        <span style={{ fontSize: 13 }}>{dividend}</span>
      </div>
    )
  }
  return {
    MM_BILL: {
      canAdd: false,
      tooltip: (
        <div>
          <div>MM bill (MM): Số effort sẽ được KH thanh toán</div>
          <ul>
            <li>MM Bill Total = MM Bill BU </li>
            <li>MM Bill BU = Σ MM Bill DU</li>
            <li>MM Bill DU = Σ MM Bill DU theo revenue plan của DU</li>
          </ul>
        </div>
      ),
    },
    UNIT_PRICE: {
      required: true,
      tooltip: (
        <div>
          <div>Unit price Total = Unit Price BU</div>
          <div>
            Unit Price BU = Tổng doanh thu sản xuất phần mềm của BU / Tổng MM
            Bill của BU
          </div>
          <div>
            Unit Price DU = Tổng doanh thu sản xuất phần mềm của DU / Tổng MM
            Bill của DU
          </div>
          <br />
          <div>Trong đó</div>
          <ul>
            <li>
              Doanh thu sản xuất phần mềm của BU = Σ(Đơn giá BU bán cho khách
              hàng x MM Bill x Pipeline Status Ratio)
            </li>
            <li>
              Doanh thu sản xuất phần mềm của DU = Σ(Đơn giá DU bán cho BU x MM
              Bill x Pipeline Status Ratio)
            </li>
          </ul>
        </div>
      ),
    },
    MM_PRODUCTION: {
      required: true,
      tooltip: (
        <div>
          <div>MM effort (MM): Số effort sử dụng để thực hiện công việc</div>
          <ul>
            <li>MM effort Total = Σ MM effort (DU)</li>
            <li>MM Effort BU = Σ MM Bill BU</li>
            <li>
              MM Effort DU = Σ MM Effort của DU theo data user nhập trong
              Delivery Plan – Resource Information
            </li>
          </ul>
        </div>
      ),
    },
    MM_BILL_SERVICE: {
      tooltip: (
        <div>
          <div>
            Service/Sub service (MM): Phân chia MM bill theo các dịch vụ mà CMC
            cung cấp cho KH
          </div>
          <ul>
            <li>
              (DU) Service/Sub service là số MM bill tương ứng với từng loại
              dịch vụ (DX và non-DX) mà CMC cung cấp cho KH. Loại dịch vụ 3.
              Others áp dụng với hình thức BOT, cho thuê thiết bị, xây ODC, ...
            </li>
          </ul>
        </div>
      ),
    },
    TAX_TOTAL: {
      tooltip: (
        <div>
          <div>Tax expenses:</div>
          <ul>
            <li>Total tax expenses = total revenues * total CIT and VAT</li>
            <li>(BU) tax expenses = (BU) revenues * total CIT and VAT</li>
            <li>(DU) tax expenses = (Du) revenues * total CIT and VAT</li>
          </ul>
        </div>
      ),
    },
    PIC_CIT: {
      percent: true,
      tooltip: (
        <div>
          CIT and VAT (if any) (%): Thuế Thu nhập doanh nghiệp hoặc thuế Giá trị
          gia tăng phải chịu (áp dụng với các Hợp đồng có rủi ro về thuế do
          không ký theo mẫu của CMC Global)
        </div>
      ),
    },
    PRODUCTION_MM_BONUS: {
      required: true,
      tooltip: 'Hệ số thưởng sản xuất cho 1 MM Bill tương ứng',
    },
    DIRECT_MARGIN_RATE: {
      percent: true,
      tooltip: (
        <div className="flex-items-center gap-4">
          Direct margin % = {displayDivide('Direct margin', 'Revenues')} x 100
        </div>
      ),
    },
    DIRECT_MARGIN_BONUS_RATE: {
      percent: true,
      tooltip: (
        <div className="flex-items-center gap-4">
          Direct Margin before Incentives and Project bonus % =
          {displayDivide(
            'Direct Margin before Incentives and Project bonus  ',
            'Revenues'
          )}
          x 100
        </div>
      ),
    },
    INDIRECT_MARGIN_RATE: {
      percent: true,
      tooltip: (
        <div className="flex-items-center gap-4">
          Indirect margin % = {displayDivide('Indirect margin', 'Revenues')} x
          100
        </div>
      ),
    },
    BILLABLE_RATE: {
      percent: true,
      tooltip: (
        <div className="flex-items-center gap-4">
          Billable rate = {displayDivide('MM Bill', 'MM Effort')} x 100
        </div>
      ),
    },
    INCENTIVES_RATE: {
      percent: true,
      tooltip: 'Incentives rate (%): Tỷ lệ incentive của dự án',
    },
    BILL_RATE_NORM: {
      percent: true,
      required: true,
      tooltip:
        'Bill rate norm (%) là định mức billable rate theo Kế hoạch ngân sách',
    },
    DEDUCTION: {
      negative: true,
      tooltip: (
        <div>
          <div>Deduction:</div>
          <ul>
            <li>Total deduction = Σ (BU+ Internal + DU) deduction</li>
            <li>
              (BU) Deduction = Σ(Đơn giá BU bán cho khách hàng x MM Bill x
              Pipeline Status Ratio) - (BU) Revenues from work delivered
            </li>
          </ul>
        </div>
      ),
    },

    DIRECT_LABOR_COST: {
      canEditInternal: checkRolePermission(
        SourceConstants.BUSINESS_PLAN_DETAIL,
        ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
      ),
      tooltip: (
        <div>
          <div>Direct labor cost:</div>
          <ul>
            <li>
              Total direct labor cost = Σ (BU + Internal + DU) direct labor cost
            </li>
            <li>
              (DU) direct labor cost là chi phí nhân sự sản xuất trực tiếp cho
              dự án, dựa theo data user input trong Delivery Plan – section
              Resource Information
            </li>
          </ul>
        </div>
      ),
    },

    OUTSOURCING_COST: {
      canEditInternal: checkRolePermission(
        SourceConstants.BUSINESS_PLAN_DETAIL,
        ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
      ),
      tooltip: (
        <div>
          <div>Outsourcing cost:</div>
          <ul>
            <li>
              Total outsourcing cost = Σ (BU + Internal + DU) outsourcing cost
            </li>
            <li>
              (BU)/(DU) outsourcing cost là chi phí nhân sự thuê ngoài trọn gói,
              dựa theo data user input trong Delivery Plan – section Resource
              Information
            </li>
          </ul>
        </div>
      ),
    },

    EQUIPMENT_INTERNET_SERVER_COST: {
      canEditInternal: checkRolePermission(
        SourceConstants.BUSINESS_PLAN_DETAIL,
        ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
      ),
      tooltip: (
        <div>
          <ul>
            <li>
              Total Equipment, Internet, Server cost = Σ (BU + Internal + DU)
              Equipment, Internet, Server Cost
            </li>
            <li>
              (BU)/(DU) Equipment, Internet, Server cost = Data Equipment,
              Internet, Server cost user nhập trong delivery plan của đơn vị
              tương ứng
            </li>
            <li>
              (BU)/(DU) Equipment, Internet, Server cost là Chi phí mua thiết
              bị, internet, server, license, phần mềm, ... phục vụ dự án
            </li>
          </ul>
        </div>
      ),
    },
    ONSITE_DEVELOPMENT_COST: {
      canEditInternal: checkRolePermission(
        SourceConstants.BUSINESS_PLAN_DETAIL,
        ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
      ),
      tooltip: (
        <div>
          <div>
            Onsite development cost (Onsite allowance, per diem, travelling,
            accommodation, etc.): Chi phí onsite, công tác của nhân sự thực hiện
            dự án.
          </div>
          <div>
            Chi phí công tác có thể bao gồm vé máy bay, per diem, phí lưu trú,
            đi lại, ... và cần bổ sung bảng tính chi tiết.
          </div>
          <div>Chi phí onsite bao gồm phụ cấp onsite, gửi xe, ...</div>
          <ul>
            <li>
              Total onsite development cost = Σ (BU + Internal + DU) Onsite
              development cost
            </li>
            <li>
              (BU)/(DU) onsite development cost = Data onsite development cost
              user nhập trong delivery plan của đơn vị tương ứng
            </li>
          </ul>
        </div>
      ),
    },
    PROJECT_BONUS: {
      canEditInternal: checkRolePermission(
        SourceConstants.BUSINESS_PLAN_DETAIL,
        ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
      ),
      tooltip: (
        <div>
          <div>Project bonus:</div>
          <ul>
            <li>Total project bonus = Σ (BU + Internal + DU) project bonus</li>
            <li>(DU) project bonus = (DU) MM bill * (DU) project bonus/MM</li>
          </ul>
        </div>
      ),
    },
    OVERTIME: {
      canEditInternal: checkRolePermission(
        SourceConstants.BUSINESS_PLAN_DETAIL,
        ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
      ),
      tooltip: (
        <div>
          <div>Overtime: Chi phí làm thêm giờ (nếu có)</div>
          <ul>
            <li>Total overtime = Σ (BU + Internal + DU) overtime</li>
          </ul>
        </div>
      ),
    },
    NON_DEDUCTION_VAT: {
      canEditInternal: checkRolePermission(
        SourceConstants.BUSINESS_PLAN_DETAIL,
        ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
      ),
      tooltip: (
        <div>
          <div>
            Non-deductible input VAT: Chi phí thuế Giá trị gia tăng/thuế tiêu
            thụ đầu vào không được khấu trừ - áp dụng các dự án với khách hàng
            tại Việt Nam
          </div>
          <ul>
            <li>
              Total non-deductible input VAT = Σ (BU + Internal + DU)
              non-deductible input VAT
            </li>
            <li>
              (BU)/(DU) Non-deductible input VAT = Data Non-deductible input VAT
              user nhập trong delivery plan của đơn vị tương ứng
            </li>
          </ul>
        </div>
      ),
    },
    OTHER_EXPENSES: {
      canEditInternal: checkRolePermission(
        SourceConstants.BUSINESS_PLAN_DETAIL,
        ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
      ),
      tooltip: (
        <div>
          <ul>
            <li>
              Total other expenses = Σ (BU + Internal + DU) other expenses
            </li>
            <li>
              (BU)/(DU) other expenses = Data other expenses user nhập trong
              delivery plan của đơn vị tương ứng
            </li>
          </ul>
        </div>
      ),
    },
    SOFTWARE_PRODUCTION_REVENUES: {
      tooltip: (
        <div>
          <div>Revenues from work delivered:</div>
          <ul>
            <li>
              Total revenues from work delivered = Σ (BU + Internal + DU)
              revenues from work delivered
            </li>
            <li>
              (BU) Revenues from work delivered = Exchange rate * software
              development fee
            </li>
            <li>
              Internal revenues from work delivered = - Σ (DU) revenues from
              work delivered
            </li>
            <li>
              (DU) Revenues from work delivered = Σ(Đơn giá DU bán cho BU x MM
              Bill x Pipeline Status Ratio)
            </li>
          </ul>
        </div>
      ),
    },
    ONSITE_FEE: {
      tooltip: (
        <div>
          <div>Onsite fee:</div>
          <ul>
            <li>Total onsite fee = Σ (BU + Internal + DU) onsite fee</li>
            <li>
              (BU)/(DU) onsite fee = Data onsite fee user nhập trong revenue
              plan của đơn vị tương ứng
            </li>
            <li>
              (BU)/(DU) onsite fee là hoạt động onsite được Khách hàng đồng ý
              thanh toán. Onsite fee có thể bao gồm vé máy bay, per diem, phí
              lưu trú, đi lại...
            </li>
          </ul>
        </div>
      ),
    },
    EQUIPMENT_FEE: {
      tooltip: (
        <div>
          <div>Revenues from Equipment, Internet, Server,...:</div>
          <ul>
            <li>
              Total Revenues from Equipment, Internet, Server = Σ (BU + Internal
              + DU) revenues from Equipment, Internet, Server,...
            </li>
            <li>
              (BU)/(DU) Revenues from Equipment, Internet, Server = Data
              Revenues from Equipment, Internet, Server user nhập trong revenue
              plan của đơn vị tương ứng
            </li>
            <li>
              (BU)/(DU) Revenues from Equipment, Internet, Server là doanh thu
              từ cho thuê thiết bị, cung ứng dịch vụ đường truyền, xây dựng ODC
            </li>
          </ul>
        </div>
      ),
    },
    OTHER_FEE: {
      tooltip: (
        <div>
          <div>Other revenues:</div>
          <ul>
            <li>
              Total other revenues = Σ (BU + Internal + DU) other revenues
            </li>
            <li>
              (BU)/(DU) other revenues = Data other revenues user nhập trong
              revenue plan của đơn vị tương ứng
            </li>
            <li>
              (BU)/(DU) other revenues là các doanh thu khác (nếu có) (ví dụ,
              BOT)
            </li>
          </ul>
        </div>
      ),
    },
    COST_PRICE_TOTAL: {
      tooltip: (
        <div>
          <div>Cost of sales:</div>
          <ul>
            <li>Total cost of sales = Σ (BU + Internal + DU) cost of sales</li>
            <li>(BU) cost of sales = (BU) cost of sales (ratecard DU)</li>
            <li>
              Internal cost of sales = internal cost of sales (ratecard DU)
            </li>
          </ul>
        </div>
      ),
    },
    COST_OF_DU_SOLD: {
      tooltip: (
        <div>
          <div>Cost of sales (Ratecard DU):</div>
          <ul>
            <li>
              (BU) cost of sales (ratecard DU) = Σ (DU) revenues from work
              delivered
            </li>
            <li>
              Internal cost of sales (ratecard DU) = internal revenues from work
              delivered
            </li>
          </ul>
        </div>
      ),
    },
    SELLING_EXPENSES_TOTAL: {
      tooltip: (
        <div>
          <div>Selling expenses:</div>
          <ul>
            <li>
              Total selling expenses = total incentives + total agency expenses
            </li>
            <li>
              (BU) selling expenses = (BU) incentives + (BU) agency expenses
            </li>
          </ul>
        </div>
      ),
    },
    INCENTIVES: {
      tooltip: (
        <div>
          <div>Incentives:</div>
          <ul>
            <li>Total incentives = Σ (BU + Internal+ DU) incentives</li>
            <li>
              (BU) incentives = (BU) revenues from work delivered * (BU)
              incentives rate
            </li>
          </ul>
        </div>
      ),
    },
    AGENCY_EXPENSE: {
      tooltip: (
        <div>
          <div>Agency expenses:</div>
          <ul>
            <li>
              Total agency expenses = Σ (BU + Internal + DU) agency expenses
            </li>
            <li>
              (BU) agency expenses là chi phí hoa hồng chi trả cho môi giới kinh
              doanh (agency, advisor)
            </li>
          </ul>
        </div>
      ),
    },
    DIRECT_MARGIN: {
      tooltip: (
        <div>
          Direct margin = Revenues - Cost of sales - selling expenses - delivery
          expenses - tax expenses
        </div>
      ),
    },
    DIRECT_MARGIN_BONUS: {
      tooltip: (
        <div>
          Direct margin before incentive and project bonus = direct margin +
          incentives + project bonus
        </div>
      ),
    },
    ALLOCATION_OF_POOL_AND_UNBILLABLE: {
      tooltip: (
        <div>
          <div>Allocation of pool and unbillable:</div>
          <ul>
            <li>
              Total allocation of pool and unbillable = Σ (BU + Internal + DU)
              allocation of pool and unbillable
            </li>
            <li>
              (DU) allocation of pool and unbillable = ((DU) Direct labor cost /
              (DU) billable rate norm) - (DU) Direct labor cost
            </li>
          </ul>
        </div>
      ),
    },
    INDIRECT_MARGIN: {
      tooltip: (
        <div>
          Indirect margin = Direct margin - allocation of pool and unbillable
        </div>
      ),
    },
    DELIVERY_AVERAGE_EXPENSES: {
      tooltip: (
        <div>
          <ul>
            <li>
              <div className="flex-items-center gap-4">
                Average delivery expenses =
                {displayDivide('Delivery expenses', 'MM Effort')}
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    SALARY_AVERAGE_EXPENSES: {
      tooltip: (
        <div className="flex-items-center gap-4">
          Average delivery salary =
          {displayDivide('Direct labor cost', 'MM effort')}
        </div>
      ),
    },

    PRODUCTIVITY: {
      tooltip: (
        <div className="flex-items-center gap-4">
          Productivity =
          {displayDivide('Revenues from work delivery', 'MM effort')} x100
        </div>
      ),
    },
    EFFICIENCY: {
      tooltip: (
        <div className="flex-items-center gap-4">
          Efficiency = {displayDivide('Direct Margin', 'MM Effort')} x100
        </div>
      ),
    },
  }
}

export const sectionConfig = {
  MAN_MONTH: {
    rowClass: 'bg-light-blue',
    newRowEditable: columnKey =>
      columnKey.match(/TOTAL|SALE|INTERNAL/) ? false : true,
    newRowKey: 'MM_BILL',
    collapsible: true,
    titleRowClass: 'total-section-no-space',
  },
  REVENUES: {
    canAdd: false,
    collapsible: true,
    newRowEditable: columnKey =>
      columnKey.match(/TOTAL|INTERNAL/) ? false : true,
    newRowKey: 'OTHER_FEE',
    titleRowClass: 'group-divider',
  },
  COST_PRICE: {
    collapsible: true,
  },
  MARGIN: {
    hiddenTitle: true,
    collapsible: true,
    titleRowClass: 'group-divider',
  },
  DELIVERY_EXPENSES: {
    canAdd: false,
    collapsible: true,
    newRowEditable: columnKey => (columnKey.match(/TOTAL/) ? false : true),
    newRowKey: 'OTHER_EXPENSES',
  },
  SELLING_EXPENSES: {
    collapsible: true,
  },
  TAX: {
    collapsible: true,
  },
  REFERENCE: {
    collapsible: true,
    titleRowClass: 'group-divider',
  },
}

export const STATUS_COLOR_BUSINESS_PLAN_REQUEST = {
  'TO DO': { color: '#1890FF', backgroundColor: '#CDEDFF' },
  APPROVED: { color: '#4CAF50', backgroundColor: '#D9F7BE' },
  REJECTED: { color: '#F5222D', backgroundColor: '#FFCCC7' },
  DELETED: { color: '#101C2D', backgroundColor: '#D9D9D9' },
}

export const REVENUE_PLAN_TAB = {
  SUMMARY: 'Summary',
  SOFTWARE_PRODUCTION_REVENUE_INFORMATION:
    'Software Production Revenue Information',
  OTHER_REVENUES: 'Other Revenues',
  HISTORY: 'History',
  SELLING_EXPENSES: 'Selling Expenses',
}

export const REVENUE_TYPE_ID = {
  'Onsite Fee': 0,
  Equipment: 1,
  Other: 2,
}

export const SELLING_EXPENSES_TYPE_ID = {
  'Agency Expense': 3,
}

export const API_TYPE = {
  OTHER_REVENUES: 'otherRevenues',
  SELLING_EXPENSES: 'sellingExpenses',
}

export const REVENUE_TYPE_ORIGIN = ['Onsite Fee', 'Equipment', 'Other']
export const SELLING_TYPE_ORIGIN = ['Agency Expense']

export const CAN_NOT_EDIT_REVENUE =
  'Cannot edit as this revenue plan is being reviewed'

export const NOTIFICATION_MESSAGE_REVENUE = {
  REVENUE_EMPTY: 'Please input required fields',
  REVENUE_DUPLICATE:
    'Revenue name is duplicated in other revenues or selling expenses section',
}

export const CONFIRM_MODAL_CHANGE_DEPARTMENT = {
  TITLE: 'Confirm',
  CONTENT:
    'Change department may cause your data to be lost, do you want to continue?',
}

export const SAVE_BUSINESS_PLAN_MESSAGE = {
  SUCCESS: 'Save Business Plan Information successfully',
}

export const MAX_BUSINESS_PLAN_KPI_TOTAL_CONFIG_KEY =
  'MAX_BUSINESS_PLAN_KPI_TOTAL'

export const KPI_BONUS_ENUMS = [
  {
    FIELD: 'PM',
    CONFIG_KEY: 'MAX_BUSINESS_PLAN_KPI_PM',
  },
  {
    FIELD: 'QA',
    CONFIG_KEY: 'MAX_BUSINESS_PLAN_KPI_QA',
  },
  {
    FIELD: 'Member',
    CONFIG_KEY: 'MAX_BUSINESS_PLAN_KPI_MEMBER',
  },
]
