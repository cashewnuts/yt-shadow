import React, { memo } from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import { AppContextProvider } from '@/contexts/AppContext'

const MemoizedApp = memo(App)

export const APP_DOM_ID = '084f9327-d83f-4e74-bfc8-e06c4406520d'

export const render = (element: Element) => {
  ReactDOM.render(
    <AppContextProvider>
      <MemoizedApp />
    </AppContextProvider>,
    element
  )
}
export const unmount = (element?: Element | null) => {
  if (!element) return
  ReactDOM.unmountComponentAtNode(element)
}
