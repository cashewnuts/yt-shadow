import { render } from './views'
import { getElementAsync } from './helpers/dependency-helper'
import './polyfill'
import { createLogger } from './helpers/logger'
const logger = createLogger('yt-shadow.ts')

const APP_DOM_ID = '084f9327-d83f-4e74-bfc8-e06c4406520d'

async function main() {
  const infoContents = await getElementAsync({ id: 'info-contents' })
  let appDiv = document.getElementById(APP_DOM_ID)

  logger.info('Init', infoContents, appDiv)
  if (!appDiv) {
    appDiv = document.createElement('div')
    appDiv.id = APP_DOM_ID
  }

  if (infoContents) {
    infoContents.insertAdjacentElement('beforebegin', appDiv)
    render(APP_DOM_ID)
  } else {
    logger.error('Depending DOM does not exists.')
  }
}

main()
