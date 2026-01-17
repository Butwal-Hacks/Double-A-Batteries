'use client';
// share button component
// creates a link ppl can share with friends

import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { createShare } from '@/lib/api';

export default function ShareButton({ code, explanation, language = 'auto-detect' }) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // hit the api to create share link
  async function handleShare() {
    setLoading(true);
    try {
      const result = await createShare({ code, explanation, language });
      if (result.share_id) {
        // build the full url
        const url = `${window.location.origin}/share/${result.share_id}`;
        setShareUrl(url);
      }
    } catch (err) {
      // should probably show error to user but eh
      console.error('share failed:', err);
    }
    setLoading(false);
  }

  function handleCopy() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // show input w/ copy btn if we have a share url
  if (shareUrl) {
    return (
      <div className="bg-green-50 border border-green-300 rounded-lg p-4">
        <p className="text-sm font-medium text-green-800 mb-2">Share link created!</p>
        <div className="flex gap-2">
          <input type="text" value={shareUrl} readOnly className="flex-1 px-3 py-2 border border-green-300 rounded text-sm bg-gray-100" />
          <button onClick={handleCopy} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium flex items-center gap-1 transition-colors">
            {copied ? (<><Check className="w-4 h-4" />Copied</>) : (<><Copy className="w-4 h-4" />Copy</>)}
          </button>
        </div>
      </div>
    );
  }

  // default share btn
  return (
    <button onClick={handleShare} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors">
      <Share2 className="w-4 h-4" />
      {loading ? 'Creating share...' : 'Share'}
    </button>
  );
}
