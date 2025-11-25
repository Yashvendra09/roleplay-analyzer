'use client';

import { useEffect, useState } from 'react';

/**
 * ReplayPanel
 * - Props: evaluationId (string) OR a simple UI control to input an id
 * - Fetches GET /api/replay?id=<id> and renders the transcript lines as a friendly list.
 *
 * Simple speaker split: lines that contain "Agent:" or "Customer:" (case-insensitive)
 */

export default function ReplayPanel({ evaluationId: initialId }) {
  const [id, setId] = useState(initialId || '');
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialId) fetchReplay(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  async function fetchReplay(reqId) {
    if (!reqId) return;
    setLoading(true);
    setDoc(null);
    try {
      const res = await fetch(`/api/replay?id=${encodeURIComponent(reqId)}`);
      const json = await res.json();
      if (json?.success) setDoc(json);
      else setDoc({ success: false, message: json?.message || 'Not found' });
    } catch (err) {
      console.error('fetchReplay err', err);
      setDoc({ success: false, message: 'Error fetching replay' });
    } finally {
      setLoading(false);
    }
  }

  function renderTranscript(text) {
    if (!text) return <div className="text-xs text-slate-500">No transcript</div>;
    const lines = text.split('\n').filter(Boolean);
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          const lower = trimmed.toLowerCase();
          let speaker = 'Other';
          if (lower.startsWith('agent:')) speaker = 'Agent';
          else if (lower.startsWith('customer:') || lower.startsWith('client:')) speaker = 'Customer';
          const message = trimmed.includes(':') ? trimmed.split(':').slice(1).join(':').trim() : trimmed;
          return (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold ${speaker === 'Agent' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                  {speaker[0]}
                </div>
              </div>
              <div>
                <div className="text-[13px] font-medium text-slate-800">{speaker}</div>
                <div className="text-sm text-slate-700">{message}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-slate-900">Session Replay</h4>
        <div className="flex items-center gap-2">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="evaluation id (paste here)"
            className="rounded-md border border-slate-200 px-2 py-1 text-xs"
          />
          <button
            onClick={() => fetchReplay(id)}
            className="rounded-md bg-indigo-600 text-white px-3 py-1 text-xs"
            disabled={!id || loading}
          >
            {loading ? 'Loading…' : 'Load'}
          </button>
        </div>
      </div>

      {doc && !doc.success && (
        <div className="text-xs text-red-600 mb-2">{doc.message || 'Not found'}</div>
      )}

      {doc && doc.success && (
        <>
          <div className="text-[11px] text-slate-500 mb-2">Scenario: {doc.scenarioType || '-'}</div>
          <div className="text-[11px] text-slate-400 mb-3">Date: {new Date(doc.createdAt).toLocaleString()}</div>
          <div className="rounded-md border border-slate-100 p-3 bg-slate-50">
            {renderTranscript(doc.roleplayText)}
          </div>
        </>
      )}

      {!doc && !loading && (
        <div className="text-xs text-slate-500">Paste an evaluation id and click Load to see the transcript.</div>
      )}
    </div>
  );
}
