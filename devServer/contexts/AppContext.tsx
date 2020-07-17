import React, {
  createContext,
  PropsWithChildren,
  useState,
  Dispatch,
  SetStateAction,
} from 'react'
import { createLogger } from '@/helpers/logger'
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
