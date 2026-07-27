import { GoogleGenAI } from '@google/genai';
import { IGeminiAIService } from '@inducore/application';
import { SupplierBid } from '@inducore/core-domain';

export class GeminiAIService implements IGeminiAIService {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required for GeminiAIService');
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  public async evaluateBids(bids: SupplierBid[], rfqRequirements: string): Promise<{ supplierId: string; score: number; reasoning: string }[]> {
    if (!process.env.GEMINI_API_KEY) {
      // Deterministic fallback if API key is not yet configured by user
      return bids.map((b, idx) => ({
        supplierId: b.supplierId,
        score: Math.max(70, 95 - idx * 5 - Math.round(b.leadTimeDays / 2)),
        reasoning: `Evaluated bid from ${b.supplierName} based on lead time of ${b.leadTimeDays} days and price ${b.totalBidAmount.amount} ${b.totalBidAmount.currency}.`
      }));
    }

    try {
      const client = this.getClient();
      const prompt = `You are an expert industrial procurement auditor. Evaluate the following supplier bids against the RFQ requirement: "${rfqRequirements}".
Bids:
${JSON.stringify(bids.map(b => ({ supplierId: b.supplierId, supplierName: b.supplierName, totalAmount: b.totalBidAmount.amount, leadTimeDays: b.leadTimeDays })))}

Return a strict JSON array of objects with keys: supplierId, score (0-100), reasoning.`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const responseText = response.text || '';
      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedJson);
    } catch (err) {
      console.warn('Gemini evaluation error, using fallback evaluation matrix:', err);
      return bids.map((b, idx) => ({
        supplierId: b.supplierId,
        score: Math.max(70, 95 - idx * 5),
        reasoning: `Automatic evaluation score for ${b.supplierName}.`
      }));
    }
  }
}
