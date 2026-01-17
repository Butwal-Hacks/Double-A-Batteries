'use client';
// shows the AI suggestions for improving code
// parsing is messy cuz the AI returns different formats sometimes

import React from 'react';
import { Lightbulb, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ImprovementsSuggestion({ improvements = [], theme = 'light' }) {
  const [copiedId, setCopiedId] = useState(null);

  // copy to clipboard
  function handleCopy(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // this function is ugly but it handles all the edge cases
  function parseImprovements(data) {
    if (!data || data.length === 0) return [];

    // already array of objects
    if (Array.isArray(data) && typeof data[0] === 'object') {
      return data.filter(item => item && (item.title || item.description));
    }

    // array of strings - parse numbered items
    if (Array.isArray(data) && typeof data[0] === 'string') {
      const text = data.join('\n');
      const items = text.split(/\n(?=\d+\.)/);
      return items.map((item, idx) => {
        const lines = item.trim().split('\n');
        const titleLine = lines[0].replace(/^\d+\.\s*/, '').trim();
        const desc = lines.slice(1).join('\n').trim();
        return { title: titleLine, description: desc, index: idx };
      }).filter(item => item.title && item.title.length > 2);
    }

    // single string
    if (typeof data === 'string') {
      const items = data.split(/\n(?=\d+\.)/);
      return items.map((item, idx) => {
        const lines = item.trim().split('\n');
        const titleLine = lines[0].replace(/^\d+\.\s*/, '').trim();
        const desc = lines.slice(1).join('\n').trim();
        return { title: titleLine, description: desc, index: idx };
      }).filter(item => item.title && item.title.length > 2);
    }
    return [];
  }

  const parsed = parseImprovements(improvements);
  if (!parsed || parsed.length === 0) return null;

  return (
    <div className={`mt-8 rounded-lg border-2 p-6 ${theme === 'dark' ? 'bg-purple-900 border-purple-700' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-300' : 'text-blue-600'}`} />
        <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-blue-900'}`}>Code Improvements</h3>
      </div>

      <div className="space-y-4">
        {parsed.map((imp, idx) => (
          <div key={idx} className={`rounded-lg border p-4 hover:shadow-md transition-shadow ${theme === 'dark' ? 'bg-gray-800 border-purple-600 hover:border-purple-500' : 'bg-gray-100 border-blue-200 hover:border-blue-300'}`}>
            <h4 className={`font-bold text-base mb-2 ${theme === 'dark' ? 'text-purple-200' : 'text-blue-900'}`}>
              {idx + 1}. {imp.title}
            </h4>
            {imp.description && (
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{imp.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
