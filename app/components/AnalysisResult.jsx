'use client';

export default function AnalysisResult({ evaluation }) {
  if (!evaluation) {
    return 
  }

  return (
    <div className="mt-4">
      <pre className="rounded-md border border-slate-300 bg-slate-900 text-slate-50 text-xs px-3 py-3 overflow-x-auto">
        {JSON.stringify(evaluation, null, 2)}
      </pre>
    </div>
  );
}
