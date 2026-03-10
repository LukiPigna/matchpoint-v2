export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string[] | undefined>;

  constructor(
    message: string,
    statusCode = 500,
    errors?: Record<string, string[] | undefined>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: Record<string, string[] | undefined>) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = 'No autorizado') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Acceso denegado') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new AppError(message, 404);
  }

  static conflict(message: string) {
    return new AppError(message, 409);
  }

  static internal(message = 'Error interno del servidor') {
    return new AppError(message, 500);
  }
}
