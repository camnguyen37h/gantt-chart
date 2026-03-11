import styled from 'styled-components'
import { Select } from 'antd'

const VersionRowWrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &.business-version-tree {
    position: relative;
    cursor: pointer;
    &:not(:first-child) {
      cursor: default;
      padding-left: 52px;
      ::before {
        content: '';
        position: absolute;
        left: 24px;
        top: 0;
        width: 20px;
        height: calc(50% + 1px);
        border-left: 1px solid #d9d9d9;
        border-bottom: 1px solid #d9d9d9;
      }
    }
  }
`

const VersionRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`

export { VersionRowWrapper, VersionRow }
