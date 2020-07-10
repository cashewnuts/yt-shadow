import React, { createContext, PropsWithChildren, useState } from 'react'
import { createLogger } from '@/helpers/logger'
import TranscriptMessageService from '@/services/transcript-message-service'
import VideoMessageService from '@/services/video-message-service'
const logger = createLogger('MessageContext.tsx')

export interface MessageContextParams {
  transcriptMessage?: TranscriptMessageService
  videoMessage?: VideoMessageService
}

export const MessageContext = createContext<MessageContextParams>({})

export const MessageContextProvider = (props: PropsWithChildren<unknown>) => {
  const [port] = useState(
    browser.runtime.connect({ name: 'DatabaseMessageService' })
  )

  return (
    <MessageContext.Provider
      value={{
        transcriptMessage: new TranscriptMessageService(port),
        videoMessage: new VideoMessageService(port),
      }}
    >
      {props.children}
    </MessageContext.Provider>
  )
}

export const MessageContextConsumer = MessageContext.Consumer
