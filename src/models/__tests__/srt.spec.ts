import SRT from '../srt'
import { xmlObj, xmlObjShort, xmlObjWithNonSpeaking } from './xml-obj.data'

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
})
