// app/api/evaluate/route.js
// POST /api/evaluate  → run evaluation for a single roleplay
// GET  /api/evaluate  → fetch recent evaluations + basic analytics

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

import connectDB from '../../../services/db.js';
import Evaluation from '../../../models/Evaluation.js';
import { buildScoringPrompt } from '../../../services/scoringPrompt.js';
import { validateEvaluationResult } from '../../../services/validateOutput.js';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const MAX_ROLEPLAY_CHARS = 8000;

// ---------- POST /api/evaluate ----------
// Run LLM-based scoring and store the result
export async function POST(req) {
  try {
    const body = await req.json();
    const { roleplayText, userId } = body || {};

    if (!roleplayText || typeof roleplayText !== 'string') {
      return NextResponse.json(
        { success: false, message: 'roleplayText is required and must be a string.' },
        { status: 400 }
      );
    }

    const trimmedRoleplay =
      roleplayText.length > MAX_ROLEPLAY_CHARS
        ? roleplayText.slice(0, MAX_ROLEPLAY_CHARS)
        : roleplayText;

    await connectDB();

    const prompt = buildScoringPrompt({
      roleplayText: trimmedRoleplay,
    });

    // 1) Call Groq via Vercel AI SDK – plain text response
    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'), 
      prompt,
    });

    // 2) Parse the model output as JSON
    let rawObject;
    try {
      rawObject = JSON.parse(text);
    } catch (parseErr) {
      console.error('Failed to parse model JSON:', text);
      return NextResponse.json(
        {
          success: false,
          message: 'Model did not return valid JSON.',
        },
        { status: 500 }
      );
    }

    // 3) Validate against Zod schema (guardrail)
    let evaluation;
    try {
      evaluation = validateEvaluationResult(rawObject);
    } catch (zodErr) {
      console.error('Schema validation failed:', zodErr);
      return NextResponse.json(
        {
          success: false,
          message: 'Model output failed schema validation.',
        },
        { status: 500 }
      );
    }

    // 4) Persist to Mongo for history / analytics
    const doc = await Evaluation.create({
      userId: userId || null,
      roleplayText: trimmedRoleplay,
      result: evaluation,
      modelName: 'groq:llama-3.1-8b-instant',
    });

    return NextResponse.json(
      {
        success: true,
        data: evaluation,
        id: doc._id.toString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in POST /api/evaluate:', err);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to analyze roleplay. Please try again.',
      },
      { status: 500 }
    );
  }
}

// ---------- GET /api/evaluate ----------
// Return recent evaluations + aggregate stats for analytics
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || null;
    const scenarioType = searchParams.get('scenarioType') || null;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    await connectDB();

    const query = {};
    if (userId) query.userId = userId;
    if (scenarioType) query.scenarioType = scenarioType;

    const docs = await Evaluation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const count = docs.length;

    let sumOverall = 0;
    let sumEmpathy = 0;
    let sumClarity = 0;
    let sumProductKnowledge = 0;

    for (const doc of docs) {
      const res = doc.result || {};
      const scores = res.scores || {};

      if (typeof res.overallScore === 'number') sumOverall += res.overallScore;
      if (typeof scores.empathy === 'number') sumEmpathy += scores.empathy;
      if (typeof scores.clarity === 'number') sumClarity += scores.clarity;
      if (typeof scores.productKnowledge === 'number') {
        sumProductKnowledge += scores.productKnowledge;
      }
    }

    const meta =
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
            avgProductKnowledge: Number(
              (sumProductKnowledge / count).toFixed(2)
            ),
          };

    const data = docs.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId || null,
      scenarioType: doc.scenarioType || null,
      createdAt: doc.createdAt,
      overallScore: doc.result?.overallScore ?? null,
      scores: doc.result?.scores ?? null,
    }));

    return NextResponse.json(
      {
        success: true,
        meta,
        data,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in GET /api/evaluate:', err);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to load evaluations.',
      },
      { status: 500 }
    );
  }
}
