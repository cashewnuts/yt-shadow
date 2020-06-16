import Dexie from 'dexie'

export default class ShadowingDatabase extends Dexie {
  transcripts: Dexie.Table<ITranscript, string>

  constructor() {
    super('ShadowingDatabase')
    this.version(1).stores({
      transcripts: '++id, [videoId+textId], start',
    })
    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    this.transcripts = this.table('transcripts')
  }
}

export interface ITranscript {
  id?: number
  videoId: string
  textId: string
  start: number
}

export const db = new ShadowingDatabase()
