import SRT from '../srt'
import { xmlObj } from './xml-obj'

describe('srt.ts', () => {
  it('can parse', () => {
    try {
      const srt = new SRT(xmlObj)
      expect(srt).toBeTruthy()
    } catch (err) {
      fail(err)
    }
  })
})
