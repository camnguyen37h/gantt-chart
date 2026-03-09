import { Radio } from 'antd'
import styled from 'styled-components'

const ViewOptionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #d9d9d9;
  margin-bottom: 16px;
  
  .label {
    font-weight: 500;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
  }
`

const StyledRadioGroup = styled(Radio.Group)`
  .ant-radio-button-wrapper {
    padding: 0 20px;
    height: 32px;
    line-height: 30px;
    
    &.ant-radio-button-wrapper-checked {
      background: #1890ff;
      border-color: #1890ff;
      color: #fff;
      
      &:hover {
        background: #40a9ff;
        border-color: #40a9ff;
      }
    }
  }
`

const VIEW_OPTIONS = [
  { label: 'Total', value: 'TOTAL', businessPlanOnly: true },
  { label: 'OB', value: 'OB', businessPlanOnly: true },
  { label: 'Onsite', value: 'ONSITE', businessPlanOnly: false },
  { label: 'Offshore', value: 'OFFSHORE', businessPlanOnly: false }
]

function BusinessPlanViewOptions({ value = 'TOTAL', onChange, activeTab = '1' }) {
  // Filter options based on active tab
  // Business Plan tab (key="1"): Show all options
  // Revenue/Delivery Plan tabs (key="2"/"3"): Hide Total/OB
  const visibleOptions = VIEW_OPTIONS.filter(option => {
    if (activeTab === '1') return true // Business Plan - show all
    return !option.businessPlanOnly // Revenue/Delivery - hide Total/OB
  })

  return (
    <ViewOptionsWrapper>
      <span className="label">View by:</span>
      <StyledRadioGroup
        value={value}
        onChange={onChange}
        buttonStyle="solid">
        {visibleOptions.map(option => (
          <Radio.Button key={option.value} value={option.value}>
            {option.label}
          </Radio.Button>
        ))}
      </StyledRadioGroup>
    </ViewOptionsWrapper>
  )
}

export default BusinessPlanViewOptions
