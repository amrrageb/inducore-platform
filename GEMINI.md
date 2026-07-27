# GEMINI.md — Gemini LLM Context Rules & SDK Standards

This file governs model interactions and code generation standards when leveraging Google Gemini models and the `@google/genai` SDK within InduCore.

---

## 1. SDK Usage Standards (`@google/genai`)

- **Server-Side Only**: All Gemini API integrations MUST reside in backend services (`server.ts` or `packages/infrastructure/`).
- **Secret Isolation**: Never prefix Gemini keys with `VITE_` or expose `GEMINI_API_KEY` to client-side code.
- **Initialization Pattern**:
  ```typescript
  import { GoogleGenAI } from '@google/genai';

  export function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({ apiKey });
  }
  ```

---

## 2. Recommended Model Aliases

- **Structured Output & Reasoning**: `gemini-2.5-pro`
- **Fast Multimodal & Code Generation**: `gemini-2.5-flash`
- **Live Streamed Audio/Text**: `gemini-2.5-flash-native`

---

## 3. Structured Output & Function Calling Conventions

- Always enforce strongly typed schema responses using Zod or JSON Schema objects in `responseSchema`.
- Temperature should be set to `0.0` or `0.1` for deterministic structured data extraction (e.g. parsing supplier RFQ PDFs or telemetry anomalies).
