import React, {
  PropsWithChildren,
  useState,
  useEffect,
  useContext,
} from 'react'
import { parseStringPromise } from 'xml2js'
import SRT from '../../models/srt'
import Transcript from '@/models/transcript'
import { createLogger } from '@/helpers/logger'
import { MessageContext } from '@/contexts/MessageContext'
import Video from '@/models/video'
const logger = createLogger('SubtitleLoader.tsx')

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
  const { transcriptMessage, videoMessage } = useContext(MessageContext)

  useEffect(() => {
    const asyncFn = async () => {
      if (!videoId) {
        return
      }
      setSubtitleNotExists(false)
      setLoading(true)
      try {
        const url = getTimedTextUrl('en', videoId)
        logger.debug('transcript url', url)
        const response = await fetch(url)
        const text = await response.text()
        const xml = await parseStringPromise(text)
        setLoading(false)
        if (!xml) {
          setSubtitleNotExists(true)
          return
        }
        logger.debug('xml', xml)
        const srt = new SRT(xml)
        onSRTLoaded(srt)
        const { host, href } = window.location
        const transcripts = srt.texts.map(
          (t) =>
            new Transcript({
              host,
              videoId,
              start: t.start,
              text: t.text,
              dur: t.dur,
            })
        )
        const resultUpsert = await transcriptMessage?.bulkUpsert(transcripts)
        await videoMessage?.upsert(
          new Video({
            host,
            videoId,
            title: document.title,
            url: href,
          })
        )
        logger.debug('result: bulkUpsert', resultUpsert)
        const result = await transcriptMessage?.getAll(host, videoId)
        logger.debug('result: get', result)
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
