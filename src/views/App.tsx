import React, {
  PropsWithChildren,
  CSSProperties,
  useState,
  useEffect,
  useRef,
  useContext,
} from 'react'
import SubtitleLoader from './components/SubtitleLoader'
import Spinner from './components/Spinner'
import YoutubeVideo from './components/YoutubeVideo'
import SRT, { SRTMeasure } from '../models/srt'
import VideoPlayer from './components/VideoPlayer'
import TranscriptWriter, { onInputType } from './components/TranscriptWriter'
import { AppContextConsumer } from '../contexts/AppContext'
import VideoSlider from './components/VideoSlider'
import { createLogger } from '@/helpers/logger'
import { MessageContext } from '@/contexts/MessageContext'
import TranscriptDetails from './components/TranscriptDetails'
import TitleLabel from './components/TitleLabel'
import ShortcutHelp from './components/ShortcutHelp'
import { Button, Card } from '@blueprintjs/core'
const logger = createLogger('App.tsx')

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    display: 'grid',
    gridTemplateColumns: '5em 0 auto',
    gridTemplateRows: '2.5em 0.75em auto',
    gridTemplateAreas: `
      'header header header'
      '. . .'
      'buttons main main'
    `,
    alignContent: 'space-around',
    justifyContent: 'space-between',
    position: 'relative',
    width: 'auto',
    minHeight: '6em',
    padding: '1em 0.75em 1em 0.75em',
    marginTop: '1em',
    borderRadius: '3px',
  },
  help: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    overflow: 'auto',
    zIndex: 1000,
  },
  helpCloseButton: {
    position: 'absolute',
    top: '0.5em',
    right: '0.5em',
  },
  header: {
    gridArea: 'header',
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
    gridArea: 'buttons',
  },
  userInputContainer: {
    gridArea: 'main',
    display: 'flex',
    flexDirection: 'column',
  },
}

enum SRTPropName {
  paragraphs = 'paragraphs',
  texts = 'texts',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const App = (props: PropsWithChildren<unknown>) => {
  const { dbMessageService } = useContext(MessageContext)
  const [videoId, setVideoId] = useState<string>()
  const [helpOpen, setHelpOpen] = useState(false)
  const srtRef = useRef<SRT>()
  const videoRef = useRef<HTMLVideoElement>()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isAds, setIsAds] = useState(false)
  const [scriptRange, setScriptRange] = useState<{
    start: number
    end: number
  }>()
  const [appState, setAppState] = useState<{
    pauseTimeoutId: number | null
    waitMillisec: number
    srtGrainSize: SRTPropName
  }>({
    pauseTimeoutId: null,
    waitMillisec: 100,
    srtGrainSize: SRTPropName.texts,
  })
  const [transcript, setTranscript] = useState<SRTMeasure>()
  const [transcriptState, setTranscriptState] = useState<{
    text?: SRTMeasure
    done: boolean
    correct: boolean
  }>({
    done: false,
    correct: false,
  })
  const [rangeOpen, setRangeOpen] = useState(false)
  const [hasInputFocus, setInputFocus] = useState(false)

  const clearPauseTimeoutId = () => {
    setAppState({
      ...appState,
      waitMillisec: 100,
      pauseTimeoutId: null,
    })
  }
  const updateTranscript = (text: SRTMeasure) => {
    setScriptRange({
      start: text.start,
      end: text.start + text.dur,
    })
    setTranscript(text)
  }
  const incrementOrClearTranscript = () => {
    if (!videoRef.current || !srtRef.current) return
    const srt = srtRef.current
    const prop = srt[appState.srtGrainSize]
    const currentTime = videoRef.current.currentTime
    const matchedScript = (prop as Array<SRTMeasure>).find(
      (t) => t.start <= currentTime && currentTime < t.start + t.dur
    )
    if (!matchedScript) return
    logger.debug('matchedScript', matchedScript, transcript)
    if (matchedScript !== transcript) {
      updateTranscript(matchedScript)
      setAppState({
        ...appState,
        waitMillisec: 500,
      })
    }
    clearPauseTimeoutId()
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
    setAppState({
      ...appState,
      waitMillisec: 500,
    })
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
  const handleTimeUpdate = async () => {
    if (!videoRef.current || !srtRef.current) return
    const { currentTime } = videoRef.current
    const srt = srtRef.current
    const prop = srt[appState.srtGrainSize]
    const matchedScript = (prop as Array<SRTMeasure>).find(
      (t) => t.start <= currentTime && currentTime < t.start + t.dur
    )
    logger.debug('pauseTimeoutId', appState.pauseTimeoutId)
    if (!matchedScript || appState.pauseTimeoutId) return
    if (hasInputFocus && matchedScript !== transcript) {
      // set dummy pauseTimeoutId
      setAppState({
        ...appState,
        pauseTimeoutId: 9999,
      })
      let savedScript = null
      try {
        if (videoId && transcript && transcript.start) {
          savedScript = await dbMessageService?.get(
            window.location.host,
            videoId,
            transcript.start
          )
        }
      } catch (err) {
        logger.error(err)
      }
      logger.debug('savedScript', savedScript?.done, savedScript?.skip)
      if (!savedScript || (!savedScript.done && !savedScript.skip)) {
        const timeoutId = window.setTimeout(() => {
          videoRef.current?.pause()
        }, appState.waitMillisec)
        setAppState({
          ...appState,
          pauseTimeoutId: timeoutId,
        })
      } else {
        updateTranscript(matchedScript)
        clearPauseTimeoutId()
      }
    } else {
      updateTranscript(matchedScript)
      clearPauseTimeoutId()
    }
  }
  const handleToggleOnVideoPlayer = () => {
    const video = videoRef.current
    if (!video) return

    logger.debug('handleToggleOnVideoPlayer')
    incrementOrClearTranscript()
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }
  const handlePlayPauseOnTranscriptWriter = (bool: boolean) => () => {
    logger.debug('handlePlayPauseOnTranscriptWriter')
    incrementOrClearTranscript()
    if (bool) {
      videoRef.current?.play()
    } else {
      videoRef.current?.pause()
    }
  }
  const handleRangeOpen = () => {
    setRangeOpen(!rangeOpen)
  }
  const handleNextPrevTranscript = (crement: 1 | -1) => {
    return () => {
      if (!videoRef.current || !srtRef.current) return
      const srt = srtRef.current
      const video = videoRef.current
      const idx =
        srt[appState.srtGrainSize].findIndex(
          (measure: SRTMeasure) => video.currentTime < measure.start
        ) - 1
      logger.debug('next or prev', idx)
      const timeoutOffset = appState.pauseTimeoutId ? 1 : 0
      clearPauseTimeoutId()
      const currentParagraph = srt[appState.srtGrainSize][idx - timeoutOffset]
      const matchedParagraph =
        srt[appState.srtGrainSize][idx + crement - timeoutOffset]
      if (
        crement === -1 &&
        Math.abs(currentParagraph.start - video.currentTime) > 0.5
      ) {
        video.currentTime = currentParagraph.start
      } else if (matchedParagraph) {
        updateTranscript(matchedParagraph)
        video.currentTime = matchedParagraph.start
      }
    }
  }
  const handleTranscriptInput = async (value: onInputType) => {
    logger.debug('handleTranscriptInput', value)
    if (!transcript || !videoId) return
    const patchTranscript = {
      host: window.location.host,
      videoId,
      start: transcript.start,
      ...value,
    }
    try {
      const result = await dbMessageService?.patch(patchTranscript)
      setTranscriptState({
        text: transcript,
        done: value.done,
        correct: value.correct,
      })
      logger.info('dbMessageService.patch for input', {
        patchTranscript,
        result,
      })
    } catch (err) {
      logger.error('dbMessageService.patch for input', err)
    }
  }
  const handleHelp = () => {
    setHelpOpen(!helpOpen)
  }
  const handleEscape = () => {
    setHelpOpen(false)
  }
  const handleClickWrapper = () => {
    inputRef.current?.focus()
  }
  const handleRepeatVideo = () => {
    if (transcript && videoRef.current) {
      setAppState({
        ...appState,
        waitMillisec: 500,
        pauseTimeoutId: null,
      })
      videoRef.current.currentTime = transcript.start
      videoRef.current.play()
    }
  }
  return (
    <AppContextConsumer>
      {({ focus }) => (
        <Card
          interactive={true}
          style={{
            ...styles.wrapper,
            boxShadow: focus
              ? '0px 0px 8px rgba(208, 0, 0, 0.5)'
              : '0px 0px 4px rgba(40, 40, 40, 0.5)',
          }}
          onClick={handleClickWrapper}
        >
          <div style={{ ...styles.help, display: helpOpen ? 'block' : 'none' }}>
            <div style={styles.helpCloseButton}>
              <Button icon="cross" onClick={setHelpOpen.bind(null, false)} />
            </div>
            <ShortcutHelp />
          </div>
          <div style={styles.header}>
            <TitleLabel />
          </div>
          <div style={styles.playerContainer}>
            <YoutubeVideo
              onLoaded={({ video }) => (videoRef.current = video)}
              onPause={() => clearPauseTimeoutId()}
              onPlay={() => clearPauseTimeoutId()}
              onTimeUpdate={handleTimeUpdate}
              onLoadStart={handleLoadStart}
              render={(video) => (
                <VideoPlayer
                  video={video}
                  onToggle={handleToggleOnVideoPlayer}
                  onRangeOpen={handleRangeOpen}
                  onRepeat={handleRepeatVideo}
                  onNext={handleNextPrevTranscript(1)}
                  onPrevious={handleNextPrevTranscript(-1)}
                  onHelp={handleHelp}
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
              videoId={videoId}
              inputRef={inputRef}
              onFocus={(focus) => setInputFocus(focus)}
              onRangeOpen={handleRangeOpen}
              onPlay={handlePlayPauseOnTranscriptWriter(true)}
              onPause={handlePlayPauseOnTranscriptWriter(false)}
              onRepeat={handleRepeatVideo}
              onNext={handleNextPrevTranscript(1)}
              onPrevious={handleNextPrevTranscript(-1)}
              onInput={handleTranscriptInput}
              onHelp={handleHelp}
              onEscape={handleEscape}
            >
              <TranscriptDetails
                text={transcriptState.text}
                videoId={videoId}
                state={transcriptState}
              />
            </TranscriptWriter>
          </div>
        </Card>
      )}
    </AppContextConsumer>
  )
}

export default App
