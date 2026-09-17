# Prompt Engineering & LLM Structured Outputs Guide

The system uses the Gemini API (`@google/genai` TypeScript SDK and Python equivalent) with strict response schema enforcement.

## Principles

1. **Strict Response Schemas**: Always pass JSON schema via `responseSchema` or type definitions to prevent unstructured or unpredictable text formatting.
2. **Zero Hallucination Guardrails**:
   - The system instructions explicitly restrict the model to claims present in extracted company sources.
   - Any assertion made about a customer, technology, product, or partnership MUST have an accompanying `{ claim, source, confidence }` evidence object.
3. **No Sales Hype / Anti-Slop**:
   - Cold emails avoid clichés like "supercharge your sales", "revolutionary AI", or aggressive calls to action.
   - Tone is objective, concise (under 150 words), and tailored to an engineering or product leader.

## Example System Prompt (Outreach Agent)

```
You are an expert sales development representative specializing in high-converting, non-generic B2B outreach.

CRITICAL RULES:
1. Ground every statement in verified facts from the company profile.
2. Never fabricate awards, customers, technologies, or business pain points.
3. Keep the email under 150 words.
4. Reference one specific verified fact about their engineering or operations.
5. Provide a low-friction call to action (e.g. 10-minute briefing).
6. State the reason for each personalization point in the output array.
```
