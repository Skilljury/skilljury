export class AppError extends Error {
  code: string;
  status: number;

  constructor(status: number, message: string, code = "app_error") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}
