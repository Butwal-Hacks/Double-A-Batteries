'use client';
// renders the explanation text
// this parsing logic is janky but it makes things look nice

import React from 'react';

function ExplanationRenderer({ explanation, theme }) {
  // turn the text into jsx elements
  function renderExplanation() {
    const lines = explanation.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // check if it looks like code
      if (trimmedLine.includes('`') || /^(def|class|function|const|let|var|if|for|while|return|import|export)/.test(trimmedLine)) {
        const codeContent = trimmedLine.replace(/`/g, '');
        elements.push(
          <div key={i} className={`my-2 p-3 rounded-lg font-mono font-bold text-sm border-l-4 ${theme === 'dark' ? 'bg-gray-900 border-indigo-500 text-indigo-300' : 'bg-indigo-50 border-indigo-500 text-indigo-900'}`}>{codeContent}</div>
        );
      } 
      // numbered sections like 1. 2. etc
      else if (/^\d+\./.test(trimmedLine)) {
        elements.push(
          <div key={i} className={`my-3 font-semibold text-base ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'}`}>{trimmedLine}</div>
        );
        i++;
        // add content lines for this section
        while (i < lines.length && lines[i].trim() && !/^\d+\./.test(lines[i].trim())) {
          const contentLine = lines[i].trim();
          if (contentLine) {
            elements.push(
              <div key={`content-${i}`} className={`ml-4 my-2 leading-relaxed text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{contentLine}</div>
            );
          }
          i++;
        }
        continue;
      }
      // section headers - ends with : and short
      else if (trimmedLine.endsWith(':') && trimmedLine.length < 50 && trimmedLine.length > 3) {
        elements.push(
          <div key={i} className={`mt-4 mb-2 font-bold text-sm uppercase tracking-wide ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>{trimmedLine}</div>
        );
      }
      // empty line
      else if (!trimmedLine) {
        elements.push(<div key={i} className="h-2" />);
      }
      // regular text
      else if (trimmedLine) {
        elements.push(
          <div key={i} className={`my-2 leading-relaxed text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{trimmedLine}</div>
        );
      }
      i++;
    }
    return elements;
  }

  return (
    <div className={`space-y-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
      {renderExplanation()}
    </div>
  );
}

export default React.memo(ExplanationRenderer);

