import React, { PropsWithChildren } from 'react'
import { SRTMeasure } from '../../models/srt'

export interface TranscriptWriterProps {
  text: SRTMeasure
}

const TranscriptWriter = (props: PropsWithChildren<TranscriptWriterProps>) => {
  const { text } = props
  return <div>{text && <p>{text.text}</p>}</div>
}

export default TranscriptWriter
