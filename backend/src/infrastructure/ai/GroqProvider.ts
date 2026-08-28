import { AIProvider, AIProviderRequest, AIProviderResponse } from "./AIProvider.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.AI_MODEL || process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || "10000", 10);

export class GroqProvider implements AIProvider {
  readonly name = "groq";
  readonly model = DEFAULT_MODEL;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || process.env.AI_PROVIDER_API_KEY || "";
    if (!this.apiKey) throw new Error("GROQ_API_KEY missing");
  }

  async generate(req: AIProviderRequest): Promise<AIProviderResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const systemPrompt = `You are FrontDesk AI for business "${req.context.businessName}" (products: ${req.context.productCount}, enquiries new: ${req.context.enquiryNew}). Be concise, business-aware, and never invent prices. If asked to add a product like "add X for ₹Y", respond with JSON action.`;
    const body = {
      model: req.model || this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: req.message },
      ],
      temperature: 0.3,
      max_tokens: 500,
    };
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Groq error ${res.status}: ${txt.slice(0, 200)}`);
      }
      const data: any = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim() || "I'm here to help with your business.";
      const usage = data.usage ? { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens } : { inputTokens: req.message.length, outputTokens: content.length };

      const actions: any[] = [];
      const addMatch = req.message.match(/add\s+(.+?)\s+for\s+₹?\s*(\d+)/i);
      if (addMatch) {
        const name = addMatch[1].trim();
        const price = Number(addMatch[2]);
        actions.push({ type: "CREATE_PRODUCT", payload: { name, price, currency: "INR" }, approvalRequired: false });
      }

      return {
        message: content,
        actions,
        sources: [],
        usage: { ...usage, latencyMs: 0 },
        provider: this.name,
        model: data.model || this.model,
      };
    } catch (e: any) {
      if (e.name === "AbortError") throw new Error("AI provider timeout");
      const msg = e.message || "AI provider error";
      if (msg.includes("GROQ_API_KEY") || msg.includes("401") || msg.includes("403")) throw new Error("AI provider authentication failed");
      throw new Error(msg);
    } finally {
      clearTimeout(timeout);
    }
  }
}
