import React, {
  PropsWithChildren,
  useEffect,
  useState,
  CSSProperties,
  ChangeEvent,
} from 'react'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('VideoSlider.tsx')

const styles: {
  [key: string]: CSSProperties
} = {
  detailWrapper: {
    transition: 'max-height 300ms ease-in-out',
    overflow: 'hidden',
  },
  sliderContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: '#fbfbfb',
    borderRadius: 2,
  },
  slider: {
    width: '100%',
    height: '100%',
    backgroundColor: '#afafaf',
    boxShadow: 'rgba(0, 0, 0, 0.75) 1px 1px 1px 0px',
    transform: 'translate(-2.5px)',
    cursor: 'pointer',
  },
}
export interface VideoSliderProps {
  video?: HTMLVideoElement
  start?: number
  end?: number
  open: boolean
  onRangeOver?: (time: number) => void
}

const VideoSlider = (props: PropsWithChildren<VideoSliderProps>) => {
  const { video, start, end, open, onRangeOver } = props
  const [currentTime, setCurrentTime] = useState(0)
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(video?.duration || 0)
  useEffect(() => {
    logger.debug('useEffect1', video, start, end)
    if (!video) return
    const updateCurrentTime = () => {
      const currentTime = video.currentTime || 0
      setCurrentTime(currentTime)
    }
    updateCurrentTime()
    if (start) {
      setMin(start)
    }
    if (end) {
      setMax(end)
    }
  }, [start, end, video])
  useEffect(() => {
    if (!video) return
    const updateCurrentTime = () => {
      const currentTime = video.currentTime
      setCurrentTime(currentTime)
    }
    const onRangeOverChecker = () => {
      if ((end || video.duration) < video.currentTime) {
        if (onRangeOver) {
          onRangeOver(video.currentTime)
        }
      }
    }
    const handleTimeupdate = () => {
      updateCurrentTime()
      onRangeOverChecker()
    }
    video.addEventListener('timeupdate', handleTimeupdate)
    return () => {
      video.removeEventListener('timeupdate', handleTimeupdate)
    }
  }, [video, end, onRangeOver])
  const [rangeOpen, setRangeOpen] = useState(open)
  useEffect(() => {
    setRangeOpen(open)
  }, [open])

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newCurrent = +event.target.value
    setCurrentTime(newCurrent)
    if (video) {
      video.currentTime = newCurrent
    }
  }
  return (
    <div
      style={{ ...styles.detailWrapper, maxHeight: rangeOpen ? '5em' : '0' }}
    >
      <div style={styles.sliderContainer}>
        <input
          type="range"
          min={min - 0.5}
          max={max + 0.5}
          value={currentTime}
          step="0.001"
          onChange={handleRangeChange}
          style={styles.slider}
        ></input>
      </div>
    </div>
  )
}

export default VideoSlider
