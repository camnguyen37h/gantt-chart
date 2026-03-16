import { formatFloatNumber } from '../../../utils/format-utils/ConvertNumber'
import { Tooltip } from 'antd'
import moment from 'moment'
import { REQUIRED_FIELDS_DELIVERY, RESOURCE_TABLE_WIDTH } from './constants'

export const getMonthsBetweenTimestamps = (start, end) => {
  const startDate = moment(start)
  const endDate = moment(end)
  const months = []
  while (startDate.isBefore(endDate)) {
    months.push(startDate.format('MM-YYYY'))
    startDate.add(1, 'month')
  }
  return months
}

export const convertDateTextFormat = date => {
  return moment(date, 'MM-YYYY').format('MMM-YYYY')
}

export const formatNumberThousands = num => {
  if (!num) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export const formatterMMValues = value => {
  if (value === null) return value
  if (value === '-') return null
  if (value === '') return value

  const res = value.toString().match(/^(\d{0,4})(\.(\d{0,6})?)?/) // Limit to 4 digits before and 6 after
  if (!res) return ''

  const intPart = res[1]
  const decimalPart = res[3] || ''
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return decimalPart !== ''
    ? `${formattedInt}.${decimalPart}`
    : `${formattedInt}${res[2] ? '.' : ''}`
}

export const parserMMValues = value => {
  if (value === null || value === '') return ''

  const cleaned = value.replace(/[-,]/g, '') // Remove negative sign and commas
  const res = cleaned.match(/^(\d{0,4})(\.(\d{0,6})?)?/) // Limit to 4 digits before and 6 after
  return res ? `${res[1]}${res[2] || ''}` : ''
}

export const getVisibleColumns = (columns, visibilityData) => {
  return columns.reduce((acc, column) => {
    if (column.children && column.children.length > 0) {
      const visibleChildren = column.children.filter(item => {
        return (
          !(item.key in visibilityData) || visibilityData[item.key] === true
        )
      })

      // Only add the column if it has visible children
      if (visibleChildren.length > 0) {
        acc.push({
          ...column,
          children: visibleChildren,
        })
      }
    } else {
      acc.push(column) // Add columns without children
    }
    return acc
  }, [])
}
export const getMissingFieldsArray = array => {
  const result = {}

  array.forEach(item => {
    const {
      groupId,
      groupName,
      deliveryMemberId,
      ldap,
      missingRequiredFields,
    } = item
    const key = `${groupId}-${groupName}`

    if (!result[key]) {
      result[key] = {}
    }

    if (!result[key][deliveryMemberId]) {
      result[key][deliveryMemberId] = { ldap, fields: new Set() }
    }

    missingRequiredFields.forEach(field => {
      const fieldItem = REQUIRED_FIELDS_DELIVERY.find(f => f.key === field)
      if (fieldItem) {
        result[key][deliveryMemberId].fields.add(fieldItem.title)
      }
    })
  })

  return Object.entries(result).flatMap(([key, memberData]) => {
    const [groupId, groupName] = key.split('-')
    return Object.entries(memberData).map(
      ([deliveryMemberId, { ldap, fields }]) => {
        return `${groupName}: Ldap: ${ldap || ''}: ${Array.from(fields).join(
          ', '
        )}`
      }
    )
  })
}

export const checkboxItems = [
  { value: 'location', label: 'Show Location', checked: true },
  { value: 'employeeType', label: 'Show Employee Type', checked: true },
  {
    value: 'originalGrossSalary',
    label: 'Show Original Employee Cost',
    checked: true,
  },
  { value: 'grossSalary', label: 'Show Employee Cost VND', checked: true },
  { value: 'position', label: 'Show Position', checked: true },
  { value: 'role', label: 'Show Role', checked: true },
]

export const loadDataFromList = [
  { value: 'Resource Allocation', label: 'Resource Allocation' },
  { value: 'Actual Timesheet', label: 'Actual Timesheet' },
  { value: 'Available', label: 'Available' },
  { value: 'Book', label: 'Book' },
]

export const mainColumns = [
  {
    title: '',
    key: 'fixed-columns',
    fixed: 'left',
    children: [
      {
        title: 'NO',
        key: 'no',
        dataIndex: 'no',
        align: 'left',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.NO,
      },
      {
        title: 'Resource Type',
        dataIndex: 'resourceType',
        key: 'resourceType',
        align: 'left',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.RESOURCE_TYPE,
      },
      {
        title: 'Resource Full Name',
        dataIndex: 'resourceFullName',
        key: 'resourceFullName',
        align: 'left',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.RESOURCE_FULL_NAME,
        editable: true,
      },
      {
        title: 'Ldap',
        dataIndex: 'ldap',
        key: 'ldap',
        align: 'left',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.LDAP,
      },
      {
        title: 'Fill',
        dataIndex: 'fill',
        key: 'fill',
        align: 'center',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.NO,
      },
    ],
  },
  {
    title: 'Total Plan',
    align: 'right',
    key: 'totalPlan',
    children: [
      {
        title: 'Location',
        dataIndex: 'location',
        key: 'location',
        align: 'left',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.LOCATION,
      },
      {
        title: 'Employee Type',
        dataIndex: 'employeeType',
        key: 'employeeType',
        align: 'left',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.EMPLOYEE_TYPE,
      },
      {
        title: 'Original Employee Cost',
        dataIndex: 'originalGrossSalary',
        key: 'originalGrossSalary',
        align: 'left',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.ORIGINAL_EMPLOYEE_COST,
      },
      {
        title: 'Employee Cost VND',
        dataIndex: 'grossSalary',
        key: 'grossSalary',
        align: 'left',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.EMPLOYEE_COST,
        render: text => formatFloatNumber(text),
      },
      {
        title: 'Position',
        dataIndex: 'position',
        key: 'position',
        align: 'left',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.POSITION,
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        align: 'left',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.ROLE,
      },
      // {
      //   title: 'Total',
      //   dataIndex: 'rowTotal',
      //   key: 'rowTotal',
      //   align: 'center',
      //   ellipsis: true,
      //   width: RESOURCE_TABLE_WIDTH.TOTAL,
      //   render: text => {
      //     const content = formatFloatNumber(text, 0, 6) || 0
      //     return (
      //       <span title={content}>{content}</span>
      //     )
      //   },
      // },
    ],
  },
  {
    align: 'center',
    key: 'rowTotal',
    children: [
      {
        title: 'Total',
        key: 'rowTotal',
        dataIndex: 'rowTotal',
        align: 'center',
        ellipsis: true,
        width: RESOURCE_TABLE_WIDTH.TOTAL,
        render: text => (
          <span title={text}>{formatFloatNumber(text, 0, 6)}</span>
        ),
      },
    ],
  },
]
