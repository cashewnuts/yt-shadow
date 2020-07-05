import React, {
  createContext,
  PropsWithChildren,
  useState,
  Dispatch,
  SetStateAction,
  memo,
} from 'react'
import { createLogger } from '@/helpers/logger'
import { MessageContextProvider } from './MessageContext'
const MemoinizedMessageContextProvider = memo(MessageContextProvider)
const logger = createLogger('AppContext.tsx')

export interface AppContextParams {
  focus: boolean
  setFocus: Dispatch<SetStateAction<boolean>>
}

export const AppContext = createContext<AppContextParams>({
  focus: true,
  setFocus: () => logger.debug('default setFocus'),
})

export const AppContextProvider = (props: PropsWithChildren<unknown>) => {
  const [focus, setFocus] = useState(false)
  const value = {
    focus,
    setFocus,
  }
  return (
    <AppContext.Provider value={value}>
      <MemoinizedMessageContextProvider>
        {props.children}
      </MemoinizedMessageContextProvider>
    </AppContext.Provider>
  )
}

export const AppContextConsumer = AppContext.Consumer
