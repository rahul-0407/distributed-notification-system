export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const API_ENDPOINTS = {


  PLATFORM_LOGIN: `${API_BASE_URL}/api/v1/users/platform/login`,
  PLATFORM_ME: `${API_BASE_URL}/api/v1/users/platform/me`,
  TENANT_LOGIN: `${API_BASE_URL}/api/v1/tenants/auth/login`,
  TENANT_ME: `${API_BASE_URL}/api/v1/tenants/auth/me`,
  LOGOUT: `${API_BASE_URL}/api/v1/users/platform/logout`,

  PLATFORM_TENANTS: `${API_BASE_URL}/api/v1/users/platform/tenants`,
  PLATFORM_ADMINS: `${API_BASE_URL}/api/v1/users/platform/admins`,
  PLATFORM_NOTIFICATIONS: `${API_BASE_URL}/api/v1/users/platform/notifications`,
  PLATFORM_ANALYTICS: `${API_BASE_URL}/api/v1/users/platform/analytics`,

  TENANT_MEMBERS: (tenantId: string) => `${API_BASE_URL}/api/v1/tenants/${tenantId}/members`,
  TENANT_API_KEYS: (tenantId: string) => `${API_BASE_URL}/api/v1/tenants/${tenantId}/api-keys`,
  TENANT_END_USERS: (tenantId: string) => `${API_BASE_URL}/api/v1/tenants/${tenantId}/end-users`,
  TENANT_ANALYTICS: (tenantId: string) => `${API_BASE_URL}/api/v1/analytics/notifications/tenant/${tenantId}`,

  NOTIFICATIONS_DISPATCH: `${API_BASE_URL}/api/v1/notifications`,
};
