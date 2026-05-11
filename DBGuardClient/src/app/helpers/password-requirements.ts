export const passwordRequirementsRegex: RegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/; // One uppercase, one lowercase, one special char, and one digit, min 8 length
