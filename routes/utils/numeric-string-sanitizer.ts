const sanitizeNumericString = (key: string, defaultVal: string): string =>
  Number.isNaN(Number(key)) ? defaultVal : key;

export default sanitizeNumericString;
