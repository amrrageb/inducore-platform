export class GuardUtils {
  public static againstNullOrUndefined(value: unknown, argumentName: string): boolean {
    if (value === null || value === undefined) {
      throw new Error(`Argument '${argumentName}' cannot be null or undefined.`);
    }
    return true;
  }

  public static againstEmptyString(value: string, argumentName: string): boolean {
    if (!value || value.trim().length === 0) {
      throw new Error(`Argument '${argumentName}' cannot be empty.`);
    }
    return true;
  }
}
