import { Form, InputNumber, Table } from "antd";
import { Fragment, useMemo } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { KPI_BONUS_ENUMS } from "../../constants";
const StyledInputNumber = styled(InputNumber)`
  .ant-input-number-handler-wrap {
    display: none;
  }
`
const formatter = value => {
  if (value === null) return value
  if (value === '-') return null
  if (value === '') return value
  const res = value.toString().match(/^(\d{1,15}\.\d{0,2}|\d{1,15})/)
  return res ? res[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
}

const KpiBonusBodyItem = Form.create(
)((
  {
    form,
    businessPlanKpiDTO,
    canEdit,
    onChangeKpiBonusInput,
  }
) => {

  const { validation } = useSelector(state => state.businessPlanDetails)

  const {
    getFieldDecorator,
  } = form

  const transformedData = useMemo(
    () => {
      return KPI_BONUS_ENUMS.map(role => ({
        key: role.CONFIG_KEY,
        role: role.FIELD,
        field: role.FIELD === 'PM'
          ? "kpiPm"
          : role.FIELD === 'QA'
            ? "kpiQa"
            : "kpiMember",
        kpi: role.FIELD === 'PM'
          ? businessPlanKpiDTO && businessPlanKpiDTO.kpiPm
          : role.FIELD === 'QA'
            ? businessPlanKpiDTO && businessPlanKpiDTO.kpiQa
            : businessPlanKpiDTO && businessPlanKpiDTO.kpiMember,
      }))
    },
    [businessPlanKpiDTO]
  );

  const columns = [
    {
      title: <div className="text-center w-100">% Bonus</div>,
      colSpan: 2,
      dataIndex: "role",
      key: "role",
      render: text => <div className="text-left w-100">{`${text} (%)`}</div>
    },
    {
      colSpan: 0,
      dataIndex: "kpi",
      key: "kpi",
      align: 'center',
      render: (text, record) => canEdit
        ? (getFieldDecorator(record.field)
          (<div>
            <StyledInputNumber
              defaultValue={record.kpi}
              className={
                `${validation[record.field] && 'input-error'} industry-input-number`
              }
              style={{ width: "100%" }}
              size="small"
              min={0}
              formatter={formatter}
              onChange={value => onChangeKpiBonusInput(value, record.field)}
            />
            {validation[record.field] && (
              <span className="text-danger text-left d-block">
                Please input required field(s)
              </span>
            )}
          </div>
          )
        )
        : (record.kpi !== null && record.kpi !== undefined && record.kpi !== '')
          ? `${record.kpi}`
          : ""
    }
  ]

  return (
    <Fragment>
      <Table
        className="kpi-bonus-table"
        rowKey={record => record.key}
        bordered
        size="small"
        style={{ width: '400px' }}
        columns={columns}
        dataSource={transformedData}
        pagination={false}
      />
    </Fragment>
  );
});

export default KpiBonusBodyItem;