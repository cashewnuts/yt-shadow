/** @jsx jsx */
import React, { PropsWithChildren, useState, useRef } from 'react'
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  jsx,
  css,
  InterpolationWithTheme,
} from '@emotion/core'
import { WordProcessorResult } from './WordProcessor'
import { Menu, MenuItem, ContextMenu } from '@blueprintjs/core'
import { WHITE_SPACE } from '@/helpers/text-helper'

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

export interface WordRenderProps {
  index?: number
  type: 'mask' | 'diff' | 'answer'
  chars: WordProcessorResult[]
}

const WordContextMenu = (): JSX.Element => {
  return (
    <Menu>
      <MenuItem text="Save" />
      <MenuItem text="Delete" />
    </Menu>
  )
}

export const WordRender = (props: PropsWithChildren<WordRenderProps>) => {
  const { index, type, chars } = props
  const [showIndexes, setShowIndexes] = useState<number[]>([])
  const wordEl = useRef<HTMLPreElement>(null)
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
  const handleContextMenu = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log(e, wordEl, window.getSelection())

    ContextMenu.show(
      <WordContextMenu />,
      { left: e.clientX, top: e.clientY },
      () => {
        // menu was closed; callback optional
      }
    )
  }
  return (
    <span ref={wordEl} css={styles.word} onContextMenu={handleContextMenu}>
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
  )
}
