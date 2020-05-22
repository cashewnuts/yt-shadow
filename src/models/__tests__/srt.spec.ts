import SRT from '../srt'
import { xmlObj } from './xml-obj.data'

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
    const srt = new SRT(xmlObj)
    expect(srt.texts).toHaveLength(24)
  })
  it('can parse text', () => {
    const srt = new SRT(xmlObj)
    expect(srt.paragraphs).toHaveLength(12)
  })
})
