import { Result } from './Result.js';

export class Guard {
  public static againstNullOrUndefined(argument: any, argumentName: string): Result<void> {
    if (argument === null || argument === undefined) {
      return Result.fail<void>(`${argumentName} is null or undefined`);
    }
    return Result.ok<void>();
  }

  public static againstNullOrUndefinedBulk(args: { argument: any; argumentName: string }[]): Result<void> {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (result.isFailure) return result;
    }
    return Result.ok<void>();
  }

  public static isGreaterThanZero(num: number, argumentName: string): Result<void> {
    if (num <= 0) {
      return Result.fail<void>(`${argumentName} must be greater than zero`);
    }
    return Result.ok<void>();
  }
}
