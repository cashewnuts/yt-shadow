import React, { PropsWithChildren, memo } from 'react'
import ReactDOM from 'react-dom'
import { createLogger } from '@/helpers/logger'
import { Navbar, Alignment, Button } from '@blueprintjs/core'
import { StorageContextProvider } from '@/contexts/StorageContext'
import VideoTable from './components/Dashboard/VideoTable'
const logger = createLogger('Dashboard.tsx')

export const renderDashboard = (element: HTMLElement) => {
  logger.info('renderPopup', element)
  ReactDOM.render(
    <StorageContextProvider>
      <MemoizedDashboard />
    </StorageContextProvider>,
    element
  )
}

const Dashboard = (props: PropsWithChildren<unknown>) => {
  return (
    <div>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Youtube Shadowing</Navbar.Heading>
          <Navbar.Divider />
          <Button className="bp3-minimal" icon="home" text="Home" />
        </Navbar.Group>
      </Navbar>
      <div>
        <VideoTable />
      </div>
    </div>
  )
}

const MemoizedDashboard = memo(Dashboard)
export default Dashboard
