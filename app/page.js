'use client';

import { useState } from 'react';
import AnalysisForm from './components/AnalysisForm';
import AnalysisResult from './components/AnalysisResult';
import AnalyticsPanel from './components/AnalyticsPanel';
import ReplayPanel from './components/ReplayPanel';


export default function HomePage() {
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const USER_ID = 'demo-user-1'; // static for now

  const handleAnalyze = async (roleplayText, scenarioType) => {
    setLoading(true);
    setError('');
    setEvaluation(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleplayText,
          scenarioType,
          userId: USER_ID,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json) {
        setError(json?.message || 'Request failed');
        return;
      }

      // We only care about the JSON the API returns
      setEvaluation(json);
    } catch (err) {
      console.error('Analyze error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Roleplay Scoring Engine
          </h1>
        </header>

        {/* Form */}
        <AnalysisForm onAnalyze={handleAnalyze} loading={loading} />

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Raw JSON result */}
            <AnalysisResult evaluation={evaluation} />

            {/* Analytics + Replay (optional) */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
            <AnalyticsPanel userId="demo-user-1" />
            <ReplayPanel />
            </div>
      </div>
    </div>
  );
}
