import { RequestDictionaryAction, RequestContentAction } from '@/messages'
import {
  instanceOfRequestContentAction,
  instanceOfRequestDictionaryAction,
} from '@/helpers/message-helper'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('request-message-service.ts')

export { default as RequestMessageServiceMock } from './mock/request-message-service-mock'

export interface OwlbotResponse {
  definitions: {
    type: string
    definition: string
    example?: string
    image_url: string | null
    emoji: string | null
  }[]
  word: string
  pronunciation: string
}

export interface RequestMessageServiceBase {
  getText(url: string, options?: RequestInit): Promise<string>
  getJson<T>(url: string, options?: RequestInit): Promise<T>
  getDict(word: string): Promise<OwlbotResponse>
}

export default class RequestMessageService
  implements RequestMessageServiceBase {
  constructor(private port: browser.runtime.Port) {
    this.port.onDisconnect.addListener((port: browser.runtime.Port) => {
      logger.info('RequestMessageService: disconnected', port)
    })
  }

  getText(url: string, options?: RequestInit) {
    return this.postMessage<RequestContentAction, string>({
      action: 'request',
      contentType: 'text',
      url,
      options,
    })
  }

  getJson<T>(url: string, options?: RequestInit) {
    return this.postMessage<RequestContentAction, T>({
      action: 'request',
      contentType: 'json',
      url,
      options,
    })
  }

  getDict(word: string) {
    return this.postMessageDict<RequestDictionaryAction, OwlbotResponse>({
      action: 'request',
      contentType: 'dictionary',
      word,
    })
  }

  private postMessage<T extends RequestContentAction, R>(action: T) {
    return new Promise<R>((resolve, reject) => {
      const listener = (obj: object) => {
        if (instanceOfRequestContentAction(obj) && obj.url === action.url) {
          this.port.onMessage.removeListener(listener)
          if (obj.error) {
            reject(obj.error)
          } else {
            resolve(obj.value as R)
          }
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
  private postMessageDict<T extends RequestDictionaryAction, R>(action: T) {
    return new Promise<R>((resolve, reject) => {
      const listener = (obj: object) => {
        if (
          instanceOfRequestDictionaryAction(obj) &&
          obj.word === action.word
        ) {
          this.port.onMessage.removeListener(listener)
          if (obj.error) {
            reject(obj.error)
          } else {
            resolve(obj.value as R)
          }
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
