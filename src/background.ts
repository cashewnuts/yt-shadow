// background-script.js

import { DatabaseAction, ConnectionMessage } from './messages'
import {
  instanceOfDatabaseAction,
  instanceOfTranscriptBulkUpsertAction,
  instanceOfMessage,
  instanceOfTranscriptGetAction,
  instanceOfTranscriptPatchAction,
} from './helpers/message-helper'
import { db } from './storages/shadowing-db'
import { createLogger } from './helpers/logger'
const logger = createLogger('background.ts')

let portFromCS: browser.runtime.Port

async function databaseActionHandler(
  port: browser.runtime.Port,
  action: DatabaseAction
) {
  if (instanceOfTranscriptBulkUpsertAction(action)) {
    let result = true
    logger.debug('instanceOfTranscriptBulkUpsertAction')
    try {
      await db.transcripts.bulkPut(action.value)
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
      const { host, videoId } = action.value
      logger.debug(host, videoId)
      result = await db.transcripts.where({ host, videoId }).sortBy('start')
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
        const mergedObj = {
          ...transcript,
          ...rest,
        }
        result = await db.transcripts.put(mergedObj)
      } else {
        result = await db.transcripts.put(value)
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
