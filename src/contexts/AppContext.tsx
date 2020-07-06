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
import { ShortcutContextProvider } from './ShortcutContext'
const MemoinizedMessageContextProvider = memo(MessageContextProvider)
const MemoinizedShortcutContextProvider = memo(ShortcutContextProvider)
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
        <MemoinizedShortcutContextProvider>
          {props.children}
        </MemoinizedShortcutContextProvider>
      </MemoinizedMessageContextProvider>
    </AppContext.Provider>
  )
}

export const AppContextConsumer = AppContext.Consumer
