/** @jsx jsx */
import React, { PropsWithChildren, useState } from 'react'
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  jsx,
  css,
  InterpolationWithTheme,
} from '@emotion/core'
import { WordProcessorResult } from './WordProcessor'

const styles: { [key: string]: InterpolationWithTheme<unknown> } = {
  masked: css({
    borderBottom: '1px solid black',
    display: 'inline-block',
    width: '.75em',
    fontStyle: 'normal',
    marginLeft: '1px',
  }),
  correct: css({
    display: 'inline-block',
    width: '.75em',
    fontStyle: 'normal',
    marginLeft: '1px',
  }),
  wrong: css({
    background: 'yellow',
    display: 'inline-block',
    width: '.75em',
    fontStyle: 'italic',
    marginLeft: '1px',
  }),
  notInput: css({
    background: 'yellow',
    display: 'inline-block',
    width: '.75em',
    fontStyle: 'normal',
    marginLeft: '1px',
  }),
}

export interface WordRenderProps {
  type: 'mask' | 'diff' | 'answer'
  chars: WordProcessorResult[]
}

export const WordRender = (props: PropsWithChildren<WordRenderProps>) => {
  const { type, chars } = props
  const [showIndexes, setShowIndexes] = useState<number[]>([])
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
  return (
    <pre>
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
    </pre>
  )
}
