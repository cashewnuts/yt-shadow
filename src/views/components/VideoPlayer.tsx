import React, {
  PropsWithChildren,
  useEffect,
  CSSProperties,
  useState,
} from 'react'

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
  button: {
    height: '30px',
    lineHeight: 1,
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
        <button style={styles.button} onClick={props.onHelp}>
          help
        </button>
        <button style={styles.button} onClick={props.onRangeOpen}>
          range
        </button>
        <button style={styles.button} onClick={props.onRepeat}>
          repeat
        </button>
        <button style={styles.button} onClick={props.onToggle}>
          {isPlaying ? 'stop' : 'play'}
        </button>
        <button style={styles.button} onClick={props.onPrevious}>
          previous
        </button>
        <button style={styles.button} onClick={props.onNext}>
          next
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
