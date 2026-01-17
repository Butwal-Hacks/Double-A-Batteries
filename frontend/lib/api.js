// api.js - dumping all api stuff here for now
// this file is getting messy but whatever, it works
// NOTE: backend needs to be running on port 8000!!

// idk if this is the best way but env vars are confusing
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// basic explain - not using this anymore but keeping just in case
// the enhanced one below is better
export async function explainCode(code) {
  const res = await fetch(`${API_URL}/explain/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    // this error handling is jank but it works
    try {
      const err = await res.json();
      throw new Error(err.error || err.detail || 'Failed to explain code');
    } catch (e) {
      // idk why this happens sometimes
      throw new Error('Failed to explain code. Make sure the backend is running.');
    }
  }
  return res.json();
}

// health check
export async function checkHealth() {
  const res = await fetch(`${API_URL}/health/`);
  return res.json();
}

// enhanced version with all the options
export async function explainCodeEnhanced(params) {
  const {
    code,
    language = 'auto-detect',
    explanation_level = 'intermediate',
    include_improvements = false,
    include_output = false,
    format = 'text'
  } = params;

  // console.log('calling explain with:', { language, explanation_level });

  const res = await fetch(`${API_URL}/explain/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code, language, explanation_level,
      include_improvements, include_output, format
    }),
  });

  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err.error || err.detail || 'Failed to explain code');
    } catch (e) {
      if (e.message.includes('Failed to explain code')) throw e;
      throw new Error('Failed to explain code. Make sure the backend is running.');
    }
  }
  return res.json();
}

// ----- history stuff -----
// had to add auth tokens for this, took forever to figure out

export async function getHistory(token) {
  const res = await fetch(`${API_URL}/history/list/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to get history');
  return res.json();
}

export async function saveToHistory(data, token) {
  const res = await fetch(`${API_URL}/history/save/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to save to history');
  return res.json();
}

export async function deleteHistoryEntry(id, token) {
  const res = await fetch(`${API_URL}/history/${id}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Token ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete history entry');
  return res.ok;
}

// examples endpoint - preloaded code samples
// might add more languages later

export async function getExamples(language = null) {
  const url = language ? `${API_URL}/examples/${language}/` : `${API_URL}/examples/`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to get examples');
  return res.json();
}

// sharing - lets users share their explanations
// this was a pain to implement ngl

export async function createShare(data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Token ${token}`;

  const res = await fetch(`${API_URL}/share/create/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create share');
  return res.json();
}

export async function getShare(shareId) {
  const res = await fetch(`${API_URL}/share/${shareId}/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to get share');
  return res.json();
}

export async function deleteShare(shareId, token) {
  const res = await fetch(`${API_URL}/share/${shareId}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Token ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete share');
  return res.ok;
}

// complexity analysis - shows big O notation and stuff
// still kinda buggy tbh

export async function analyzeComplexity(code, language = 'auto-detect') {
  const res = await fetch(`${API_URL}/analyze/complexity/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  });
  // forgot to rename this variable earlier oops
  if (!res.ok) {
    throw new Error('Failed to analyze complexity');
  }

  return res.json();
}

// compare two code snippets - not sure if anyone will use this lol
export async function compareCode(code1, code2, lang = 'auto-detect') {
  const resp = await fetch(`${API_URL}/analyze/compare/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code1, code2, language: lang }),
  });

  if (!resp.ok) throw new Error('Failed to compare code');
  return resp.json();
}

// followup questions - this is cool, u can ask questions about the code
// took like 3 hours to get this working properly

export async function askFollowUp(code, previousExplanation, question, language = 'auto-detect') {
  const res = await fetch(`${API_URL}/chat/followup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, previous_explanation: previousExplanation, question, language }),
  });
  if (!res.ok) throw new Error('Failed to get follow-up answer');
  return res.json();
}

// auth - basic login/signup
// password reset would be nice but no time rn
// also need to add oauth eventually

export async function signup(email, password, name) {
  const res = await fetch(`${API_URL}/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) throw new Error('Failed to sign up');
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Failed to login');
  return res.json();
}
