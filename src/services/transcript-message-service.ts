import {
  TranscriptBulkUpsertAction,
  TranscriptGetAllAction,
  TranscriptPatchAction,
  TranscriptGetAction,
  TranscriptFindAction,
} from '@/messages'
import { ITranscript } from '@/models/transcript'
import { createLogger } from '@/helpers/logger'
import { TranscriptIndex } from '@/storages/shadowing-db'
import DatabaseMessageService from './database-message-service'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = createLogger('transcript-message-service.ts')

export class TranscriptMessageService extends DatabaseMessageService {
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
}

export default new TranscriptMessageService()
