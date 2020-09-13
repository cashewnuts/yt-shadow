export const getElementAsync = async <T extends HTMLElement>(
  selectArgs: { id?: string; query?: string },
  waitUntil = 3000
) => {
  const { id, query } = selectArgs
  if (!id && !query) {
    throw new Error('id or query must specify')
  }
  return new Promise<T>((resolve, reject) => {
    const standardTime = Date.now()
    const check = () => {
      let elem: HTMLElement | null = null
      if (id) {
        elem = document.getElementById(id)
      } else if (query) {
        elem = document.querySelector(query)
      }
      if (elem) {
        resolve(elem as T)
      } else if (standardTime + waitUntil < Date.now()) {
        reject()
      } else {
        setTimeout(check, 500)
      }
    }
    check()
  })
}

export const prepareFonts = () => {
  const linkDoms = Array.from(document.querySelectorAll('link'))
  const robotoMonoFontHref =
    'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400&display=swap'
  const matchedLink = linkDoms.find(
    (l: HTMLLinkElement) => l.href === robotoMonoFontHref
  )
  if (!matchedLink) {
    const linkDom = document.createElement('link')
    linkDom.href = robotoMonoFontHref
    linkDom.rel = 'stylesheet'
    const head = document.querySelector('head')
    head?.appendChild(linkDom)
  }
}
