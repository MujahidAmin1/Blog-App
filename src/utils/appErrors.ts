export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    // super() calls the parent Error class constructor
    // this sets this.message = message
    // required when extending a built-in class

    this.statusCode = statusCode;
    this.isOperational = true;
    // isOperational = true means this is an expected error
    // that we deliberately threw (wrong password, not found etc.)
    // vs an unexpected crash (bug in code, DB down)
    // you use this flag to decide how to log/handle it
    Error.captureStackTrace(this, this.constructor);
    // Node.js specific — captures where the error was thrown
    // makes stack traces cleaner by excluding the Error constructor itself
    // from the trace, pointing directly to where YOU threw the error
  }
}

export default AppError;