import { configureStore } from '@reduxjs/toolkit'
import { AppStateSlice } from './slicers/app-state'
import { TranscriptSlice } from './slicers/transcript'

export const store = configureStore({
  reducer: {
    appState: AppStateSlice.reducer,
    transcript: TranscriptSlice.reducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
