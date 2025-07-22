export class ErrorCollector {
  private errors: string[] = [];

  add(error: string): void {
    this.errors.push(error);
  }

  addMany(errors: string[]): void {
    this.errors.push(...errors);
  }

  addConditional(condition: boolean, error: string): void {
    if (condition) this.errors.push(error);
  }

  getErrors(): string[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  clear(): void {
    this.errors = [];
  }

  toValidationResult(): { valid: boolean; errors: string[] } {
    return {
      valid: !this.hasErrors(),
      errors: this.getErrors(),
    };
  }
}