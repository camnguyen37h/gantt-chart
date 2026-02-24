const useBusinessPlanRevenue = (listRevenueInvalid, dataSourceTable) => {
  const invalidKeys = new Set(listRevenueInvalid.map(item => item.key))
  const dataSourceValidation = dataSourceTable.map(item => {
    const dataChildrenValidation = item.children.map(child => {
      if (invalidKeys.has(child.key)) {
        return {
          ...child,
          revenueName: {
            ...child.revenueName,
            props: {
              ...child.revenueName.props,
              className: 'input-error',
            },
          },
        }
      } else {
        return {
          ...child,
          revenueName: {
            ...child.revenueName,
            props: {
              ...child.revenueName.props,
              className: '',
            },
          },
        }
      }
    })

    return {
      ...item,
      children: dataChildrenValidation,
    }
  })

  return { dataSourceValidation }
}

export default useBusinessPlanRevenue
