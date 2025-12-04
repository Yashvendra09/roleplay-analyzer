# 🧠 Roleplay Scoring Engine — AI-Powered Conversation Evaluation

Tech Stack: Next.js (App Router) • Vercel AI SDK • Groq LLM • MongoDB • Tailwind • Zod
Features: Evaluation Engine • Structured JSON Output • Guardrails • Analytics Dashboard • Replay Viewer


---

## 📌 Overview

This project implements an AI-powered roleplay scoring engine designed to evaluate conversations such as:

Sales roleplays

Customer support simulations

Candidate mock interviews


Users submit a roleplay transcript, and the AI generates:

An overall performance score

Three skill-based sub-scores

A concise summary

Strengths and areas for improvement

JSON-consistent evaluation results


The system also provides:

Analytics trends across evaluations

Replay viewer for past conversations

Storage in MongoDB for history and dashboards

---

## 🎯 Core Objectives Achieved

1. AI Evaluation with Structured JSON Output

All LLM responses adhere to a strict JSON schema enforced by Zod to prevent:

Chain-of-thought leakage

Hallucinated fields

Malformed JSON


2. Secure, Scalable API using Vercel AI SDK

The /api/evaluate endpoint:

Uses Vercel AI SDK for inference

Calls a Groq model (extremely fast + cost efficient)

Ensures schema-validated results

Stores evaluation + analytics data in MongoDB


3. Guardrails & Safety Layers

Implemented guardrails include:

Input size caps (prevents excessive token usage)

Zod schema validation (ensures correct JSON)

Prompt shaping (prevents chain-of-thought output)

Backend input checks (empty/malformed request prevention)


4. Analytics + Replay System

Built endpoints to fetch:

Recent evaluations

Average scores

Skill distribution

Historical trends


Also implemented a session replay viewer inspired by conversation intelligence platforms.


---

## 🏗️ High-Level Architecture

┌───────────────────────────┐
│        Frontend UI        │
│  (Next.js App Router)     │
│  - Transcript input       │
│  - Scenario selection     │
│  - Score display          │
│  - Analytics dashboard    │
└─────────────┬─────────────┘
              │ POST /evaluate
              ▼
┌───────────────────────────┐
│     API Layer (Vercel)    │
│   /api/evaluate           │
│   /api/history            │
│   /api/analytics          │
│   • Input validation      │
│   • Prompt creation       │
│   • LLM inference         │
│   • Zod schema guardrail  │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│   Vercel AI SDK + Groq    │
│  • Fast model inference   │
│  • JSON output enforced   │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     MongoDB Database      │
│  • Evaluations collection │
│  • Stored results + stats │
└───────────────────────────┘


---

## 🧩 How the AI Evaluation Works

Step 1 — User submits conversation

A transcript is posted to /api/evaluate:

{
  "roleplayText": "Agent: Hi... Customer: I'm comparing tools...",
  "userId": "test-user-1"
}


---

Step 2 — Backend generates a scoring prompt

const prompt = buildScoringPrompt({ roleplayText });

The prompt explicitly instructs the model:

“Do NOT output explanations.”

“Return ONLY valid JSON.”

“Do not include chain-of-thought.”



---

Step 3 — LLM evaluates using Vercel AI SDK

const { text } = await generateText({
  model: groq("llama-3.1-8b-instant"),
  prompt,
});

Fast + deterministic inference.


---

Step 4 — JSON is validated with Zod

If fields are wrong, missing or hallucinated → rejected.


---

Step 5 — Results stored in MongoDB

- userId
- transcript
- timestamp
- model output JSON


---

Step 6 — Returned to the UI as stable JSON

{
  "success": true,
  "data": {
    "overallScore": 8,
    "scores": {
      "empathy": 9,
      "clarity": 9,
      "productKnowledge": 7
    },
    "feedback": {
      "summary": "...",
      "strengths": [...],
      "areasForImprovement": [...]
    }
  }
}


---

## 📊 Analytics Features

The /api/analyze endpoint stores evaluations.
The /api/analysis endpoint computes:

Average scores

Total evaluations

Skill distributions

Time-based trends


Uses MongoDB aggregations for:

avg()

sum()

group-by

sorting


This forms the foundation for team dashboards in a production system.


---

## 💡 Design Choices & Trade-offs

Why Next.js App Router?

Serverless deployment

Integrated backend + frontend

Works perfectly with Vercel AI SDK

Auto scaling


Why MongoDB?

Flexible schema for transcripts

Stores nested JSON easily

Easier early-stage iteration


Why Groq (LLaMA)?

Very fast inference

No OpenAI quota issues

Cost-effective


Why Zod?

Bulletproof schema validation

Prevents chain-of-thought leaks

Ensures stable contract


Trade-offs

MongoDB isn’t ideal for large-scale analytic workloads

LLM calls create latency (could be offloaded to queues)

Analytics computed in real-time instead of batch jobs



---

## 🔐 Guardrails Implemented

Risk	Guardrail

Malformed JSON	Zod validation
Excessive tokens	Input length limit (8000 chars)
Chain-of-thought	Prompt instructions to avoid COT
Missing input	Backend validation
Hallucinated fields	Schema verification before DB write
Cost spikes	Smaller model + trimmed input


This ensures safe, predictable AI behavior.


---

## 🚀 Other Features Implemented

✔ Replay Viewer

Shows the last 10 evaluations with timestamp + scores.

✔ Analytics Dashboard

Displays:

Avg overall score

Avg empathy, clarity, product knowledge

Evaluation history list

Skill distribution chart


✔ Production-ready JSON evaluation format

Matches real-world sales coaching tools.


---

## 🧭 What I Would Improve With More Time

1. Add async job queue (BullMQ / SQS) for high-scale evaluations


2. Add auth + RBAC (admin vs agent vs managers)


3. Add vector search for:

finding similar conversations

smart recommendations



4. Add team dashboards


5. Move analytics to:

Postgres (OLAP queries) or

ClickHouse (real-time analytics)



6. Use Claude Sonnet or OpenAI o3 for higher accuracy scoring




---

## 🌟 Business Value

This project demonstrates:
This project provides strong business value for any company that relies on conversations, training, or customer interactions:

1. Automated Conversation Evaluation

AI scores conversations instantly and consistently, reducing manual QA effort and enabling scalable performance review.

2. Personalized Coaching

Structured JSON insights help generate targeted feedback, improving agent training and accelerating skill development.

3. Cost & Time Efficiency

Automates repetitive review tasks, freeing managers and trainers to focus on high-impact work.

4. Consistent, Bias-Free Scoring

Removes human subjectivity and ensures fair, standardized evaluation across teams.

5. Actionable Analytics

Aggregated metrics reveal team strengths, weaknesses, trends, and training needs.

6. Easy Integration

JSON-based output allows seamless integration with CRMs, LMS platforms, dashboards, and internal tools.

## 📎 How to Run Locally

npm install
npm run dev

Create .env.local:

MONGO_URI=your-mongo-uri
GROQ_API_KEY=your-key

Then test via Postman:

POST /api/evaluate
{
  "roleplayText": "...",
  "userId": "demo-user"
}


---

## ✔ Conclusion

This project delivers:

Fully functional AI scoring engine

Guardrails + JSON contract

Analytics system

Replay history

Clean, scalable architecture


Ready for expansion into a production-grade conversational intelligence platform.


