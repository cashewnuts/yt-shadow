export const checkBePunctuated = (str: string): boolean => {
  return /[.?!"]$/.test(str)
}
export const checkSpokenText = (str: string): boolean => {
  return !/^\(.*\)$/.test(str)
}
