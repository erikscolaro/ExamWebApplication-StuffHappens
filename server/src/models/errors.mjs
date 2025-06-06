class ErrorDTO extends Error{
  constructor(code, name, message){
    super(message);
    this.code = code;
    this.name = name;
  }

  toJSON(){
    return {
      code: this.code,
      error: this.name,
      description: this.message
    };
  }

  fromJSON(json) {
    return new ErrorDTO(json.code, json.error, json.description);
  }

  static badRequest(message) {
    return new ErrorDTO(400, 'badRequest', message);
  }

  static unauthorized(message) {
    return new ErrorDTO(401, 'unauthorized', message);
  }

  static forbidden(message) {
    throw new ErrorDTO(403, 'forbidden', message);
  }

  static notFound(message) {
    return new ErrorDTO(404, 'notFound', message);
  }

  static conflict(message) {
    return new ErrorDTO(409, 'conflict', message);
  }

  static internalServerError(message) {
    return new ErrorDTO(500, 'internalServerError', message);
  }

  static serviceUnavailable(message) {
    return new ErrorDTO(503, 'serviceUnavailable', message);
  }
}

export default ErrorDTO;