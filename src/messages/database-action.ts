import { ITranscript } from '@/models/transcript'

export interface DatabaseAction {
  action: 'database'
  table: string
  method: string
  value?: unknown
}

export interface TranscriptAction extends DatabaseAction {
  table: 'transcripts'
  method: string
}

export interface TranscriptBulkUpsertAction extends TranscriptAction {
  method: 'bulkUpsert'
  value: ITranscript[]
}

export interface TranscriptGetAction extends TranscriptAction {
  method: 'get'
  value: {
    host: string
    videoId: string
    start: number
  }
}
export interface TranscriptGetAllAction extends TranscriptAction {
  method: 'getAll'
  value: {
    host: string
    videoId: string
  }
}
export interface TranscriptFindAction extends TranscriptAction {
  method: 'find'
  value: {
    host: string
    videoId: string
    filters: {
      [key: string]: unknown
      done?: boolean
      skip?: boolean
      correct?: boolean
      from?: number
      to?: number
    }
  }
}

export interface TranscriptPatchAction extends TranscriptAction {
  method: 'patch'
  value: {
    value: ITranscript
  }
}
