export type ParseErrorCode =
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "PARSE_FAILED"
  | "UNAVAILABLE";

const MESSAGES: Record<ParseErrorCode, string> = {
  RATE_LIMITED: "Import is busy right now. Please wait a minute and try again.",
  SERVICE_UNAVAILABLE:
    "Could not process this PDF right now. Please try again shortly.",
  PARSE_FAILED:
    "Could not read this PDF. Check the file is a clear statement or receipt, then try again.",
  UNAVAILABLE: "PDF import is temporarily unavailable. Please try again later.",
};

const STATUS_BY_CODE: Record<ParseErrorCode, number> = {
  RATE_LIMITED: 429,
  SERVICE_UNAVAILABLE: 503,
  PARSE_FAILED: 400,
  UNAVAILABLE: 503,
};

export class ParseUserError extends Error {
  readonly code: ParseErrorCode;
  readonly status: number;

  constructor(code: ParseErrorCode, message?: string) {
    super(message ?? MESSAGES[code]);
    this.name = "ParseUserError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
  }
}

export function toUserFacingResponse(e: unknown): {
  error: string;
  status: number;
} {
  if (e instanceof ParseUserError) {
    return { error: e.message, status: e.status };
  }
  return {
    error: MESSAGES.PARSE_FAILED,
    status: 400,
  };
}
