import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import { AppContextProvider } from '@/contexts/AppContext'

export const render = (id: string) => {
  ReactDOM.render(
    <AppContextProvider>
      <App />
    </AppContextProvider>,
    document.getElementById(id)
  )
}
