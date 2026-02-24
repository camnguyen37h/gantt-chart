import { Tag as AntdTag } from 'antd'

const Tag = ({ color, backgroundColor, children,...otherProps }) => {
    return (
      <AntdTag
        color={backgroundColor}
        style={{ color, margin: 0 }}
        {...otherProps}>
        {children}
      </AntdTag>
    )
}

export default Tag
