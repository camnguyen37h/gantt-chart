import { DateFormat } from '../constants/DateFormat'
import moment from 'moment'
import PropTypes from 'prop-types'
import { memo, useCallback, useEffect, useRef } from 'react'
import { handleCanvasEvents } from '../utils/canvasEventHandler'
import { drawTimeline } from '../utils/canvasRenderer'
import { TimelineCanvasStyled } from './TimelineCanvas.styled'

const TimelineCanvas = ({
  containerRef: externalContainerRef,
  timelineData,
  layoutItems,
  gridHeight,
  currentDatePosition,
  getItemStyle,
  rowHeight,
  enableGrid,
  enableCurrentDate,
  onItemHover,
  loading,
  config,
  isZooming,
  zoomLevel,
  scrollToToday,
  hasAutoScrolledRef,
  enableAutoScroll,
  handleZoom,
  maxZoomLevel,
  minZoomLevel,
}) => {
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const internalContainerRef = useRef(null)
  const tooltipRef = useRef(null)
  const animationFrameRef = useRef(null)
  const hoveredItemRef = useRef(null)
  const animationProgressRef = useRef(0)
  const animationStartTimeRef = useRef(null)
  const dprRef = useRef(1)
  const H_PADDING = 60

  // Use external containerRef if provided, otherwise use internal
  const containerRef = externalContainerRef || internalContainerRef

  // Ensure containerRef is set after component mounts
  useEffect(() => {
    // This forces a re-render/update after the ref is assigned
    if (externalContainerRef && !externalContainerRef.current && internalContainerRef.current) {
      externalContainerRef.current = internalContainerRef.current
    }
  }, [])

  // Drag to scroll state
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartYRef = useRef(0)
  const scrollLeftStartRef = useRef(0)
  const scrollTopStartRef = useRef(0)

  // Calculate canvas dimensions
  const canvasWidth =
    timelineData && timelineData.totalWidth ? timelineData.totalWidth : 1000
  const canvasHeight = Math.max(gridHeight, 450)

  // Notify when container is mounted and ready
  useEffect(() => {
    if (containerRef.current && currentDatePosition !== null && timelineData) {
      // Trigger a small delay to ensure container is fully rendered
      const timer = setTimeout(() => {
        // Force a re-check by touching containerRef
        if (containerRef.current) {
          containerRef.current.dataset.ready = 'true'
        }
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [containerRef, currentDatePosition, timelineData])

  // Draw timeline on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawTimeline(ctx, {
      timelineData,
      layoutItems,
      currentDatePosition,
      getItemStyle,
      rowHeight,
      enableGrid,
      enableCurrentDate,
      config,
      dpr: dprRef.current,
      hoveredItem: hoveredItemRef.current,
      animationProgress: animationProgressRef.current,
      isZooming: isZooming,
      zoomLevel: zoomLevel,
      horizontalPadding: H_PADDING,
    })
  }, [
    timelineData,
    layoutItems,
    currentDatePosition,
    getItemStyle,
    rowHeight,
    enableGrid,
    enableCurrentDate,
    config,
    isZooming,
    zoomLevel,
  ])

  // Get DPR from canvas context
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const backingStoreRatio =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1

    dprRef.current = Math.max(1, 1 / backingStoreRatio)

    canvas.width = canvasWidth * dprRef.current
    canvas.height = canvasHeight * dprRef.current
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`

    ctx.scale(dprRef.current, dprRef.current)

    if (animationProgressRef.current === 1) {
      draw()
    }
  }, [canvasWidth, canvasHeight, draw])

  // Animation effect: triggers on data change
  useEffect(() => {
    if (loading) {
      return
    }

    if (isZooming) {
      animationProgressRef.current = 1
      draw()
      return
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    animationStartTimeRef.current = Date.now()
    animationProgressRef.current = 0

    const animate = () => {
      const elapsed = Date.now() - animationStartTimeRef.current
      const duration = 300

      if (elapsed < duration) {
        const progress = elapsed / duration
        animationProgressRef.current = 1 - Math.pow(1 - progress, 3)
        draw()
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        animationProgressRef.current = 1
        draw()
        animationFrameRef.current = null
        
        // Trigger auto scroll after animation completes
        if (enableAutoScroll && !hasAutoScrolledRef.current && scrollToToday && containerRef.current) {
          requestAnimationFrame(() => {
            scrollToToday()
            hasAutoScrolledRef.current = true
          })
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [timelineData, layoutItems, loading, draw, isZooming, enableAutoScroll, scrollToToday, hasAutoScrolledRef, containerRef])

  // Handle canvas events
  useEffect(() => {
    const overlay = overlayRef.current
    const container = containerRef.current
    if (!overlay || !container) return

    const tooltip = tooltipRef.current

    return handleCanvasEvents({
      overlay,
      container,
      tooltip,
      layoutItems,
      getItemStyle,
      horizontalPadding: H_PADDING,
      isDraggingRef,
      dragStartXRef,
      dragStartYRef,
      scrollLeftStartRef,
      scrollTopStartRef,
      handleZoom,
      zoomLevel,
      maxZoomLevel,
      minZoomLevel,
      onItemHover: item => {
        if (!isDraggingRef.current) {
          hoveredItemRef.current = item
          draw()
          if (onItemHover) {
            onItemHover(item)
          }
        }
      },
      onMouseLeave: () => {
        if (hoveredItemRef.current) {
          hoveredItemRef.current = null
          draw()
        }
      },
      onScrollStart: () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
          return
        }
        animationProgressRef.current = 1
        draw()
      },
    })
  }, [layoutItems, getItemStyle, onItemHover, draw])

  return (
    <TimelineCanvasStyled
      ref={containerRef}
      className={`timeline-canvas-container ${
        loading ? 'timeline-loading' : 'timeline-loaded'
      }`}>
      {timelineData && (
        <div>
          <div className="timeline-canvas-wrapper">
            <canvas ref={canvasRef} className="timeline-canvas" />

            <div
              ref={overlayRef}
              className="timeline-canvas-overlay"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
              }}
            />

            <div
              ref={tooltipRef}
              className="timeline-canvas-tooltip"
              style={{ display: 'none', opacity: 0 }}>
              <div className="timeline-canvas-tooltip-content">
                <div className="tooltip-title"></div>
                <div className="tooltip-details"></div>
              </div>
            </div>

            {enableCurrentDate && currentDatePosition !== null && (
              <div
                className="timeline-current-date"
                style={{ left: `${currentDatePosition + H_PADDING}px` }}>
                <div className="current-date-marker" />
                <div className="current-date-label">
                  {moment().format(DateFormat.DD_MM_YYYY)}
                </div>
              </div>
            )}
          </div>

          {timelineData && timelineData.periods && (
            <div
              className="timeline-header"
              style={{
                width: `${timelineData.baseWidth}px`,
                marginLeft: `${H_PADDING}px`,
              }}>
              <div className="timeline-axis-line" />

              {timelineData.periods &&
                timelineData.periods.map((period, index) => (
                  <div
                    key={period.label}
                    className="timeline-period"
                    style={{ width: `${period.width}px` }}>
                    <div className="timeline-tick-mark" />
                    <div className="period-label-border">{period.label}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </TimelineCanvasStyled>
  )
}

TimelineCanvas.propTypes = {
  containerRef: PropTypes.object,
  timelineData: PropTypes.object,
  layoutItems: PropTypes.array.isRequired,
  gridHeight: PropTypes.number.isRequired,
  currentDatePosition: PropTypes.number,
  getItemStyle: PropTypes.func.isRequired,
  rowHeight: PropTypes.number.isRequired,
  enableGrid: PropTypes.bool,
  enableCurrentDate: PropTypes.bool,
  onItemHover: PropTypes.func,
  loading: PropTypes.bool,
  config: PropTypes.object,
  isZooming: PropTypes.bool,
  zoomLevel: PropTypes.number,
  scrollToToday: PropTypes.func,
  hasAutoScrolledRef: PropTypes.object,
  enableAutoScroll: PropTypes.bool,
  handleZoom: PropTypes.func,
  maxZoomLevel: PropTypes.number,
  minZoomLevel: PropTypes.number,
}

TimelineCanvas.defaultProps = {
  enableGrid: true,
  enableCurrentDate: true,
  loading: false,
}

export default memo(TimelineCanvas)
