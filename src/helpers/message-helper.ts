import {
  DatabaseAction,
  Message,
  TranscriptBulkUpsertAction,
  TranscriptGetAction,
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

export function instanceOfMessage(object: any): object is Message {
  return 'message' in object
}
