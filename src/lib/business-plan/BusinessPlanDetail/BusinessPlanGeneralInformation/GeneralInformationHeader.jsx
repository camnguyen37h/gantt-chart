import React from 'react'
import { Icon } from 'antd'

function GeneralInformationHeader({ component, title, required }) {
  return (
    <div className="general-information-header">
      <Icon component={component} className="header-icon" />
      <span className="header-title">{title}</span>
      {required && (
        <span className="text-danger" style={{ fontSize: 16 }}>
          *
        </span>
      )}
    </div>
  )
}

export default GeneralInformationHeader
