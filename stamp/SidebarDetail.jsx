import useSideBar from '@/hooks/useSideBar'
import { Icon, Layout, Menu } from 'antd'
import { useLayoutEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { DotSVG } from '../CustomIcon'
import { handleDistinctMenuTabs } from '../helper/HandleRoute'
import './../Sidebar.css'
import { PATH } from './constant'
import CustomTrigger from './CustomTrigger'

const { Sider } = Layout
const { SubMenu } = Menu

function NewSidebarDetail({
  location,
  arrayNameLayer2,
  pageName,
  keyParent,
  history,
  detailInfo,
}) {
  const distinctData = handleDistinctMenuTabs('label')

  const [openKeys, setOpenKeys] = useState(arrayNameLayer2)
  const [collapsed, setCollapsed] = useState(false)

  useLayoutEffect(() => {
    document
      .querySelector('.sidebar-content')
      .classList.remove('sidebar-collapsed')
  }, [])

  const pathArray = window.location.pathname.split('/')
  const projectId = pathArray[3]
  const listSubDefaults = pathArray.includes(PATH.SAP_REPORT)
    ? undefined
    : arrayNameLayer2

  const hasChild = (listMenu = [], listSub = listSubDefaults) => {
    let dataChildren

    if (listSub) {
      dataChildren = listSub.map(elm => {
        return {
          children: listMenu.filter(
            item =>
              !item.children &&
              item.state.includes(detailInfo.stringDetail) &&
              item.state.startsWith(
                arrayNameLayer2.length > 1
                  ? `/${pageName.toLocaleLowerCase()}/${elm.toLocaleLowerCase()}/`
                  : `/${pageName.toLocaleLowerCase()}`
              )
          ),
          name: elm,
          state: listMenu.find(
            item =>
              item.state ===
              `/${pageName.toLocaleLowerCase()}/${elm.toLocaleLowerCase()}`
          ).state,
        }
      })
    } else {
      const detailItems = listMenu.filter(item =>
        item.state.includes(detailInfo.stringDetail)
      )
      const groups = detailInfo.subMenuGroups

      if (groups && groups.length) {
        const usedStates = new Set()
        const groupedItems = []

        groups.forEach(group => {
          const children = detailItems.filter(item => {
            const lastSegment = item.state.split('/').pop()
            return lastSegment.startsWith(group.pathPrefix)
          })
          if (children.length > 0) {
            children.forEach(c => usedStates.add(c.state))
            groupedItems.push({ name: group.name, children })
          }
        })

        const ungrouped = detailItems.filter(
          item => !usedStates.has(item.state)
        )
        dataChildren = [...ungrouped, ...groupedItems]
      } else {
        dataChildren = detailItems
      }
    }

    const modifiedDataChildren = dataChildren.map(item => {
      if (!item.children)
        return {
          ...item,
          state: item.state.replace(detailInfo.stringDetail, projectId),
        }

      const modifiedChildren = item.children.map(child => {
        const modifiedState = child.state.replace(
          detailInfo.stringDetail,
          projectId
        )

        return {
          ...child,
          state: modifiedState,
        }
      })

      return {
        ...item,
        children: modifiedChildren,
      }
    })

    return modifiedDataChildren
  }

  const handleOpenChange = keys => {
    setOpenKeys(keys)
  }

  const toggleSidebar = () => {
    document
      .querySelector('.sidebar-content')
      .classList.toggle('sidebar-collapsed')
    setCollapsed(!collapsed)
  }

  const handleGoBack = () => {
    if (detailInfo.isBackToList) localStorage.setItem('backToList', 1)
    history.push({
      pathname: detailInfo.state,
    })
  }

  const renderMenuItem = item => {
    return (
      <Menu.Item key={item.state}>
        <Link
          to={{
            pathname: item.state,
          }}>
          {item.icon ? <Icon type={item.icon} /> : <Icon component={DotSVG} />}
          <span>{item.name}</span>
        </Link>
      </Menu.Item>
    )
  }

  const parentItem = distinctData.find(item => item.label === keyParent)
  const parentChildren = parentItem ? parentItem.children : []

  const formatMenuData = hasChild(parentChildren)

  const { keys } = useSideBar(location, formatMenuData)

  return (
    <Sider
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
      }}
      collapsible
      collapsed={collapsed}
      theme="light"
      className="sider-wrapper sider-detail"
      onCollapse={toggleSidebar}
      trigger={<CustomTrigger collapsed={collapsed} />}>
      <div className="back-container" onClick={() => handleGoBack()}>
        <Icon type="left-circle" theme="filled" className="icon-back" />
        <span>{`Back to ${detailInfo.label}`}</span>
      </div>
      <div className="logo" />
      <Menu
        theme="light"
        onOpenChange={handleOpenChange}
        openKeys={openKeys}
        selectedKeys={keys}
        mode="inline"
        className="menu-container">
        {formatMenuData.map(elm =>
          elm.children && elm.children.length > 0 ? (
            <SubMenu
              key={elm.name}
              title={
                <span>
                  <span>{elm.name}</span>
                </span>
              }>
              {elm.children.map(renderMenuItem)}
            </SubMenu>
          ) : (
            renderMenuItem(elm)
          )
        )}
      </Menu>
    </Sider>
  )
}

export default withRouter(NewSidebarDetail)
