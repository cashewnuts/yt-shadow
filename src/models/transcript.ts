import { TranscriptIndex } from '@/storages/shadowing-db'
import { splitTextIntoWords } from '@/helpers/text-helper'

export interface ITranscript extends TranscriptIndex {
  text: string
  dur?: number
  answer?: string
  done?: boolean
  skip?: boolean
  correct?: boolean
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
  public correct: boolean
  public createdAt: number
  public updatedAt: number

  public static mergeObject(...transcripts: ITranscript[]) {
    const [first, ...rest] = transcripts
    const integerOrMax = (num?: number) =>
      Number.isInteger(num) ? (num as number) : Number.MAX_SAFE_INTEGER
    return rest.reduce((prev, mergeObj) => {
      const createdAt =
        integerOrMax(prev.createdAt) < integerOrMax(mergeObj.createdAt)
          ? prev.createdAt
          : mergeObj.createdAt
      return {
        ...mergeObj,
        ...prev,
        createdAt,
      }
    }, first)
  }

  constructor(params: ITranscript) {
    const {
      host,
      videoId,
      start,
      dur,
      text,
      answer,
      done,
      skip,
      correct,
      createdAt,
      updatedAt,
    } = params
    this.host = host
    this.videoId = videoId
    this.start = start
    this.words = Object.keys(
      splitTextIntoWords(text).reduce(
        (wordObj: { [key: string]: boolean }, word) => {
          wordObj[word] = true
          return wordObj
        },
        {}
      )
    )
    this.dur = dur
    this.text = text
    this.answer = answer || ''
    this.done = done || false
    this.skip = skip || false
    this.correct = correct || false
    this.createdAt = createdAt || Date.now()
    this.updatedAt = updatedAt || Date.now()
  }
}
