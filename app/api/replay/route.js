// app/api/replay/route.js
// GET /api/replay?id=<evaluationId>
// Returns the original transcript and metadata for session replay.

import { NextResponse } from 'next/server';
import connectDB from '../../../services/db.js';
import Evaluation from '../../../models/Evaluation.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing id query parameter.' },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = await Evaluation.findById(id).lean();

    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Evaluation not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: doc._id.toString(),
        createdAt: doc.createdAt,
        userId: doc.userId || null,
        roleplayText: doc.roleplayText || null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in GET /api/replay:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to load replay.' },
      { status: 500 }
    );
  }
}
