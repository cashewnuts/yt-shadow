import { iconPath, grayIconPath } from './icon-path'
import { StorageKey, DefaultStorageObject } from '../storages/browser-storage'
const { SETTING } = StorageKey

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function browserActionHandler(tab?: browser.tabs.Tab) {
  try {
    await toggleActiveState()
  } catch (err) {
    console.error(err)
  }
}

export const toggleActiveState = async () => {
  const { active } = await getCurrentSetting()
  if (active) {
    browser.browserAction.setIcon({
      path: grayIconPath,
    })
  } else {
    browser.browserAction.setIcon({
      path: iconPath,
    })
  }
  const activeState = !active
  await browser.storage.local.set({
    [SETTING]: {
      active: activeState,
    },
  })
  return activeState
}

export const getCurrentSetting = async () => {
  const storageObj = await browser.storage.local.get({
    [SETTING]: DefaultStorageObject[SETTING],
  })
  return storageObj[SETTING]
}
