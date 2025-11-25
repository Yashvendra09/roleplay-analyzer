// services/validateOutput.js
// Zod schema + helper to validate model output.

import { z } from 'zod';

// JSON contract for the evaluation result
export const evaluationSchema = z.object({
  overallScore: z.number().min(0).max(10),

  scores: z.object({
    empathy: z.number().min(0).max(10),
    clarity: z.number().min(0).max(10),
    productKnowledge: z.number().min(0).max(10),
  }),

  feedback: z.object({
    summary: z.string().min(1),
    strengths: z.array(z.string()).default([]),
    areasForImprovement: z.array(z.string()).default([]),
  }),
});

/**
 * Validates that data matches the Evaluation schema.
 * Throws ZodError if invalid.
 */
export function validateEvaluationResult(data) {
  return evaluationSchema.parse(data);
}
