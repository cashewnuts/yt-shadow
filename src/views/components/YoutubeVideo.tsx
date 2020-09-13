import React, {
  PropsWithChildren,
  useEffect,
  DOMAttributes,
  useState,
  useRef,
} from 'react'
import { getElementAsync } from '../../helpers/dependency-helper'
import { createLogger } from '@/helpers/logger'
import { useEventListener } from '../hooks/event-hooks'
const logger = createLogger('YoutubeVideo.tsx')

export interface YoutubeVideoProps {
  onLoaded?: (args: { video: HTMLVideoElement }) => void
  render: (video: HTMLVideoElement) => JSX.Element
}

const YoutubeEventHandler = (
  props: {
    eventKeys: string[]
    video: HTMLVideoElement
  } & DOMAttributes<HTMLVideoElement>
) => {
  const { eventKeys, video } = props
  for (const eventProp of eventKeys) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEventListener(
      eventProp.substr(2).toLowerCase(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (props as any)[eventProp],
      video
    )
  }
  return <></>
}

const YoutubeVideo = (
  props: PropsWithChildren<DOMAttributes<HTMLVideoElement> & YoutubeVideoProps>
) => {
  const [video, setVideo] = useState<HTMLVideoElement>()
  const youtubeRef = useRef<HTMLVideoElement | null>(null)
  const eventKeys = Object.keys(props)
    .filter((p) => p !== 'onLoaded')
    .filter((p) => p.startsWith('on'))
  useEffect(() => {
    const asyncFn = async () => {
      youtubeRef.current = await getElementAsync<HTMLVideoElement>({
        query: "video[src*='blob:https://www.youtube.com']",
      })
      logger.debug('video tag', youtubeRef.current, props)
      if (props.onLoaded) {
        props.onLoaded({ video: youtubeRef.current })
      }
      setVideo(youtubeRef.current)
    }
    asyncFn()
    return () => {
      setVideo(undefined)
    }
  }, [props])

  return (
    <>
      {video && (
        <YoutubeEventHandler {...props} eventKeys={eventKeys} video={video} />
      )}
      {props.render && video && props.render(video)}
    </>
  )
}

export default YoutubeVideo
