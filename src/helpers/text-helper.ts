export const WHITE_SPACE = '\u00A0'
export const SYMBOLS = ',.?<>/!@#$%^&*()-‑=_+[]{}|:;\'"'

export const checkBePunctuated = (str: string): boolean => {
  return /[.?!"]$/.test(str)
}
export const checkSpokenText = (str: string): boolean => {
  return !/^\(.*\)$/.test(str)
}

export const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export const checkSpokenChar = (str: string) => {
  return SYMBOLS.indexOf(str) === -1 && !/\s/.test(str)
}
export const checkSymbol = (str: string) => {
  return !checkSpokenChar(str)
}

export const countSpokenChar = (str: string) => {
  const re = new RegExp(`[${escapeRegExp(SYMBOLS)}]`, 'g')
  return ((str || '').match(re) || []).length
}

export const splitTextIntoWords = (str: string) => {
  return str
    .split(/\s|\rn/)
    .map((word: string) => {
      return (word + '').trim()
    })
    .filter(Boolean)
}
