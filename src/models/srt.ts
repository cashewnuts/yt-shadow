import {
  checkBePunctuated,
  checkSpokenText,
  splitTextIntoWords,
} from '../helpers/text-helper'
import { decode } from 'entities'

export interface SRTMeasure {
  start: number
  dur: number
  end: number
  text: string
  words: string[]
}

export interface SRTText extends SRTMeasure {
  raw: string
  done: boolean
  spoken: boolean
}
export interface SRTParagraph extends SRTMeasure {
  srtTexts: SRTText[]
}

export default class SRT {
  xml: unknown
  texts: SRTText[]
  paragraphs: SRTParagraph[]
  constructor(xmlObj: any) {
    this.xml = xmlObj
    this.texts = []
    this.paragraphs = []
    this.parse_()
  }

  private parse_() {
    this.parseText_()
    this.parseParagraph_()
  }
  private parseText_() {
    const textArr: any[] = (this.xml as any).transcript.text
    this.texts = textArr
      .map((t) => {
        const start = parseInt(t.$.start, 10)
        const dur = parseInt(t.$.dur, 10)
        const rawText = t._ as string
        if (!rawText) {
          return undefined
        }
        const text = decode(rawText)
        const words = splitTextIntoWords(text)
        const done = checkBePunctuated(text)
        const spoken = checkSpokenText(text)
        return {
          start,
          dur,
          end: start + dur,
          text,
          raw: rawText,
          words,
          done,
          spoken,
        }
      })
      .filter((x): x is SRTText => Boolean(x))
  }
  private parseParagraph_() {
    const constructParagraph = (textList: SRTText[]): SRTParagraph => {
      const first = textList[0]
      const last = textList[textList.length - 1]
      const end = last.start + last.dur
      const dur = end - first.start
      return {
        start: first.start,
        dur,
        end,
        text: textList.map((t) => t.text).join(' '),
        words: textList.flatMap((t) => t.words),
        srtTexts: textList,
      }
    }
    let tempTextList = []
    for (const text of this.texts) {
      if (!text.spoken) {
        continue
      }
      tempTextList.push(text)
      if (text.done) {
        this.paragraphs = [...this.paragraphs, constructParagraph(tempTextList)]
        tempTextList = []
      }
    }
    if (tempTextList.length > 0) {
      this.paragraphs = [...this.paragraphs, constructParagraph(tempTextList)]
    }
  }
}
