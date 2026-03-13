import { Modal, Select } from 'antd'
import { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CONFIRM_MODAL_CHANGE_DEPARTMENT } from '../../constants'
import {
  getLocationExchangeRate,
  getSummaryDeliveryPlan,
  getSummaryRevenuePlan,
  resetSaveDeliveryPlanParams,
  resetSummaryDeliveryPlan,
  resetSummaryRevenuePlan,
  setDeliveryUnitDataDelivery,
  setDeliveryUnitDataRevenue,
  setDuValueDelivery,
  setDuValueRevenue,
  setLoadDataFromValue,
} from '../../redux'
const { Option } = Select

const ALL_OPTION_VALUE = ''

const BusinessPlanDropdownDu = memo(
  ({ buId, dataDU, duValue, updateIsSaveConfirmShowed, showAllOption }) => {
    const { listDUDelivery } = useSelector(state => state.businessPlanDelivery)
    const { listDuRevenue } = useSelector(state => state.businessPlanRevenue)
    const { activePanel } = useSelector(state => state.businessPlanDetails)
    const isSaveShowed = useSelector(
      state => state.businessPlanRevenue.isSaveConfirmShowed
    )
    const isSaveShowedDeliveryPlan = useSelector(
      state => state.businessPlanDelivery.isSaveShowedDeliveryPlan
    )
    const dispatch = useDispatch()

    const handleChange = (value, type) => {
      let findDu

      dispatch(resetSummaryDeliveryPlan())
      dispatch(resetSummaryRevenuePlan())

      switch (type) {
        case 'Revenue':
          findDu = listDuRevenue.find(item => item.groupId === value)

          dispatch(setDuValueRevenue(value))
          dispatch(setDeliveryUnitDataRevenue(findDu))
          dispatch(
            getSummaryRevenuePlan({
              businessPlanVersionId: buId,
              duSelected: { ...findDu, groupId: parseInt(findDu.groupId) },
            })
          )
          break
        case 'Delivery':
          findDu = listDUDelivery.find(item => item.groupId === value) || null

          dispatch(resetSaveDeliveryPlanParams())
          dispatch(setDuValueDelivery(value))
          dispatch(setDeliveryUnitDataDelivery(findDu))
          if (findDu) {
            dispatch(
              getLocationExchangeRate({
                businessPlanVersionId: buId,
                deliveryUnit: findDu.groupName,
              })
            )
          }
          dispatch(
            getSummaryDeliveryPlan({
              businessPlanVersionId: buId,
              groupId: value,
            })
          )
          break
        default:
          break
      }
    }

    const handleSelectChange = value => {
      if (isSaveShowed || isSaveShowedDeliveryPlan) {
        Modal.confirm({
          title: CONFIRM_MODAL_CHANGE_DEPARTMENT.TITLE,
          content: CONFIRM_MODAL_CHANGE_DEPARTMENT.CONTENT,
          okText: 'Yes',
          cancelText: 'No',
          onOk: () => {
            handleChange(value, activePanel)
            updateIsSaveConfirmShowed(false)
          },
        })
      } else {
        handleChange(value, activePanel)
      }
    }

    const options = [
      ...(showAllOption ? [{ groupId: ALL_OPTION_VALUE, groupName: 'All' }] : []),
      ...dataDU,
    ]

    return (
      <Select
        placeholder={'Select a delivery unit'}
        style={{ width: 200, float: 'right' }}
        value={duValue}
        onChange={value => handleSelectChange(value)}>
        {options.map(item => (
          <Option key={item.groupId || 'all'} value={item.groupId}>
            {item.groupId === ALL_OPTION_VALUE
              ? 'All'
              : `${item.groupName} - ${item.groupSale ? 'Sales' : 'Delivery'}`}
          </Option>
        ))}
      </Select>
    )
  }
)

export default BusinessPlanDropdownDu
