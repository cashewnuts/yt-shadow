import { VideoBulkUpsertAction, VideoUpsertAction } from '@/messages'
import { IVideo } from '@/models/video'
import DatabaseMessageService from './database-message-service'
import { createLogger } from '@/helpers/logger'
import { VideoIndex } from '@/storages/shadowing-db'
const logger = createLogger('video-message-service.ts')

export default class VideoMessageService extends DatabaseMessageService {
  async upsert(data: IVideo) {
    const action: VideoUpsertAction = {
      action: 'database',
      table: 'videos',
      method: 'upsert',
      value: data,
    }
    return this.postMessage<VideoUpsertAction, VideoIndex>(action)
  }
  async bulkUpsert(data: IVideo | IVideo[]) {
    const videos = Array.isArray(data) ? data : [data]
    const action: VideoBulkUpsertAction = {
      action: 'database',
      table: 'videos',
      method: 'bulkUpsert',
      value: videos,
    }
    return this.postMessage<VideoBulkUpsertAction, boolean>(action)
  }
}
