import { VideoIndex } from '@/storages/shadowing-db'
import { splitTextIntoWords } from '@/helpers/text-helper'

export interface IVideo extends VideoIndex {
  title: string
  url: string
  createdAt?: number
  updatedAt?: number
}

export interface VideoParams extends IVideo {
  title: string
  words?: string[]
}

export default class Video implements IVideo {
  host: string
  videoId: string
  words: string[]
  title: string
  url: string
  dur?: number
  createdAt?: number
  updatedAt?: number
  constructor({
    host,
    videoId,
    words,
    title,
    url,
    createdAt,
    updatedAt,
  }: VideoParams) {
    this.host = host
    this.videoId = videoId
    this.title = title
    this.url = url
    this.words =
      words ||
      Object.keys(
        splitTextIntoWords(title).reduce(
          (wordObj: { [key: string]: boolean }, word) => {
            wordObj[word] = true
            return wordObj
          },
          {}
        )
      )
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
