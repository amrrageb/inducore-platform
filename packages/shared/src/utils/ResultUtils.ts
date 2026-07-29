export class ResultUtils<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error?: string;
  private _value?: T;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(`Cannot get value from a failed result: ${this.error}`);
    }
    return this._value as T;
  }

  public static ok<U>(value?: U): ResultUtils<U> {
    return new ResultUtils<U>(true, undefined, value);
  }

  public static fail<U>(error: string): ResultUtils<U> {
    return new ResultUtils<U>(false, error);
  }
}
