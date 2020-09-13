export const sleep = (mili: number) => {
  return new Promise((resolve) => setTimeout(resolve, mili))
}
