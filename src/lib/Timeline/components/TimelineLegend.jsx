import { isEmpty } from 'lodash'
import PropTypes from 'prop-types'
import { memo } from 'react'
import { getStatusColor } from '../utils/itemUtils'
import { TimelineLegendStyled } from './TimelineLegend.styled'

const TimelineLegend = memo(
  ({ statusColorMap = {}, visibleStatuses = {}, onStatusToggle }) => {
    const handleStatusClick = status => {
      if (onStatusToggle) {
        onStatusToggle(status)
      }
    }

    return (
      <TimelineLegendStyled
        style={
          isEmpty(statusColorMap) ? { minHeight: 0, padding: 0 } : undefined
        }>
        {!isEmpty(statusColorMap) &&
          Object.entries(statusColorMap).map(([status]) => {
            const isVisible = visibleStatuses[status] !== false
            const color = getStatusColor(status)

            return (
              <button
                key={`status-${status}`}
                className={`timeline-legend-item ${!isVisible ? 'hidden' : ''}`}
                onClick={() => handleStatusClick(status)}>
                <span
                  className="timeline-legend-color"
                  style={{ backgroundColor: color }}
                />
                <span className="timeline-legend-label">{status}</span>
              </button>
            )
          })}
      </TimelineLegendStyled>
    )
  }
)

TimelineLegend.propTypes = {
  statuses: PropTypes.arrayOf(PropTypes.string),
  statusColorMap: PropTypes.object,
  visibleStatuses: PropTypes.object,
  onStatusToggle: PropTypes.func,
}

export default TimelineLegend
