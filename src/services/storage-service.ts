import ShadowingDatabase, { db } from '../storages/shadowing-db'

export default class StorageService {
  constructor(private db: ShadowingDatabase) {}

  queryVideos({ limit, offset = 0 }: { limit: number; offset: number }) {
    return this.db.videos
      .orderBy('updatedAt')
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray()
  }
}
