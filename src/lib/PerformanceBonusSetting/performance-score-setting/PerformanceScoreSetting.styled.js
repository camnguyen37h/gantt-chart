import { Icon, InputNumber, Table } from 'antd'
import styled from 'styled-components'

const Wrapper = styled.div`
  .parent-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }

  .ant-table {
    .ant-table-header {
      background-color: transparent;
    }
  }

  .ant-table-tbody tr > td {
    white-space: break-spaces;
    word-break: break-word;
  }
`

const StyledInputNumber = styled(InputNumber)`
  .ant-input-number-handler-wrap {
    display: none;
  }
`

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    font-size: 14px;
    line-height: 1.2;
  }
  .ant-table-tbody > tr > td {
    vertical-align: middle;
    border-bottom: none !important;
  }
`

const ScoreHeader = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

const ScoreCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PlusIcon = styled(Icon).attrs({ type: 'plus-circle' })`
  width: 14px;
  height: 14px;
  font-size: 14px;
  line-height: 14px;
  color: #1890ff;
  cursor: pointer;
  flex: 0 0 auto;

  &:hover {
    color: #40a9ff;
  }
`

const MinusIcon = styled(Icon).attrs({ type: 'minus-circle' })`
  width: 14px;
  height: 14px;
  font-size: 14px;
  line-height: 14px;
  cursor: pointer;
  color: ${p => (p.disabled ? '#d9d9d9' : '#ff4d4f')};
  flex: 0 0 auto;
  pointer-events: ${p => (p.disabled ? 'none' : 'auto')};

  &:hover {
    color: ${p => (p.disabled ? '#d9d9d9' : '#ff7875')};
  }
`

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
`

const PanelHeaderTitle = styled.span`
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export {
  Wrapper,
  StyledInputNumber,
  StyledTable,
  ScoreHeader,
  ScoreCell,
  PlusIcon,
  MinusIcon,
  PanelHeader,
  PanelHeaderTitle,
}
