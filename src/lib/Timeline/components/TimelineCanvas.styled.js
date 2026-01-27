import styled from 'styled-components'

const TimelineCanvasStyled = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  will-change: opacity;
  overflow: visible;

  .timeline-canvas-wrapper {
    position: relative;
    width: 100%;
    overflow: visible;
  }

  .timeline-canvas-empty {
    padding: 40px 20px 60px;
    text-align: center;
    color: #8c8c8c;
    font-size: 14px;
  }

  .timeline-canvas {
    display: block;
  }

  .timeline-canvas-overlay {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: auto;
    z-index: 5;
  }

  .timeline-current-date {
    position: absolute;
    top: 0;
    bottom: -1px;
    width: 2px;
    background: #db372d;
    z-index: 50;
    pointer-events: none;
  }

  .current-date-marker {
    position: absolute;
    top: -7px;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 14px;
    background: #db372d;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(228, 66, 88, 0.4);
    animation: fadeInCentered 0.5s ease-out 0.4s both;
  }

  .current-date-label {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: #db372d;
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(228, 66, 88, 0.3);
    z-index: 60;
    animation: fadeInCentered 0.5s ease-out 0.5s both;
  }

  @keyframes fadeInCentered {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  &.timeline-loading {
    opacity: 0;
  }

  &.timeline-loaded {
    opacity: 1;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Timeline Header - ECharts Style */
  .timeline-header {
    display: flex;
    background: transparent;
    border-top: 1px solid #e8e8e8;
    position: relative;
    margin-top: 0;
    min-height: 36px;
    width: 100%;
    box-sizing: border-box;
  }

  /* X-Axis Line */
  .timeline-axis-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: #333;
    z-index: 5;
  }

  /* Tick Marks */
  .timeline-tick-mark {
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    height: 6px;
    background-color: #333;
    z-index: 6;
  }

  .timeline-period {
    position: relative;
    border-right: 1px solid #f0f0f0;
    flex-shrink: 0;
    height: 100%;
  }

  .timeline-period:last-child {
    border-right: none;
  }

  .period-label-border {
    position: absolute;
    left: 0;
    top: 8px;
    transform: translateX(-50%);
    font-size: 12px;
    font-weight: 500;
    padding: 4px;
    white-space: nowrap;
    z-index: 10;
    text-align: center;
  }

  .period-sublabel {
    font-size: 11px;
    font-weight: 400;
    color: #8c8c8c;
    margin-top: 2px;
    display: none;
  }

  /* Tooltip */
  .timeline-canvas-tooltip {
    position: absolute;
    display: none;
    opacity: 0;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 13px;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    transition: opacity 0.2s ease-in-out;
    max-width: 300px;
    max-height: 400px;
    min-width: 250px;
    overflow-y: auto;
  }

  .timeline-canvas-tooltip-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .timeline-canvas-tooltip .tooltip-title {
    font-weight: 600;
    font-size: 14px;
    color: #ffffff;
    margin-bottom: 4px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    word-wrap: break-word;
  }

  .timeline-canvas-tooltip .tooltip-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
  }

  .timeline-canvas-tooltip .tooltip-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .timeline-canvas-tooltip .tooltip-label {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
    min-width: 60px;
  }

  .timeline-canvas-tooltip .tooltip-value {
    color: #ffffff;
    font-weight: 500;
    text-align: right;
    flex: 1;
  }
`

const TimelineCanvasEmptyStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 48px 24px;
  text-align: center;

  .empty-state-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
`

const TimelineEmptyOverlayStyled = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 50;
  pointer-events: none;

  .empty-state-content {
    text-align: center;
    padding: 32px;
    max-width: 400px;
  }

  .empty-state-content .empty-state-icon {
    font-size: 72px;
    margin-bottom: 20px;
    opacity: 0.4;
    animation: emptyStatePulse 2s ease-in-out infinite;
  }

  .empty-state-title {
    margin: 0 0 12px 0;
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
  }

  .empty-state-message {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: #7f8c8d;
  }

  @keyframes emptyStatePulse {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.05);
    }
  }
`

export {
  TimelineCanvasStyled,
  TimelineEmptyOverlayStyled,
  TimelineCanvasEmptyStyled,
}
