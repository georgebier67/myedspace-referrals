// Simple password-based auth for admin panel

export function validateAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not configured');
    return false;
  }
  return password === adminPassword;
}

export function getPasswordFromCookie(cookies: string | null): string | null {
  if (!cookies) return null;

  const match = cookies.match(/admin_auth=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
