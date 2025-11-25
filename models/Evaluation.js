// models/Evaluation.js
// Mongoose model to store each roleplay analysis result.

import mongoose from 'mongoose';

const EvaluationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
    },

    roleplayText: {
      type: String,
      required: true,
    },

    // Structured JSON result from the LLM (scores + feedback)
    result: {
      type: Object,
      required: true,
    },

    
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
