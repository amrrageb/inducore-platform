# AI Architecture & Gemini Integration Specification

## 1. Executive Summary & Principles

InduCore integrates Google's **Gemini AI models** to transform manual procurement processes into intelligent, automated workflows. AI capabilities include unstructured supplier PDF quote parsing, multi-criteria bid evaluation, anomaly-to-RFQ specification synthesis, and market price trend prediction.

All AI integrations strictly adhere to **Server-Side Isolation**, **Structured Output Validation**, and **Deterministic Prompt Engineering**.

---

## 🤖 2. Server-Side Integration & SDK Architecture

In accordance with system security rules and `GEMINI.md` standards:
- All Gemini API interactions execute strictly within backend services (`packages/infrastructure/src/ai/GeminiAIService.ts`).
- Client-side React applications MUST NEVER hold or expose `GEMINI_API_KEY`.

```
[ Client Web Portal ]
         │ HTTPS Request (Trigger AI Evaluation)
         ▼
[ API Gateway ] -> [ Application Use Case (`EvaluateBidsWithAIUseCase`) ]
                                 │
                                 ▼
                     [ Port Interface (`IGeminiAIService`) ]
                                 │
                                 ▼
                     [ Infrastructure Adapter (`GeminiAIService`) ]
                                 │ Uses `@google/genai` SDK
                                 ▼
                     [ Google Gemini API Engine ]
```

---

## 🎯 3. Model Selection Matrix

| Capability / Task | Selected Model Alias | Rationale & Temperature |
| :--- | :--- | :--- |
| **Multi-Criteria Bid Scoring** | `gemini-2.5-pro` | Complex reasoning across price, lead time, ISO compliance, and logistics. Temperature: `0.0`. |
| **PDF Bid Quote Parsing** | `gemini-2.5-flash` | High-speed multimodal document ingestion and unstructured table extraction. Temperature: `0.1`. |
| **IoT Telemetry Anomaly Summarization** | `gemini-2.5-flash` | Ultra-fast text synthesis for maintenance alert notifications. Temperature: `0.2`. |

---

## 📐 4. Structured Output Extraction & Response Schema

To ensure system reliability, all Gemini API calls enforce strongly typed JSON Schema outputs using the SDK's `responseSchema` configuration:

```typescript
// packages/infrastructure/src/ai/GeminiAIService.ts
import { GoogleGenAI, Type } from '@google/genai';
import { IGeminiAIService, AIBidEvaluationResult } from '@inducore/application';

export class GeminiAIService implements IGeminiAIService {
  private aiClient: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    this.aiClient = new GoogleGenAI({ apiKey });
  }

  async evaluateBids(rfqSpecs: string, bidsJson: string): Promise<AIBidEvaluationResult> {
    const response = await this.aiClient.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [
        { role: 'user', text: `Evaluate these supplier bids against the RFQ specification:\nRFQ Specs: ${rfqSpecs}\nBids: ${bidsJson}` }
      ],
      config: {
        temperature: 0.0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedSupplierId: { type: Type.STRING },
            overallScore: { type: Type.NUMBER },
            priceCompetitivenessScore: { type: Type.NUMBER },
            leadTimeScore: { type: Type.NUMBER },
            complianceScore: { type: Type.NUMBER },
            evaluationRationale: { type: Type.STRING },
            lineItemComparison: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sku: { type: Type.STRING },
                  bestPriceBidder: { type: Type.STRING },
                  variancePercentage: { type: Type.NUMBER },
                },
                required: ['sku', 'bestPriceBidder', 'variancePercentage'],
              },
            },
          },
          required: ['recommendedSupplierId', 'overallScore', 'evaluationRationale'],
        },
      },
    });

    return JSON.parse(response.text!) as AIBidEvaluationResult;
  }
}
```

---

## ⚖️ 5. Multi-Criteria Scoring Formula & Prompt Security

### Weighted Scoring Formula
$$\text{Composite Score} = (0.40 \times \text{PriceScore}) + (0.30 \times \text{LeadTimeScore}) + (0.20 \times \text{ISORating}) + (0.10 \times \text{GeoProximity})$$

### Prompt Injection Safeguards
1. User-provided text (supplier bid comments, RFQ notes) is sanitized and wrapped in XML delimiters (e.g. `<supplier_comment>...</supplier_comment>`).
2. System instructions explicitly direct Gemini to ignore prompt override attempts contained within quote attachments.
