import { HttpError } from "../lib/http.js";

export const validateBody = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return next(new HttpError(422, "Please check the submitted information.", details));
  }
  req.body = parsed.data;
  return next();
};
