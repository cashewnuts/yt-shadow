import { SRTMeasure } from '@/models/srt'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'
import transcriptMessage from '@/services/transcript-message-service'

enum SRTPropName {
  paragraphs = 'paragraphs',
  texts = 'texts',
}

export interface AppStateState {
  pauseTimeoutId: number | null
  waitMillisec: number
  srtGrainSize: SRTPropName
  autoStop: boolean
  rangeOpen: boolean
  helpOpen: boolean
}

const initialState: AppStateState = {
  pauseTimeoutId: null,
  waitMillisec: 100,
  srtGrainSize: SRTPropName.texts,
  autoStop: true,
  rangeOpen: false,
  helpOpen: false,
}

export const AppStateSlice = createSlice({
  name: 'app-state',
  initialState,
  reducers: {
    toggleAutoStop(state) {
      state.autoStop = !state.autoStop
    },
    toggleRangeOpen(state) {
      state.rangeOpen = !state.rangeOpen
    },
    toggleHelpOpen(state) {
      state.helpOpen = !state.helpOpen
    },
    setHelpOpen(state, action: PayloadAction<boolean>) {
      state.helpOpen = action.payload
    },
    setWaitMillisec(state, action: PayloadAction<number>) {
      state.waitMillisec = action.payload
    },
    setPauseTimeoutId(state, action: PayloadAction<number>) {
      state.pauseTimeoutId = action.payload
    },
    resetWaitState(state, action: PayloadAction<number | undefined>) {
      state.waitMillisec = action.payload ?? 500
      state.pauseTimeoutId = null
    },
  },
})

export default AppStateSlice.reducer
