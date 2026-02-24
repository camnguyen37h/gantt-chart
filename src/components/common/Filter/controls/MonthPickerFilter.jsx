import { DateFormat } from '../../../../lib/constants/DateFormat';
import { DatePicker } from 'antd';
import styled from 'styled-components';

const { MonthPicker } = DatePicker;

const StyledMonthPicker = styled(MonthPicker)`
    width: 100%;
`

function MonthPickerFilter({ value, controlProps, onChange, defaultValue }) {
    function handleChangeMonth(date) {
        onChange(date)
    }

    return (
        <StyledMonthPicker onChange={handleChangeMonth} placeholder={controlProps.placeholder} value={value} dropdownClassName="month-picker-dropdown" format={DateFormat.MM_YYYY} defaultValue={defaultValue} />
    )
}

export default MonthPickerFilter