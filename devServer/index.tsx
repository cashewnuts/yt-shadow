import React, { FunctionComponent } from 'react'
import ReactDOM from 'react-dom'

import DevTranscriptWriter from './DevTranscriptWriter'

export const render = (App: FunctionComponent<any>, id: string) => {
  ReactDOM.render(<App />, document.getElementById(id))
}

render(DevTranscriptWriter, 'dev-transcript-writer')
