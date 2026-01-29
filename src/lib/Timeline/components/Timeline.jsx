import { DateFormat } from '../constants/DateFormat'
import { Button, Icon } from 'antd'
import { isObject } from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import { memo, useMemo, useState } from 'react'
import { useTimeline } from '../hooks/useTimeline'
import { ITEM_TYPES } from '../constants'
import { isMilestone } from '../utils/itemUtils'
import { TimelineStyled } from './Timeline.styled'
import TimelineCanvas from './TimelineCanvas'
import TimelineLegend from './TimelineLegend'

const Timeline = memo(
  ({
    items,
    config,
    legendProps,
    headerProps,
    onItemDoubleClick,
    onItemHover,
    className,
  }) => {
    const {
      timelineData,
      layoutItems,
      gridHeight,
      currentDatePosition,
      containerRef,
      getItemStyle,
      scrollToToday,
      hasAutoScrolledRef,
      enableAutoScroll,
      handleZoom,
      config: finalConfig,
      isZooming,
      zoomLevel,
    } = useTimeline(items, config)
    const { typeTimelineMap } = legendProps

    const [activeFilters, setActiveFilters] = useState({
      range: true,
      milestone: true,
    })

    const filteredLayoutItems = useMemo(() => {
      if (!layoutItems) {
        return layoutItems
      }

      return layoutItems.filter(item => {
        const isItemMilestone = isMilestone(item)

        return !(
          (isItemMilestone && !activeFilters.milestone) ||
          (!isItemMilestone && !activeFilters.range)
        )
      })
    }, [layoutItems, activeFilters])

    const toggleFilter = filterType => {
      setActiveFilters(prev => ({
        ...prev,
        [filterType]: !prev[filterType],
      }))
    }

    return (
      <TimelineStyled className={className}>
        <h5 className="timeline-view-title">Schedule / Milestone</h5>
        {isObject(headerProps) &&
          headerProps.projectStart &&
          headerProps.projectEnd && (
            <p
              className="timeline-view-description"
              dangerouslySetInnerHTML={{
                __html: `
              Project timeline from 
              <strong>${moment(headerProps.projectStart).format(
                DateFormat.MM_YYYY
              )}</strong> 
              to <strong>${moment(headerProps.projectEnd).format(
                DateFormat.MM_YYYY
              )}</strong>
            `,
              }}
            />
          )}

        {/* Toolbar - Only Today button */}
        <div className="timeline-toolbar">
          <Button
            onClick={scrollToToday}
            disabled={moment(timelineData.end).isBefore(moment(), 'day')}
            type="default">
            <Icon type="calendar" /> Today
          </Button>
        </div>

        {/* Scrollable Timeline Container */}
        <div className="timeline-content">
          {config.loading ? (
            <div className="timeline-skeleton">
              <div className="skeleton-grid">
                {new Array(5).fill(0).map((_, index) => (
                  <div
                    key={`skeleton-item-${index + 1}`}
                    className={`skeleton-item skeleton-item-${
                      index + 1
                    }`}></div>
                ))}
              </div>

              <div className="skeleton-legend">
                {new Array(5).fill(0).map((_, index) => (
                  <div
                    key={`skeleton-status-${index + 1}`}
                    className="skeleton-status"></div>
                ))}
              </div>
            </div>
          ) : (
            <TimelineCanvas
              containerRef={containerRef}
              timelineData={timelineData}
              layoutItems={filteredLayoutItems}
              gridHeight={gridHeight}
              currentDatePosition={currentDatePosition}
              getItemStyle={getItemStyle}
              rowHeight={finalConfig.rowHeight}
              enableGrid={finalConfig.enableGrid}
              enableCurrentDate={finalConfig.enableCurrentDate}
              onItemDoubleClick={onItemDoubleClick}
              onItemHover={onItemHover}
              loading={config.loading}
              config={finalConfig}
              isZooming={isZooming}
              zoomLevel={zoomLevel}
              scrollToToday={scrollToToday}
              hasAutoScrolledRef={hasAutoScrolledRef}
              enableAutoScroll={enableAutoScroll}
              handleZoom={handleZoom}
              maxZoomLevel={finalConfig.maxZoomLevel}
              minZoomLevel={finalConfig.minZoomLevel}
            />
          )}
        </div>

        {/* Timeline Legend */}
        <div className="timeline-legend-types">
          {typeTimelineMap.includes(ITEM_TYPES.RANGE) && (
            <button
              className={`timeline-legend-type range-time ${
                activeFilters.range ? '' : 'hidden'
              }`}
              onClick={() => toggleFilter('range')}>
              Delivery ticket
            </button>
          )}
          {typeTimelineMap.includes(ITEM_TYPES.MILESTONE) && (
            <button
              className={`timeline-legend-type abnormal ${
                activeFilters.milestone ? '' : 'hidden'
              }`}
              onClick={() => toggleFilter('milestone')}>
              Delivery ticket unable to determine timeframe
            </button>
          )}
        </div>
        <TimelineLegend items={items} {...legendProps} />
      </TimelineStyled>
    )
  }
)

Timeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      startDateBefore: PropTypes.string,
      dueDateBefore: PropTypes.string,
      startDateAfter: PropTypes.string,
      dueDateAfter: PropTypes.string,
      status: PropTypes.string,
    })
  ).isRequired,
  config: PropTypes.shape({
    rowHeight: PropTypes.number,
    itemHeight: PropTypes.number,
    itemPadding: PropTypes.number,
    pixelsPerDay: PropTypes.number,
    enableAutoScroll: PropTypes.bool,
    enableCurrentDate: PropTypes.bool,
    enableGrid: PropTypes.bool,
    loading: PropTypes.bool,
  }),
  legendProps: PropTypes.object,
  headerProps: PropTypes.object,
  onItemDoubleClick: PropTypes.func,
  onItemHover: PropTypes.func,
  className: PropTypes.string,
}

Timeline.defaultProps = {
  legendProps: {},
  headerProps: {},
}

export default Timeline
