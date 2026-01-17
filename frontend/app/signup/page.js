'use client';
// signup - create new account
// has password confirmation and basic validation

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { signup, setToken, setUser } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-purple-100">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join CodeMentor to start learning</p>
        </div>

        {errMsg ? (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{errMsg}</div>
        ) : null}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="John Doe" required
                className="w-full pl-10 pr-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-400 focus:outline-none" />
            </div>
          </div>

          {/* email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full pl-10 pr-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-400 focus:outline-none" />
            </div>
          </div>

          {/* pwd */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
              <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
                placeholder="••••••••" required
                className="w-full pl-10 pr-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-400 focus:outline-none" />
            </div>
          </div>
          
          {/* confirm pwd */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
              <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                placeholder="••••••••" required
                className="w-full pl-10 pr-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-400 focus:outline-none" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</> : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

