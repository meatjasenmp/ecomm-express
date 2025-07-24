export type ErrorContext = {
  resource?: string;
  identifier?: string | number;
  field?: string;
  value?: string | number;
  operation?: string;
  originalError?: string;
  stack?: string;
  [key: string]: unknown;
};