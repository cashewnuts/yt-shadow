import Dexie from 'dexie'
import { ITranscript } from '@/models/transcript'
import { IVideo } from '@/models/video'

export default class ShadowingDatabase extends Dexie {
  transcripts: Dexie.Table<ITranscript, TranscriptIndex>
  videos: Dexie.Table<IVideo, VideoIndex>

  constructor() {
    super('ShadowingDatabase')
    this.version(1).stores({
      transcripts: '[host+videoId+start], [host+videoId], *words',
      videos: '[host+videoId], host, *words, updatedAt',
    })
    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    this.transcripts = this.table('transcripts')
    this.videos = this.table('videos')
  }
}

export interface TranscriptIndex {
  host: string
  videoId: string
  start: number
  words?: string[]
}
export interface VideoIndex {
  host: string
  videoId: string
  words?: string[]
  updatedAt: number
}

export const db = new ShadowingDatabase()
