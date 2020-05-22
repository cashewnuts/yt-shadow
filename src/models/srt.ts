import { checkBePunctuated } from '../helpers/text-helper'

export interface SRTWord {
  word: string
  masked: string
}

export interface SRTText {
  start: number
  dur: number
  text: string
  words: SRTWord[]
  done: boolean
}

export default class SRT {
  xml: unknown
  texts: SRTText[]
  constructor(xmlObj: any) {
    this.xml = xmlObj
    this.texts = []
    this.parse_()
  }

  private parse_() {
    const textArr: any[] = (this.xml as any).transcript.text
    this.texts = textArr
      .map((t) => {
        const start = parseInt(t.$.start, 10)
        const dur = parseInt(t.$.dur, 10)
        const text = t._
        if (!text) {
          return undefined
        }
        const words = text.split(/\s|\rn/).map((word: string) => {
          return {
            word,
            masked: '',
          }
        })
        const done = checkBePunctuated(text)
        return {
          start,
          dur,
          text,
          words,
          done,
        }
      })
      .filter((x): x is SRTText => Boolean(x))
  }
}
