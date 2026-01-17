// auth stuff - login, signup, token management
// keeping it simple for now
// forgot password would be nice but no time

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// create new account
export async function signup(email, password, name) {
  const res = await fetch(`${API_URL}/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    // try to parse error, backend returns different formats sometimes
    try {
      const err = await res.json();
      throw new Error(err.detail || err.email?.[0] || err.password?.[0] || err.name?.[0] || (typeof err.error === 'object' ? JSON.stringify(err.error) : err.error) || 'Signup failed');
    } catch (parseErr) {
      throw new Error('couldnt sign up, try again');
    }
  }
  return res.json();
}

// login to existing account
export async function login(email, password) {
  const res = await fetch(`${API_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err.detail || (typeof err.error === 'object' ? JSON.stringify(err.error) : err.error) || 'wrong email/password');
    } catch (parseErr) {
      throw new Error('login failed, try again');
    }
  }
  return res.json();
}

// logout - just wipe localstorage
export async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// helper funcs for token/user
export function getToken() {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}

export function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

// save to localstorage
export function setToken(token) { localStorage.setItem('token', token); }
export function setUser(user) { localStorage.setItem('user', JSON.stringify(user)); }
