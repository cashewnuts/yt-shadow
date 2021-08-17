import React, {
  PropsWithChildren,
  CSSProperties,
  useState,
  useEffect,
  useRef,
  useContext,
  memo,
  useCallback,
} from 'react'
import SubtitleLoader from './components/SubtitleLoader'
import Spinner from './components/Spinner'
import YoutubeVideo from './components/YoutubeVideo'
import SRT, { SRTMeasure } from '../models/srt'
import VideoPlayer from './components/VideoPlayer'
import TranscriptWriter, { onInputType } from './components/TranscriptWriter'
import VideoSlider from './components/VideoSlider'
import { createLogger } from '@/helpers/logger'
import { MessageContext } from '@/contexts/MessageContext'
import TranscriptDetails from './components/TranscriptDetails'
import TitleLabel from './components/TitleLabel'
import ShortcutHelp from './components/ShortcutHelp'
import { Button, Card } from '@blueprintjs/core'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { TranscriptSlice, patchTranscript } from './store/slicers/transcript'
import {
  selectAppState,
  selectTranscript,
  selectTranscriptState,
} from './store/selectors'
import { AppStateSlice } from './store/slicers/app-state'
const logger = createLogger('App.tsx')

const MemoTranscriptDetails = memo(TranscriptDetails)

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 9fr',
    gridTemplateRows: '2.5em auto',
    gridColumnGap: 0,
    gridRowGap: '0.5em',
    gridTemplateAreas: `
      'header header'
      '. .'
      'buttons main'
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const App = (props: PropsWithChildren<unknown>) => {
  const appState = useAppSelector(selectAppState)
  const transcript = useAppSelector(selectTranscript)
  const transcriptState = useAppSelector(selectTranscriptState)
  const dispatch = useAppDispatch()
  const { transcriptMessage } = useContext(MessageContext)
  const [videoId, setVideoId] = useState<string>()
  const srtRef = useRef<SRT>()
  const videoRef = useRef<HTMLVideoElement>()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isAds, setIsAds] = useState(false)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [hasInputFocus, setInputFocus] = useState(false)

  const clearPauseTimeoutId = () => {
    dispatch(AppStateSlice.actions.resetWaitState(100))
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
    logger.debug('matchedScript', matchedScript)
    dispatch(TranscriptSlice.actions.updateTranscript(matchedScript))
    if (matchedScript !== transcript) {
      dispatch(AppStateSlice.actions.setWaitMillisec(500))
    } else {
      dispatch(AppStateSlice.actions.resetWaitState(100))
    }
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
    dispatch(AppStateSlice.actions.setWaitMillisec(500))
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
    logger.debug('state on TimeUpdate', appState, transcriptState)
    if (!matchedScript || appState.pauseTimeoutId) return
    if (
      hasInputFocus &&
      appState.autoStop &&
      matchedScript !== transcript &&
      !transcriptState.skip
    ) {
      // set dummy pauseTimeoutId
      dispatch(AppStateSlice.actions.setPauseTimeoutId(9999))
      let savedScript = null
      try {
        if (videoId && transcript && transcript.start) {
          savedScript = await transcriptMessage.get(
            window.location.host,
            videoId,
            transcript.start
          )
        }
      } catch (err) {
        logger.error(err)
      }
      logger.debug(
        'savedScript',
        savedScript?.correct,
        savedScript?.done,
        savedScript?.skip
      )
      if (
        !savedScript ||
        (!(savedScript.correct && savedScript.done) && !savedScript.skip)
      ) {
        const timeoutId = window.setTimeout(() => {
          videoRef.current?.pause()
        }, appState.waitMillisec)
        dispatch(AppStateSlice.actions.setPauseTimeoutId(timeoutId))
      } else {
        dispatch(TranscriptSlice.actions.updateTranscript(matchedScript))
        clearPauseTimeoutId()
      }
    } else {
      dispatch(TranscriptSlice.actions.updateTranscript(matchedScript))
      clearPauseTimeoutId()
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
  const handleAutoStopToggle = useCallback(() => {
    dispatch(AppStateSlice.actions.toggleAutoStop())
  }, [dispatch])
  const handleLoadTranscriptWriter = (text: SRTMeasure, value: onInputType) => {
    logger.info({ text, value })
    dispatch(
      TranscriptSlice.actions.update({
        data: text,
        state: {
          done: value.done,
          correct: value.correct,
          skip: value.skip || false,
        },
      })
    )
  }
  const handleTranscriptInput = async (
    text: SRTMeasure,
    value: onInputType
  ) => {
    logger.debug('handleTranscriptInput', value)
    if (!transcript || !videoId) return
    const patchData = {
      host: window.location.host,
      videoId,
      start: text.start,
      ...value,
    }
    try {
      await dispatch(
        patchTranscript({
          message: patchData,
          transcript: text,
          state: {
            done: value.done,
            correct: value.correct,
            skip: value.skip || false,
          },
        })
      ).unwrap()
      logger.info('dbMessageService.patch for input', {
        patchData,
      })
    } catch (err) {
      logger.error('dbMessageService.patch for input', err)
    }
  }
  const handleSkip = async (skip: boolean) => {
    logger.debug('skip', skip)
    if (!transcript || !videoId) return
    const patchData = {
      host: window.location.host,
      videoId,
      start: transcript.start,
      skip,
    }
    try {
      await dispatch(
        patchTranscript({
          message: patchData,
          state: {
            skip,
          },
        })
      ).unwrap()
      logger.info('dbMessageService.patch for skip', {
        patchData,
      })
    } catch (err) {
      logger.error('dbMessageService.patch for skip', err)
    }
  }
  const handleHelpClose = () => {
    dispatch(AppStateSlice.actions.setHelpOpen(false))
  }
  const handleClickWrapper = () => {
    inputRef.current?.focus()
  }
  const handleRepeatVideo = () => {
    if (transcript && videoRef.current) {
      dispatch(AppStateSlice.actions.resetWaitState())
      videoRef.current.currentTime = transcript.start
      videoRef.current.play()
    }
  }
  return (
    <Card
      interactive={true}
      style={{
        ...styles.wrapper,
      }}
      onClick={handleClickWrapper}
    >
      <div
        style={{
          ...styles.help,
          display: appState.helpOpen ? 'block' : 'none',
        }}
      >
        <div style={styles.helpCloseButton}>
          <Button icon="cross" onClick={handleHelpClose} />
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
          render={(video) => <VideoPlayer video={video} srt={srtRef.current} />}
        />
      </div>
      <div style={styles.userInputContainer}>
        <VideoSlider video={videoRef.current} />
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
          video={videoRef.current}
          srt={srtRef.current}
          onFocus={(focus) => setInputFocus(focus)}
          onRangeOpen={handleRangeOpen}
          onLoad={handleLoadTranscriptWriter}
          onPlay={handlePlayPauseOnTranscriptWriter(true)}
          onPause={handlePlayPauseOnTranscriptWriter(false)}
          onRepeat={handleRepeatVideo}
          onInput={handleTranscriptInput}
          onSkip={handleSkip}
          onAutoStop={handleAutoStopToggle}
          onHelp={() => dispatch(AppStateSlice.actions.toggleHelpOpen)}
          onEscape={handleHelpClose}
        >
          <MemoTranscriptDetails videoId={videoId} />
        </TranscriptWriter>
      </div>
    </Card>
  )
}

export default App
