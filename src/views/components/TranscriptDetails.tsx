import React, {
  PropsWithChildren,
  useEffect,
  useContext,
  useState,
} from 'react'
import { MessageContext } from '@/contexts/MessageContext'
import { createLogger } from '@/helpers/logger'
import { useAppSelector } from '../store/hooks'
import { selectTranscript } from '../store/selectors'
const logger = createLogger('TranscriptDetails.tsx')

export interface TranscriptDetailsProps {
  videoId?: string
}

const TranscriptDetails = (
  props: PropsWithChildren<TranscriptDetailsProps>
) => {
  const { transcriptMessage } = useContext(MessageContext)
  const transcript = useAppSelector(selectTranscript)
  const { videoId } = props
  const [infos, setInfos] = useState({
    doneCount: 0,
    totalLength: 0,
  })

  useEffect(() => {
    if (!transcript || !videoId || !transcriptMessage) return
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
        (script) => script.done && script.correct
      )
      setInfos({
        doneCount: doneAndCorrectScripts.length,
        totalLength: totalScripts.length,
      })
    }
    asyncFn()
  }, [transcriptMessage, transcript, videoId])
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <p style={{ margin: 'auto' }}>
        {infos.doneCount}/<b>{infos.totalLength}</b>
      </p>
    </div>
  )
}

export default TranscriptDetails
