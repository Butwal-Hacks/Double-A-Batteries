'use client';
// shows all past code explanations
// pretty useful for going back to stuff u explained before

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { storage } from '@/lib/storage';
import ComplexityBadge from '@/components/ComplexityBadge';
import ExportButton from '@/components/ExportButton';
import ShareButton from '@/components/ShareButton';
import ImprovementsSuggestion from '@/components/ImprovementsSuggestion';

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('explanation');

  // grab history on first load
  useEffect(() => {
    const saved = storage.getHistory();
    setEntries(saved || []);
  }, []);

  // copy code to clipboard
  function copyCode() {
    if (!selected) return;
    navigator.clipboard.writeText(selected.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700 font-semibold">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Explanation History</h1>

        {entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No history entries yet</p>
            <p className="text-gray-400 mt-2">Your code explanations will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* left sidebar - entry list */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 bg-indigo-600 text-white font-bold">Entries ({entries.length})</div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {entries.map(entry => (
                  <div key={entry.id} onClick={() => setSelected(entry)}
                    className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors ${selected?.id === entry.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}>
                    <p className="text-xs font-semibold text-indigo-600 mb-1">{entry.language}</p>
                    <p className="text-sm text-gray-800 truncate">{entry.code.substring(0, 40)}...</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(entry.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* right side - details */}
            {selected && (
              <div className="col-span-2 space-y-6">
                {/* code block */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                    Code ({selected.language})
                    <button onClick={copyCode} className="text-gray-500 hover:text-gray-700" title="Copy">
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </h3>
                  <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto text-sm">{selected.code}</pre>
                </div>

                {/* tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-200">
                  <button onClick={() => setTab('explanation')}
                    className={`px-4 py-2 font-semibold transition-all ${tab === 'explanation' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}>
                    Explanation
                  </button>
                  {selected.improvements?.length > 0 && (
                    <button onClick={() => setTab('improvements')}
                      className={`px-4 py-2 font-semibold transition-all ${tab === 'improvements' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}>
                      Improvements
                    </button>
                  )}
                </div>

                {/* tab content */}
                {tab === 'explanation' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold text-gray-800 mb-3">Explanation</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.explanation}</p>
                  </div>
                )}

                {tab === 'improvements' && selected.improvements?.length > 0 && (
                  <ImprovementsSuggestion improvements={selected.improvements} theme="light" />
                )}

                {/* metadata */}
                <div className="grid grid-cols-2 gap-4">
                  {selected.complexity_score ? <div><ComplexityBadge score={selected.complexity_score} /></div> : null}
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-xs text-gray-500">Level: {selected.explanation_level}</p>
                    <p className="text-xs text-gray-500 mt-2">Saved: {new Date(selected.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {/* action btns */}
                <div className="flex gap-3">
                  <ExportButton code={selected.code} explanation={selected.explanation} language={selected.language} />
                  <ShareButton code={selected.code} explanation={selected.explanation} language={selected.language} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
