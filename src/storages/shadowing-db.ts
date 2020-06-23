import Dexie from 'dexie'

export default class ShadowingDatabase extends Dexie {
  transcripts: Dexie.Table<TranscriptIndex, string>

  constructor() {
    super('ShadowingDatabase')
    this.version(1).stores({
      transcripts: '[host+videoId+start], [host+videoId], *words',
    })
    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    this.transcripts = this.table('transcripts')
  }
}

export interface TranscriptIndex {
  host: string
  videoId: string
  start: number
  words?: string[]
}

export const db = new ShadowingDatabase()
