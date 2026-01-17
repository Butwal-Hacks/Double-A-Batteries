'use client';
// signup - create new account
// has password confirmation and basic validation

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, Moon, Sun } from 'lucide-react';
import { signup, setToken, setUser } from '@/lib/auth';
import { storage } from '@/lib/storage';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = storage.getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  function toggleTheme() {
    const newTheme = storage.toggleTheme();
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setErrMsg('');

    // check passwords match
    if (pwd !== confirmPwd) {
      setErrMsg('Passwords dont match!');
      return;
    }
    // min length check
    if (pwd.length < 6) {
      setErrMsg('Password too short (need 6+ chars)');
      return;
    }

    setLoading(true);
    
    try {
      const res = await signup(email, pwd, name);
      setToken(res.token);
      setUser(res.user);
      router.push('/');
    } catch (err) {
      console.log('signup err:', err);
      setErrMsg(err.message || 'couldnt create account');
    }
    setLoading(false);
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center p-4 transition-colors`}>
      <button onClick={toggleTheme} className={`absolute top-4 right-4 p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`} title="Toggle theme">
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'} rounded-2xl shadow-xl p-8 w-full max-w-md border-2 transition-colors`}>
        
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-[#e55753]' : 'text-gray-800'} mb-2`}>Create Account</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Join CodeMentor to start learning</p>
        </div>

        {errMsg ? (
          <div className={`mb-6 ${theme === 'dark' ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded-lg`}>{errMsg}</div>
        ) : null}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* name */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-[#e55753]' : 'text-gray-700'} mb-2`}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="John Doe" required
                className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:border-purple-400 text-white' : 'border-purple-200 focus:border-purple-400 bg-white text-gray-800'}`} />
            </div>
          </div>

          {/* email */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-[#e55753]' : 'text-gray-700'} mb-2`}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:border-purple-400 text-white' : 'border-purple-200 focus:border-purple-400 bg-white text-gray-800'}`} />
            </div>
          </div>

          {/* pwd */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-[#e55753]' : 'text-gray-700'} mb-2`}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
              <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
                placeholder="••••••••" required
                className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:border-purple-400 text-white' : 'border-purple-200 focus:border-purple-400 bg-white text-gray-800'}`} />
            </div>
          </div>
          
          {/* confirm pwd */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-[#e55753]' : 'text-gray-700'} mb-2`}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
              <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                placeholder="••••••••" required
                className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:border-purple-400 text-white' : 'border-purple-200 focus:border-purple-400 bg-white text-gray-800'}`} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</> : 'Sign Up'}
          </button>
        </form>

        <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-6`}>
          Already have an account?{' '}
          <Link href="/login" className={`font-semibold hover:underline ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Login</Link>
        </p>
      </div>
    </div>
  );
}

