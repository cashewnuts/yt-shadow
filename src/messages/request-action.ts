export type ContentType = 'text' | 'json'

export interface RequestAction {
  action: 'request'
  contentType: ContentType
  url: string
  value?: unknown
}

export interface TextRequestAction extends RequestAction {
  contentType: 'text'
}

export interface JsonRequestAction extends RequestAction {
  contentType: 'json'
}
