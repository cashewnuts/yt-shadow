/** @jsx jsx */
import React, {
  PropsWithChildren,
  useState,
  useContext,
  SyntheticEvent,
  useEffect,
} from 'react'
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  jsx,
  css,
  InterpolationWithTheme,
} from '@emotion/core'
import { WordProcessorResult } from './WordProcessor'
import {
  Menu,
  MenuItem,
  ContextMenu,
  Popover,
  Position,
  Spinner,
} from '@blueprintjs/core'
import { WHITE_SPACE, checkSpokenChar } from '@/helpers/text-helper'
import { createLogger } from '@/helpers/logger'
import { MessageContext } from '@/contexts/MessageContext'
import { OwlbotResponse } from '@/services/request-message-service'
const logger = createLogger('WordRender.tsx')

const styles: { [key: string]: InterpolationWithTheme<unknown> } = {
  word: css({
    display: 'inline-block',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: '"Roboto Mono", monospace',
    letterSpacing: '3px',
    '& i': {
      display: 'inline-block',
      marginLeft: '1px',
    },
  }),
  masked: css({
    borderBottom: '1px solid black',
    fontStyle: 'normal',
  }),
  correct: css({
    fontStyle: 'normal',
  }),
  wrong: css({
    background: 'yellow',
    fontStyle: 'italic',
  }),
  notInput: css({
    background: 'yellow',
    fontStyle: 'normal',
  }),
}

const dictStyle: { [key: string]: InterpolationWithTheme<unknown> } = {
  loadingWrapper: css({
    width: '20em',
    height: '10em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  dictWrapper: css({
    width: '20em',
    maxHeight: '20em',
    overflow: 'auto',
    padding: '0.5em 1em',
  }),
  word: css({
    marginBottom: '0.3em',
  }),
  pronounce: css({
    marginLeft: '0.75em',
  }),
  hr: css({
    margin: '0.25em 0',
    borderBottom: 'none',
    borderTop: '0.5px solid rgb(128, 128, 128)',
  }),
}
const DictionaryRender = (props: PropsWithChildren<{ word?: string }>) => {
  const { word } = props
  const { requestMessage } = useContext(MessageContext)
  const [info, setInfo] = useState<OwlbotResponse>()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const asyncFn = async () => {
      logger.debug('DictionaryRender', word)
      if (!word) return
      setLoading(true)
      try {
        const dict = await requestMessage?.getDict(word)
        if (!dict) return
        logger.debug('handleDictionary', dict)
        setInfo(dict)
      } catch (err) {
        logger.error('handleDictionary', err)
        setInfo(undefined)
      } finally {
        setLoading(false)
      }
    }
    asyncFn()
  }, [word, requestMessage])

  if (loading) {
    return (
      <div css={dictStyle.loadingWrapper}>
        <Spinner intent="none" size={Spinner.SIZE_SMALL} />
      </div>
    )
  }

  return (
    <div css={dictStyle.dictWrapper}>
      {info ? (
        <div>
          <div className="bp3-running-text bp3-text-large">
            <p css={dictStyle.word}>
              {info.word}
              {info.pronunciation && (
                <small css={dictStyle.pronounce}>/{info.pronunciation}/</small>
              )}
            </p>
          </div>
          <div>
            {info.definitions.map((def, index) => (
              <div key={index}>
                <hr css={dictStyle.hr} />
                <div>{def.type}</div>
                <p>{def.definition}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bp3-text-large bp3-text-muted">
          <p>`{word || ''}` is not found.</p>
        </div>
      )}
    </div>
  )
}

export interface WordRenderProps {
  index?: number
  type: 'mask' | 'diff' | 'answer'
  chars: WordProcessorResult[]
}

const WordContextMenu = (props: { onDict?: () => void }): JSX.Element => {
  return (
    <Menu onClick={(e: SyntheticEvent<HTMLElement>) => e.stopPropagation()}>
      <MenuItem text="Dictionary" onClick={props.onDict} />
    </Menu>
  )
}

export const WordRender = (props: PropsWithChildren<WordRenderProps>) => {
  const { index, type, chars } = props
  const [showIndexes, setShowIndexes] = useState<number[]>([])
  const [dictWord, setDictionaryWord] = useState<string>()
  const popoverOpen = Boolean(dictWord)
  const handleMouseEnter = (index: number) => () => {
    setShowIndexes([index])
  }
  const handleMouseLeave = (index: number) => () => {
    setShowIndexes(showIndexes.filter((i) => i !== index))
  }
  const getAnswerCss = (result: WordProcessorResult) => {
    if (result.correct) {
      return styles.correct
    }
    return result.s ? styles.wrong : styles.notInput
  }
  const handleDictionary = async () => {
    logger.debug('handleDictionary', popoverOpen)
    const selection = document.getSelection()
    const word = selection?.toString()
    setDictionaryWord(word || undefined)
    ContextMenu.hide()
  }
  const handleContextMenu = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    if (type !== 'answer') {
      return
    }
    const span = e.currentTarget as Node
    const nodes = Array.from(span.childNodes)
    const firstIndex = nodes.findIndex(({ textContent }: ChildNode) =>
      checkSpokenChar(textContent)
    )
    const fromLastIndex = nodes
      .slice()
      .reverse()
      .findIndex(({ textContent }: ChildNode) => checkSpokenChar(textContent))
    const lastIndex = nodes.length - fromLastIndex

    const selection = document.getSelection()
    const range = new Range()
    range.setStart(span, firstIndex)
    range.setEnd(span, lastIndex)

    const selectionChangeHandler = () => {
      logger.debug('selectionChangeHandler', document.getSelection())
    }
    document.addEventListener('selectionchange', selectionChangeHandler)

    const { clientX, clientY } = e
    ContextMenu.show(
      <WordContextMenu onDict={handleDictionary} />,
      { left: clientX, top: clientY },
      () => {
        document.removeEventListener('selectionchange', selectionChangeHandler)
        selection?.removeAllRanges()
      }
    )
    setTimeout(() => {
      selection?.addRange(range)
    }, 20)
  }
  const handlePopoverClose = (event?: SyntheticEvent<HTMLElement>) => {
    logger.debug('handlePopoverClose', event)
    setDictionaryWord(undefined)
  }
  return (
    <Popover
      content={<DictionaryRender word={dictWord} />}
      isOpen={popoverOpen}
      onClose={handlePopoverClose}
      position={Position.TOP}
    >
      <span css={styles.word} onContextMenu={handleContextMenu}>
        {index !== 0 ? WHITE_SPACE : undefined}
        {type === 'mask' &&
          chars.map((rslt, index) => (
            <i
              css={styles.masked}
              style={!rslt.spoken ? { borderBottom: 'unset' } : {}}
              key={index}
              onMouseEnter={handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave(index)}
            >
              {!rslt.spoken || showIndexes.indexOf(index) >= 0
                ? rslt.w
                : rslt.s
                ? rslt.s
                : rslt.mask}
            </i>
          ))}
        {type === 'diff' &&
          chars.map((rslt, index) => (
            <i key={index} css={getAnswerCss(rslt)}>
              {rslt.s && !rslt.correct ? rslt.s : rslt.w}
            </i>
          ))}
        {type === 'answer' &&
          chars.map((rslt, index) => (
            <i key={index} css={getAnswerCss(rslt)}>
              {rslt.w}
            </i>
          ))}
      </span>
    </Popover>
  )
}
