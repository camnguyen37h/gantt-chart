import { DateFormat } from '../constants/DateFormat'
import moment from 'moment'
import PropTypes from 'prop-types'
import { memo, useCallback, useEffect, useRef } from 'react'
import { handleCanvasEvents } from '../utils/canvasEventHandler'
import { drawTimeline } from '../utils/canvasRenderer'
import { TimelineCanvasStyled } from './TimelineCanvas.styled'

const TimelineCanvas = ({
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
}) => {
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const containerRef = useRef(null)
  const tooltipRef = useRef(null)
  const animationFrameRef = useRef(null)
  const hoveredItemRef = useRef(null)
  const animationProgressRef = useRef(0)
  const animationStartTimeRef = useRef(null)
  const dprRef = useRef(1)
  const H_PADDING = 60

  // Drag-to-scroll state
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const scrollLeftRef = useRef(0)

  // Calculate canvas dimensions
  const canvasWidth =
    timelineData && timelineData.totalWidth ? timelineData.totalWidth : 1000
  const canvasHeight = Math.max(gridHeight, 450)

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
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [timelineData, layoutItems, loading, draw, isZooming])

  // Drag-to-scroll handlers
  useEffect(() => {
    const container = containerRef.current
    const overlay = overlayRef.current
    if (!container || !overlay) return

    const handleMouseDown = e => {
      // Only trigger drag on left mouse button
      if (e.button !== 0) return

      // Check if clicking on overlay (not on an item)
      const rect = overlay.getBoundingClientRect()
      const isOnOverlay = 
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      if (!isOnOverlay) return

      isDraggingRef.current = true
      dragStartXRef.current = e.pageX
      scrollLeftRef.current = container.scrollLeft
      container.style.cursor = 'grabbing'
      container.style.userSelect = 'none'
      overlay.style.pointerEvents = 'none'
    }

    const handleMouseMove = e => {
      if (!isDraggingRef.current) return

      e.preventDefault()

      const deltaX = e.pageX - dragStartXRef.current

      // Only scroll horizontally
      container.scrollLeft = scrollLeftRef.current - deltaX
    }

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        container.style.cursor = ''
        container.style.userSelect = ''
        overlay.style.pointerEvents = ''
      }
    }

    const handleMouseLeave = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        container.style.cursor = ''
        container.style.userSelect = ''
        overlay.style.pointerEvents = ''
      }
    }

    container.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Handle canvas events
  useEffect(() => {
    const overlay = overlayRef.current
    const container = containerRef.current
    if (!overlay || !container) return

    const tooltip = tooltipRef.current
    
    // Enable pointer events for overlay to handle hover
    overlay.style.pointerEvents = 'auto'

    return handleCanvasEvents({
      overlay,
      container,
      tooltip,
      layoutItems,
      getItemStyle,
      horizontalPadding: H_PADDING,
      onItemHover: item => {
        hoveredItemRef.current = item
        draw()
        if (onItemHover) {
          onItemHover(item)
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
      className={`timeline-canvas-container ${loading ? 'timeline-loading' : 'timeline-loaded'}`}>
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
}

TimelineCanvas.defaultProps = {
  enableGrid: true,
  enableCurrentDate: true,
  loading: false,
}

export default memo(TimelineCanvas)
