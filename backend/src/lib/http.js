export class HttpError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export function sendOk(res, data, status = 200, message = "Success") {
  return res.status(status).json({ success: true, message, data });
}

export function toPublicUser(row) {
  return {
    id: String(row.id),
    userId: row.public_id,
    fullName: row.full_name,
    email: row.email,
    role: row.role_label,
    roleCode: row.role_code,
    status: row.account_status,
    phoneCountryCode: row.phone_country_code || "+91",
    phone: row.phone_number || "",
    department: row.department || "",
  };
}
