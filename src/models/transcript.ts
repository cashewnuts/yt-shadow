import { ITranscript } from './shadowing-db'
import sha256 from 'crypto-js/sha256'
import base64 from 'crypto-js/enc-base64'

export interface TranscriptParams extends Omit<ITranscript, 'textId'> {
  textId?: string
  text: string
  dur?: number
  answer?: string
  done?: boolean
  skip?: boolean
  createdAt?: number
  updatedAt?: number
}

export default class Transcript implements ITranscript {
  public id?: number
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
      id,
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
    this.id = id
    this.videoId = videoId
    this.textId = textId || sha256(text).toString(base64)
    this.start = start
    this.dur = dur
    this.text = text
    this.answer = answer || ''
    this.done = done || false
    this.skip = skip || false
    this.createdAt = createdAt || Date.now()
    this.updatedAt = updatedAt || Date.now()
    if (!this.textId) {
      throw new Error('textId is not set.')
    }
  }
}
