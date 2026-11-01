export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface ApiRequestOptions {
  readonly token?: string | undefined;
  readonly headers?: Readonly<Record<string, string>>;
  readonly params?: Readonly<Record<string, string | number | boolean>>;
}

export interface ApiErrorResponse extends JsonObject {
  readonly reason?: string;
}

export interface ResponseValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}
