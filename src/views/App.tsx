import React, {
  PropsWithChildren,
  CSSProperties,
  useState,
  useEffect,
  useRef,
} from 'react'
import SubtitleLoader from './components/SubtitleLoader'
import Spinner from './components/Spinner'
import YoutubeVideo from './components/YoutubeVideo'
import SRT, { SRTMeasure } from '../models/srt'
import VideoPlayer from './components/VideoPlayer'
import TranscriptWriter from './components/TranscriptWriter'
import { AppContextConsumer } from '../contexts/AppContext'
import VideoSlider from './components/VideoSlider'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('App.tsx')

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    display: 'flex',
    position: 'relative',
    width: 'auto',
    minHeight: '6em',
    padding: '1em 0.75em 1em 0.75em',
    marginTop: '1em',
    borderRadius: '3px',
  },
  spinner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerContainer: {
    width: '8em',
    flexShrink: 1,
  },
  userInputContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const App = (props: PropsWithChildren<unknown>) => {
  const [videoId, setVideoId] = useState<string>()
  const srtRef = useRef<SRT>()
  const videoRef = useRef<HTMLVideoElement>()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isAds, setIsAds] = useState(false)
  const [scriptRange, setScriptRange] = useState<{
    start: number
    end: number
  }>()
  const [transcript, setTranscript] = useState<SRTMeasure>()
  const [rangeOpen, setRangeOpen] = useState(false)

  const updateTranscript = (text: SRTMeasure) => {
    setScriptRange({
      start: text.start,
      end: text.start + text.dur,
    })
    setTranscript(text)
  }
  const updateVideoId = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const v = urlParams.get('v')
    if (!v) return
    setVideoId(v)
  }
  useEffect(() => {
    updateVideoId()
  }, [])
  const checkUpdateIsAds = () => {
    if (videoRef.current && srtRef.current) {
      const srt = srtRef.current
      setIsAds(
        videoRef.current.duration < srt.texts[srt.texts.length - 1].start
      )
    }
  }
  const handleSubtitleLoaded = (srt: SRT) => {
    logger.debug('onSRTLoaded', srt, videoRef)
    srtRef.current = srt
    checkUpdateIsAds()
  }
  const handleError = (err: Error) => {
    logger.error(err)
  }
  const handleLoadStart = () => {
    logger.debug('onLoadStart', srtRef.current, videoRef)
    updateVideoId()
    checkUpdateIsAds()
  }
  const handleTimeUpdate = () => {
    if (!videoRef.current || !srtRef.current) return
    const { currentTime } = videoRef.current
    const srt = srtRef.current
    const PARAGRAPH_SELECTED = true
    const propName = PARAGRAPH_SELECTED ? 'paragraphs' : 'texts'
    const prop = srt[propName]
    const matchedParagraph = (prop as Array<SRTMeasure>).find(
      (t) => t.start <= currentTime && currentTime < t.start + t.dur
    )
    if (matchedParagraph) {
      logger.debug(matchedParagraph)
      updateTranscript(matchedParagraph)
    }
  }
  const handleRangeOpen = () => {
    setRangeOpen(!rangeOpen)
  }
  const handleNextPrevTranscript = (cremnt: 1 | -1) => {
    return () => {
      if (!srtRef.current || !transcript) return
      const propName = 'srtTexts' in transcript ? 'paragraphs' : 'texts'
      const srt = srtRef.current
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const idx = transcript ? srt[propName].indexOf(transcript as any) : 0
      const matchedParagraph = srt[propName][idx + cremnt]
      if (matchedParagraph) {
        updateTranscript(matchedParagraph)
        if (videoRef.current) {
          videoRef.current.currentTime = matchedParagraph.start
        }
      }
    }
  }
  const handleTranscriptInput = (str: string) => {
    logger.debug('handleTranscriptInput', str)
  }
  const handleTranscriptCheckAnswer = (bool: boolean) => {
    logger.debug('handleTranscriptCheckAnswer', bool)
  }
  const handleClickWrapper = () => {
    inputRef.current?.focus()
  }
  const handleRepeatVideo = () => {
    if (transcript && videoRef.current) {
      videoRef.current.currentTime = transcript.start
    }
  }
  return (
    <AppContextConsumer>
      {({ focus }) => (
        <div
          style={{
            ...styles.wrapper,
            boxShadow: focus
              ? '0px 0px 8px rgba(208, 0, 0, 0.5)'
              : '0px 0px 3px rgba(40, 40, 40, 0.5)',
          }}
          onClick={handleClickWrapper}
        >
          <div style={styles.playerContainer}>
            <YoutubeVideo
              onLoaded={({ video }) => (videoRef.current = video)}
              onPause={() => logger.debug('onPause')}
              onTimeUpdate={handleTimeUpdate}
              onLoadStart={handleLoadStart}
              render={(video) => (
                <VideoPlayer
                  video={video}
                  onRangeOpen={handleRangeOpen}
                  onRepeat={handleRepeatVideo}
                  onNext={handleNextPrevTranscript(1)}
                  onPrevious={handleNextPrevTranscript(-1)}
                />
              )}
            />
          </div>
          <div style={styles.userInputContainer}>
            <VideoSlider
              video={videoRef.current}
              open={rangeOpen}
              start={scriptRange?.start}
              end={scriptRange?.end}
            />
            <SubtitleLoader
              videoId={videoId}
              onSRTLoaded={handleSubtitleLoaded}
              onError={handleError}
              render={({ loading, subtitleNotExists }) => (
                <>
                  {(loading || isAds) && (
                    <div style={styles.spinner}>
                      <Spinner />
                    </div>
                  )}
                  {subtitleNotExists && (
                    <div>
                      <h1>Subtitle Not Exists</h1>
                    </div>
                  )}
                </>
              )}
            />
            <TranscriptWriter
              text={transcript}
              inputRef={inputRef}
              onRangeOpen={handleRangeOpen}
              onRepeat={handleRepeatVideo}
              onNext={handleNextPrevTranscript(1)}
              onPrevious={handleNextPrevTranscript(-1)}
              onInput={handleTranscriptInput}
              onCheckAnswer={handleTranscriptCheckAnswer}
            />
          </div>
        </div>
      )}
    </AppContextConsumer>
  )
}

export default App
