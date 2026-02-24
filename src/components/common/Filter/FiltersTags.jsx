import { Tag } from 'antd'
import React from 'react'

function FiltersTags({ dataFields, handleRemoveTags }) {
  const listKeyField = Object.keys(dataFields)

  const handleCloseTag = (itemField, value, label) => {
    handleRemoveTags(itemField, value, label)
  }
  let countNumber = 0
  
  return (
    <div className="filters-tags">
      {listKeyField.map(itemField => {
        return (
          dataFields[itemField] &&
          Array.isArray(dataFields[itemField]) &&
          dataFields[itemField].map((item, index) => {
            countNumber++
            return (
              <Tag
                closable
                key={item.value}
                className={
                  countNumber % 2 === 0
                    ? 'custom-success-tag'
                    : 'custom-warning-tag'
                }
                onClose={e =>
                  handleCloseTag(itemField, item.value, item.label)
                }>
                {item.label}
              </Tag>
            )
          })
        )
      })}
    </div>
  )
}

export default FiltersTags
