import React, {
  createContext,
  PropsWithChildren,
  useState,
  Dispatch,
  SetStateAction,
} from 'react'
import DatabaseMessageService from '@/services/database-message-service'

export interface AppContextParams {
  focus: boolean
  setFocus: Dispatch<SetStateAction<boolean>>
  dbMessageService?: DatabaseMessageService
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
        dbMessageService: new DatabaseMessageService(),
      }}
    >
      {props.children}
    </AppContext.Provider>
  )
}

export const AppContextConsumer = AppContext.Consumer
