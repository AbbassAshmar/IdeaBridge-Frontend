function normalizedRoles(user) {
  if (!Array.isArray(user?.roles)) {
    return [];
  }

  return user.roles.map((role) => String(role).toLowerCase());
}

export function hasRole(user, roleName) {
  return normalizedRoles(user).includes(String(roleName).toLowerCase());
}

export function isDeveloper(user) {
  return hasRole(user, "developer");
}

export function getPrimaryRole(user) {
  if (!Array.isArray(user?.roles) || user.roles.length === 0) {
    return "User";
  }

  return String(user.roles[0]);
}
