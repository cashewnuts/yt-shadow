/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DatabaseAction,
  Message,
  TranscriptBulkUpsertAction,
  TranscriptGetAction,
  TranscriptPatchAction,
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
export function instanceOfTranscriptBulkUpsertAction(
  object: any
): object is TranscriptBulkUpsertAction {
  return instanceOfDatabaseAction(object) && object.method === 'bulkUpsert'
}
export function instanceOfTranscriptGetAction(
  object: any
): object is TranscriptGetAction {
  return instanceOfDatabaseAction(object) && object.method === 'get'
}
export function instanceOfTranscriptPatchAction(
  object: any
): object is TranscriptPatchAction {
  return instanceOfDatabaseAction(object) && object.method === 'patch'
}

export function instanceOfMessage(object: any): object is Message {
  return 'message' in object
}
