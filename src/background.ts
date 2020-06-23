// background-script.js

import { DatabaseAction, ConnectionMessage } from './messages'
import {
  instanceOfDatabaseAction,
  instanceOfTranscriptBulkUpsertAction,
  instanceOfMessage,
  instanceOfTranscriptGetAction,
} from './helpers/message-helper'
import { db } from './storages/shadowing-db'

var portFromCS: browser.runtime.Port

function connected(p: browser.runtime.Port) {
  portFromCS = p
  portFromCS.postMessage<ConnectionMessage>({
    message: 'from background script!',
  })
  portFromCS.onMessage.addListener(async (obj) => {
    if (instanceOfDatabaseAction(obj)) {
      await databaseActionHandler(portFromCS, obj)
    } else if (instanceOfMessage(obj)) {
      console.log(obj.message)
    }
  })
}

async function databaseActionHandler(
  port: browser.runtime.Port,
  action: DatabaseAction
) {
  if (instanceOfTranscriptBulkUpsertAction(action)) {
    let result = true
    console.log('instanceOfTranscriptBulkUpsertAction')
    try {
      await db.transcripts.bulkPut(action.value)
    } catch (err) {
      result = err
      console.error(err)
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
      console.log(host, videoId)
      result = await db.transcripts.where({ host, videoId }).sortBy('start')
    } catch (err) {
      result = err
      console.error(err)
    }
    port.postMessage({
      action: action.action,
      table: action.table,
      method: action.method,
      value: result,
    })
  }
}

browser.runtime.onConnect.addListener(connected)
