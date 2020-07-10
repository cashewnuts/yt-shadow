export interface DatabaseAction {
  action: 'database'
  table: string
  method: string
  value?: unknown
}

export * from './transcript-action'
export * from './video-action'
