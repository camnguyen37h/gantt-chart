import styled from 'styled-components';
import { Radio, Typography } from 'antd';

const { Title } = Typography;

export const StyledTitle = styled(Title)`
  &.ant-typography {
    margin-bottom: 0 !important;
  }
`;

export const ControlsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  gap: 8px;

  .ant-select {
    width: 200px;
  }
`;

export const ChartWrapper = styled.div`
  width: 100%;
  height: 500px;
  margin: 20px auto;

  /* Override echarts container default styles */
  & > div {
    height: 100% !important;
    width: 100% !important;
  }
`;

export const StyledRadioGroup = styled(Radio.Group)`
  &.custom-radio-group {
    .ant-radio-button-wrapper {
      border-left: 1px solid #d9d9d9 !important;
      border-radius: 8px !important;
      margin-right: 8px;
      border-right-width: 1px !important;
    }

    .ant-radio-button-wrapper:first-child {
      border-top-left-radius: 8px !important;
      border-bottom-left-radius: 8px !important;
    }

    .ant-radio-button-wrapper:last-child {
      border-top-right-radius: 8px !important;
      border-bottom-right-radius: 8px !important;
    }

    .ant-radio-button-wrapper:not(:first-child)::before {
      display: none !important;
    }

    .ant-radio-button-wrapper:not(.ant-radio-button-checked) {
      background-color: #fff;
      color: rgba(0, 0, 0, 0.65);
    }

    .ant-radio-button-wrapper-checked {
      background-color: #ff9900 !important;
      border-color: #ff9900 !important;
      color: white !important;
      box-shadow: none !important;
    }
  }
`;
