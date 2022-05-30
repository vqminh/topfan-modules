export function generatePassword() {
  let length = 20,
    charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}:\"<>?\\|[];\\',./`~",
    retVal = "";
  let i = 0,
    n = charset.length;
  for (; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export function toOptions(text: string) {
  return text.split(",").map((token) => {
    const i = token.indexOf(":");
    if (i > 0) {
      const value = token.substring(0, i);
      const name = token.substring(i + 1);
      return {
        name,
        value,
      };
    }
    return {
      name: token,
      value: token,
    };
  });
}
