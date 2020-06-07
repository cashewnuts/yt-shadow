import React, {
  createContext,
  PropsWithChildren,
  useState,
  Dispatch,
  SetStateAction,
} from 'react'

export interface AppContextParams {
  focus: boolean
  setFocus: Dispatch<SetStateAction<boolean>>
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
      }}
    >
      {props.children}
    </AppContext.Provider>
  )
}

export const AppContextConsumer = AppContext.Consumer
