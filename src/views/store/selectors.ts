import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '.'

const selectSelf = (state: RootState) => state

export const selectScriptRnage = createSelector(selectSelf, (state) => {
  const transcript = state.transcript.data
  if (!transcript) {
    return undefined
  }
  return {
    start: transcript.start,
    end: transcript.start + transcript.dur,
  }
})

export const selectTranscript = createSelector(
  selectSelf,
  (state) => state.transcript.data
)

export const selectTranscriptState = createSelector(
  selectSelf,
  (state) => state.transcript.state
)
