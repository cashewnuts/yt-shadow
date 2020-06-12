import Dexie from 'dexie'

export default class ShadowingDatabase extends Dexie {
  transcripts: Dexie.Table<ITranscript, string>

  constructor() {
    super('ShadowingDatabase')
    this.version(1).stores({
      transcripts: '++id, first, last',
    })
    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    this.transcripts = this.table('transcripts')
  }
}

export interface ITranscript {
  videoId: string
  textId: string
  start: number
}

export const db = new ShadowingDatabase()
