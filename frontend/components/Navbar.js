'use client';
// top nav bar
// shows logo, login/logout buttons
// responsive but kinda hacky on mobile

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';
import { LogOut } from 'lucide-react';
import { storage } from '@/lib/storage';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false); // hydration fix
  const [theme, setTheme] = useState('light');
  const router = useRouter();

  useEffect(() => {
    // hide navbar on login and signup pages
    if (pathname === '/login' || pathname === '/signup') {
      setMounted(false);
      return;
    }

    setMounted(true);
    setUser(getUser());
    // get theme from storage
    const savedTheme = storage.getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // listen for theme changes from other components
    function handleThemeChange() {
      const currentTheme = storage.getTheme();
      setTheme(currentTheme);
    }
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, [pathname]);

  function toggleTheme() {
    const newTheme = storage.toggleTheme();
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
  }

  function handleLogout() {
    logout();
    setUser(null);
    router.push('/login');
  }

  if (!mounted) return null;

  return (
    <nav className={`sticky top-0 z-50 transition-colors ${theme === 'dark' ? 'bg-gray-900 border-b border-gray-700 shadow-lg' : 'bg-white border-b border-gray-200 shadow-sm'}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={theme === 'dark' ? '/images/codementor logo.svg' : '/images/CodeMentorlightmode.svg'} alt="CodeMentor" className="h-20 sm:h-25 w-40 sm:w-55 select-none" draggable={false} />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
          <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${theme === 'dark' ? 'text-[#e55753]' : 'text-gray-700'}`}>Welcome, <span className="font-semibold">Aarambha Gautam</span></span>
          {user ? (
            <>
              <button onClick={handleLogout} className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all text-xs sm:text-base ${theme === 'dark' ? 'bg-red-900 hover:bg-red-800 text-red-200' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}>
                <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`text-xs sm:text-base font-semibold hover:underline whitespace-nowrap ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Login</Link>
              <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 sm:px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-xs sm:text-base whitespace-nowrap">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
