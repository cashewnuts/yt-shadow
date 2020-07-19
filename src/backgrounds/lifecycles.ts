export async function handleInstallScript() {
  const tabs = await browser.tabs.query({})
  let contentScripts = browser.runtime.getManifest().content_scripts
  if (!contentScripts) return
  const jsFiles = contentScripts[0].js
  if (!jsFiles) return

  const youtubeTabs = tabs.filter(
    (tab) => tab.url?.indexOf('https://www.youtube.com') === 0
  )
  youtubeTabs
    .filter((tab) => tab.active)
    .forEach((tab) => {
      if (tab.active) {
        browser.tabs.reload(tab.id)
      }
    })
  const notActiveTabs = youtubeTabs.filter((tab) => !tab.active)

  const handleYoutubeTabReload = (activeInfo: {
    tabId: number
    windowId: number
  }) => {
    const index = notActiveTabs.findIndex((tab) => tab.id === activeInfo.tabId)
    if (index < 0) return
    browser.tabs.reload(activeInfo.tabId)
    notActiveTabs.splice(index, 1)
    if (notActiveTabs.length === 0) {
      browser.tabs.onActivated.removeListener(handleYoutubeTabReload)
    }
  }
  browser.tabs.onActivated.addListener(handleYoutubeTabReload)
}
