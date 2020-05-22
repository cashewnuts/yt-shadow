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

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    position: 'relative',
    width: '100%',
    minHeight: '6em',
    padding: '0.5em 1em',
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
}

const App = (props: PropsWithChildren<unknown>) => {
  const [videoId, setVideoId] = useState<string>()
  const srtRef = useRef<SRT>()
  const videoRef = useRef<HTMLVideoElement>()
  const [isAds, setIsAds] = useState(false)
  const [scriptRange, setScriptRange] = useState<{
    start: number
    end: number
  }>()
  const [transcript, setTranscript] = useState<SRTMeasure>()

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
  const handleSubtitleLoaded = (srt: SRT) => {
    console.log('onSRTLoaded', srt, videoRef)
    srtRef.current = srt
    if (videoRef.current) {
      setIsAds(
        videoRef.current.duration < srt.texts[srt.texts.length - 1].start
      )
    }
  }
  const handleError = (err: Error) => {
    console.error(err)
  }
  const handleLoadStart = () => {
    console.log('onLoadStart', srtRef.current, videoRef)
    updateVideoId()
  }
  const handleTimeUpdate = () => {
    if (!videoRef.current || !srtRef.current) return
    const { currentTime } = videoRef.current
    const { paragraphs } = srtRef.current
    const matchedParagraph = paragraphs.find(
      (t) => t.start <= currentTime && currentTime <= t.start + t.dur
    )
    if (matchedParagraph) {
      updateTranscript(matchedParagraph)
    }
  }
  const handleRangeOver = (time: number) => {
    console.log('handleRangeOver')
    // videoRef.current?.pause();
  }
  const handleNextPrevTranscript = (cremnt: 1 | -1) => {
    return () => {
      if (!srtRef.current) return
      const srt = srtRef.current
      const idx = transcript ? srt.paragraphs.indexOf(transcript) : 0
      const matchedParagraph = srt.paragraphs[idx + cremnt]
      if (matchedParagraph) {
        updateTranscript(matchedParagraph)
        if (videoRef.current) {
          videoRef.current.currentTime = matchedParagraph.start
        }
      }
    }
  }
  return (
    <div style={styles.wrapper}>
      <YoutubeVideo
        onLoaded={({ video }) => (videoRef.current = video)}
        onPause={() => console.log('onPause')}
        onTimeUpdate={handleTimeUpdate}
        onLoadStart={handleLoadStart}
        render={(video) => (
          <VideoPlayer
            video={video}
            start={scriptRange?.start}
            end={scriptRange?.end}
            onRangeOver={handleRangeOver}
            onNext={handleNextPrevTranscript(1)}
            onPrevious={handleNextPrevTranscript(-1)}
          />
        )}
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
      {transcript && <TranscriptWriter text={transcript} />}
    </div>
  )
}

export default App
