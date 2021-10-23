import { ConsoleLogService } from "./ConsoleLogService";
import { autoinject } from "aurelia-framework";

@autoinject
export class AxiosService {
  constructor(
    private consoleLogService: ConsoleLogService,
  ) {}


  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public axiosErrorHandler(err: any): string {
    let errorMsg: string;

    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMsg = `HTTP status ${err.response.status}`;
      this.consoleLogService.logMessage(err.response.data, "error");
      this.consoleLogService.logMessage(err.response.status, "error");
      this.consoleLogService.logMessage(err.response.headers, "error");
    } else if (err.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      errorMsg = `No response: ${err.message}`;
      this.consoleLogService.logMessage(err.message, "error");
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMsg = `Unknown error: ${err.message}`;
      this.consoleLogService.logMessage(err.message, "error");
    }
    return errorMsg;
  }
}
