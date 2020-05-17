export const checkBePunctuated = (str: string) => {
  const lastChars = str.substr(str.length - 3);
  return lastChars.indexOf(".") !== -1;
};
