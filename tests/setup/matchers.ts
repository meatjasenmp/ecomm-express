import { expect } from '@jest/globals';
import type { ZodIssue, SafeParseError } from 'zod/v3';

expect.extend({
  toHaveZodIssue(
    received: SafeParseError<unknown>,
    path: string[],
    message?: string,
  ) {
    if (!received.error) {
      return {
        pass: false,
        message: () => 'Expected Zod error but parsing succeeded',
      };
    }

    const issue = received.error.issues.find(
      (i: ZodIssue) => JSON.stringify(i.path) === JSON.stringify(path),
    );

    if (!issue) {
      return {
        pass: false,
        message: () => `No error found at path: ${path}`,
      };
    }

    if (message && issue.message !== message) {
      return {
        pass: false,
        message: () =>
          `Expected message "${message}" but got "${issue.message}"`,
      };
    }

    return { pass: true, message: () => '' };
  },
});
