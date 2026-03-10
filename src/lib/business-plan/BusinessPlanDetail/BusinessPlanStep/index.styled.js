import styled from 'styled-components'
import { Select } from 'antd'

const VersionRowWrapper = styled.div`
  display: grid;
  grid-template-rows: ${props => (props.isVisible ? '1fr' : '0fr')};
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  order: ${props => (props.isActive ? -1 : 0)};
`

const VersionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  position: relative;
  min-height: 0;

  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => (props.isVisible ? 1 : 0)};

  ${props =>
    props.isActive
      ? `cursor: pointer; padding-left: 0;`
      : `
    padding-left: 72px;
    &::before {
      content: '';
      position: absolute;
      left: 44px;
      top: 0;
      width: 20px;
      height: calc(50% + 1px);
      border-left: 1px solid #d9d9d9;
      border-bottom: 1px solid #d9d9d9;
    }
  `}
`

export { VersionRowWrapper, VersionRow }
