
export const endpoints = {
  // Auth endpoints
  CSRF_COOKIE: () => "/sanctum/csrf-cookie",
  LOGIN: () => "/api/auth/login",
  REGISTER: () => "/api/auth/register",
  LOGOUT: () => "/api/auth/logout",
  GET_CURRENT_USER: () => "/api/auth/user",
};
