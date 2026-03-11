import { Radio, Tabs } from 'antd'
import styled from 'styled-components'

const { TabPane } = Tabs

const ViewOptionsWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    background: #fafafa;
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
  { label: 'Total', value: 'Total', businessPlanOnly: true },
  { label: 'OB', value: 'OB', businessPlanOnly: true },
  { label: 'Onsite', value: 'Onsite', businessPlanOnly: false },
  { label: 'Offshore', value: 'Offshore', businessPlanOnly: false },
]

const BusinessPlanTabWrapper = ({
    children,
    value,
    onChange,
    activeTab = '1',
    tab,
    ...rest
}) => {
    // Filter options based on active tab
    const visibleOptions = VIEW_OPTIONS.filter(option => {
        if (activeTab === '1') return true // Business Plan - show all
        return !option.businessPlanOnly // Revenue/Delivery - hide Total/OB
    })

    return (
        <TabPane tab={tab} {...rest}>
            <ViewOptionsWrapper>
                <StyledRadioGroup value={value} onChange={onChange} buttonStyle="solid">
                    {visibleOptions.map(option => (
                        <Radio.Button key={option.value} value={option.value}>
                            {option.label}
                        </Radio.Button>
                    ))}
                </StyledRadioGroup>
            </ViewOptionsWrapper>

            {children}
        </TabPane>
    )
}

export default BusinessPlanTabWrapper
