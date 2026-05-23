import { Icon, InputNumber } from "antd"
import styled from "styled-components"

export const StyledInputNumber = styled(InputNumber)`
  .ant-input-number-handler-wrap {
    display: none;
  }
  .ant-input-number-input {
    text-align: center;
  }
`

export const StyledWarningDiv = styled.div`
  background-color: #e5d166;
  width: 100%;
  height: 100%;
  line-height: 50px;
  position: relative;
  z-index: 1;
  cursor: default;
`
export const StyledDisabledIcon = styled(Icon)`
  svg {
    color: #d9d9d9;
    cursor: not-allowed;
  }
`

export const StyledAffix = styled.div`
  position: fixed;
  bottom: 0;
  background: #ffffff;
  width: calc(100% - 280px);
  transition: transform 1s;
  transform: translateY(100%);
  z-index: 99;
  left: 240px;
  &.active {
    transform: translateY(0);
  }

  .sidebar-collapsed & {
    width: calc(100% - 180px);
    left: 140px;
  }

  .affix-content {
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > span {
      color: var(--primary-blue);
    }
  }
`

export const StyledPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: calc(100% + 16px) !important;
`