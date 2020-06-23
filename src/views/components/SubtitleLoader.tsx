import React, {
  PropsWithChildren,
  useState,
  useEffect,
  useContext,
} from 'react'
import { parseStringPromise } from 'xml2js'
import SRT from '../../models/srt'
import { AppContext } from '@/contexts/AppContext'
import Transcript from '@/models/transcript'

export interface SubtitleLoaderProps {
  videoId?: string
  onSRTLoaded: (response: SRT) => any
  onError?: (err: Error) => any
  render: (renderArg: { loading: boolean; subtitleNotExists: boolean }) => any
}

const getTimedTextUrl = (lang = 'en', v: string) => {
  return `http://video.google.com/timedtext?lang=${lang}&v=${v}`
}

const SubtitleLoader = (props: PropsWithChildren<SubtitleLoaderProps>) => {
  const [loading, setLoading] = useState(true)
  const [subtitleNotExists, setSubtitleNotExists] = useState(false)
  const { videoId, onSRTLoaded, onError } = props
  const { dbMessageService } = useContext(AppContext)

  useEffect(() => {
    const asyncFn = async () => {
      if (!videoId) {
        return
      }
      setSubtitleNotExists(false)
      setLoading(true)
      try {
        const url = getTimedTextUrl('en', videoId)
        console.log('transcript url', url)
        const response = await fetch(url)
        const text = await response.text()
        const xml = await parseStringPromise(text)
        setLoading(false)
        if (!xml) {
          setSubtitleNotExists(true)
          return
        }
        console.log('xml', xml)
        const srt = new SRT(xml)
        const host = window.location.host
        const transcripts = srt.texts.map(
          (t) =>
            new Transcript({
              host,
              videoId,
              start: t.start,
              text: t.text,
              words: t.words,
            })
        )
        const resultUpsert = await dbMessageService?.bulkUpsert(transcripts)
        console.log('result: bulkUpsert', resultUpsert)
        const result = await dbMessageService?.get(host, videoId)
        console.log('result: get', result)
        onSRTLoaded(srt)
      } catch (err) {
        if (onError) {
          onError(err)
        }
      }
    }
    asyncFn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  return (
    <>
      {props.render({ loading, subtitleNotExists })}
      {props.children}
    </>
  )
}

export default SubtitleLoader
