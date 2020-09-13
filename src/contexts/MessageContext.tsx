import React, { createContext, PropsWithChildren, useState } from 'react'
import { createLogger } from '@/helpers/logger'
import TranscriptMessageService from '@/services/transcript-message-service'
import VideoMessageService from '@/services/video-message-service'
import RequestMessageService, {
  RequestMessageServiceMock,
  RequestMessageServiceBase,
} from '@/services/request-message-service'
import { v4 as uuidv4 } from 'uuid'
import { unmount, APP_DOM_ID } from '@/views'
const logger = createLogger('MessageContext.tsx')

export interface MessageContextParams {
  transcriptMessage?: TranscriptMessageService
  videoMessage?: VideoMessageService
  requestMessage?: RequestMessageServiceBase
}

export const MessageContext = createContext<MessageContextParams>({
  requestMessage: new RequestMessageServiceMock(),
})

export const MessageContextProvider = (props: PropsWithChildren<unknown>) => {
  const [port] = useState(browser.runtime.connect({ name: uuidv4() }))
  const [value, setValue] = useState({
    transcriptMessage: new TranscriptMessageService(port),
    videoMessage: new VideoMessageService(port),
    requestMessage: new RequestMessageService(port),
  })

  port.onDisconnect.addListener(() => {
    let retryCount = 3
    const tryReconnect = () => {
      try {
        const newPort = browser.runtime.connect({ name: uuidv4() })
        setValue({
          transcriptMessage: new TranscriptMessageService(newPort),
          videoMessage: new VideoMessageService(newPort),
          requestMessage: new RequestMessageService(newPort),
        })
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

  return (
    <MessageContext.Provider value={value}>
      {props.children}
    </MessageContext.Provider>
  )
}

export const MessageContextConsumer = MessageContext.Consumer
