import { render, unmount } from './views'
import { getElementAsync } from './helpers/dependency-helper'
import './polyfill'
import { createLogger } from './helpers/logger'
import { StorageKey, DefaultStorageObject } from './storages/browser-storage'
const logger = createLogger('yt-shadow.ts')

const APP_DOM_ID = '084f9327-d83f-4e74-bfc8-e06c4406520d'

async function initOrRemove(enable: boolean) {
  logger.info('Addon active state change', enable)
  const infoContents = await getElementAsync({ id: 'info-contents' })
  let appDiv = document.getElementById(APP_DOM_ID)

  if (enable) {
    if (!appDiv) {
      appDiv = document.createElement('div')
      appDiv.id = APP_DOM_ID
    }
    if (infoContents) {
      logger.info('Init', infoContents, appDiv)
      infoContents.insertAdjacentElement('beforebegin', appDiv)
      render(appDiv)
    } else {
      logger.error('Depending DOM does not exists.')
    }
  } else {
    logger.debug('disable addon', infoContents, appDiv)
    if (appDiv) {
      unmount(appDiv)
      appDiv.parentElement?.removeChild(appDiv)
    }
  }
}

async function main() {
  browser.storage.onChanged.addListener(
    (
      changes: browser.storage.ChangeDict,
      areaName: browser.storage.StorageName
    ) => {
      if (areaName === 'local') {
        const changedItems = Object.keys(changes)
        for (const item of changedItems) {
          if (item === StorageKey.SETTING) {
            const setting = changes[item]
            const { oldValue, newValue } = setting
            if (oldValue.active !== newValue.active) {
              initOrRemove(newValue.active || false)
            }
          }
        }
      }
    }
  )
  const setting = await browser.storage.local.get({
    [StorageKey.SETTING]: DefaultStorageObject[StorageKey.SETTING],
  })
  const { active: addonActive } = setting[StorageKey.SETTING]

  await initOrRemove(addonActive)
}

main()
