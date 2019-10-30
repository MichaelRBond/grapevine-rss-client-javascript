export class Logger {
  public static info(msg: string): void {
    return Logger.log("info", msg);
  }

  public static debug(msg: string): void {
    return Logger.log("debug", msg);
  }

  public static error(msg: string): void {
    return Logger.log("error", msg);
  }

  public static log(type: string, msg: string): void {
    console.log(`${type.toUpperCase()}: ${msg}`); // eslint-disable-line no-console
  }
}
