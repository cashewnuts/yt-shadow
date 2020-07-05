// background-script.js
import { connected } from './backgrounds/port-connection'
import { browserActionHandler } from './backgrounds/browser-action'

browser.runtime.onConnect.addListener(connected)
browser.browserAction.onClicked.addListener(browserActionHandler)
