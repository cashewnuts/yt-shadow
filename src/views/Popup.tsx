import React, { PropsWithChildren, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Switch, Divider } from '@blueprintjs/core'
import { createLogger } from '@/helpers/logger'
import {
  getCurrentSetting,
  toggleActiveState,
} from '@/backgrounds/browser-action'

const logger = createLogger('Popup.tsx')
const DASHBOARD_URL = '/dashboard/dashboard.html'

export const renderPopup = (element: HTMLElement) => {
  logger.info('renderPopup', element)
  ReactDOM.render(<Popup />, element)
}

const Popup = (props: PropsWithChildren<unknown>) => {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const asyncFn = async () => {
      const setting = await getCurrentSetting()
      setActive(setting.active)
    }
    asyncFn()
  }, [])
  const handleToggleActivateClick = async () => {
    const activeState = await toggleActiveState()
    setActive(activeState)
  }
  const handleOpenDashboard = async () => {
    try {
      await browser.tabs.create({
        url: DASHBOARD_URL,
      })
    } catch (err) {
      logger.error(err)
    }
  }
  return (
    <div style={{ width: '15em', padding: '1em' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '4em',
        }}
      >
        <Switch
          checked={active}
          label="Active"
          large
          onChange={handleToggleActivateClick}
        />
      </div>
      <Divider />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '0.5em',
        }}
      >
        <Button
          text="Open Dashboard"
          intent="success"
          onClick={handleOpenDashboard}
        />
      </div>
    </div>
  )
}

export default Popup
