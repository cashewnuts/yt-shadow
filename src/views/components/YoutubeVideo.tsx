import React, {
  PropsWithChildren,
  useEffect,
  DOMAttributes,
  useState,
  useRef,
} from 'react'
import { getElementAsync } from '../../helpers/dependency-helper'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('YoutubeVideo.tsx')

export interface YoutubeVideoProps {
  onLoaded?: (args: { video: HTMLVideoElement }) => void
  render: (video: HTMLVideoElement) => any
}

const YoutubeVideo = (
  props: PropsWithChildren<DOMAttributes<HTMLVideoElement> & YoutubeVideoProps>
) => {
  const [video, setVideo] = useState<HTMLVideoElement>()
  const youtubeRef = useRef<HTMLVideoElement | null>(null)
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
      Object.keys(props).forEach((p) => {
        if (p.startsWith('on')) {
          youtubeRef.current?.addEventListener(
            p.substr(2).toLowerCase(),
            (props as any)[p]
          )
        }
      })
    }
    asyncFn()
  }, [])
  return <>{props.render && video && props.render(video)}</>
}

export default YoutubeVideo
