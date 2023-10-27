interface IResponse {
  message: string;
  data: Record<string, any>;
}

function successResponse(message: string, data: Record<string, any> = {}): IResponse {
  return {
    message,
    data,
  };
}

export default successResponse;
