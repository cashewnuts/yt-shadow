import { ITranscript } from './shadowing-db'

interface TranscriptParams extends ITranscript {
  text: string
  dur?: number
  answer?: string
  done?: boolean
  skip?: boolean
  createdAt?: number
  updatedAt?: number
}

export default class Transcript implements ITranscript {
  public videoId: string
  public textId: string
  public start: number
  public dur?: number
  public text: string
  public answer: string
  public done: boolean
  public skip: boolean
  public createdAt: number
  public updatedAt: number

  constructor(params: TranscriptParams) {
    const {
      videoId,
      textId,
      start,
      dur,
      text,
      answer,
      done,
      skip,
      createdAt,
      updatedAt,
    } = params
    this.videoId = videoId
    this.textId = textId
    this.start = start
    this.dur = dur
    this.text = text
    this.answer = answer || ''
    this.done = done || false
    this.skip = skip || false
    this.createdAt = createdAt || Date.now()
    this.updatedAt = updatedAt || Date.now()
  }
}
