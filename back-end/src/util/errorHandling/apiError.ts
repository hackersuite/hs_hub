import { HttpResponseCode } from "./";

export class ApiError {
  /**
   * The HTTP status code of the error
   */
  public statusCode: HttpResponseCode;

  /**
   * Short description of the error
   */
  public error: string;

  /**
   * The message in the error
   */
  public message: any;

  /**
   * Creates a new ApiError
   * @param _statusCode The HTTP status code of the error
   * @param _message The reason of the error
   */
  constructor(_statusCode: HttpResponseCode, _message?: any) {
    this.statusCode = _statusCode;
    this.message = _message;

    switch (this.statusCode) {
      case HttpResponseCode.BAD_REQUEST:
        this.error = "Invalid request";
        break;
      case HttpResponseCode.UNAUTHORIZED:
        this.error = "Could not login";
        break;
      case HttpResponseCode.FORBIDDEN:
        this.error = "You do not have authorization to use this method";
        break;
      case HttpResponseCode.NOT_FOUND:
        this.error = "Method does not exist";
        break;
      case HttpResponseCode.NOT_IMPLEMENTED:
        this.error = "Method has not been implemented yet";
        break;
      default:
        this.error = `Unknown error occured with status code ${this.statusCode}`;
        break;
    }
  }
}