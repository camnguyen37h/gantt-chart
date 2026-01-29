import styled from 'styled-components'

const TimelineStyled = styled.div`
  width: 100%;
  overflow: visible;

  /* Timeline Scroll Container */
  .timeline-scroll-container {
    position: relative;
    padding-top: 60px;
    overflow-x: auto;
    overflow-y: visible;
    user-select: none;
  }

  .timeline-scroll-container:active {
    cursor: grabbing;
  }

  .timeline-content {
    position: relative;
    transition: transform 0.15s ease-out;
  }

  /* Scrollbar Styling */
  .timeline-scroll-container::-webkit-scrollbar {
    height: 8px;
  }

  .timeline-scroll-container::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 4px;
  }

  .timeline-scroll-container::-webkit-scrollbar-thumb {
    background: #bfbfbf;
    border-radius: 4px;
  }

  .timeline-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #999999;
  }

  .timeline-view-title {
    font-size: 16px;
    line-height: 110%;
  }

  .timeline-view-description {
    font-size: 14px;
    line-height: 110%;
  }

  .timeline-view-description strong {
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
  }

  .timeline-toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 8px 16px;
    align-items: center;
    margin-bottom: 8px;
  }

  .timeline-legend-types {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px 16px;
    padding: 16px 16px 0;
    .timeline-legend-type {
      position: relative;
      border: none;
      background-color: transparent;
      padding: 4px 0 4px 36px;
      font-size: 13px;
      color: #595959;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        border: solid 1px #595959;
        transition: all 0.2s ease;
      }

      &.range-time {
        &::before {
          left: 18px;
          width: 24px;
          height: 16px;
          border-radius: 4px;
          transform: translate(-50%, -50%);
        }
      }

      &.abnormal {
        &::before {
          left: 16px;
          width: 16px;
          height: 16px;
          transform: translate(-50%, -50%) rotate(45deg);
        }

        &::after {
          content: '';
          position: absolute;
          left: 16px;
          top: 50%;
          width: 8px;
          height: 8px;
          border: solid 1px #595959;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
      }

      &:hover {
        opacity: 0.8;
      }

      &.hidden {
        opacity: 0.4;
      }
    }
  }

  /* Timeline Skeleton Loading */
  .skeleton-grid {
    position: relative;
    min-height: 300px;
    border-bottom: 1px solid #333;
  }

  .skeleton-item {
    height: 32px;
    margin-bottom: 20px;
    background: linear-gradient(90deg, #e3f2fd 25%, #bbdefb 50%, #e3f2fd 75%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-item-1 {
    width: 60%;
    margin-left: 5%;
    animation-delay: 0s;
  }

  .skeleton-item-2 {
    width: 45%;
    margin-left: 15%;
    animation-delay: 0.1s;
  }

  .skeleton-item-3 {
    width: 80%;
    margin-left: 0;
    animation-delay: 0.2s;
  }

  .skeleton-item-4 {
    width: 50%;
    margin-left: 25%;
    animation-delay: 0.3s;
  }

  .skeleton-item-5 {
    width: 70%;
    margin-left: 15%;
    animation-delay: 0.4s;
  }

  .skeleton-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
    background: #fafafa;
    border-radius: 4px;
  }

  .skeleton-status {
    width: 100px;
    height: 24px;
    background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
    background-size: 200% 100%;
    border-radius: 12px;
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`

export { TimelineStyled }
