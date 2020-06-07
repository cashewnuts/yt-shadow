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
} from 'react'
import { SRTMeasure, SRTWord } from '../../models/srt'
import { v4 as uuidv4 } from 'uuid'
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  jsx,
  css,
  InterpolationWithTheme,
} from '@emotion/core'
import { AppContext } from '@/contexts/AppContext'

export interface TranscriptWriterProps {
  text?: SRTMeasure
  inputRef: MutableRefObject<HTMLInputElement | null>
}

const styles: { [key: string]: InterpolationWithTheme<unknown> } = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
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
    paddingLeft: '0.5em',
    cursor: 'pointer',
  }),
  paragraphContainer: css({
    flexGrow: 1,
    fontSize: '16px',
    fontFamily: "'Roboto', monospace",
    margin: '0.75em 0',
    padding: '0 1em',
  }),
  paragraph: css({
    textAlign: 'center',
    wordWrap: 'break-word',
  }),
  masked: css({
    borderBottom: '1px solid black',
    display: 'inline-block',
    width: '.75em',
    fontStyle: 'normal',
    marginLeft: '1px',
  }),
  correct: css({
    text: 'blue',
    display: 'inline-block',
    width: '.75em',
    fontStyle: 'normal',
    marginLeft: '1px',
  }),
  wrong: css({
    text: 'red',
    background: 'yellow',
    display: 'inline-block',
    width: '.75em',
    fontStyle: 'italic',
    marginLeft: '1px',
  }),
}

const WHITE_SPACE = '\u00A0'
const SYMBOLS = ',.?<>/!@#$%^&*()-=_+[]{}|:;\'"'
const checkSpokenChar = (str: string) => {
  return SYMBOLS.indexOf(str) === -1
}

interface WordProcessorResult {
  w: string
  s?: string
  mask: string
  correct: boolean
  spoken: boolean
}

class WordProcessor {
  key: string
  srtWord: SRTWord
  results: WordProcessorResult[]
  length = 0
  constructor(word: SRTWord) {
    this.key = uuidv4()
    this.srtWord = word
    this.results = word.word.split('').map((w) => ({
      w,
      mask: WHITE_SPACE,
      correct: false,
      spoken: checkSpokenChar(w),
    }))
  }

  get isCorrect() {
    return (
      this.srtWord.word.length === this.results.length &&
      this.results.every((r) => r.correct)
    )
  }
  get hasInput() {
    return this.results.filter((r) => r.s).length > 0
  }
  get end() {
    return this.results.every((r) => Boolean(r.s || !r.spoken))
  }

  validInput() {
    return this.results
      .map((r) => {
        if (r.spoken) {
          return r.s
        }
      })
      .filter(Boolean)
      .join('')
  }

  input(str: string) {
    let spaceCount = 0
    this.length = 0
    const word = this.srtWord.word
    const results: WordProcessorResult[] = []
    let index = '0'
    for (index in str.split('')) {
      const idxNum = parseInt(index, 10)
      const s = str[idxNum]
      const isSpace = /\s/.test(s)
      if (isSpace) {
        spaceCount++
        continue
      }
      const wordIndex = idxNum - spaceCount
      const w = word[wordIndex]
      const spoken = checkSpokenChar(w)
      if (!spoken && s !== w) {
        continue
      }
      results.push({
        w,
        s,
        mask: WHITE_SPACE,
        correct: s.toLowerCase() === w.toLowerCase() || !spoken,
        spoken,
      })
      if (word.length <= results.length) {
        break
      }
      if (word.length - 1 === wordIndex + 1) {
        const nextS = str[idxNum + 1]
        const nextW = word[wordIndex + 1]
        const nextSpoken = checkSpokenChar(nextW)
        if (!nextSpoken && nextS !== nextW) {
          break
        }
      }
    }
    this.results = word.split('').map((w, idx) => {
      const reslt = results[idx]
      if (reslt) {
        return reslt
      }
      const spoken = checkSpokenChar(w)
      return {
        w,
        s: undefined,
        mask: WHITE_SPACE,
        correct: !spoken,
        spoken,
      }
    })

    this.length = parseInt(index, 10) + 1
    return str.substr(this.length)
  }

  get render() {
    return (
      <span>
        {this.results.map((rslt, index) => (
          <i css={styles.masked} key={index}>
            {rslt.spoken ? (rslt.s ? rslt.s : rslt.mask) : rslt.w}
          </i>
        ))}
      </span>
    )
  }

  get renderAnswer() {
    return (
      <span>
        {this.results.map((rslt, index) => (
          <i key={index} css={rslt.correct ? styles.correct : styles.wrong}>
            {rslt.w}
          </i>
        ))}
      </span>
    )
  }
}

const TranscriptWriter = (props: PropsWithChildren<TranscriptWriterProps>) => {
  const { text, inputRef } = props
  const [inputValue, setInputValue] = useState('')
  const [inputEnded, setInputEnded] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [wordProcessors, setWordProcessors] = useState(
    text ? text.words.map((w) => new WordProcessor(w)) : []
  )
  const { focus, setFocus } = useContext(AppContext)

  useEffect(() => {
    if (!text) return
    setWordProcessors(text.words.map((w) => new WordProcessor(w)))
  }, [text])

  const updateWordProcessorInput = (str: string) => {
    for (const wordProcessor of wordProcessors) {
      str = wordProcessor.input(str)
    }
    setWordProcessors(wordProcessors)
    const inputEnded = wordProcessors.every((wp) => wp.end)
    setInputEnded(inputEnded)
  }
  const changeInputHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    updateWordProcessorInput(value)
    setInputValue(value)
  }
  const wrapperFocusHandler = () => {
    inputRef.current?.focus()
  }
  const keyDownInputHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key, ctrlKey, metaKey } = event
    if (key === 'Backspace' && (ctrlKey || metaKey)) {
      event.preventDefault()
      if (!wordProcessors || wordProcessors.length === 0) {
        return
      }
      let length = 0
      let lastWp = wordProcessors[0]
      for (const wp of wordProcessors) {
        if (!wp.hasInput) {
          break
        }
        lastWp = wp
        length += wp.length
      }
      const newInputValue = inputValue.substr(0, length - lastWp.length)
      updateWordProcessorInput(newInputValue)
      setInputValue(newInputValue)
    }
    if (inputEnded) {
      if (key === 'Enter' && ctrlKey) {
        setShowAnswer(!showAnswer)
      }
    }
  }
  const showAnswerClickHandler = () => {
    setShowAnswer(!showAnswer)
  }
  const inputSetFocusHandler = (bool: boolean) => () => setFocus(bool)
  const handleParagraphClick = (event: SyntheticEvent<HTMLElement>) => {
    if (showAnswer) {
      event.stopPropagation()
    }
  }
  return (
    <div
      css={styles.wrapper}
      onClick={wrapperFocusHandler}
      onTouchEnd={wrapperFocusHandler}
    >
      <div css={styles.paragraphContainer}>
        <p css={styles.paragraph} onClick={handleParagraphClick}>
          {(inputValue || showAnswer || true) &&
            wordProcessors.map((wp) => (
              <span css={styles.word} key={wp.key}>
                {showAnswer ? wp.renderAnswer : wp.render}
              </span>
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
        {text && <button onClick={showAnswerClickHandler}>Show Answer</button>}
      </div>
    </div>
  )
}

export default TranscriptWriter
