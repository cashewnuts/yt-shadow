import React, {
  PropsWithChildren,
  useEffect,
  useContext,
  useState,
} from 'react'
import { SRTMeasure } from '@/models/srt'
import { MessageContext } from '@/contexts/MessageContext'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('TranscriptDetails.tsx')

export interface TranscriptDetailsProps {
  text?: SRTMeasure
  videoId?: string
  state?: {
    done: boolean
    correct: boolean
  }
}

const TranscriptDetails = (
  props: PropsWithChildren<TranscriptDetailsProps>
) => {
  const { transcriptMessage } = useContext(MessageContext)
  const { text, videoId, state } = props
  const [infos, setInfos] = useState({
    doneCount: 0,
    totalLength: 0,
  })

  useEffect(() => {
    if (!text || !videoId || !transcriptMessage) return
    const asyncFn = async () => {
      const totalScripts = await transcriptMessage.find(
        window.location.host,
        videoId,
        {
          skip: false,
        }
      )
      logger.debug('dbMessageService.find { skip: false }', totalScripts)
      const doneAndCorrectScripts = totalScripts.filter(
        (script) => script.done && script.correct && script.start !== text.start
      )
      setInfos({
        doneCount: doneAndCorrectScripts.length,
        totalLength: totalScripts.length,
      })
    }
    asyncFn()
  }, [transcriptMessage, text, videoId])
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <p style={{ margin: 'auto' }}>
        {infos.doneCount + (state?.done && state.correct ? 1 : 0)}/
        <b>{infos.totalLength}</b>
      </p>
    </div>
  )
}

export default TranscriptDetails
