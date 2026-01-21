import { Col, Row, Select, Radio } from 'antd';
import ReactEcharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { CHART_WORKLOAD_MODES, MODE_CONFIG, MOCK_CHART_DATA, MOCK_MVV_LIST } from './constants';
import { normalizeData } from './utils';
import { getChartOption } from './chartOptions';
import { StyledTitle, ControlsWrapper, ChartWrapper, StyledRadioGroup } from './WorkforceChart.styled';

const { Option } = Select;

const WorkforceChart = ({ projectId }) => {
  const [mvvList, setMvvList] = useState(MOCK_MVV_LIST);
  const [subProjectCode, setSubProjectCode] = useState('All');
  const [mode, setMode] = useState(CHART_WORKLOAD_MODES.HEAD_COUNT);
  const [chartData, setChartData] = useState(MOCK_CHART_DATA);
  const [loading, setLoading] = useState(false);

  const { actualKey, planKey } = useMemo(() => {
    return MODE_CONFIG[mode];
  }, [mode]);

  // Normalize data to fill missing months
  const normalizedChartData = useMemo(() => {
    return normalizeData(chartData, { defaultValue: null });
  }, [chartData]);

  const isAllZero =
    !normalizedChartData.length ||
    normalizedChartData.every(
      val => (val[actualKey] || 0) === 0 && (val[planKey] || 0) === 0
    );

  // Mock fetch - remove API calls
  const fetchMvvByProjectId = async () => {
    setMvvList(MOCK_MVV_LIST);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setChartData(MOCK_CHART_DATA);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMvvByProjectId();
  }, []);

  useEffect(() => {
    fetchData();
  }, [projectId, subProjectCode]);

  const getOption = useMemo(() => {
    return getChartOption({ chartData: normalizedChartData, isAllZero, actualKey, planKey });
  }, [normalizedChartData, isAllZero, actualKey, planKey]);

  return (
    <div>
      <Row type="flex" justify="space-between">
        <Col span={12}>
          <StyledTitle level={4}>Workforce Planning</StyledTitle>
          <p>Actual and Plan</p>
        </Col>
        <Col span={12}>
          <ControlsWrapper>
            <Select
              placeholder="Select MVV"
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              value={subProjectCode}
              onChange={value => {
                setSubProjectCode(value);
              }}>
              <Option value="All">All</Option>
              {mvvList.map(item => (
                <Option key={item.projectCode} value={item.projectCode}>
                  {item.projectCode}
                </Option>
              ))}
            </Select>

            <StyledRadioGroup
              value={mode}
              onChange={e => setMode(e.target.value)}
              className="custom-radio-group">
              {Object.keys(CHART_WORKLOAD_MODES).map(key => (
                <Radio.Button key={key} value={CHART_WORKLOAD_MODES[key]}>
                  {CHART_WORKLOAD_MODES[key]}
                </Radio.Button>
              ))}
            </StyledRadioGroup>
          </ControlsWrapper>
        </Col>
      </Row>

      {loading ? (
        <ChartWrapper>
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999'
          }}>
            Loading...
          </div>
        </ChartWrapper>
      ) : (
        <ChartWrapper>
          <ReactEcharts option={getOption} notMerge={true} lazyUpdate={true} />
        </ChartWrapper>
      )}
    </div>
  );
};

WorkforceChart.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

WorkforceChart.defaultProps = {
  projectId: 'default-project'
};

export default WorkforceChart;
