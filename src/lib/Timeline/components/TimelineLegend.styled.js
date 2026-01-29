import styled from 'styled-components'

const TimelineLegendStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 16px 20px;
  min-height: 60px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;

  .timeline-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.3s;
  }

  .timeline-legend-item:hover {
    opacity: 0.8;
  }

  .timeline-legend-item.hidden {
    opacity: 0.4;
  }

  .timeline-legend-color {
    display: inline-block;
    flex-shrink: 0;
    width: 24px;
    height: 16px;
    border-radius: 4px;
    border: 1px solid;
  }

  .timeline-legend-label {
    font-size: 13px;
    color: #595959;
    font-weight: 500;
  }
`

export { TimelineLegendStyled }
