import ShadowingDatabase, { db, ITranscript } from '../models/shadowing-db'

export default class DatabaseService {
  shadowDb: ShadowingDatabase
  constructor(db: ShadowingDatabase) {
    // do
    this.shadowDb = db
  }

  blkUpSert(data: ITranscript | ITranscript[]) {
    const transcripts = Array.isArray(data) ? data : [data]
    this.shadowDb.transcripts.bulkPut(transcripts)
  }
}

export const dbService = new DatabaseService(db)
