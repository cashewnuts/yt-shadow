import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react'
import { createLogger } from '@/helpers/logger'
import transcriptMessage, {
  TranscriptMessageService,
} from '@/services/transcript-message-service'
import videoMessage, {
  VideoMessageService,
} from '@/services/video-message-service'
import requestMessage, {
  RequestMessageServiceBase,
} from '@/services/request-message-service'
import { v4 as uuidv4 } from 'uuid'
import { unmount, APP_DOM_ID } from '@/views'
const logger = createLogger('MessageContext.tsx')

export interface MessageContextParams {
  transcriptMessage: TranscriptMessageService
  videoMessage: VideoMessageService
  requestMessage: RequestMessageServiceBase
}

export const MessageContext = createContext<MessageContextParams>({
  transcriptMessage,
  videoMessage,
  requestMessage,
})

export const MessageContextProvider = (props: PropsWithChildren<unknown>) => {
  const [port] = useState(browser.runtime.connect({ name: uuidv4() }))
  const [value] = useState({
    transcriptMessage,
    videoMessage,
    requestMessage,
  })

  useEffect(() => {
    transcriptMessage.init(port)
    videoMessage.init(port)
    requestMessage.init(port)
    port.onDisconnect.addListener(() => {
      let retryCount = 3
      const tryReconnect = () => {
        try {
          const newPort = browser.runtime.connect({ name: uuidv4() })
          transcriptMessage.init(newPort)
          videoMessage.init(newPort)
          requestMessage.init(newPort)
          return
        } catch (err) {
          logger.error('Port reconnect failed', err)
          retryCount--
        }
        if (retryCount > 0) {
          setTimeout(tryReconnect, 1000 * 1)
        } else {
          unmount(document.getElementById(APP_DOM_ID))
        }
      }
      setTimeout(tryReconnect, 1000 * 1)
    })
  }, [port])

  return (
    <MessageContext.Provider value={value}>
      {props.children}
    </MessageContext.Provider>
  )
}

export const MessageContextConsumer = MessageContext.Consumer
