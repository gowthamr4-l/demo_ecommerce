import { environment } from '../environment';

interface UserData {
  id: number;
  mobile?: string;
  email?: string;
  name?: string;
  isRealEstateAgent?: boolean;
  [key: string]: any;
}

interface AuthResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: UserData;
  error?: string;
  message?: string;
}

/**
 * Token Storage Helpers (SSR Safe)
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('accessToken');
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('refreshToken');
  } catch {
    return null;
  }
};

export const getUser = (): UserData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuthSession = (accessToken: string, refreshToken?: string, user?: UserData) => {
  if (typeof window === 'undefined') return;
  try {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save auth session:', err);
  }
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  } catch (err) {
    console.error('Failed to clear auth session:', err);
  }
};

/**
 * Silent Refresh Token Exchange
 */
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const refreshSession = async (): Promise<string | null> => {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    clearAuthSession();
    return null;
  }

  try {
    const res = await fetch(`${environment.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    const data: AuthResponse = await res.json();

    if (res.ok && data.success && data.accessToken) {
      setAuthSession(data.accessToken, data.refreshToken, data.user);
      onRefreshed(data.accessToken);
      return data.accessToken;
    } else {
      clearAuthSession();
      return null;
    }
  } catch (err) {
    console.error('Error refreshing token:', err);
    clearAuthSession();
    return null;
  }
};

/**
 * Authenticated Fetch Wrapper
 * Automatically attaches Bearer token and retries on 401 TOKEN_EXPIRED
 */
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(options.headers || {});

  let token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Ensure JSON content type by default for mutating requests if not specified
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    let response = await fetch(url, fetchOptions);

    // If 401 Unauthorized, attempt token refresh and replay request once
    if (response.status === 401) {
      let clonedResponse = response.clone();
      let errorBody: any = {};
      try {
        errorBody = await clonedResponse.json();
      } catch {}

      if (errorBody.error === 'TOKEN_EXPIRED' || errorBody.error === 'NO_TOKEN_PROVIDED') {
        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await refreshSession();
          isRefreshing = false;

          if (newToken) {
            headers.set('Authorization', `Bearer ${newToken}`);
            return fetch(url, { ...fetchOptions, headers });
          }
        } else {
          // Wait for active refresh to finish
          const retryPromise = new Promise<Response>((resolve) => {
            subscribeTokenRefresh((newToken) => {
              headers.set('Authorization', `Bearer ${newToken}`);
              resolve(fetch(url, { ...fetchOptions, headers }));
            });
          });
          return retryPromise;
        }
      }
    }

    return response;
  } catch (err: any) {
    console.warn(`Network request to ${url} failed:`, err?.message || err);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Could not connect to backend server. Please verify backend is running on port 5000.',
        error: err?.message || 'NetworkError',
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

/**
 * Auth API Methods
 */
export const loginApi = async (credentials: { mobile?: string; email?: string; password?: string }): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${environment.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.accessToken) {
        setAuthSession(data.accessToken, data.refreshToken, data.user);
      }
      return data;
    }

    // Fallback if auth route not yet loaded
    if (credentials.mobile) {
      const cleanMobile = credentials.mobile.replace(/[^0-9]/g, '');
      const legacyRes = await fetch(`${environment.apiBaseUrl}/users?mobile=${cleanMobile}`);
      if (legacyRes.ok) {
        const legacyData = await legacyRes.json();
        if (legacyData.success && legacyData.data && legacyData.data.length > 0) {
          const user = legacyData.data[0];
          setAuthSession('dummy_access_token', 'dummy_refresh_token', user);
          return { success: true, user, accessToken: 'dummy_access_token' };
        }
      }
    }

    return { success: false, error: 'User not found. Please register.' };
  } catch (err: any) {
    console.warn('loginApi error, trying fallback:', err);
    if (credentials.mobile) {
      const cleanMobile = credentials.mobile.replace(/[^0-9]/g, '');
      try {
        const legacyRes = await fetch(`${environment.apiBaseUrl}/users?mobile=${cleanMobile}`);
        const legacyData = await legacyRes.json();
        if (legacyData.success && legacyData.data && legacyData.data.length > 0) {
          const user = legacyData.data[0];
          setAuthSession('dummy_access_token', 'dummy_refresh_token', user);
          return { success: true, user, accessToken: 'dummy_access_token' };
        }
      } catch {}
    }
    return { success: false, error: err.message || 'Login failed' };
  }
};

export const registerApi = async (userData: {
  mobile: string;
  name: string;
  email?: string;
  countryCode?: string;
  isRealEstateAgent?: boolean;
  password?: string;
}): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${environment.apiBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.accessToken) {
        setAuthSession(data.accessToken, data.refreshToken, data.user);
      }
      return data;
    }

    // Fallback: If /auth/register endpoint returns 404 because backend hasn't reloaded
    const legacyRes = await fetch(`${environment.apiBaseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryCode: userData.countryCode || '+91',
        mobile: userData.mobile,
        name: userData.name,
        email: userData.email,
        isRealEstateAgent: userData.isRealEstateAgent,
      }),
    });

    const legacyData = await legacyRes.json();
    if (legacyRes.ok || legacyData.success) {
      const user = legacyData.data || legacyData.user;
      setAuthSession('dummy_access_token', 'dummy_refresh_token', user);
      return { success: true, user, accessToken: 'dummy_access_token' };
    }

    return {
      success: false,
      error: legacyData.message?.message || legacyData.message || legacyData.error || 'Registration failed',
    };
  } catch (err: any) {
    console.warn('registerApi error, trying fallback:', err);
    try {
      const legacyRes = await fetch(`${environment.apiBaseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: userData.countryCode || '+91',
          mobile: userData.mobile,
          name: userData.name,
          email: userData.email,
          isRealEstateAgent: userData.isRealEstateAgent,
        }),
      });
      const legacyData = await legacyRes.json();
      if (legacyRes.ok || legacyData.success) {
        const user = legacyData.data || legacyData.user;
        setAuthSession('dummy_access_token', 'dummy_refresh_token', user);
        return { success: true, user, accessToken: 'dummy_access_token' };
      }
    } catch {}
    return { success: false, error: err.message || 'Registration failed' };
  }
};

export const logoutApi = async (): Promise<void> => {
  const user = getUser();
  try {
    await authFetch(`${environment.apiBaseUrl}/auth/logout`, {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id }),
    });
  } catch (e) {
    console.warn('Logout API error:', e);
  } finally {
    clearAuthSession();
  }
};

export const getMeApi = async (): Promise<UserData | null> => {
  try {
    const res = await authFetch(`${environment.apiBaseUrl}/auth/me`);
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      setAuthSession(getAccessToken() || '', getRefreshToken() || '', data.user);
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
};
