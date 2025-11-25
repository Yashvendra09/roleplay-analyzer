// app/api/analytics/route.js
// GET /api/analytics
// Query params:
//   userId (optional) - filter by user
//   limit (optional) - number of most recent items to include in timeSeries (default 50)
//   groupBy (optional) - 'day'|'hour' (default 'day') - controls aggregation granularity

import { NextResponse } from 'next/server';
import connectDB from '../../../services/db.js';
import Evaluation from '../../../models/Evaluation.js';
import { startOfDay, formatISO } from 'date-fns';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || null;
    const limit = Math.min(200, parseInt(searchParams.get('limit') || '50', 10));
    const groupBy = searchParams.get('groupBy') || 'day'; // 'day' or 'hour'

    await connectDB();

    const query = {};
    if (userId) query.userId = userId;

    // 1) Time series: recent N evals, earliest -> latest
    const recentDocs = await Evaluation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const timeSeries = recentDocs
      .slice()
      .reverse()
      .map((d) => ({
        ts: d.createdAt ? new Date(d.createdAt).toISOString() : null,
        overallScore: d.result?.overallScore ?? null,
        id: d._id.toString(),
      }));

    // 2) Aggregates for the set (we use the same limited set for fast response)
    let sumOverall = 0,
      sumEmpathy = 0,
      sumClarity = 0,
      sumProduct = 0,
      count = 0;

    for (const d of recentDocs) {
      const r = d.result || {};
      const s = r.scores || {};
      if (typeof r.overallScore === 'number') sumOverall += r.overallScore;
      if (typeof s.empathy === 'number') sumEmpathy += s.empathy;
      if (typeof s.clarity === 'number') sumClarity += s.clarity;
      if (typeof s.productKnowledge === 'number') sumProduct += s.productKnowledge;
      count++;
    }

    const aggregates =
      count === 0
        ? {
            count: 0,
            avgOverall: null,
            avgEmpathy: null,
            avgClarity: null,
            avgProductKnowledge: null,
          }
        : {
            count,
            avgOverall: Number((sumOverall / count).toFixed(2)),
            avgEmpathy: Number((sumEmpathy / count).toFixed(2)),
            avgClarity: Number((sumClarity / count).toFixed(2)),
            avgProductKnowledge: Number((sumProduct / count).toFixed(2)),
          };

    // 3) Buckets aggregated by day or hour (from the same recentDocs)
    const bucketsMap = new Map();
    for (const d of recentDocs) {
      const date = d.createdAt ? new Date(d.createdAt) : new Date();
      let key;
      if (groupBy === 'hour') {
        // e.g., 2025-11-23T14:00:00Z
        key = new Date(date);
        key.setMinutes(0, 0, 0);
      } else {
        // groupBy === 'day'
        key = startOfDay(date);
      }
      const ks = formatISO(key);
      if (!bucketsMap.has(ks)) {
        bucketsMap.set(ks, { sumOverall: 0, sumEmpathy: 0, sumClarity: 0, sumProduct: 0, n: 0 });
      }
      const bucket = bucketsMap.get(ks);
      const r = d.result || {};
      const s = r.scores || {};
      if (typeof r.overallScore === 'number') bucket.sumOverall += r.overallScore;
      if (typeof s.empathy === 'number') bucket.sumEmpathy += s.empathy;
      if (typeof s.clarity === 'number') bucket.sumClarity += s.clarity;
      if (typeof s.productKnowledge === 'number') bucket.sumProduct += s.productKnowledge;
      bucket.n += 1;
    }

    const buckets = Array.from(bucketsMap.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([ts, val]) => ({
        ts,
        count: val.n,
        avgOverall: val.n ? Number((val.sumOverall / val.n).toFixed(2)) : null,
        avgEmpathy: val.n ? Number((val.sumEmpathy / val.n).toFixed(2)) : null,
        avgClarity: val.n ? Number((val.sumClarity / val.n).toFixed(2)) : null,
        avgProductKnowledge: val.n ? Number((val.sumProduct / val.n).toFixed(2)) : null,
      }));

    return NextResponse.json(
      {
        success: true,
        aggregates,
        timeSeries,
        buckets,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in GET /api/analytics:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to compute analytics.' },
      { status: 500 }
    );
  }
}
