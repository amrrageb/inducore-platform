export class Logger {
  public static info(message: string, context?: Record<string, any>): void {
    console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...context }));
  }

  public static warn(message: string, context?: Record<string, any>): void {
    console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, ...context }));
  }

  public static error(message: string, error?: any, context?: Record<string, any>): void {
    console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message, error: error?.message || error, ...context }));
  }
}
