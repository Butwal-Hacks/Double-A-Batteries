'use client';
// dropdown for picking programming language
// could add more langs but these cover most cases

import React from 'react';
import { ChevronDown } from 'lucide-react';

// all the languages we support rn
const languages = [
  { value: 'auto-detect', label: 'Auto-detect' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'jsx', label: 'JSX/React' },
  { value: 'other', label: 'Other' },
];

export default function LanguageSelector({ value = 'auto-detect', onChange, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 bg-indigo-50 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm font-medium text-gray-700 appearance-none cursor-pointer hover:border-indigo-300 transition-colors">
        {languages.map((lang) => (<option key={lang.value} value={lang.value}>{lang.label}</option>))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-600 pointer-events-none" />
    </div>
  );
}
