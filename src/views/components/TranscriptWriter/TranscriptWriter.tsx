/* eslint-disable react-hooks/exhaustive-deps */
/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {
  ChangeEvent,
  useState,
  KeyboardEvent,
  useEffect,
  useContext,
  MutableRefObject,
  SyntheticEvent,
  useCallback,
  FC,
  PropsWithChildren,
} from 'react'
import { Button } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'
import SRT, { SRTMeasure } from '../../../models/srt'
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  jsx,
  css,
  SerializedStyles,
} from '@emotion/react'
import { WordRender } from './WordRender'
import { AppContext } from '@/contexts/AppContext'
import CheckAnimation from '../CheckAnimation'
import { createLogger } from '@/helpers/logger'
import { MessageContext } from '@/contexts/MessageContext'
import { WordProcessor } from './WordProcessor'
import { ShortcutContext, ShortcutKey } from '@/contexts/ShortcutContext'
import { AppDispatch, RootState } from '@/views/store'
import { AppStateSlice, AppStateState } from '@/views/store/slicers/app-state'
import { TranscriptSlice } from '@/views/store/slicers/transcript'
import { connect, ConnectedProps } from 'react-redux'
const logger = createLogger('TranscriptWriter.tsx')

export type onInputType = {
  answer: string
  done: boolean
  correct: boolean
  skip?: boolean
}
export interface TranscriptWriterProps {
  text?: SRTMeasure
  videoId?: string
  inputRef: MutableRefObject<HTMLInputElement | null>
  video?: HTMLVideoElement
  srt?: SRT
  onLoad?: (text: SRTMeasure, value: onInputType) => void
  onPlay?: () => void
  onPause?: () => void
  onRepeat?: () => void
  onRangeOpen?: () => void
  onFocus?: (focus: boolean) => void
  onInput?: (text: SRTMeasure, value: onInputType) => void
  onSkip?: (skip: boolean) => void
  onAutoStop?: () => void
  onHelp?: () => void
  onEscape?: () => void
}

const mapState = (state: RootState) => ({
  autoStop: state.appState.autoStop,
  appState: state.appState,
})

const mergeProps = (
  mapProps: ReturnType<typeof mapState>,
  dispatchProps: any,
  ownProps: TranscriptWriterProps
) => {
  const { video, srt } = ownProps
  const { appState } = mapProps
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
    onNext: () => nextPrevHandler(1),
    onPrevious: () => nextPrevHandler(-1),
  }
}

const connector = connect(mapState, null, mergeProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & PropsWithChildren<TranscriptWriterProps>

const styles: { [key: string]: SerializedStyles } = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    position: 'relative',
  }),
  check: css({
    position: 'absolute',
    top: '0',
    right: '0',
  }),
  bottomContainer: css({
    flexGrow: 0,
    height: '3em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  inputContainer: css({
    width: 0,
  }),
  inputStyle: css({
    width: '60%',
    opacity: 0,
  }),
  paragraphContainer: css({
    flexGrow: 1,
    fontSize: '16px',
    fontFamily: "'Roboto', monospace",
    margin: '0.75em 0',
    padding: '0 1.25em 0 1em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  paragraph: css({
    textAlign: 'center',
    wordWrap: 'break-word',
  }),
  diffButton: css({
    opacity: 0.6,
    '&:hover': {
      opacity: 1,
    },
  }),
}

const TranscriptWriter = (props: Props) => {
  const { text, videoId, inputRef } = props
  const [inputValue, setInputValue] = useState('')
  const [inputEnded, setInputEnded] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [result, setResult] = useState({
    show: false,
    correct: false,
    skip: false,
  })
  const [wordProcessors, setWordProcessors] = useState(
    text ? text.words.map((w) => new WordProcessor(w)) : []
  )
  const { setFocus } = useContext(AppContext)
  const { transcriptMessage } = useContext(MessageContext)
  const { config: shortcutConfig } = useContext(ShortcutContext)

  const toggleAnswer = () => {
    if (!text) return
    const answer = wordProcessors
      .map((wp) => wp.answerText)
      .join(' ')
      .trim()
    const correct = wordProcessors.every((wp) => wp.isCorrect)
    const show = !result.show
    setResult({
      ...result,
      correct,
      show,
    })
    props.onInput?.call(null, text, {
      answer,
      correct,
      done: show,
    })
  }

  const skipToggleHandler = () => {
    const skip = !result.skip
    setResult({
      ...result,
      skip,
    })
    props.onSkip?.call(null, skip)
  }
  const shortcutEvents = {
    [ShortcutKey.PLAY]: props.onPlay,
    [ShortcutKey.PAUSE]: props.onPause,
    // [ShortcutKey.TOGGLE]: props.onRepeat,
    [ShortcutKey.REPEAT]: props.onRepeat,
    [ShortcutKey.PREVIOUS]: props.onPrevious,
    [ShortcutKey.NEXT]: props.onNext,
    [ShortcutKey.RANGEOPEN]: props.onRangeOpen,
    [ShortcutKey.TOGGLE_ANSWER]: toggleAnswer,
    [ShortcutKey.SKIP]: skipToggleHandler,
    [ShortcutKey.AUTOSTOP]: props.onAutoStop,
    [ShortcutKey.HELP]: props.onHelp,
  }

  const emitOnLoad = useCallback(() => {
    if (!text) return
    const answer = wordProcessors
      .map((wp) => wp.answerText)
      .join(' ')
      .trim()
    const correct = wordProcessors.every((wp) => wp.isCorrect)
    props.onLoad?.call(null, text, {
      answer,
      correct,
      done: result.show || false,
    })
  }, [props.onLoad])
  const emitOnInput = useCallback(() => {
    if (!text) return
    const answer = wordProcessors
      .map((wp) => wp.answerText)
      .join(' ')
      .trim()
    const correct = wordProcessors.every((wp) => wp.isCorrect)
    props.onInput?.call(null, text, {
      answer,
      correct,
      done: result.show || false,
    })
  }, [props.onInput?.call, result.show, wordProcessors])
  useEffect(() => {
    if (!text) return
    const wordProcessors = text.words.map((w) => new WordProcessor(w))
    const asyncFn = async () => {
      if (!videoId) return
      try {
        const transcript = await transcriptMessage?.get(
          window.location.host,
          videoId,
          text.start
        )
        logger.debug('dbMessageService.get', transcript)
        if (transcript) {
          const answer = transcript.answer || ''
          let str = answer
          for (const wordProcessor of wordProcessors) {
            str = wordProcessor.input(str)
          }
          const inputEnded = wordProcessors.every((wp) => wp.end)
          setInputEnded(inputEnded)
          setWordProcessors(wordProcessors)
          setInputValue(answer)
          setShowDiff(false)
          const skip = transcript.skip || false
          setResult({
            ...result,
            show: transcript.done || false,
            correct: transcript.correct || false,
            skip,
          })
        } else {
          setWordProcessors(wordProcessors)
          setInputValue('')
          setInputEnded(false)
          setShowDiff(false)
          setResult({
            show: false,
            correct: false,
            skip: false,
          })
        }
        emitOnLoad()
      } catch (err) {
        setWordProcessors(wordProcessors)
        setInputValue('')
        setInputEnded(false)
        setShowDiff(false)
        setResult({
          show: false,
          correct: false,
          skip: false,
        })
        logger.error(err)
      }
    }
    asyncFn()
  }, [transcriptMessage?.get, text, videoId])

  const updateWordProcessorInput = (str: string) => {
    for (const wordProcessor of wordProcessors) {
      str = wordProcessor.input(str)
    }
    setWordProcessors(wordProcessors)
    const inputEnded = wordProcessors.every((wp) => wp.end)
    setInputEnded(inputEnded)
    emitOnInput()
  }
  const changeInputHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    updateWordProcessorInput(value)
    setInputValue(value)
    if (result.show) {
      const correct = wordProcessors.every((wp) => wp.isCorrect)
      setResult({
        ...result,
        correct,
      })
    }
  }
  const wrapperFocusHandler = () => {
    inputRef.current?.focus()
  }
  const keyDownInputHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key, ctrlKey, metaKey, altKey } = event
    logger.debug('keydown', key, { ctrlKey, metaKey, altKey })
    const stopPrevents = () => {
      event.preventDefault()
      event.stopPropagation()
    }
    for (const configKey of Object.keys(shortcutConfig)) {
      const sKey = configKey as ShortcutKey
      const shortcut = shortcutConfig[sKey]
      const match = shortcut.shortcuts.some(
        (sc) =>
          sc.ctrlKey === ctrlKey &&
          sc.altKey === altKey &&
          sc.metaKey === metaKey &&
          sc.key === key
      )
      if (match) {
        stopPrevents()
        shortcutEvents[sKey]?.call(null)
        break
      }
    }
    if (key === 'Backspace' && ctrlKey) {
      stopPrevents()
      if (!wordProcessors || wordProcessors.length === 0) {
        return
      }
      let length = 0
      let lastWp = wordProcessors[0]
      for (const wp of wordProcessors) {
        if (!wp.hasInput) {
          continue
        }
        lastWp = wp
        length += wp.length
      }
      const newInputValue = inputValue.substr(0, length - lastWp.length)
      updateWordProcessorInput(newInputValue)
      setInputValue(newInputValue)
    }
    if (key === 'Escape') {
      props.onEscape?.call(null)
    }
    if (inputEnded && key === 'Enter' && ctrlKey) {
      stopPrevents()
      toggleAnswer()
    }
    if (result.skip) {
      stopPrevents()
    }
  }
  const showAnswerClickHandler = () => {
    setResult({
      ...result,
      show: !result.show,
    })
  }
  const makeItCorrectHandler = () => {
    if (!text) return
    const answer = wordProcessors
      .map((wp) => wp.wordText)
      .join(' ')
      .trim()
    updateWordProcessorInput(answer)
    setInputValue(answer)
    setResult({
      ...result,
      correct: true,
      show: true,
      skip: false,
    })
    props.onInput?.call(null, text, {
      answer,
      done: true,
      correct: true,
      skip: false,
    })
  }

  const inputSetFocusHandler = (bool: boolean) => () => {
    setFocus(bool)
    props.onFocus?.call(null, bool)
  }
  const handleParagraphClick = (event: SyntheticEvent<HTMLElement>) => {
    if (result.show) {
      event.stopPropagation()
    }
  }
  const toggleShowDiff = () => {
    setShowDiff(!showDiff)
  }
  return (
    <div
      css={styles.wrapper}
      onClick={wrapperFocusHandler}
      onTouchEnd={wrapperFocusHandler}
    >
      <div css={styles.check}>
        {result.show &&
          (result.correct ? (
            <CheckAnimation width={30} height={30} duration={450} />
          ) : (
            <Tooltip2 content={showDiff ? 'correct' : 'diff'}>
              <Button
                css={styles.diffButton}
                icon={showDiff ? 'clean' : 'delta'}
                onClick={toggleShowDiff}
              />
            </Tooltip2>
          ))}
      </div>
      <div css={styles.paragraphContainer}>
        <p
          css={styles.paragraph}
          style={{ opacity: result.skip ? 0.2 : 1 }}
          onClick={handleParagraphClick}
        >
          {(inputValue || result.show || true) &&
            wordProcessors.map((wp, index) => (
              <WordRender
                index={index}
                key={wp.key}
                chars={wp.results}
                type={result.show ? (showDiff ? 'diff' : 'answer') : 'mask'}
              />
            ))}
        </p>
      </div>
      <div css={styles.bottomContainer}>
        <div css={styles.inputContainer}>
          <input
            ref={inputRef}
            css={styles.inputStyle}
            onChange={changeInputHandler}
            onKeyDown={keyDownInputHandler}
            onFocus={inputSetFocusHandler(true)}
            onBlur={inputSetFocusHandler(false)}
            value={inputValue}
          />
        </div>
        <div style={{ flexGrow: 1 }}>{props.children}</div>
        <div style={{ width: 'auto' }}>
          {text && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {!result.show && (
                <Tooltip2>
                  <Button
                    icon={result.skip ? 'lightbulb' : 'eject'}
                    text={result.skip ? 'unskip' : 'skip'}
                    onClick={skipToggleHandler}
                  />
                </Tooltip2>
              )}
              {!result.skip && (
                <Tooltip2>
                  {result.show ? (
                    <div>
                      <Button
                        icon={result.correct ? 'edit' : 'draw'}
                        text={result.correct ? '' : 'Back'}
                        onClick={showAnswerClickHandler}
                      />
                      {result.correct ? (
                        <Button
                          icon="endorsed"
                          text="Go next"
                          onClick={props?.onNext}
                        />
                      ) : (
                        <Button
                          icon="endorsed"
                          text="Make it correct"
                          onClick={makeItCorrectHandler}
                        />
                      )}
                    </div>
                  ) : (
                    <Button
                      icon={inputEnded ? 'tick-circle' : 'eye-open'}
                      intent={inputEnded ? 'primary' : 'none'}
                      text="Show Answer"
                      onClick={showAnswerClickHandler}
                    />
                  )}
                </Tooltip2>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default connector(TranscriptWriter) as unknown as FC<
  PropsWithChildren<TranscriptWriterProps>
>
