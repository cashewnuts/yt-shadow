import React, {
  PropsWithChildren,
  useEffect,
  CSSProperties,
  useState,
} from 'react'
import { Button, Tooltip } from '@blueprintjs/core'

export interface VideoPlayerProps {
  video: HTMLVideoElement
  onToggle?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onRangeOpen?: () => void
  onRepeat?: () => void
  onHelp?: () => void
}

const styles: {
  [key: string]: CSSProperties
} = {
  wrapper: {
    width: 'auto',
  },
  playerWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  alignHorizontal: {
    display: 'flex',
  },
}

const VideoPlayer = (props: PropsWithChildren<VideoPlayerProps>) => {
  const { video } = props
  const [isPlaying, setIsPlaying] = useState(!video.paused)
  useEffect(() => {
    video.addEventListener('playing', () => {
      setIsPlaying(true)
    })
    video.addEventListener('pause', () => {
      setIsPlaying(false)
    })
  }, [video])

  return (
    <div style={styles.wrapper}>
      <div style={styles.playerWrapper}>
        <div style={styles.alignHorizontal}>
          <Tooltip content="help">
            <Button icon="help" onClick={props.onHelp} />
          </Tooltip>
          <Tooltip content="range slider">
            <Button icon="flow-review" onClick={props.onRangeOpen} />
          </Tooltip>
        </div>
        <Tooltip content="replay">
          <Button icon="repeat" onClick={props.onRepeat} />
        </Tooltip>
        <Tooltip content={isPlaying ? 'stop' : 'play'}>
          <Button icon={isPlaying ? 'stop' : 'play'} onClick={props.onToggle} />
        </Tooltip>
        <div style={styles.alignHorizontal}>
          <Tooltip content="previous">
            <Button icon="arrow-left" onClick={props.onPrevious} />
          </Tooltip>
          <Tooltip content="next">
            <Button icon="arrow-right" onClick={props.onNext} />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
