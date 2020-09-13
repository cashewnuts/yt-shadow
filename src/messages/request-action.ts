export type ContentType = 'text' | 'json'

export interface RequestAction {
  action: 'request'
  contentType: string
  options?: RequestInit
  value?: unknown
  error?: unknown
}

export interface RequestContentAction extends RequestAction {
  url: string
  contentType: ContentType
}

export interface TextRequestAction extends RequestContentAction {
  contentType: 'text'
}

export interface JsonRequestAction extends RequestContentAction {
  contentType: 'json'
}

export interface RequestDictionaryAction extends RequestAction {
  contentType: 'dictionary'
  word: string
}
