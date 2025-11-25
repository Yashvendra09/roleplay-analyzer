'use client';

import { useState } from 'react';

export default function AnalysisForm({ onAnalyze, loading }) {
  const [roleplayText, setRoleplayText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleplayText.trim()) return;
    await onAnalyze(roleplayText.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-slate-200 bg-white px-4 py-4 space-y-4"
    >
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Roleplay transcript
        </label>
        <textarea
          value={roleplayText}
          onChange={(e) => setRoleplayText(e.target.value)}
          rows={8}
          className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500"
          placeholder={`Agent: Hi, thanks for taking the time today. How are you doing?\nCustomer: I'm good, just trying to understand if your tool fits our workflow.\nAgent: Sure, can you tell me a bit about your current process?\n...`}
        />
      </div>

      <div className="flex justify-end">

        <button
          type="submit"
          disabled={loading || !roleplayText.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
              Sending…
            </>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </form>
  );
}
