const RESOURCE_INFORMATION_TYPE = {
    HEAD_COUNT: 1,
    LABOR_COST: 2,
}
export default RESOURCE_INFORMATION_TYPE

export const DU_MEMBER_WARNING_MESSAGE = "This person does not belong to this delivery plan's delivery unit"

export const REVIEWING_WARNING_MESSAGE = "You cannot edit when filter is All, please change the filter to a single unit"

export const DUPLICATED_COSTNAMES_MESSAGE = "Cost name is duplicated in other expenses section"

export const VALIDATE_REQUIRED_FIELDS_MESSAGE = "Please input required fields"

export const MISSING_REQUIRED_FIELDS_SUBMIT = 'Missing required fields for delivery plan: ###'

export const REQUIRED_FIELDS_DELIVERY = [
    {
        title: "Resource Type",
        key: "resourceType"
    },
    {
        title: "Resource Full Name",
        key: "resourceFullName"
    },
    {
        title: "Ldap",
        key: "ldap"
    },
    {
        title: "Location",
        key: "location"
    },
    {
        title: "Employee Type",
        key: "employeeType"
    },
    {
        title: "Original Employee Cost",
        key: "originalGrossSalary"
    },
    {
        title: "Employee Cost VND",
        key: "grossSalary"
    },
    {
        title: "Position",
        key: "position"
    },
    {
        title: "Role",
        key: "role"
    },
    {
        title: "Total",
        key: "rowTotal"
    }
]

export const OTHER_EXPENSE_TABLE_WIDTH = {
    ACTION: 30,
    EXPENSE_CATEGORIES: 160,
    TOTAL_EXPENSE: 160,
    MONTH: 100,
    TABLE: 1517,
}

export const RESOURCE_TABLE_WIDTH = {
    TABLE: 1517,
    WARNING: 4,
    ACTION: 30,
    RESOURCE_TYPE: 160,
    RESOURCE_FULL_NAME: 180,
    LDAP: 100,
    LOCATION: 120,
    EMPLOYEE_TYPE: 120,
    ORIGINAL_EMPLOYEE_COST: 160,
    EMPLOYEE_COST: 160,
    POSITION: 120,
    ROLE: 120,
    TOTAL: 100,
    MAX_MONTH_WIDTH: 120,
    NO: 40
}

export const OTHER_EXPENSE_TABLE_ENUMS = ['Onsite', 'Equipment', 'Overtime', 'Non-deductible input VAT', 'Others']

export const RESOURCES_KEYS = {
    DELIVERY_MEMBER: 'DELIVERY_MEMBER',
    NEW_DELIVERY_MEMBER: 'NEW_DELIVERY_MEMBER',
}

export const OTHER_EXPENSES_KEYS = {
    UPDATE_EXPENSE_COSTNAME: 'UPDATE_EXPENSE_COSTNAME',
    NEW_EXPENSE_COSTNAME: 'NEW_EXPENSE_COSTNAME',
}

export const RESOURCE_TYPE_ENUM = {
    USER: 'User',
    GENERIC_RESOURCE: 'Generic Resource',
    RESOURCE: 'Resource'
}

export const RESOURCE_REFERENCE_TYPE_ENUM = ['Actual TS', 'Allocated', 'Book', 'Available']

export const RESOURCE_TYPE_TOOLTIP = (
    <div>
        <ul>
            <li>User: Nhân sự đang làm việc tại đơn vị sản xuất</li>
            <li>Generic Resource: Nhân sự mà đơn vị sản xuất đang có kế hoạch tuyển dụng (Nhân sự ảo)</li>
        </ul>
    </div>
)