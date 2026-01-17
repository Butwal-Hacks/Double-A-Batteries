'use client';
// shows how complex the code is
// green = ez, yellow = medium, red = hard

import React from 'react';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';

export default function ComplexityBadge({ score = 'medium', details = '' }) {
  // colors and stuff for each level
  const config = {
    simple: { 
      bg: 'bg-green-100', border: 'border-green-300', 
      text: 'text-green-800', icon: CheckCircle, 
      label: 'Simple', desc: 'Easy to understand and execute' 
    },
    medium: { 
      bg: 'bg-yellow-100', border: 'border-yellow-300', 
      text: 'text-yellow-800', icon: Zap, 
      label: 'Medium', desc: 'Moderate complexity' 
    },
    complex: { 
      bg: 'bg-red-100', border: 'border-red-300', 
      text: 'text-red-800', icon: AlertCircle, 
      label: 'Complex', desc: 'Advanced concepts involved' 
    },
  };

  const c = config[score] || config.medium; // fallback to medium
  const Icon = c.icon;

  // format details text
  function formatDetails(text) {
    const sections = text.split(/(?=Time Complexity:|Space Complexity:|Rating:)/);
    return sections.map((section, idx) => {
      if (!section.trim()) return null;
      const isHeader = section.trim().startsWith('Time Complexity') || section.trim().startsWith('Space Complexity') || section.trim().startsWith('Rating');
      return (
        <div key={idx} className={`mb-3 ${idx > 0 ? 'pt-3 border-t border-current border-opacity-20' : ''}`}>
          {isHeader ? (<><div className="font-semibold text-sm mb-1">{section.match(/^[^:]+:/)?.[0]}</div><div className="text-xs leading-relaxed opacity-90">{section.replace(/^[^:]+:\s*/, '')}</div></>) : (<div className="text-xs leading-relaxed opacity-90">{section}</div>)}
        </div>
      );
    }).filter(Boolean);
  }

  return (
    <div className={`${c.bg} border-2 ${c.border} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${c.text}`} />
        <span className={`font-bold text-base ${c.text}`}>Complexity: {c.label}</span>
      </div>
      <p className={`text-sm ${c.text} mb-3 font-medium`}>{c.desc}</p>
      {details && (
        <div className={`${c.text} bg-gray-100 bg-opacity-40 p-3 rounded border ${c.border} space-y-2 max-h-64 overflow-y-auto`}>{formatDetails(details)}</div>
      )}
    </div>
  );
}
