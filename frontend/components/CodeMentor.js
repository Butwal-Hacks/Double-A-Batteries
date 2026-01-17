'use client';
// CodeMentor - the main thing
// this file is way too long, need to break it up sometime
// but deadline is coming so whatever

import React, { useState, useEffect } from 'react';
import { Sparkles, Code2, Lightbulb, Loader2, Copy, Check, History, Zap } from 'lucide-react';
import { explainCodeEnhanced } from '@/lib/api';
import { storage } from '@/lib/storage';
import LanguageSelector from './LanguageSelector';
import LevelSelector from './LevelSelector';
import ImprovementsSuggestion from './ImprovementsSuggestion';
import ThemeToggle from './ThemeToggle';
import ShareButton from './ShareButton';
import ExportButton from './ExportButton';
import HistorySidebar from './HistorySidebar';
import ExplanationRenderer from './ExplanationRenderer';
import SkeletonLoader from './SkeletonLoader';

export default function CodeMentor() {
  // bunch of state variables - probably too many tbh
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagram, setDiagram] = useState(''); // not using this yet
  const [err, setErr] = useState('');
  const [lang, setLang] = useState('auto-detect');
  const [level, setLevel] = useState('intermediate');
  const [includeImprovements, setIncludeImprovements] = useState(false);
  const [includeOutput, setIncludeOutput] = useState(false);

  // ui states
  const [copiedExp, setCopiedExp] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showHist, setShowHist] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // extra data
  const [improvements, setImprovements] = useState([]);
  const [meta, setMeta] = useState(null);
  const [output, setOutput] = useState('');

  // fib example - everyone knows this one
  const exampleCode = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(5))`;

  // load theme on mount
  useEffect(() => {
    const savedTheme = storage.getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    storage.initializeDemoData();
  }, []);

  // the big function - calls the API and does all the work
  // spent way too much time debugging this lol
  async function handleExplain() {
    if (!code.trim()) return; // dont do anything if empty
    
    setLoading(true);
    setExplanation('');
    setDiagram('');
    setErr('');
    setImprovements([]);
    setMeta(null);

    // demo mode for when backend isnt running
    // super hacky but works for presentations
    if (demoMode) {
      setTimeout(() => {
        const history = storage.getHistory();
        // normalize code so spacing doesnt matter
        const normalizeCode = (str) => str.trim().split('\n').map(line => line.trim()).filter(line => line).join('\n');
        
        const normalizedInput = normalizeCode(code);
        const matchingEntry = history.find(entry => normalizeCode(entry.code) === normalizedInput);
        
        if (matchingEntry) {
          setExplanation(matchingEntry.explanation);
          setDiagram(matchingEntry.diagram || '');
          if (matchingEntry.improvements) setImprovements(matchingEntry.improvements);
          if (matchingEntry.complexity_score) setMeta({ complexity_score: matchingEntry.complexity_score });
        } else {
          setExplanation('DEMO_MODE');
        }
        setLoading(false);
      }, 500);
      return;
    }

    // real api call
    try {
      const data = await explainCodeEnhanced({
        code, language: lang, explanation_level: level,
        include_improvements: includeImprovements, include_output: includeOutput,
      });
      
      setExplanation(data.explanation);
      setDiagram(data.diagram || '');
      if (data.output) setOutput(data.output);
      if (data.improvements) setImprovements(data.improvements);
      if (data.metadata) setMeta(data.metadata);

      // save to local storage
      storage.saveExplanation({
        code, explanation: data.explanation, language: data.language || lang,
        explanation_level: level, improvements: data.improvements || [],
        complexity_score: data.metadata?.complexity_score, diagram: data.diagram || '',
      });
    } catch (e) {
      setErr('Oops! Something went wrong. Make sure the backend is running.');
      console.error('Error:', e);
    }
    setLoading(false);
  }

  function loadExample() {
    setCode(exampleCode);
    setExplanation('');
    setDiagram('');
    setErr('');
  }

  function copyExplanation() {
    navigator.clipboard.writeText(explanation);
    setCopiedExp(true);
    setTimeout(() => setCopiedExp(false), 2000);
  }

  function toggleTheme() {
    const newTheme = storage.toggleTheme();
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
  }

  // keyboard shortcut - ctrl+enter to explain
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (code.trim()) handleExplain();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [code, lang, level, includeImprovements, includeOutput]);

  // main layout
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} p-4 sm:p-6 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        {/* hero section with tagline */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-[#e55753]' : 'text-black'}`}>
            Code that finally makes sense
          </h1>
          <p className={`text-lg sm:text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Understand any code snippet with AI-powered explanations
          </p>
        </div>

        {/* top buttons */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 flex-wrap gap-4">
          <div className="flex-1"></div>
          <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
            <button onClick={() => setDemoMode(!demoMode)} className={`p-3 rounded-lg transition-colors ${demoMode ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' : theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`} title={demoMode ? 'Demo mode ON' : 'Demo mode OFF'}>
              <Zap className="w-5 h-5" />
            </button>
            <button onClick={() => setShowHist(!showHist)} className={`p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`} title="Show history">
              <History className="w-5 h-5" />
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {/* error msg */}
        {err && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
            {err}
          </div>
        )}

        {/* left side - code input */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-indigo-100'} rounded-3xl shadow-2xl p-6 sm:p-8 border-2 hover:shadow-3xl transition-shadow`}>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-[#e55753]' : 'text-gray-800'}`}>Your Code</h2>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Paste any code snippet here</p>
              </div>
            </div>

            {/* lang and level selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} block mb-2`}>Language</label>
                <LanguageSelector value={lang} onChange={setLang} />
              </div>
              <div>
                <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} block mb-2`}>Level</label>
                <LevelSelector value={level} onChange={setLevel} />
              </div>
            </div>

            {/* checkboxes */}
            <div className="flex gap-3 sm:gap-6 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={includeImprovements} onChange={(e) => setIncludeImprovements(e.target.checked)} className="w-4 h-4 border-2 border-purple-300 accent-purple-600 cursor-pointer" />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Improvements</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={includeOutput} onChange={(e) => setIncludeOutput(e.target.checked)} className="w-4 h-4 border-2 border-purple-300 accent-purple-600 cursor-pointer" />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Show Output</span>
              </label>
            </div>
            {/* textarea */}
            <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="def hello():&#10;    print('Hello, World!')&#10;&#10;hello()" className={`w-full h-48 sm:h-64 p-4 sm:p-5 border-2 rounded-2xl focus:border-indigo-500 focus:outline-none font-mono text-xs sm:text-sm resize-none transition-all ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-[#e55753]' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-indigo-200'}`} />

            {/* buttons */}
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 flex-wrap">
              <button onClick={handleExplain} disabled={loading || !code.trim()} className="flex-1 min-w-[150px] bg-indigo-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base">
                {loading ? (<><Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /><span className="hidden sm:inline">Analyzing...</span></>) : (<><Sparkles className="w-5 h-5 sm:w-6 sm:h-6" /><span>Explain</span></>)}
              </button>
              <button onClick={loadExample} className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${theme === 'dark' ? 'bg-purple-900 hover:bg-purple-800 text-purple-100' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'}`}>
                Try Example
              </button>
            </div>
          </div>

          {/* right side - results */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-pink-100'} rounded-3xl shadow-2xl p-6 sm:p-8 border-2 hover:shadow-3xl transition-shadow`}>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-3 rounded-2xl">
                <Lightbulb className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="flex-1 min-w-[150px]">
                <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-[#e55753]' : 'text-gray-800'}`}>Explanation</h2>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>AI-powered learning guide</p>
              </div>
              {explanation && (
                <button onClick={copyExplanation} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Copy explanation">
                  {copiedExp ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                </button>
              )}
            </div>

            {/* empty state */}
            {!explanation && !loading && (
              <div className={`h-48 sm:h-72 flex items-center justify-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                <div className="text-center px-4">
                  <Code2 className="w-16 sm:w-24 h-16 sm:h-24 mx-auto mb-3 sm:mb-4 opacity-30" />
                  <p className="text-base sm:text-lg font-medium">Paste code and click "Explain This!"</p>
                  <p className="text-xs sm:text-sm mt-1 sm:mt-2 text-gray-500">Any programming language works</p>
                  {demoMode && <p className="text-xs mt-2 sm:mt-3 text-yellow-600 font-semibold">⚡ Demo Mode Active</p>}
                </div>
              </div>
            )}

            {/* loading state */}
            {loading && (
              <div className={`space-y-4 overflow-y-auto max-h-72 sm:max-h-96 pr-2 sm:pr-4`}>
                <div className="text-center mb-4">
                  <Loader2 className="w-6 sm:w-8 h-6 sm:h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                  <p className={`text-xs sm:text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Analyzing your code, finding feasible solutions...</p>
                </div>
                <SkeletonLoader theme={theme} />
              </div>
            )}

            {/* demo mode placeholder */}
            {explanation === 'DEMO_MODE' && !loading && (
              <div className={`space-y-4 overflow-y-auto max-h-96 pr-4`}><SkeletonLoader theme={theme} /></div>
            )}

            {/* actual explanation */}
            {explanation && explanation !== 'DEMO_MODE' && (
              <div className={`space-y-4 overflow-y-auto max-h-96 pr-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                <ExplanationRenderer explanation={explanation} theme={theme} />

                {meta && (
                  <div className={`text-xs border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-3 mt-4`}>
                    Processing time: {meta.processing_time}s
                  </div>
                )}

                {output && (
                  <div className={`mt-6 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`text-sm font-bold uppercase tracking-wide mb-3 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>📤 Output</div>
                    <div className={`p-4 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap break-words ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-green-300' : 'bg-gray-50 border border-gray-300 text-gray-800'}`}>{output}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>



        {/* improvements section */}
        {improvements.length > 0 && explanation && (
          <div className="mt-8"><ImprovementsSuggestion improvements={improvements} theme={theme} /></div>
        )}

        {/* export and share buttons */}
        {explanation && (
          <div className="mt-8 flex gap-4 flex-wrap">
            <ExportButton code={code} explanation={explanation} language={lang} />
            <ShareButton code={code} explanation={explanation} language={lang} />
          </div>
        )}

        {/* history sidebar */}
        <HistorySidebar isOpen={showHist} onClose={() => setShowHist(false)} onSelect={(entry) => { setCode(entry.code); setExplanation(entry.explanation); setLang(entry.language); setLevel(entry.explanation_level); setShowHist(false); }} />
      </div>
    </div>
  );
}
