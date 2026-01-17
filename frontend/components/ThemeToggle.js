'use client';
// toggle dark mode on/off
// simple component, nothing fancy

import React from 'react';
import { Moon, Sun } from 'lucide-react';

// just a button that switches themes
export default function ThemeToggle({ theme = 'light', onToggle }) {
  return (
    <button onClick={onToggle} className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-400'}`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
    </button>
  );
}
