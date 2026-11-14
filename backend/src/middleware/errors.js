import { HttpError } from "../lib/http.js";

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  if (error?.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ success: false, message: "A record with those details already exists." });
  }
  if (error?.code === "ER_NO_REFERENCED_ROW_2" || error?.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({ success: false, message: "This record is referenced by other records and cannot be changed that way." });
  }
  if (error?.name === "MulterError") {
    const message = error.code === "LIMIT_FILE_SIZE" ? "The selected file is larger than the 5 MB limit." : error.message;
    return res.status(400).json({ success: false, message });
  }

  const status = error instanceof HttpError ? error.status : 500;
  const payload = {
    success: false,
    message: status === 500 ? "An unexpected server error occurred." : error.message,
  };
  if (error instanceof HttpError && error.details) payload.details = error.details;
  if (status === 500 && process.env.NODE_ENV !== "production") {
    payload.debug = error.message;
  }
  if (status === 500) console.error(error);
  return res.status(status).json(payload);
}
