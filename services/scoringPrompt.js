// services/scoringPrompt.js
// Builds the scoring prompt for the LLM.

export function buildScoringPrompt({ roleplayText, }) {
  
    return `
  You are an expert evaluator of conversation quality.
  
  Goal:
  Score the conversation on three dimensions:
  - empathy
  - clarity
  - product_knowledge
  
  Scoring rules:
  - Scores are integers from 0 to 10.
  - 0 = terrible, 10 = excellent.
  - Consider only the content in the transcript. 
  - Be strict but fair.
  
  Definitions:
  - empathy: understanding and responding to the other person's feelings, concerns, and context.
  - clarity: clear language, structured answers, no confusion or rambling.
  - product_knowledge: understanding of the product or domain being discussed, correct facts.
  
  VERY IMPORTANT FORMAT INSTRUCTIONS:
  - You must output ONLY valid JSON.
  - Do NOT include any explanations, notes, apologies, or reasoning.
  - Do NOT include chain-of-thought, internal reasoning, or step-by-step analysis.
  - The JSON must match this shape exactly:
  
  {
    "overallScore": 0,
    "scores": {
      "empathy": 0,
      "clarity": 0,
      "productKnowledge": 0
    },
    "feedback": {
      "summary": "short single-paragraph summary",
      "strengths": ["bullet point 1", "bullet point 2"],
      "areasForImprovement": ["bullet point 1", "bullet point 2"]
    }
  }
  
  Transcript to evaluate:
  """ 
  ${roleplayText}
  """
  `;
  }
  