import React, { createContext, PropsWithChildren } from 'react'
import { createLogger } from '@/helpers/logger'
import StorageService from '@/services/storage-service'
import { db } from '@/storages/shadowing-db'
const logger = createLogger('StorageContext.tsx')

export interface StorageContextParams {
  storageService?: StorageService
}

export const StorageContext = createContext<StorageContextParams>({})

export const StorageContextProvider = (props: PropsWithChildren<unknown>) => {
  return (
    <StorageContext.Provider
      value={{
        storageService: new StorageService(db),
      }}
    >
      {props.children}
    </StorageContext.Provider>
  )
}

export const StorageContextConsumer = StorageContext.Consumer
