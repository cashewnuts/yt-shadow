import { v4 as uuidv4 } from 'uuid'
import { checkSpokenChar, WHITE_SPACE } from '@/helpers/text-helper'

export interface WordProcessorResult {
  w: string
  s?: string
  mask: string
  correct: boolean
  spoken: boolean
}

export class WordProcessor {
  key: string
  srtWord: string
  results: WordProcessorResult[]
  showIndexes: number[]
  length = 0
  constructor(word: string) {
    this.key = uuidv4()
    this.srtWord = word
    this.showIndexes = []
    this.results = word.split('').map((w) => {
      const spoken = checkSpokenChar(w)
      return {
        w,
        mask: WHITE_SPACE,
        correct: !spoken,
        spoken,
      }
    })
  }

  get isCorrect() {
    return (
      this.srtWord.length === this.results.length &&
      this.results.every((r) => r.correct)
    )
  }
  get hasInput() {
    return this.results.filter((r) => r.s).length > 0
  }
  get end() {
    return this.results.every((r) => Boolean(r.s || !r.spoken))
  }
  get answerText() {
    return this.results
      .map(({ s }) => s)
      .filter(Boolean)
      .join('')
  }
  get hasSomeSpoken() {
    return this.results.some((r) => r.spoken)
  }

  validInput() {
    return this.results
      .map((r) => {
        if (r.spoken) {
          return r.s
        }
      })
      .filter(Boolean)
      .join('')
  }

  input(str: string) {
    let offsetCursor = 0
    this.length = 0
    const word = this.srtWord
    const results: WordProcessorResult[] = []
    let index = 0
    if (!this.hasSomeSpoken) {
      index = -1
    } else {
      for (index = 0; index < str.length; index++) {
        const s = str[index]
        const isSpace = /\s/.test(s)
        if (isSpace) {
          offsetCursor++
          continue
        }
        for (let j = index - offsetCursor; j < word.length; j++) {
          const w = word[j]
          const spoken = checkSpokenChar(w)

          if (word.length <= results.length) {
            break
          }
          // if 's' is Symbols and not equels to 'w', then check next char is correct
          if (!spoken && w !== s) {
            results.push({
              w,
              s: w,
              mask: WHITE_SPACE,
              correct: true,
              spoken,
            })
            offsetCursor--
          } else {
            break
          }
        }
        if (word.length <= results.length) {
          break
        }
        const wordIndex = index - offsetCursor
        const w = word[wordIndex]
        const spoken = checkSpokenChar(w)
        results.push({
          w,
          s,
          mask: WHITE_SPACE,
          correct: s.toLowerCase() === w.toLowerCase() || !spoken,
          spoken,
        })
        if (word.length <= results.length) {
          break
        }
        if (word.length - 1 === wordIndex + 1) {
          const nextS = str[index + 1]
          const nextW = word[wordIndex + 1]
          const nextSpoken = checkSpokenChar(nextW)
          if (!nextSpoken && nextS !== nextW) {
            break
          }
        }
      }
    }
    this.results = word.split('').map((w, idx) => {
      const reslt = results[idx]
      if (reslt) {
        return reslt
      }
      const spoken = checkSpokenChar(w)
      return {
        w,
        s: undefined,
        mask: WHITE_SPACE,
        correct: !spoken,
        spoken,
      }
    })
    this.length = index + 1
    return str.substr(this.length)
  }
}
