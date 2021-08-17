import { SRTMeasure } from '@/models/srt'
import { ITranscript } from '@/models/transcript'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'
import transcriptMessage from '@/services/transcript-message-service'

export interface TranscriptState {
  data?: SRTMeasure
  state: {
    done: boolean
    correct: boolean
    skip: boolean
  }
}

const initialState: TranscriptState = {
  data: undefined,
  state: {
    done: false,
    correct: false,
    skip: false,
  },
}

export const patchTranscript = createAsyncThunk<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  {
    message: ITranscript
    transcript?: SRTMeasure
    state?: Partial<TranscriptState['state']>
  },
  {
    state: RootState
  }
>('transcript/patchTranscript', async ({ message: patchData, state }) => {
  await transcriptMessage.patch(patchData)
  return state
})

export const TranscriptSlice = createSlice({
  name: 'transcript',
  initialState,
  reducers: {
    update(
      state,
      action: PayloadAction<{
        data: SRTMeasure
        state: TranscriptState['state']
      }>
    ) {
      state.data = action.payload.data
      state.state = action.payload.state
    },
    updateTranscript(state, action: PayloadAction<SRTMeasure>) {
      if (state.data?.start !== action.payload.start) {
        state.data = action.payload
      }
    },
    setSkip(state, action: PayloadAction<boolean>) {
      state.state.skip = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(patchTranscript.fulfilled, (state, action) => {
      if (action.meta.arg.state) {
        state.state = {
          ...state.state,
          ...action.meta.arg.state,
        }
      }
      if (action.meta.arg.transcript) {
        state.data = action.meta.arg.transcript
      }
    })
  },
})

export default TranscriptSlice.reducer
