import { DatabaseAction } from './database-action'
import { IVideo } from '@/models/video'

export interface VideoAction extends DatabaseAction {
  table: 'videos'
  method: string
}

export interface VideoUpsertAction extends VideoAction {
  method: 'upsert'
  value: IVideo
}
export interface VideoBulkUpsertAction extends VideoAction {
  method: 'bulkUpsert'
  value: IVideo[]
}
