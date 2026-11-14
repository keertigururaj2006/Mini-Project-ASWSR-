const aliases = new Map([
  ["10th", "10th"],
  ["10thstandard", "10th"],
  ["sslc", "10th"],
  ["secondary", "10th"],
  ["12th", "12th"],
  ["12thstandard", "12th"],
  ["12thpuc", "12th"],
  ["puc", "12th"],
  ["highersecondary", "12th"],
  ["intermediate", "12th"],
  ["diploma", "diploma"],
  ["degree", "degree"],
  ["bachelor", "degree"],
  ["bachelorsdegree", "degree"],
  ["undergraduate", "degree"],
]);

export function normalizeQualification(value) {
  if (value === null || value === undefined || value === "") return value ?? null;
  const original = String(value).trim();
  const key = original.toLowerCase().replace(/[^a-z0-9]/g, "");
  return aliases.get(key) || original;
}

export function qualificationLabel(value) {
  const canonical = normalizeQualification(value);
  return ({
    "10th": "10th Standard",
    "12th": "12th / PUC",
    diploma: "Diploma",
    degree: "Bachelor's Degree",
  })[canonical] || canonical;
}
