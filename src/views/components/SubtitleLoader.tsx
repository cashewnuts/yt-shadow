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
  onSRTLoaded: (response: SRT) => void
  onError?: (err: Error) => void
  render: (renderArg: {
    loading: boolean
    subtitleNotExists: boolean
  }) => JSX.Element
}

const getTimedTextUrl = (lang = 'en', v: string) => {
  return `https://video.google.com/timedtext?lang=${lang}&v=${v}`
}

const getYoutubeTitle = async () => {
  const suffix = ' - YouTube'
  return new Promise<string>((resolve, reject) => {
    let count = 0
    const tryResolve = () => {
      count++
      const title = document.title
      const lastIndex = title.lastIndexOf(suffix)
      if (lastIndex > 0) {
        return resolve(title.substring(0, lastIndex))
      } else if (count > 10) {
        return reject(new Error(`Cannot get title of YouTube: ${title}`))
      }
      setTimeout(tryResolve, 100)
    }
    tryResolve()
  })
}

const SubtitleLoader = (props: PropsWithChildren<SubtitleLoaderProps>) => {
  const [loading, setLoading] = useState(true)
  const [subtitleNotExists, setSubtitleNotExists] = useState(false)
  const { videoId, onSRTLoaded, onError } = props
  const messangers = useContext(MessageContext)

  useEffect(() => {
    const asyncFn = async () => {
      if (!videoId || !messangers) {
        return
      }
      const { transcriptMessage, videoMessage, requestMessage } = messangers
      setSubtitleNotExists(false)
      setLoading(true)
      try {
        const url = getTimedTextUrl('en', videoId)
        logger.debug('transcript url', url)
        const responseText = await requestMessage?.getText(url)
        const xml = await parseStringPromise(responseText || '')
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
              skip: !t.spoken,
            })
        )
        const resultUpsert = await transcriptMessage?.bulkUpsert(transcripts)
        logger.debug('result: bulkUpsert', resultUpsert)
        await videoMessage?.upsert(
          new Video({
            host,
            videoId,
            title: await getYoutubeTitle(),
            url: href,
          })
        )
      } catch (err) {
        if (onError) {
          onError(err)
        }
      }
    }
    asyncFn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, messangers])

  return (
    <>
      {props.render({ loading, subtitleNotExists })}
      {props.children}
    </>
  )
}

export default SubtitleLoader
