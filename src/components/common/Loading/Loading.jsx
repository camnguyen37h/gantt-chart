import React from 'react'
import { Spin } from 'antd'

import './index.css'

export default function Loading({ loading = false }) {
  return (
    <React.Fragment>
      {loading && (
        <div className="loading-spin">
          <Spin size="large" />
        </div>
      )}
    </React.Fragment>
  )
}
