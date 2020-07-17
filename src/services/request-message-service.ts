import { RequestAction } from '@/messages'
import { instanceOfRequestAction } from '@/helpers/message-helper'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('request-message-service.ts')

export default class RequestMessageService {
  constructor(private port: browser.runtime.Port) {
    this.port.onDisconnect.addListener((port: browser.runtime.Port) => {
      logger.info('RequestMessageService: disconnected', port)
    })
  }

  getText(url: string) {
    return this.postMessage<RequestAction, string>({
      action: 'request',
      contentType: 'text',
      url,
    })
  }

  postMessage<T extends RequestAction, R>(action: T) {
    return new Promise<R>((resolve, reject) => {
      const listener = (obj: object) => {
        if (instanceOfRequestAction(obj) && obj.url === action.url) {
          this.port.onMessage.removeListener(listener)
          if (obj.value instanceof Error) {
            reject(obj.value)
          }
          resolve(obj.value as R)
        }
      }
      setTimeout(
        reject.bind(this, 'postMessage timeout: ' + JSON.stringify(action)),
        10000
      )
      this.port.onMessage.addListener(listener)
      this.port.postMessage<T>(action)
    })
  }
}
