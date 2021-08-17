import { DatabaseAction, ConnectionMessage } from '@/messages'
import {
  instanceOfDatabaseAction,
  instanceOfMessage,
} from '@/helpers/message-helper'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('database-message-service.ts')

export default abstract class DatabaseMessageService {
  port?: browser.runtime.Port

  init(port: browser.runtime.Port) {
    this.port = port
    this.port.onDisconnect.addListener((port: browser.runtime.Port) => {
      logger.info('DatabaseMessageService: disconnected', port)
    })
    // Message listener to background message
    this.port.onMessage.addListener(function (m) {
      if (instanceOfMessage(m)) {
        logger.info(m.message)
      }
    })
    this.port.postMessage<ConnectionMessage>({
      message: 'hello from content script',
    })
  }

  postMessage<T extends DatabaseAction, R>(action: T) {
    if (!this.port) {
      throw new Error('port not be set')
    }
    return new Promise<R>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const listener = (obj: object) => {
        if (instanceOfDatabaseAction(obj) && obj.method === action.method) {
          this.port?.onMessage.removeListener(listener)
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
      this.port?.onMessage.addListener(listener)
      this.port?.postMessage<T>(action)
    })
  }
}
