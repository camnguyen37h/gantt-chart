import { useMergeState } from '../../../../hooks'
import {
  Button,
  Collapse,
  Dropdown,
  Form,
  Icon,
  Menu,
  Select,
  Spin,
  Tooltip,
  TreeSelect,
} from 'antd'
import {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import DatePickerWithFooter from '../../../../components/common/Filter/controls/DatePickerWithFooter'
import MonthPickerFilter from '../../../../components/common/Filter/controls/MonthPickerFilter'
import debounce from 'lodash/debounce'
import styled from 'styled-components'

const { Panel } = Collapse
const { SHOW_PARENT } = TreeSelect
const { Option } = Select
const customPanelStyle = {
  borderRadius: '8px',
  border: '1px solid #E3E3E3',
  marginBottom: 10,
}

const StyledSelect = styled(Select)`
  ${props => props.fullWidth && ` width: 100%;`}
  min-width: 100px;
`

const StyledCollapse = styled(Collapse)`
  .ant-collapse-content {
    overflow: unset;
  }
`

const FilterBusinessPlan = forwardRef(
  (
    {
      filterConfig,
      onSearch,
      skipFetch,
      defaultFromStorage,
      validator,
      form,
      clearInvalidData,
      resetFilterConfigOption,
    },
    ref
  ) => {
    const [filters, setFilters] = useMergeState({})
    const [labels, setLabels] = useMergeState({})
    const [activePanel, setActivePanel] = useState(
      filterConfig.map(item => item.name)
    )
    const [filterOption, setFilterOption] = useState([])
    const isFirstTimeRender = useRef(true)

    const selectedFilters = useMemo(
      () => filterConfig.filter(item => filterOption.includes(item.name)),
      [filterOption, filterConfig]
    )

    const { getFieldDecorator, setFieldsValue } = form
    useImperativeHandle(
      ref,
      () => {
        return {
          setFilterOption,
          setFilters,
          filterOption,
          fitlerValues: filters,
          form,
        }
      },
      []
    )

    const handleSelectAllTree = (name, data) => {
      const allData = data.map(item => item.value)
      const allChildren = data
        .map(item =>
          item.children ? item.children.map(child => child.value) : item.value
        )
        .flatten()
      setFieldsValue({ [name]: allData })
      setFilters({ [name]: allChildren })
    }

    const handleClearAllTree = name => {
      setFilters({ [name]: [] })
      setFieldsValue({ [name]: [] })
    }

    const handleDeleteFilter = filter => {
      setFilterOption(filterOption.filter(name => name !== filter.name))
      const temp = { ...filters }
      delete temp[filter.name]
      setFilters(temp, true)
    }

    const getChildren = element => {
      if (typeof element === 'object') {
        return getChildren(element.props.children)
      }
      return element
    }

    const handleSearch = () => {
      localStorage.setItem(`${window.location}_filter`, JSON.stringify(filters))
      setFieldsValue(filters)
      onSearch(filters)
    }

    const onChange = useMemo(
      () =>
        debounce(({ name, value, option }) => {
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
        }, 400),
      [filters]
    )

    const filterTreeNode = (inputValue, treeNode) => {
      const title = treeNode.props.title
      if (title) {
        return title.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
      }
      return false
    }

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
      const { loading, className, ...otherProps } = controlProps || {}

      const config = {
        // options prop: [{text: 'text', value:'value', id:'id'}]
        select: (
          <StyledSelect
            showSearch
            optionFilterProp="title"
            className={`${name}-select`}
            allowClear
            fullWidth
            onChange={(value, option) =>
              onChange({
                name,
                value,
                option,
              })
            }
            mode={mode}
            dropdownRender={menu => (
              <Spin spinning={loading || false}>{menu}</Spin>
            )}
            {...otherProps}>
            {options &&
              options.map(item => (
                <Select.Option
                  title={item.text}
                  key={item.id || item.value}
                  value={item.value}>
                  <Tooltip title={item.text} key={item.id || item.value}>
                    {item.text}
                  </Tooltip>
                </Select.Option>
              ))}
          </StyledSelect>
        ),
        // options prop: [{text: 'text', value:'value', key: 'key', children: [{text: 'text', value:'value', key: 'key'}]}]
        'tree-select': (
          <TreeSelect
            treeData={options}
            onChange={value => {
              const getChildValue = value.reduce((arr, item) => {
                const parent = options.find(opt => opt.value === item)
                return [
                  ...arr,
                  ...(parent
                    ? parent.children.map(item => item.value)
                    : [item]),
                ]
              }, [])
              onChange({ name, value: getChildValue })
            }}
            treeCheckable={true}
            showCheckedStrategy={SHOW_PARENT}
            filterTreeNode={filterTreeNode}
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: '150px' }}
            {...otherProps}></TreeSelect>
        ),
        'date-footer': (
          <DatePickerWithFooter
            type={dateType}
            onChangeType={value => onChange({ name: rangeName, value })}
            onChange={value => onChange({ name, value })}
            controlProps={controlProps}
            value={filters[name]}
          />
        ),
        'month-picker': (
          <MonthPickerFilter
            value={filters[name]}
            onChange={value => onChange({ name, value })}
            controlProps={controlProps}
          />
        ),
      }

      return config[type]
    }

    const onChangeCollapse = key => {
      setActivePanel(key)
    }

    const onSelectFilterOption = value => {
      const filterSelected = filterConfig.find(item => item.name === value)
      if (filterSelected && !filterOption.some(item => item.name === value)) {
        setFilterOption([...filterOption, filterSelected.name])
      }
    }

    const genExtraHeaderAction = props => {
      return (
        <div className="flex-items-center gap-8">
          {activePanel.includes(props.name) && props.type === 'tree-select' ? (
            <div
              className="flex-items-center gap-8"
              style={{ fontWeight: 600, color: '#215EFA' }}>
              <span
                onClick={e => {
                  e.stopPropagation()
                  handleSelectAllTree(props.name, props.options)
                }}>
                Select all
              </span>
              <span
                onClick={e => {
                  e.stopPropagation()
                  handleClearAllTree(props.name)
                }}>
                Clear all
              </span>
            </div>
          ) : null}
          <span
            onClick={e => {
              e.stopPropagation()
              handleDeleteFilter(props)
            }}>
            <Icon type="delete" style={{ fontSize: 16 }} />
          </span>
        </div>
      )
    }

    useEffect(() => {
      if (isFirstTimeRender.current) {
        isFirstTimeRender.current = false
        let filters = {}
        const backToList = localStorage.getItem('backToList')

        const defaultFilters = filterConfig.reduce((res, filter) => {
          if (filter.defaultValue === undefined) return res
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
      } else {
        handleSearch()
      }
    }, [filters])

    return (
      <Fragment>
        <Dropdown
          overlay={
            <Menu style={{ width: '350px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  padding: '10px',
                }}
                onClick={event => event.stopPropagation()}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>
                  <Select
                    showSearch
                    style={{
                      width: '100%',
                      border: '1px solid #E3E3E3',
                      borderRadius: '8px',
                    }}
                    value={undefined}
                    placeholder="Search Filter"
                    optionFilterProp="children"
                    showArrow={false}
                    onSelect={onSelectFilterOption}
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }>
                    {filterConfig
                      .filter(
                        item => !filterOption.some(name => name === item.name)
                      )
                      .map(props => (
                        <Option value={props.name}>{props.title}</Option>
                      ))}
                  </Select>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <img src="/img/filter-icon.svg" alt="filter" />
                    <span>Filter in this view ({selectedFilters.length})</span>
                  </div>
                </div>
                <Form>
                  <StyledCollapse
                    activeKey={activePanel}
                    onChange={onChangeCollapse}
                    bordered={false}
                    style={{ backgroundColor: '#FFFFFF' }}
                    expandIconPosition={'right'}>
                    {selectedFilters.length > 0 &&
                      selectedFilters.map(props => (
                        <Panel
                          header={props.title}
                          extra={genExtraHeaderAction(props)}
                          key={props.name}
                          style={customPanelStyle}>
                          <Form.Item name={props.name}>
                            {getFieldDecorator(props.name, {
                              initialValue: props.defaultValue,
                            })(renderControl(props))}
                          </Form.Item>
                        </Panel>
                      ))}
                  </StyledCollapse>
                </Form>
              </div>
            </Menu>
          }
          trigger={['click']}>
          <Button
            style={{
              width: '250',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onClick={e => e.preventDefault()}>
            {filterOption.length ? (
              <div
                style={{
                  backgroundColor: '#84abdb',
                  width: '16px',
                }}>
                {filterOption.length}
              </div>
            ) : null}
            Filter
            <Icon type="down" />
          </Button>
        </Dropdown>
      </Fragment>
    )
  }
)

const WrappedFilterBusinessPlan = Form.create()(FilterBusinessPlan)

const ForwardedFilterBusinessPlan = forwardRef((props, ref) => (
  <WrappedFilterBusinessPlan {...props} wrappedComponentRef={ref} />
))

export default ForwardedFilterBusinessPlan
