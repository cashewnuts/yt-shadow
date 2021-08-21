import React, { useEffect, CSSProperties, useState, FC } from 'react'
import { Button } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'
import { AppDispatch, RootState } from '../store'
import { connect, ConnectedProps } from 'react-redux'
import { AppStateSlice } from '../store/slicers/app-state'
import SRT, { SRTMeasure } from '@/models/srt'
import { TranscriptSlice } from '../store/slicers/transcript'

export interface VideoPlayerProps {
  video: HTMLVideoElement
  srt?: SRT
}

const mapState = (state: RootState) => ({
  autoStop: state.appState.autoStop,
  transcript: state.transcript.data,
  appState: state.appState,
})
const mapDispatch = (dispatch: AppDispatch) => {
  return {
    dispatch,
    onRangeOpen: () => {
      dispatch(AppStateSlice.actions.toggleRangeOpen())
    },
    onAutoStopToggle: () => dispatch(AppStateSlice.actions.toggleAutoStop()),
    onHelp: () => dispatch(AppStateSlice.actions.toggleHelpOpen()),
  }
}

const mergeProps = (
  mapProps: ReturnType<typeof mapState>,
  dispatchProps: ReturnType<typeof mapDispatch>,
  ownProps: VideoPlayerProps
) => {
  const { video, srt } = ownProps
  const { appState, transcript } = mapProps
  const { dispatch } = dispatchProps
  const nextPrevHandler = (crement: 1 | -1) => {
    if (!video || !srt) return
    const idx =
      srt[appState.srtGrainSize].findIndex(
        (measure: SRTMeasure) => video.currentTime < measure.start
      ) - 1
    const timeoutOffset = appState.pauseTimeoutId ? 1 : 0
    dispatch(AppStateSlice.actions.resetWaitState(100))
    const currentParagraph = srt[appState.srtGrainSize][idx - timeoutOffset]
    const matchedParagraph =
      srt[appState.srtGrainSize][idx + crement - timeoutOffset]
    if (
      crement === -1 &&
      Math.abs(currentParagraph.start - video.currentTime) > 0.5
    ) {
      video.currentTime = currentParagraph.start
    } else if (matchedParagraph) {
      dispatch(TranscriptSlice.actions.updateTranscript(matchedParagraph))
      video.currentTime = matchedParagraph.start
    }
  }
  return {
    ...ownProps,
    ...mapProps,
    ...dispatchProps,
    onNext: () => nextPrevHandler(1),
    onPrevious: () => nextPrevHandler(-1),
    onToggle: () => {
      if (!video || !srt) return
      const prop = srt[appState.srtGrainSize]
      const currentTime = video.currentTime
      const matchedScript = (prop as Array<SRTMeasure>).find(
        (t) => t.start <= currentTime && currentTime < t.start + t.dur
      )
      if (!matchedScript) return
      dispatch(TranscriptSlice.actions.updateTranscript(matchedScript))
      if (matchedScript !== transcript) {
        dispatch(AppStateSlice.actions.setWaitMillisec(500))
      } else {
        dispatch(AppStateSlice.actions.resetWaitState(100))
      }
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
    },
    onRepeat: () => {
      if (transcript && video) {
        dispatch(AppStateSlice.actions.resetWaitState())
        video.currentTime = transcript.start
        video.play()
      }
    },
  }
}

const connector = connect(mapState, mapDispatch, mergeProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & VideoPlayerProps

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

export const VideoPlayer = (props: Props) => {
  const { video, autoStop } = props
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
    <div style={styles.wrapper} onClick={(event) => event.stopPropagation()}>
      <div style={styles.playerWrapper}>
        <div style={styles.alignHorizontal}>
          <Tooltip2 content={<span>help</span>}>
            <Button icon="help" onClick={props.onHelp} />
          </Tooltip2>
          <Tooltip2 content="range slider">
            <Button icon="flow-review" onClick={props.onRangeOpen} />
          </Tooltip2>
        </div>
        <div style={styles.alignHorizontal}>
          <Tooltip2 content="replay">
            <Button icon="redo" onClick={props.onRepeat} />
          </Tooltip2>
          <Tooltip2 content={autoStop ? 'Disable AutoStop' : 'AutoStop'}>
            <Button
              icon={autoStop ? 'stopwatch' : 'automatic-updates'}
              intent={autoStop ? 'primary' : 'none'}
              onClick={props.onAutoStopToggle}
            />
          </Tooltip2>
        </div>
        <Tooltip2 content={isPlaying ? 'stop' : 'play'}>
          <Button icon={isPlaying ? 'stop' : 'play'} onClick={props.onToggle} />
        </Tooltip2>
        <div style={styles.alignHorizontal}>
          <Tooltip2 content="previous">
            <Button icon="arrow-left" onClick={props.onPrevious} />
          </Tooltip2>
          <Tooltip2 content="next">
            <Button icon="arrow-right" onClick={props.onNext} />
          </Tooltip2>
        </div>
      </div>
    </div>
  )
}

export default connector(VideoPlayer) as unknown as FC<VideoPlayerProps>
