import { DatabaseAction, ConnectionMessage } from '../messages'
import {
  instanceOfDatabaseAction,
  instanceOfTranscriptBulkUpsertAction,
  instanceOfMessage,
  instanceOfTranscriptGetAllAction,
  instanceOfTranscriptPatchAction,
  instanceOfTranscriptGetAction,
  instanceOfTranscriptFindAction,
} from '../helpers/message-helper'
import { db } from '../storages/shadowing-db'
import { createLogger } from '../helpers/logger'
import zip from 'lodash/zip'
import { ITranscript } from '../models/transcript'
const logger = createLogger('background.ts')

let portFromCS: browser.runtime.Port[] = []

async function databaseActionHandler(
  port: browser.runtime.Port,
  action: DatabaseAction
) {
  if (instanceOfTranscriptBulkUpsertAction(action)) {
    let result = true
    try {
      const keys = action.value.map(({ host, videoId, start }) => [
        host,
        videoId,
        start,
      ])
      const savedTranscripts = await db.transcripts
        .where('[host+videoId+start]')
        .anyOf(keys)
        .toArray()
      const putItems: ITranscript[] = []
      for (const [item, script] of zip(action.value, savedTranscripts)) {
        if (!item) {
          logger.error('bulkUpsert operation must be wrong', {
            value: action.value,
            savedTranscripts,
          })
          continue
        }
        // If different from db then put or overwrite
        if (!script || item.text !== script.text) {
          putItems.push(item)
          continue
        }
      }
      logger.debug('bulkPut', putItems)
      await db.transcripts.bulkPut(putItems)
    } catch (err) {
      result = err
      logger.error(err)
    }
    port.postMessage({
      action: action.action,
      table: action.table,
      method: action.method,
      value: result,
    })
  } else if (instanceOfTranscriptGetAction(action)) {
    let result = null
    try {
      const { host, videoId, start } = action.value
      logger.debug('get', host, videoId, start)
      result = await db.transcripts.get({ host, videoId, start })
    } catch (err) {
      result = err
      logger.error(err)
    }
    logger.info('result get', result)
    port.postMessage({
      action: action.action,
      table: action.table,
      method: action.method,
      value: result,
    })
  } else if (instanceOfTranscriptGetAllAction(action)) {
    let result = null
    try {
      const { host, videoId } = action.value
      logger.debug('getAll', host, videoId)
      result = await db.transcripts.where({ host, videoId }).sortBy('start')
      logger.info('result getAll', result)
    } catch (err) {
      result = err
      logger.error(err)
    }
    port.postMessage({
      action: action.action,
      table: action.table,
      method: action.method,
      value: result,
    })
  } else if (instanceOfTranscriptFindAction(action)) {
    let result = null
    try {
      const { host, videoId, filters } = action.value
      const filtersArr = Object.keys(filters)
        .filter((key) => filters[key] !== undefined)
        .map((key) => ({
          prop: key,
          value: filters[key],
        }))
      logger.debug('find', host, videoId, filters)
      result = await db.transcripts
        .where({ host, videoId })
        .filter((transcript) => {
          for (const filterItem of filtersArr) {
            if (
              filterItem.prop === 'from' &&
              (filterItem.value as number) < transcript.start
            ) {
              return false
            }
            if (
              filterItem.prop === 'to' &&
              transcript.start < (filterItem.value as number)
            ) {
              return false
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (filterItem.value !== (transcript as any)[filterItem.prop]) {
              return false
            }
          }
          return true
        })
        .sortBy('start')
      logger.info('result find', result)
    } catch (err) {
      result = err
      logger.error(err)
    }
    port.postMessage({
      action: action.action,
      table: action.table,
      method: action.method,
      value: result,
    })
  } else if (instanceOfTranscriptPatchAction(action)) {
    let result = null
    try {
      const { value } = action.value
      const { host, videoId, start, ...rest } = value
      const transcript = await db.transcripts.get({ host, videoId, start })
      if (transcript) {
        const { createdAt } = transcript
        const mergedObj = {
          ...transcript,
          ...rest,
          createdAt,
          updatedAt: Date.now(),
        }
        logger.debug('patch', mergedObj)
        result = await db.transcripts.put(mergedObj)
        logger.info('patch', result)
      } else {
        result = await db.transcripts.put({ ...value, updatedAt: Date.now() })
      }
    } catch (err) {
      result = err
      logger.error(err)
    }
    port.postMessage({
      action: action.action,
      table: action.table,
      method: action.method,
      value: result,
    })
  }
}

export function connected(p: browser.runtime.Port) {
  p.postMessage<ConnectionMessage>({
    message: 'from background script!',
  })
  const onMessageHandler = async (obj: unknown) => {
    if (instanceOfDatabaseAction(obj)) {
      await databaseActionHandler(p, obj)
    } else if (instanceOfMessage(obj)) {
      logger.info(obj.message)
    }
  }
  const onDisconnectHandler = () => {
    p.onMessage.removeListener(onMessageHandler)
    p.onDisconnect.removeListener(onDisconnectHandler)
    portFromCS = portFromCS.filter((item) => item !== p)
  }
  p.onMessage.addListener(onMessageHandler)
  p.onDisconnect.addListener(onDisconnectHandler)
  portFromCS.push(p)
}
