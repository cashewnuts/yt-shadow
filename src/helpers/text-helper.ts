export const checkBePunctuated = (str: string): boolean => {
  return /[.?"]$/.test(str)
}
