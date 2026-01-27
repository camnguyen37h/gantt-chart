import { Collapse } from 'antd'
import styled from 'styled-components'

const ProjectChartCollapseStyled = styled(Collapse)`
  .ant-collapse-content > .ant-collapse-content-box {
    padding: 0 !important;
  }

  > .ant-collapse-item {
    border-bottom: none !important;
    > .ant-collapse-header {
      padding-left: 24px !important;
      .ant-collapse-arrow {
        left: 12px !important;
        transform: translate(-50%, -50%) !important;
      }
    }
  }
`

export { ProjectChartCollapseStyled }
