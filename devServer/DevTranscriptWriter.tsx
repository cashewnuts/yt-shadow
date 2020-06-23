import React, { useEffect, useState, useRef } from 'react'
import SRT, { SRTMeasure } from '@/models/srt'
import TranscriptWriter from '@/views/components/TranscriptWriter'
import { AppContextProvider } from '@/contexts/AppContext'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('DevTranscriptWriter.tsx')

const xmlObj = {
  transcript: {
    text: [
      {
        _: 'This is not a rhetorical question.',
        $: { start: '18.16', dur: '1.661' },
      },
      {
        _: 'I actually want you to think of a number.',
        $: { start: '20.362', dur: '1.955' },
      },
    ],
  },
}

const DevTranscriptWriter = () => {
  logger.debug(SRT)
  const inputRef = useRef(null)
  const [transcript, setTranscript] = useState<SRTMeasure>()
  useEffect(() => {
    const srt = new SRT(xmlObj)
    setTranscript(srt.paragraphs[0])
  }, [])

  return (
    <AppContextProvider>
      <TranscriptWriter text={transcript} inputRef={inputRef} />
    </AppContextProvider>
  )
}

export default DevTranscriptWriter
