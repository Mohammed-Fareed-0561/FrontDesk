export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;
  constructor(opts: { statusCode: number; code: string; message: string; details?: unknown }) {
    super(opts.message);
    this.statusCode = opts.statusCode;
    this.code = opts.code;
    this.details = opts.details;
  }
}

export const Errors = {
  unauthorized: (msg = "Authentication required") => new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: msg }),
  forbidden: (msg = "You do not have permission to perform this action.") => new AppError({ statusCode: 403, code: "INSUFFICIENT_PERMISSION", message: msg }),
  notFound: (entity = "Resource") => new AppError({ statusCode: 404, code: `${entity.toUpperCase()}_NOT_FOUND`, message: `${entity} not found.` }),
  validation: (msg: string, details?: unknown) => new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: msg, details }),
  conflict: (msg: string) => new AppError({ statusCode: 409, code: "CONFLICT", message: msg }),
  badRequest: (msg: string) => new AppError({ statusCode: 400, code: "BAD_REQUEST", message: msg }),
};
