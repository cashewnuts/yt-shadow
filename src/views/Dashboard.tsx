import React, { PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'
import { createLogger } from '@/helpers/logger'
import { Navbar, Alignment, Button } from '@blueprintjs/core'
const logger = createLogger('Dashboard.tsx')

export const renderDashboard = (element: HTMLElement) => {
  logger.info('renderPopup', element)
  ReactDOM.render(<Dashboard />, element)
}

const Dashboard = (props: PropsWithChildren<unknown>) => {
  return (
    <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>Youtube Shadowing</Navbar.Heading>
        <Navbar.Divider />
        <Button className="bp3-minimal" icon="home" text="Home" />
        <Button className="bp3-minimal" icon="document" text="Files" />
      </Navbar.Group>
    </Navbar>
  )
}

export default Dashboard
