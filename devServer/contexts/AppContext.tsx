import React, {
  createContext,
  PropsWithChildren,
  useState,
  Dispatch,
  SetStateAction,
} from 'react'
import DatabaseMessageService from '@/services/database-message-service'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('AppContext.tsx')

export interface AppContextParams {
  focus: boolean
  setFocus: Dispatch<SetStateAction<boolean>>
  dbMessageService?: DatabaseMessageService
}

export const AppContext = createContext<AppContextParams>({
  focus: true,
  setFocus: () => logger.debug('default setFocus'),
})

export const AppContextProvider = (props: PropsWithChildren<unknown>) => {
  const [focus, setFocus] = useState(false)
  return (
    <AppContext.Provider
      value={{
        focus,
        setFocus,
      }}
    >
      {props.children}
    </AppContext.Provider>
  )
}

export const AppContextConsumer = AppContext.Consumer
