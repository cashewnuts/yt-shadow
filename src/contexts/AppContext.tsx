import React, {
  createContext,
  PropsWithChildren,
  useState,
  Dispatch,
  SetStateAction,
} from 'react'
import DatabaseService, { dbService } from '@/services/database-service'

export interface AppContextParams {
  focus: boolean
  setFocus: Dispatch<SetStateAction<boolean>>
  dbService?: DatabaseService
}

export const AppContext = createContext<AppContextParams>({
  focus: true,
  setFocus: () => console.log('default setFocus'),
})

export const AppContextProvider = (props: PropsWithChildren<unknown>) => {
  const [focus, setFocus] = useState(false)
  return (
    <AppContext.Provider
      value={{
        focus,
        setFocus,
        dbService,
      }}
    >
      {props.children}
    </AppContext.Provider>
  )
}

export const AppContextConsumer = AppContext.Consumer
