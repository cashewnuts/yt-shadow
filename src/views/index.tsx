import React, { memo } from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import { AppContextProvider } from '@/contexts/AppContext'

const MemoizedApp = memo(App)

export const render = (element: Element) => {
  ReactDOM.render(
    <AppContextProvider>
      <MemoizedApp />
    </AppContextProvider>,
    element
  )
}
export const unmount = (element: Element) => {
  ReactDOM.unmountComponentAtNode(element)
}
