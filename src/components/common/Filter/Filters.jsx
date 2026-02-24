import { useMergeState } from '../../../hooks'
import { Button, Col, DatePicker, Row, Select, Spin, Tooltip } from 'antd'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import styled from 'styled-components'
import DatePickerWithFooter from './controls/DatePickerWithFooter'
import FiltersTags from './FiltersTags'
import MonthPickerFilter from './controls/MonthPickerFilter'
import InputFilter from './controls/InputFilter'
import DatePickerFilter from './controls/DatePickerFilter'
import CheckBoxFilter from './controls/CheckBoxFilter'

const StyledSelect = styled(Select)`
  ${props => props.fullWidth && ` width: 100%;`}
  min-width: 100px;
`

const StyledFlexWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Filters = forwardRef(
  (
    {
      filterConfig,
      onSearch,
      skipFetch,
      defaultFromStorage,
      showTags = false,
      showDefaultButtons = true,
      extraButton,
      validator,
      layout,
    },
    ref
  ) => {
    useImperativeHandle(
      ref,
      () => {
        return {
          reset(skipSearch) {
            handleReset(skipSearch)
          },
          fitlerValues: filters,
        }
      },
      []
    )

    const [filters, setFilters] = useMergeState({})
    const [labels, setLabels] = useMergeState({})

    const getChildren = element => {
      if (typeof element === 'object') {
        return getChildren(element.props.children)
      }

      return element
    }

    const handleSearch = () => {
      if (validator && !validator(filters)) {
        return
      }
      localStorage.setItem(`${window.location}_filter`, JSON.stringify(filters))
      onSearch(filters)
    }

    const handleReset = skipSearch => {
      const defaultFilters = filterConfig.reduce((res, filter) => {
        res[filter.name] = filter.defaultValue || ''
        if (filter.rangeName) {
          res[filter.rangeName] =
            filter.dateType === 'start'
              ? '>='
              : filter.dateType === 'end'
              ? '<='
              : '='
        }
        return res
      }, {})

      const defaultLabels = filterConfig.reduce((res, filter) => {
        if (filter.defaultValue === undefined) return res
        if (filter.type === 'select') {
          const { defaultValue, options } = filter
          const labels = Array.isArray(defaultValue)
            ? options
                .filter(item => defaultValue.some(val => val === item.value))
                .map(item => ({ label: item.text, value: item.value }))
            : {
                label: options.find(item => item.value === defaultValue).text,
                value: options.find(item => item.value === defaultValue).text,
              }
          res[filter.name] = labels || ''
        }

        return res
      }, {})

      setLabels(defaultLabels)
      setFilters(defaultFilters)
      !skipSearch && onSearch(defaultFilters)
    }

    const handleRemoveTags = (itemField, value, label) => {
      setLabels({
        [itemField]: labels[itemField].filter(item => item.label !== label),
      })
      setFilters({
        [itemField]: filters[itemField].filter(item => item !== value),
      })
    }

    useEffect(() => {
      let filters = {}
      const backToList = localStorage.getItem('backToList')

      const defaultFilters = filterConfig.reduce((res, filter) => {
        res[filter.name] = filter.defaultValue || ''
        if (filter.type === 'date-footer') {
          res[filter.rangeName] =
            filter.dateType === 'start'
              ? '>='
              : filter.dateType === 'end'
              ? '<='
              : '='
        }
        return res
      }, {})

      const defaultLabels = filterConfig.reduce((res, filter) => {
        if (filter.defaultValue === undefined) return res
        if (filter.type === 'select') {
          const { defaultValue, options } = filter
          const labels = Array.isArray(defaultValue)
            ? options
                .filter(item => defaultValue.some(val => val === item.value))
                .map(item => ({ label: item.text, value: item.value }))
            : {
                label: options.find(item => item.value === defaultValue).text,
                value: options.find(item => item.value === defaultValue).text,
              }
          res[filter.name] = labels || ''
        }

        return res
      }, {})

      if (defaultFromStorage && +backToList) {
        const filterFromStorage = localStorage.getItem(
          `${window.location}_filter`
        )
        filters = filterFromStorage
          ? JSON.parse(filterFromStorage)
          : defaultFilters
      } else {
        filters = defaultFilters
        localStorage.setItem(
          `${window.location}_filter`,
          JSON.stringify(defaultFilters)
        )
      }
      setFilters(filters)
      setLabels(defaultLabels)
      !skipFetch && onSearch(filters)
      localStorage.setItem('backToList', 0)
    }, [])

    const renderControl = filterProps => {
      const {
        type,
        name,
        options,
        defaultValue,
        controlProps,
        mode,
        rangeName,
        dateType,
      } = filterProps

      const { loading, ...otherProps } = controlProps
      const onChange = ({ name, value, option, backToDefault }) => {
        if (backToDefault && defaultValue && (!value || value.length === 0)) {
          setFilters({ [name]: defaultValue })
          if (type === 'select' && defaultValue) {
            const labels = Array.isArray(defaultValue)
              ? options
                  .filter(item => defaultValue.some(val => val === item.value))
                  .map(item => ({ label: item.text, value: item.value }))
              : {
                  label: options.find(item => item.value === defaultValue).text,
                  value: options.find(item => item.value === defaultValue).text,
                }
            setLabels({ [name]: labels })
          }
        } else {
          setFilters({ [name]: value })
          if (option) {
            const label = Array.isArray(option)
              ? option.map(item => ({
                  label: getChildren(item),
                  value: item.props.value,
                }))
              : { value: option.props.value, label: getChildren(option) }

            setLabels({ [name]: label })
          }
        }
      }
      const config = {
        // options prop: [{text: 'text', value:'value', id:'id'}]
        select: (
          <StyledSelect
            fullWidth={layout === 'column'}
            defaultValue={defaultValue}
            onChange={(value, option) =>
              onChange({
                name,
                value,
                option,
              })
            }
            value={filters[name] || undefined}
            mode={mode}
            dropdownRender={menu => (
              <Spin spinning={loading || false}>{menu}</Spin>
            )}
            {...otherProps}>
            {options &&
              options.map(item => (
                <Select.Option key={item.id || item.value} value={item.value}>
                  <Tooltip title={item.text} key={item.id || item.value}>
                    {item.text}
                  </Tooltip>
                </Select.Option>
              ))}
          </StyledSelect>
        ),
        'date-footer': (
          <DatePickerWithFooter
            type={dateType}
            onChangeType={value => onChange({ name: rangeName, value })}
            onChange={value => onChange({ name, value })}
            controlProps={controlProps}
            value={filters[name]}
            defaultValue={defaultValue}
          />
        ),
        'month-picker': (
          <MonthPickerFilter
            value={filters[name]}
            onChange={value => onChange({ name, value })}
            controlProps={controlProps}
            defaultValue={defaultValue}
          />
        ),
        'range-picker': (
          <DatePicker.RangePicker
            defaultValue={defaultValue}
            onChange={value => onChange({ name, value, backToDefault: true })}
            value={filters[name]}
            {...otherProps}
          />
        ),
        'input-filter': (
          <InputFilter
            value={filters[name]}
            onChange={value => onChange({ name, value })}
            controlProps={controlProps}
            defaultValue={defaultValue}
          />
        ),
        'date-picker-filter': (
          <DatePickerFilter
            onChange={value => onChange({ name, value })}
            controlProps={controlProps}
            value={filters[name]}
            defaultValue={defaultValue}
          />
        ),
        'checkbox-filter': (
          <CheckBoxFilter
            onChange={value => onChange({ name, value })}
            controlProps={controlProps}
            value={filters[name]}
            defaultValue={defaultValue}
          />
        ),
      }

      return config[type]
    }

    const renderLayoutCol = () => {
      return (
        <Row gutter={[16, 16]} type="flex">
          {filterConfig.map(props => (
            <Col key={props.name} span={4}>
              {renderControl(props)}
            </Col>
          ))}
          <Col
            className='filter-action-buttons'
            span={4}
            push={20 - (filterConfig.length % 6) * 4}
            style={{ textAlign: 'right' }}>
            {showDefaultButtons && (
              <div>
                <Button icon="search" type="primary" onClick={handleSearch} />
                <Button
                  icon="sync"
                  onClick={() => handleReset()}
                  style={{ marginLeft: 12 }}
                />
              </div>
            )}
            {extraButton}
          </Col>
        </Row>
      )
    }

    const renderLayoutFlex = () => {
      return (
        <StyledFlexWrapper>
          {filterConfig.map(props => (
            <div key={props.name}>{renderControl(props)}</div>
          ))}
          <div className="flex-items-center gap-8 ml-auto">
            {showDefaultButtons && (
              <div>
                <Button icon="search" type="primary" onClick={handleSearch} />
                <Button icon="sync" onClick={() => handleReset()} />
              </div>
            )}
            {extraButton}
          </div>
        </StyledFlexWrapper>
      )
    }

    const renderFilters = layout => {
      const layoutConfig = {
        column: renderLayoutCol,
        flex: renderLayoutFlex,
      }

      return layout && layoutConfig[layout]
        ? layoutConfig[layout]()
        : layoutConfig.column()
    }

    return (
      <div className="mb-3">
        {renderFilters(layout)}
        {showTags && (
          <FiltersTags
            dataFields={labels}
            handleRemoveTags={handleRemoveTags}
          />
        )}
      </div>
    )
  }
)

Filters.defaultProps = {
  onSearch: () => {},
  showTags: false,
  layout: 'column',
}

export default Filters
