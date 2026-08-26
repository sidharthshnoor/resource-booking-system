export function sanitizeUser(user = {}) {
  const {
    password_hash,
    passwordHash,
    password,
    ...safeUser
  } = user;

  return safeUser;
}
