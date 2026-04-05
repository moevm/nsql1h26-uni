const ADMIN_SESSION_KEY = 'adminSession';

export function saveAdminSession(session) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem('isAdmin', 'true');
  localStorage.setItem('adminId', session.adminId);
  localStorage.setItem('adminUsername', session.username);
}

export function getAdminSession() {
  const session = localStorage.getItem(ADMIN_SESSION_KEY);

  if (session) {
    try {
      return JSON.parse(session);
    } catch {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }

  const adminId = localStorage.getItem('adminId');
  const adminUsername = localStorage.getItem('adminUsername');

  if (!adminId) {
    return null;
  }

  return {
    adminId,
    username: adminUsername || '',
  };
}

export function isAdminAuthenticated() {
  return Boolean(localStorage.getItem('isAdmin')) && Boolean(localStorage.getItem('adminId'));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('adminId');
  localStorage.removeItem('adminUsername');
}
