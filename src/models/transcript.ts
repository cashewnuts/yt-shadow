import { TranscriptIndex } from '@/storages/shadowing-db'

export interface ITranscript extends TranscriptIndex {
  videoId: string
  start: number
  text: string
  dur?: number
  answer?: string
  done?: boolean
  skip?: boolean
  createdAt?: number
  updatedAt?: number
}

export default class Transcript implements ITranscript {
  public host: string
  public videoId: string
  public words: string[]
  public start: number
  public dur?: number
  public text: string
  public answer: string
  public done: boolean
  public skip: boolean
  public createdAt: number
  public updatedAt: number

  constructor(params: ITranscript) {
    const {
      host,
      videoId,
      start,
      words,
      dur,
      text,
      answer,
      done,
      skip,
      createdAt,
      updatedAt,
    } = params
    this.host = host
    this.videoId = videoId
    this.start = start
    this.words = words || []
    this.dur = dur
    this.text = text
    this.answer = answer || ''
    this.done = done || false
    this.skip = skip || false
    this.createdAt = createdAt || Date.now()
    this.updatedAt = updatedAt || Date.now()
  }
}
