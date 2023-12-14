const sanitizeNumericString = (key: string, defaultVal: string): string =>
  Number.isNaN(Number(key)) ? defaultVal : String(Math.abs(Number(key)));

export default sanitizeNumericString;
