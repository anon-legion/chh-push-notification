class CustomApiError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export default CustomApiError;
