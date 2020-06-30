// background-script.js

import { DatabaseAction, ConnectionMessage } from './messages'
import {
  instanceOfDatabaseAction,
  instanceOfTranscriptBulkUpsertAction,
  instanceOfMessage,
  instanceOfTranscriptGetAllAction,
  instanceOfTranscriptPatchAction,
  instanceOfTranscriptGetAction,
} from './helpers/message-helper'
import { db } from './storages/shadowing-db'
import { createLogger } from './helpers/logger'
import zip from 'lodash/zip'
import { ITranscript } from './models/transcript'
const logger = createLogger('background.ts')

let portFromCS: browser.runtime.Port

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

function connected(p: browser.runtime.Port) {
  portFromCS = p
  portFromCS.postMessage<ConnectionMessage>({
    message: 'from background script!',
  })
  portFromCS.onMessage.addListener(async (obj) => {
    if (instanceOfDatabaseAction(obj)) {
      await databaseActionHandler(portFromCS, obj)
    } else if (instanceOfMessage(obj)) {
      logger.info(obj.message)
    }
  })
}

browser.runtime.onConnect.addListener(connected)
