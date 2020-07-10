import ShadowingDatabase, { db } from '../storages/shadowing-db'

export default class StorageService {
  constructor(private db: ShadowingDatabase) {}
}
