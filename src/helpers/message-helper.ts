/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DatabaseAction,
  Message,
  TranscriptAction,
  TranscriptBulkUpsertAction,
  TranscriptGetAllAction,
  TranscriptPatchAction,
  TranscriptGetAction,
  TranscriptFindAction,
  VideoBulkUpsertAction,
  VideoAction,
  VideoUpsertAction,
  RequestAction,
} from '@/messages'

export function instanceOfDatabaseAction(
  object: any
): object is DatabaseAction {
  return (
    'action' in object &&
    'table' in object &&
    'method' in object &&
    object.action === 'database'
  )
}

/*
 * Transcript Actions
 */
export function instanceOfTranscriptAction(
  object: any
): object is TranscriptAction {
  return instanceOfDatabaseAction(object) && object.table === 'transcripts'
}
export function instanceOfTranscriptBulkUpsertAction(
  object: any
): object is TranscriptBulkUpsertAction {
  return instanceOfTranscriptAction(object) && object.method === 'bulkUpsert'
}
export function instanceOfTranscriptGetAction(
  object: any
): object is TranscriptGetAction {
  return instanceOfTranscriptAction(object) && object.method === 'get'
}
export function instanceOfTranscriptGetAllAction(
  object: any
): object is TranscriptGetAllAction {
  return instanceOfTranscriptAction(object) && object.method === 'getAll'
}
export function instanceOfTranscriptFindAction(
  object: any
): object is TranscriptFindAction {
  return instanceOfTranscriptAction(object) && object.method === 'find'
}
export function instanceOfTranscriptPatchAction(
  object: any
): object is TranscriptPatchAction {
  return instanceOfTranscriptAction(object) && object.method === 'patch'
}

export function instanceOfMessage(object: any): object is Message {
  return 'message' in object
}

/*
 * Video Actions
 */
export function instanceOfVideoAction(object: any): object is VideoAction {
  return instanceOfDatabaseAction(object) && object.table === 'videos'
}
export function instanceOfVideoUpsertAction(
  object: any
): object is VideoUpsertAction {
  return instanceOfVideoAction(object) && object.method === 'upsert'
}
export function instanceOfVideoBulkUpsertAction(
  object: any
): object is VideoBulkUpsertAction {
  return instanceOfVideoAction(object) && object.method === 'bulkUpsert'
}

/*
 * Request Action
 */
export function instanceOfRequestAction(object: any): object is RequestAction {
  return 'action' in object && 'contentType' in object && 'url' in object
}
