/** @jsx jsx */
import React, {
  PropsWithChildren,
  ChangeEvent,
  useState,
  KeyboardEvent,
  useEffect,
  useContext,
  MutableRefObject,
  SyntheticEvent,
  useCallback,
} from 'react'
import { SRTMeasure } from '../../../models/srt'
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  jsx,
  css,
  InterpolationWithTheme,
} from '@emotion/core'
import { WordRender } from './WordRender'
import { AppContext } from '@/contexts/AppContext'
import CheckAnimation from '../CheckAnimation'
import { createLogger } from '@/helpers/logger'
import { MessageContext } from '@/contexts/MessageContext'
import { WordProcessor } from './WordProcessor'
const logger = createLogger('TranscriptWriter.tsx')

export type onInputType = {
  answer: string
  done: boolean
  correct: boolean
}
export interface TranscriptWriterProps {
  text?: SRTMeasure
  videoId?: string
  inputRef: MutableRefObject<HTMLInputElement | null>
  onPlay?: () => void
  onPause?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onRepeat?: () => void
  onRangeOpen?: () => void
  onFocus?: (focus: boolean) => void
  onInput?: (value: onInputType) => void
  onHelp?: () => void
  onEscape?: () => void
}

const styles: { [key: string]: InterpolationWithTheme<unknown> } = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    position: 'relative',
  }),
  check: css({
    position: 'absolute',
    top: '5px',
    right: '5px',
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
  word: css({
    display: 'inline-block',
    paddingLeft: '0.5em',
    cursor: 'pointer',
  }),
  paragraphContainer: css({
    flexGrow: 1,
    fontSize: '16px',
    fontFamily: "'Roboto', monospace",
    margin: '0.75em 0',
    padding: '0 1em',
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

const TranscriptWriter = (props: PropsWithChildren<TranscriptWriterProps>) => {
  const { text, videoId, inputRef } = props
  const [inputValue, setInputValue] = useState('')
  const [inputEnded, setInputEnded] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [result, setResult] = useState({
    show: false,
    correct: false,
  })
  const [wordProcessors, setWordProcessors] = useState(
    text ? text.words.map((w) => new WordProcessor(w)) : []
  )
  const { setFocus } = useContext(AppContext)
  const { dbMessageService } = useContext(MessageContext)

  const emitOnInput = useCallback(() => {
    const answer = wordProcessors
      .map((wp) => wp.answerText)
      .join(' ')
      .trim()
    const correct = wordProcessors.every((wp) => wp.isCorrect)
    props.onInput?.call(null, {
      answer,
      done: result.show || false,
      correct,
    })
  }, [props.onInput?.call, result.show, wordProcessors])
  useEffect(() => {
    if (!text) return
    const wordProcessors = text.words.map((w) => new WordProcessor(w))
    const asyncFn = async () => {
      if (!videoId) return
      try {
        const transcript = await dbMessageService?.get(
          window.location.host,
          videoId,
          text.start
        )
        logger.debug('dbMessageService.get', transcript)
        if (transcript && transcript.answer) {
          const answer = transcript.answer || ''
          let str = answer
          for (const wordProcessor of wordProcessors) {
            str = wordProcessor.input(str)
          }
          setWordProcessors(wordProcessors)
          setInputValue(answer)
          setShowDiff(false)
          setResult({
            show: transcript.done || false,
            correct: transcript.correct || false,
          })
        } else {
          setWordProcessors(wordProcessors)
          setInputValue('')
          setShowDiff(false)
          setResult({
            show: false,
            correct: false,
          })
        }
      } catch (err) {
        setWordProcessors(wordProcessors)
        setInputValue('')
        setShowDiff(false)
        setResult({
          show: false,
          correct: false,
        })
        logger.error(err)
      }
    }
    asyncFn()
  }, [dbMessageService?.get, text, videoId])
  useEffect(() => {
    emitOnInput()
  }, [emitOnInput])

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
    if (key === 'h' && ctrlKey) {
      stopPrevents()
      props.onPrevious?.call(null)
    }
    if (key === 'j' && ctrlKey) {
      stopPrevents()
      props.onPause?.call(null)
    }
    if (key === 'k' && ctrlKey) {
      stopPrevents()
      props.onPlay?.call(null)
    }
    if (key === 'l' && ctrlKey) {
      stopPrevents()
      props.onNext?.call(null)
    }
    if ((key === 'u' || key === 'r') && ctrlKey) {
      stopPrevents()
      props.onRepeat?.call(null)
    }
    if (key === '/' && ctrlKey) {
      stopPrevents()
      props.onHelp?.call(null)
    }
    if (key === 'Escape') {
      props.onEscape?.call(null)
    }
    if (
      (key === 'o' && ctrlKey) ||
      (inputEnded && key === 'Enter' && ctrlKey)
    ) {
      stopPrevents()
      const correct = wordProcessors.every((wp) => wp.isCorrect)
      setResult({
        ...result,
        correct,
        show: !result.show,
      })
    }
  }
  const showAnswerClickHandler = () => {
    setResult({
      ...result,
      show: !result.show,
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
            <button
              css={styles.diffButton}
              onClick={() => setShowDiff(!showDiff)}
            >
              {showDiff ? 'correct' : 'diff'}
            </button>
          ))}
      </div>
      <div css={styles.paragraphContainer}>
        <p css={styles.paragraph} onClick={handleParagraphClick}>
          {(inputValue || result.show || true) &&
            wordProcessors.map((wp) => (
              <div css={styles.word} key={wp.key}>
                <WordRender
                  chars={wp.results}
                  type={result.show ? (showDiff ? 'diff' : 'answer') : 'mask'}
                />
              </div>
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
        <div style={{ width: '80%' }}>{props.children}</div>
        <div style={{ width: '20%' }}>
          {text && (
            <div>
              <button onClick={showAnswerClickHandler}>Show Answer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TranscriptWriter
