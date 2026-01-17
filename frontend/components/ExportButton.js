'use client';
// export as json or markdown
// pdf would be cool but didnt have time

import React, { useState } from 'react';
import { Download, FileJson } from 'lucide-react';

export default function ExportButton({ code, explanation, language = 'auto-detect' }) {
  // eslint-disable-next-line
  const [exporting, setExporting] = useState(false); // might use later

  // download as json file
  function exportAsJson() {
    const data = { 
      code, 
      explanation, 
      language, 
      exportedAt: new Date().toISOString() 
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // hacky way to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `code-explanation-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url); // cleanup
  }

  function exportAsMarkdown() {
    const markdown = `# Code Explanation

**Language:** ${language}

## Code
\`\`\`${language}
${code}
\`\`\`

## Explanation
${explanation}

---
*Exported from CodeMentor on ${new Date().toLocaleString()}*
`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code-explanation-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <button onClick={exportAsMarkdown} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm" title="Export as Markdown">
        <FileJson className="w-4 h-4" />Markdown
      </button>
      <button onClick={exportAsJson} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm" title="Export as JSON">
        <Download className="w-4 h-4" />JSON
      </button>
    </div>
  );
}
