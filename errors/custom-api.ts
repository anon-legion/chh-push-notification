class CustomApiError extends Error {
  constructor(
    public message: string,
    public errors?: any[]
  ) {
    super(message);
  }
}

export default CustomApiError;
