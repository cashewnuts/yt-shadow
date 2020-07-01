import React, { memo } from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import { AppContextProvider } from '@/contexts/AppContext'

const MemoizedApp = memo(App)

export const render = (id: string) => {
  ReactDOM.render(
    <AppContextProvider>
      <MemoizedApp />
    </AppContextProvider>,
    document.getElementById(id)
  )
}
