import {
  TranscriptBulkUpsertAction,
  DatabaseAction,
  ConnectionMessage,
  TranscriptGetAllAction,
  TranscriptPatchAction,
  TranscriptGetAction,
  TranscriptFindAction,
} from '@/messages'
import { ITranscript } from '@/models/transcript'
import {
  instanceOfDatabaseAction,
  instanceOfMessage,
} from '@/helpers/message-helper'
import { createLogger } from '@/helpers/logger'
import { TranscriptIndex } from '@/storages/shadowing-db'
const logger = createLogger('database-message-service.ts')

export default class DatabaseMessageService {
  port: browser.runtime.Port
  constructor() {
    this.port = browser.runtime.connect({ name: 'DatabaseMessageService' })
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

  async bulkUpsert(data: ITranscript | ITranscript[]) {
    const transcripts = Array.isArray(data) ? data : [data]
    const action: TranscriptBulkUpsertAction = {
      action: 'database',
      table: 'transcripts',
      method: 'bulkUpsert',
      value: transcripts,
    }
    return this.postMessage<TranscriptBulkUpsertAction, boolean>(action)
  }

  async get(host: string, videoId: string, start: number) {
    return this.postMessage<TranscriptGetAction, ITranscript>({
      action: 'database',
      table: 'transcripts',
      method: 'get',
      value: {
        host,
        videoId,
        start,
      },
    })
  }
  async getAll(host: string, videoId: string) {
    return this.postMessage<TranscriptGetAllAction, ITranscript[]>({
      action: 'database',
      table: 'transcripts',
      method: 'getAll',
      value: {
        host,
        videoId,
      },
    })
  }

  async find(
    host: string,
    videoId: string,
    filters: {
      done?: boolean
      skip?: boolean
      correct?: boolean
      from?: number
      to?: number
    }
  ) {
    return this.postMessage<TranscriptFindAction, ITranscript[]>({
      action: 'database',
      table: 'transcripts',
      method: 'find',
      value: {
        host,
        videoId,
        filters,
      },
    })
  }
  async patch(transcript: ITranscript) {
    return this.postMessage<TranscriptPatchAction, TranscriptIndex>({
      action: 'database',
      table: 'transcripts',
      method: 'patch',
      value: {
        value: transcript,
      },
    })
  }

  postMessage<T extends DatabaseAction, R>(action: T) {
    return new Promise<R>((resolve, reject) => {
      const listener = (obj: object) => {
        if (instanceOfDatabaseAction(obj) && obj.method === action.method) {
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
