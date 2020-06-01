import React, { useEffect, useState } from 'react'
import SRT, { SRTMeasure } from '@/models/srt'
import TranscriptWriter from '@/views/components/TranscriptWriter'

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

export default () => {
  console.log(SRT)
  const [transcript, setTranscript] = useState<SRTMeasure>()
  useEffect(() => {
    const srt = new SRT(xmlObj)
    setTranscript(srt.paragraphs[0])
  }, [])

  return <>{transcript && <TranscriptWriter text={transcript} />}</>
}
