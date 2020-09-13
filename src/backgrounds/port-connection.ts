import {
  DatabaseAction,
  TranscriptAction,
  ConnectionMessage,
  VideoAction,
  RequestContentAction,
  RequestDictionaryAction,
} from '../messages'
import {
  instanceOfDatabaseAction,
  instanceOfTranscriptBulkUpsertAction,
  instanceOfMessage,
  instanceOfTranscriptGetAllAction,
  instanceOfTranscriptPatchAction,
  instanceOfTranscriptGetAction,
  instanceOfTranscriptFindAction,
  instanceOfTranscriptAction,
  instanceOfVideoBulkUpsertAction,
  instanceOfVideoAction,
  instanceOfVideoUpsertAction,
  instanceOfRequestContentAction,
  instanceOfRequestAction,
  instanceOfRequestDictionaryAction,
} from '../helpers/message-helper'
import { db } from '../storages/shadowing-db'
import { createLogger } from '../helpers/logger'
import zip from 'lodash/zip'
import { ITranscript } from '../models/transcript'
const logger = createLogger('background.ts')

let portFromCS: browser.runtime.Port[] = []

const expandError = (err: Error) => ({
  name: err.name,
  message: err.message,
  stack: err.stack,
})
const postDatabaseAction = (
  port: browser.runtime.Port,
  action: DatabaseAction,
  value: unknown
) => {
  port.postMessage({
    action: action.action,
    table: action.table,
    method: action.method,
    value,
  })
}
const throwDatabaseAction = (
  port: browser.runtime.Port,
  action: DatabaseAction,
  error: Error
) => {
  port.postMessage({
    action: action.action,
    table: action.table,
    method: action.method,
    error: expandError(error),
  })
}

async function handleTranscriptAction(
  port: browser.runtime.Port,
  action: TranscriptAction
) {
  if (instanceOfTranscriptBulkUpsertAction(action)) {
    const result = true
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
          putItems.push({
            ...item,
            createdAt: script?.createdAt || Date.now(),
            updatedAt: Date.now(),
          })
          continue
        }
      }
      logger.debug('bulkPut', putItems)
      const bulkPutResult = await db.transcripts.bulkPut(putItems)
      logger.debug('result bulkPut', bulkPutResult)
      postDatabaseAction(port, action, result)
    } catch (err) {
      logger.error(err)
      throwDatabaseAction(port, action, err)
    }
  } else if (instanceOfTranscriptGetAction(action)) {
    let result = null
    try {
      const { host, videoId, start } = action.value
      logger.debug('get', host, videoId, start)
      result = await db.transcripts.get({ host, videoId, start })
      logger.info('result get', result)
      postDatabaseAction(port, action, result)
    } catch (err) {
      logger.error(err)
      throwDatabaseAction(port, action, err)
    }
  } else if (instanceOfTranscriptGetAllAction(action)) {
    let result = null
    try {
      const { host, videoId } = action.value
      logger.debug('getAll', host, videoId)
      result = await db.transcripts.where({ host, videoId }).sortBy('start')
      logger.info('result getAll', result)
      postDatabaseAction(port, action, result)
    } catch (err) {
      logger.error(err)
      throwDatabaseAction(port, action, err)
    }
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
      postDatabaseAction(port, action, result)
    } catch (err) {
      logger.error(err)
      throwDatabaseAction(port, action, err)
    }
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
          createdAt: createdAt || Date.now(),
          updatedAt: Date.now(),
        }
        logger.debug('patch', mergedObj)
        result = await db.transcripts.put(mergedObj)
        logger.info('patch', result)
      } else {
        result = await db.transcripts.put({ ...value, updatedAt: Date.now() })
      }
      postDatabaseAction(port, action, result)
    } catch (err) {
      logger.error(err)
      throwDatabaseAction(port, action, err)
    }
  }
}

async function handleVideoAction(
  port: browser.runtime.Port,
  action: VideoAction
) {
  if (instanceOfVideoUpsertAction(action)) {
    const { value } = action
    let result = null
    try {
      const { host, videoId } = action.value
      const video = await db.videos.get({ host, videoId })
      const putValue = {
        ...value,
        createdAt: video?.createdAt || Date.now(),
        updatedAt: Date.now(),
      }
      logger.debug('upsert', value)
      result = await db.videos.put(putValue)
      logger.debug('result upsert', result)
      postDatabaseAction(port, action, result)
    } catch (err) {
      logger.error(err)
      throwDatabaseAction(port, action, err)
    }
  } else if (instanceOfVideoBulkUpsertAction(action)) {
    logger.error('This method of action is not implemented', action)
  } else {
    logger.error('This method of action is not implemented', action)
  }
}

async function databaseActionHandler(
  port: browser.runtime.Port,
  action: DatabaseAction
) {
  if (instanceOfTranscriptAction(action)) {
    return handleTranscriptAction(port, action)
  } else if (instanceOfVideoAction(action)) {
    return handleVideoAction(port, action)
  } else {
    logger.error('This table of action is not implemented', action)
  }
}

async function requestContentActionHandler(
  port: browser.runtime.Port,
  action: RequestContentAction
) {
  let result = null
  const { url, options } = action
  try {
    const response = await fetch(url, options)
    result = await response[action.contentType]()
    logger.debug('requestContentActionHandler', { result })
    port.postMessage({
      action: action.action,
      contentType: action.contentType,
      url: action.url,
      value: result,
    })
  } catch (err) {
    logger.error(err)
    port.postMessage({
      action: action.action,
      contentType: action.contentType,
      url: action.url,
      error: expandError(err),
    })
  }
}
async function requestDictionaryActionHandler(
  port: browser.runtime.Port,
  action: RequestDictionaryAction
) {
  let result = null
  const { word, options } = action
  try {
    const url = `https://owlbot.info/api/v4/dictionary/${encodeURIComponent(
      word
    )}`
    const apiToken = process.env.OWLBOT_API_TOKEN
    const _options = {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Token ${apiToken}`,
      },
    }
    const response = await fetch(url, _options)
    if (200 <= response.status && response.status < 300) {
      result = await response.json()
      logger.debug('requestDictionaryActionHandler', { result })
      port.postMessage({
        action: action.action,
        contentType: action.contentType,
        word: action.word,
        value: result,
      })
    } else {
      throw new Error(JSON.stringify(await response.json()))
    }
  } catch (err) {
    logger.error(err)
    port.postMessage({
      action: action.action,
      contentType: action.contentType,
      word: action.word,
      error: expandError(err),
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
    } else if (instanceOfRequestAction(obj)) {
      if (instanceOfRequestContentAction(obj)) {
        await requestContentActionHandler(p, obj)
      } else if (instanceOfRequestDictionaryAction(obj)) {
        await requestDictionaryActionHandler(p, obj)
      }
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
