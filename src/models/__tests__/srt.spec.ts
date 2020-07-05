import SRT from '../srt'
import {
  xmlObj,
  xmlObjShort,
  xmlObjWithNonSpeaking,
  objCode39,
  objQuote,
} from './xml-obj.data'

describe('srt.ts', () => {
  it('can parse', () => {
    try {
      const srt = new SRT(xmlObj)
      expect(srt).toBeTruthy()
    } catch (err) {
      fail(err)
    }
  })
  it('can parse text', () => {
    const srt = new SRT(xmlObjShort)
    expect(srt.texts).toHaveLength(10)
  })
  it('can parse for paragraphs', () => {
    const srt = new SRT(xmlObjShort)
    expect(srt.paragraphs).toHaveLength(6)
  })
  it('can parse and omit non speaks from paragraph', () => {
    const srt = new SRT(xmlObjWithNonSpeaking)
    expect(srt.texts).toHaveLength(8)
    expect(srt.paragraphs).toHaveLength(3)
  })
  it('can decode code 39', () => {
    const srt = new SRT(objCode39)
    expect(srt.texts[0].words[4].word).toBe("it's")
  })
  it('can decode quote', () => {
    const srt = new SRT(objQuote)
    const { texts } = srt
    const [text] = texts
    expect(text.words[text.words.length - 1].word).toBe('done."')
  })
})
