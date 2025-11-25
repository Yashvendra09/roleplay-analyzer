// models/Evaluation.js
// Mongoose model to store each roleplay analysis result.

import mongoose from 'mongoose';

// Reuse existing model if already compiled (avoids overwrite errors in dev)
const EvaluationSchema = new mongoose.Schema(
  {
    // Optional: identify who this belongs to (if you add auth later)
    userId: {
      type: String,
      required: false,
    },

    // Raw roleplay text or structured transcript (you decide how you send it)
    // For the assignment, a single big string is enough.
    roleplayText: {
      type: String,
      required: true,
    },

    // Structured JSON result from the LLM (scores + feedback)
    result: {
      type: Object, // you can refine this later with a stricter schema if needed
      required: true,
    },

    // You can use this for debugging and analysis later
    modelName: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Evaluation =
  mongoose.models.Evaluation ||
  mongoose.model('Evaluation', EvaluationSchema);

export default Evaluation;
