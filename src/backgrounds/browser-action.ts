import { iconPath, grayIconPath } from './icon-path'
import { StorageKey, DefaultStorageObject } from '../storages/browser-storage'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function browserActionHandler(tab: browser.tabs.Tab) {
  const { SETTING } = StorageKey
  try {
    const setting = await browser.storage.local.get({
      [SETTING]: DefaultStorageObject[SETTING],
    })
    const { active } = setting[SETTING]
    if (active) {
      browser.browserAction.setIcon({
        path: grayIconPath,
      })
    } else {
      browser.browserAction.setIcon({
        path: iconPath,
      })
    }
    await browser.storage.local.set({
      [SETTING]: {
        active: !active,
      },
    })
  } catch (err) {
    console.error(err)
  }
}
