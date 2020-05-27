import React, { PropsWithChildren, CSSProperties } from 'react'
import { SRTMeasure } from '../../models/srt'

export interface TranscriptWriterProps {
  text: SRTMeasure
}

const styles: { [key: string]: CSSProperties } = {
  inputContainer: {
    height: '3em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputStyle: {
    width: '80%',
  },
}

const TranscriptWriter = (props: PropsWithChildren<TranscriptWriterProps>) => {
  const { text } = props
  return (
    <div>
      {text && (
        <div>
          <p>{text.text}</p>
          <div style={styles.inputContainer}>
            <input style={styles.inputStyle} />
          </div>
        </div>
      )}
    </div>
  )
}

export default TranscriptWriter
