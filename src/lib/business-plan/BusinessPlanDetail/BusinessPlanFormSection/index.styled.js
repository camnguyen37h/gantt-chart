import styled from 'styled-components'

const StyledWrapper = styled.div`
  --title-size: 270px;
  --border-x-row: 6px;
  --column-width: 165px;
  max-height: 700px;
  overflow: auto;
  margin-top: 24px;
  background-color: #ffffff;

  .ant-input-number-input {
    text-align: center;
  }

  table {
    white-space: nowrap;
    margin: 0;
    border: none;
    // border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    width: max-content;

    .red {
      color: var(--error-red);
    }

    .green {
      color: var(--success-green);
    }

    thead {
      position: sticky;
      top: 0;
      z-index: 100;
      th {
        position: sticky;
        top: 0;
        z-index: 1;
        padding: 0;
        font-weight: 500;
        text-align: center;
        background: #fff;

        > span {
          display: inline-block;
          padding: 6px 8px;
          width: 100%;
        }

        &:first-child {
          left: 0;
          z-index: 2;
        }
        &:nth-child(2) {
          left: var(--title-size);
          z-index: 2;
        }
      }

      .item-label {
        padding: 6px 8px;
        border-top: 1px solid #e1e1e1;
        background: var(--light-blue);
        width: 100%;
      }

      .business-plan-normal {
        padding: 16px;
      }
    }

    tbody {
      .bg-light-blue {
        td,
        th {
          background-color: var(--light-blue);
        }

        th:first-child {
          &:before {
            background-color: var(--light-blue);
          }
        }
        td:last-child {
          &:before {
            background-color: var(--light-blue);
          }
        }
      }

      .margin {
        th:first-child {
          padding: 0 0 0 40px;
          border: none;
          &:before {
            content: '';
            position: absolute;
            width: 1px;
            background: #e1e1e1;
            height: 100%;
            display: block;
            top: 0;
            left: 15px;
          }

          &:after {
            position: absolute;
            display: block;
            width: calc(100% - 40px);
            height: 1px;
            background-color: #e1e1e1;
            bottom: 0;
            content: '';
          }

          .flag {
            position: absolute;
            top: 15px;
            left: 4px;
          }
        }
      }

      tr:not(.margin) + .margin {
        border-top: 10px solid #fafbfc;

        th:first-child {
          &:before {
            height: calc(100% - 30px);
            top: 30px;
          }
        }

        td,
        th {
          padding-top: 10px;
        }
      }

      tr:has(+ .total-section),
      tr:has(+ .margin):not(.margin) {
        td,
        th {
          border-bottom-color: #ffffff;

          &:after {
            content: none !important;
          }
        }
      }
      .total-section {
        td,
        th {
          padding-top: 10px;
          border-bottom-color: #ffffff;
        }
      }

      .total-section-no-space {
        td,
        th {
          padding-top: 4px;
        }
      }

      tr:first-child {
        border-top: 10px solid #fafbfc;
        &.bg-light-blue {
          td,
          th {
            border-bottom-color: var(--light-blue);
          }
        }
      }

      .group-divider {
        border-top: 10px solid #fafbfc;
      }

      td {
        background-color: #ffffff;
        padding: 4px;
        text-align: center;
        border-bottom: 1px solid #e1e1e1;
        vertical-align: top;

        &:last-child {
          position: relative;
          &:before {
            content: '';
            position: absolute;
            display: block;
            width: 6px;
            height: 1px;
            bottom: -1px;
            right: 0;
            background-color: #ffffff;
          }
        }
      }

      th {
        position: sticky;
        z-index: 1;
        font-weight: normal;
        padding: 4px;
        text-wrap: pretty;
        border-bottom: 1px solid #e1e1e1;
        background-color: #ffffff;
        vertical-align: top;

        &:first-child {
          left: 0;
          padding-left: 20px;
          &:before {
            content: '';
            position: absolute;
            display: block;
            width: 6px;
            height: 1px;
            left: 0;
            bottom: -1px;
            background-color: #ffffff;
          }
        }
        &:nth-child(2) {
          left: var(--title-size);
          text-align: center;
          border-right: 1px solid #e1e1e1;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          text-wrap: nowrap;
        }

        .total {
          text-align: center;
          background-color: #acd1ff;
          border-radius: 4px;
          line-height: 25px;
          height: 25px;
        }
      }
    }
  }
`

export { StyledWrapper }
