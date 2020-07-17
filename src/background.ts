// background-script.js
import { connected } from './backgrounds/port-connection'
import { browserActionHandler } from './backgrounds/browser-action'
import { handleInstallScript } from './backgrounds/lifecycles'

browser.runtime.onConnect.addListener(connected)
browser.browserAction.onClicked.addListener(browserActionHandler)

browser.runtime.onInstalled.addListener(handleInstallScript)
