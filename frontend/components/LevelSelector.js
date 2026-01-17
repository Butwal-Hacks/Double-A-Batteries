'use client';
// pick how detailed u want the explanation
// beginner is for ppl just learning, advanced is for nerds like me

import React from 'react';
import { ChevronDown } from 'lucide-react';

const levels = [
  { value: 'beginner', label: '🌱 Beginner - Simple explanations' },
  { value: 'intermediate', label: '📚 Intermediate - Moderate detail' },
  { value: 'advanced', label: '🚀 Advanced - Technical deep-dive' },
];

export default function LevelSelector({ value = 'intermediate', onChange, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 bg-purple-50 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm font-medium text-gray-700 appearance-none cursor-pointer hover:border-purple-300 transition-colors">
        {levels.map((lvl) => (<option key={lvl.value} value={lvl.value}>{lvl.label}</option>))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-600 pointer-events-none" />
    </div>
  );
}
