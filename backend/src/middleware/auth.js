import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http.js";

export function authenticate(req, _res, next) {
  const header = req.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
  const token = bearer || req.cookies?.credifit_access;

  if (!token) return next(new HttpError(401, "Sign in to continue."));

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
    req.auth = {
      userId: String(payload.sub),
      role: payload.role,
      email: payload.email,
      publicId: payload.publicId,
    };
    return next();
  } catch {
    return next(new HttpError(401, "Your session has expired. Please sign in again."));
  }
}

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.auth) return next(new HttpError(401, "Sign in to continue."));
  if (!roles.includes(req.auth.role)) {
    return next(new HttpError(403, "You do not have permission to perform this action."));
  }
  return next();
};
