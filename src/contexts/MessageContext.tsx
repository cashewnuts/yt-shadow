import React, { createContext, PropsWithChildren } from 'react'
import DatabaseMessageService from '@/services/database-message-service'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('MessageContext.tsx')

export interface MessageContextParams {
  dbMessageService?: DatabaseMessageService
}

export const MessageContext = createContext<MessageContextParams>({})

export const MessageContextProvider = (props: PropsWithChildren<unknown>) => {
  return (
    <MessageContext.Provider
      value={{
        dbMessageService: new DatabaseMessageService(),
      }}
    >
      {props.children}
    </MessageContext.Provider>
  )
}

export const MessageContextConsumer = MessageContext.Consumer
