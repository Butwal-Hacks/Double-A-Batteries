'use client';
// sidebar that shows ur past explanations
// slides in from the right, pretty slick if i say so myself

import React, { useState, useEffect } from 'react';
import { Trash2, Code2, Clock, Filter, Search } from 'lucide-react';
import { storage } from '@/lib/storage';

export default function HistorySidebar({ onSelect, isOpen = false, onClose }) {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');

  // load history when component mounts
  useEffect(() => {
    function loadHistory() {
      const h = storage.getHistory();
      setHistory(h);
      filterHistory(h, searchQ, selectedLang);
    }
    loadHistory();
    // poll every 5 sec in case new stuff gets added
    const interval = setInterval(loadHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // filter by search and language
  function filterHistory(h, query, lang) {
    let filtered = h;
    if (query) {
      filtered = filtered.filter((entry) => entry.code.toLowerCase().includes(query.toLowerCase()) || entry.explanation.toLowerCase().includes(query.toLowerCase()));
    }
    if (lang !== 'all') filtered = filtered.filter((entry) => entry.language === lang);
    setFilteredHistory(filtered);
  }

  function handleSearch(query) {
    setSearchQ(query);
    filterHistory(history, query, selectedLang);
  }

  function handleLangFilter(lang) {
    setSelectedLang(lang);
    filterHistory(history, searchQ, lang);
  }

  function handleDelete(id) {
    storage.deleteHistoryEntry(id);
    const updated = history.filter((entry) => entry.id !== id);
    setHistory(updated);
    filterHistory(updated, searchQ, selectedLang);
  }

  function handleClearAll() {
    if (confirm('Are you sure? This will delete all history.')) {
      storage.clearHistory();
      setHistory([]);
      setFilteredHistory([]);
    }
  }

  const langs = ['all', ...new Set(history.map((h) => h.language))];

  return (
    <div className={`fixed inset-0 z-40 transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      {/* backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* sidebar */}
      <div className={`absolute right-0 top-0 h-full w-96 bg-gray-100 dark:bg-gray-900 shadow-2xl transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-hidden flex flex-col`}>
        {/* header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />History
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
          </div>

          {/* search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search code..." value={searchQ} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white" />
          </div>

          {/* lang filter */}
          <div className="flex gap-2 flex-wrap">
            {langs.map((lang) => (
              <button key={lang} onClick={() => handleLangFilter(lang)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedLang === lang ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300'}`}>
                {lang === 'all' ? 'All' : lang}
              </button>
            ))}
          </div>
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Code2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>{history.length === 0 ? 'No history yet' : 'No matching entries'}</p>
            </div>
          ) : (
            filteredHistory.map((entry) => (
              <div key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 cursor-pointer transition-colors group" onClick={() => onSelect(entry)}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">{entry.language}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{entry.code.substring(0, 60)}...</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}</p>
              </div>
            ))
          )}
        </div>

        {/* footer - clear all btn */}
        {history.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleClearAll} className="w-full px-4 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 transition-colors text-sm font-medium">Clear All History</button>
          </div>
        )}
      </div>
    </div>
  );
}
