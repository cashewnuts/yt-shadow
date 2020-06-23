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
  }
}
