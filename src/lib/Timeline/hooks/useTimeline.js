import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generatePeriods, getDateRangeFromItems } from '../utils/dateUtils'
import { getItemDate, isMilestone, normalizeItem } from '../utils/itemUtils'
import {
  calculateAdvancedLayout,
  calculateGridHeight,
  filterItems,
} from '../utils/layoutUtils'
import { DEFAULT_CONFIG } from '../constants'

export const useTimeline = (items = [], config = {}) => {
  const [filters] = useState({})
  const [zoomLevel, setZoomLevel] = useState(1)
  const [containerWidth, setContainerWidth] = useState(null)
  const [isZooming, setIsZooming] = useState(false)

  const containerRef = useRef(null)
  const hasAutoScrolledRef = useRef(false)
  const zoomTimeoutRef = useRef(null)
  const zoomRAFRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const updateWidth = () => {
      if (containerRef.current) {
        const widthContainer = containerRef.current.offsetWidth
        setContainerWidth(widthContainer)
      }
    }

    updateWidth()
    const resizeObserver = new ResizeObserver(() => {
      updateWidth()
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const finalConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config]
  )

  const normalizedItems = useMemo(() => {
    const itemCount = items.length
    const result = new Array(itemCount)

    for (let i = 0; i < itemCount; i++) {
      result[i] = normalizeItem(items[i])
    }

    return result
  }, [items])

  // Filter and search items
  const filteredItems = useMemo(() => {
    let result = normalizedItems.filter(item => item._isValid)
    result = filterItems(result, filters)

    return result
  }, [normalizedItems, filters])

  // Calculate date range
  const dateRange = useMemo(() => {
    return getDateRangeFromItems(filteredItems)
  }, [filteredItems])

  const timelineData = useMemo(() => {
    if (!dateRange) {
      return null
    }

    const { start, end } = dateRange
    const totalDays = end.diff(start, 'days', true)

    const zoomedPixelsPerDay = finalConfig.pixelsPerDay * zoomLevel
    let periods = generatePeriods(start, end, zoomedPixelsPerDay)
    let baseWidth = totalDays * zoomedPixelsPerDay
    let scaleFactor = zoomLevel

    const minContainerWidth = containerWidth || 800
    const availableWidth = minContainerWidth - 120

    if (baseWidth < availableWidth && baseWidth > 0) {
      const autoScaleFactor = availableWidth / baseWidth
      scaleFactor = zoomLevel * autoScaleFactor

      const periodCount = periods.length
      const scaledPeriods = new Array(periodCount)

      for (let i = 0; i < periodCount; i++) {
        const period = periods[i]
        scaledPeriods[i] = {
          label: period.label,
          width: period.width * autoScaleFactor,
          days: period.days,
          start: period.start,
          end: period.end,
          type: period.type,
        }
      }

      periods = scaledPeriods
      baseWidth = availableWidth
    }

    const totalWidth = baseWidth + 120

    return {
      start: start,
      end: end,
      totalDays: totalDays,
      totalWidth: totalWidth,
      baseWidth: baseWidth,
      periods: periods,
      pixelsPerDay: finalConfig.pixelsPerDay * scaleFactor,
      scaleFactor: scaleFactor,
    }
  }, [dateRange, finalConfig.pixelsPerDay, containerWidth, zoomLevel])

  const currentDatePosition = useMemo(() => {
    const TIMELINE_CURRENT_DATE_WIDTH = 2
    if (!timelineData) {
      return null
    }

    const now = moment()
    if (now.isBefore(timelineData.start) || now.isAfter(timelineData.end)) {
      return null
    }

    const daysFromStart = now.diff(timelineData.start, 'days')

    return (
      daysFromStart * timelineData.pixelsPerDay -
      TIMELINE_CURRENT_DATE_WIDTH / 2
    )
  }, [timelineData])

  const layoutItems = useMemo(() => {
    if (!filteredItems || filteredItems.length === 0) {
      return []
    }

    return calculateAdvancedLayout(filteredItems)
  }, [filteredItems])

  // Calculate grid height
  const gridHeight = useMemo(() => {
    return calculateGridHeight(layoutItems, finalConfig.rowHeight)
  }, [layoutItems, finalConfig.rowHeight])

  const getItemStyle = useCallback(
    item => {
      if (!timelineData) {
        return {}
      }

      const pixelsPerDay = timelineData.pixelsPerDay

      if (isMilestone(item)) {
        const milestoneDate = getItemDate(item.createdDate)

        if (!milestoneDate) {
          return {}
        }

        const daysFromStart = milestoneDate.diff(
          timelineData.start,
          'days',
          true
        )
        const left = daysFromStart * pixelsPerDay
        const top = item.row * finalConfig.rowHeight + finalConfig.itemPadding

        return {
          left: `${left}px`,
          top: `${top}px`,
        }
      }

      const startDate = getItemDate(item.startDateAfter)
      if (!startDate) {
        return {}
      }

      const dueDate = getItemDate(item.dueDateAfter)
      const daysFromStart = startDate.diff(timelineData.start, 'days', true)
      const duration = dueDate.diff(startDate, 'days', true)

      const left = daysFromStart * pixelsPerDay
      const width = duration * pixelsPerDay
      const top = item.row * finalConfig.rowHeight + finalConfig.itemPadding

      return {
        left: `${left}px`,
        width: `${width}px`,
        top: `${top}px`,
        height: `${finalConfig.itemHeight}px`,
        backgroundColor: item.color,
      }
    },
    [timelineData, finalConfig]
  )

  const scrollToToday = useCallback(() => {
    if (!containerRef.current || currentDatePosition === null) {
      return
    }

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const scrollLeft = currentDatePosition - containerWidth / 2 + 60

    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth',
    })
  }, [currentDatePosition])

  useEffect(() => {
    if (
      !finalConfig.enableAutoScroll ||
      hasAutoScrolledRef.current ||
      !containerRef.current ||
      currentDatePosition === null ||
      !timelineData
    ) {
      return
    }

    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToToday()
        hasAutoScrolledRef.current = true
      })
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [
    timelineData,
    currentDatePosition,
    finalConfig.enableAutoScroll,
    scrollToToday,
  ])

  const zoomIn = useCallback(() => {
    if (zoomLevel >= finalConfig.maxZoomLevel) {
      return
    }

    if (zoomRAFRef.current) {
      cancelAnimationFrame(zoomRAFRef.current)
    }

    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current)
    }

    setIsZooming(true)

    zoomRAFRef.current = requestAnimationFrame(() => {
      setZoomLevel(prev => {
        const newZoom = Math.min(prev * 1.15, finalConfig.maxZoomLevel)
        return Math.round(newZoom * 100) / 100
      })

      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current)
      }
      zoomTimeoutRef.current = setTimeout(() => {
        setIsZooming(false)
        zoomTimeoutRef.current = null
      }, 150)
    })
  }, [finalConfig.maxZoomLevel, zoomLevel])

  const zoomOut = useCallback(() => {
    if (zoomLevel <= finalConfig.minZoomLevel) {
      return
    }

    if (zoomRAFRef.current) {
      cancelAnimationFrame(zoomRAFRef.current)
    }

    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current)
    }

    setIsZooming(true)

    zoomRAFRef.current = requestAnimationFrame(() => {
      setZoomLevel(prev => {
        const newZoom = Math.max(prev / 1.15, finalConfig.minZoomLevel)
        return Math.round(newZoom * 100) / 100
      })

      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current)
      }
      zoomTimeoutRef.current = setTimeout(() => {
        setIsZooming(false)
        zoomTimeoutRef.current = null
      }, 150)
    })
  }, [finalConfig.minZoomLevel, zoomLevel])

  const resetZoom = useCallback(() => {
    if (zoomRAFRef.current) {
      cancelAnimationFrame(zoomRAFRef.current)
    }

    setIsZooming(true)
    setZoomLevel(1)

    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current)
    }
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZooming(false)
    }, 150)
  }, [])

  const handleZoom = useCallback(
    direction => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current)
      }

      if (direction > 0) {
        zoomIn()
      } else {
        zoomOut()
      }

      zoomTimeoutRef.current = setTimeout(() => {
        zoomTimeoutRef.current = null
      }, 50)
    },
    [zoomIn, zoomOut]
  )

  useEffect(() => {
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current)
      }
      if (zoomRAFRef.current) {
        cancelAnimationFrame(zoomRAFRef.current)
      }
    }
  }, [])

  return {
    zoomLevel,
    isZooming,
    timelineData,
    layoutItems,
    gridHeight,
    currentDatePosition,
    containerRef,
    getItemStyle,
    scrollToToday,
    zoomIn,
    zoomOut,
    resetZoom,
    handleZoom,
    config: finalConfig,
  }
}

export default useTimeline
