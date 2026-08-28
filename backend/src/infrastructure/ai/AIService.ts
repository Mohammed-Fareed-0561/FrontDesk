import { AIProvider, AIProviderRequest, AIProviderResponse } from "./AIProvider.js";
import { MockProvider } from "./MockProvider.js";
import { GroqProvider } from "./GroqProvider.js";

const ALLOWED_PROVIDERS = new Set(["mock", "groq"]);
const ALLOWED_MODELS: Record<string, string[]> = {
  mock: ["mock-v0.1"],
  groq: ["llama-3.1-8b-instant", "llama-3.1-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 20;

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) throw new Error("Rate limit exceeded: too many AI requests");
}

export function sanitizeError(e: any): string {
  const msg = e.message || "AI error";
  if (msg.toLowerCase().includes("api_key") || msg.toLowerCase().includes("apikey")) return "AI provider authentication failed";
  if (msg.includes("GROQ_API_KEY") || msg.includes("Bearer")) return "AI provider authentication failed";
  return msg.slice(0, 300).replace(/sk-[a-zA-Z0-9]+/g, "[REDACTED]").replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]");
}

export class AIService {
  private mock = new MockProvider();
  private groq: GroqProvider | null = null;

  getProviderName(): string {
    const configured = (process.env.AI_PROVIDER || "").toLowerCase();
    if (configured === "groq" && (process.env.GROQ_API_KEY || process.env.AI_PROVIDER_API_KEY)) return "groq";
    if (process.env.GROQ_API_KEY || process.env.AI_PROVIDER_API_KEY) return "groq";
    return "mock";
  }

  getProvider(requestedProvider?: string, requestedModel?: string): AIProvider {
    const providerName = (requestedProvider || this.getProviderName()).toLowerCase();
    if (!ALLOWED_PROVIDERS.has(providerName)) throw new Error(`Invalid provider: ${providerName}`);
    if (requestedModel) {
      const allowed = ALLOWED_MODELS[providerName] || [];
      if (allowed.length && !allowed.includes(requestedModel)) throw new Error(`Invalid model ${requestedModel} for provider ${providerName}`);
    }
    if (providerName === "groq") {
      if (!this.groq) {
        try {
          this.groq = new GroqProvider();
        } catch (e: any) {
          throw new Error("Groq not configured: missing GROQ_API_KEY");
        }
      }
      return this.groq;
    }
    return this.mock;
  }

  async generate(
    req: AIProviderRequest & { requestedProvider?: string; requestedModel?: string; rateLimitKey?: string }
  ): Promise<AIProviderResponse> {
    const key = req.rateLimitKey || `global:${req.context.businessId}:${req.context.userId}`;
    checkRateLimit(key);
    checkRateLimit(`provider:${req.requestedProvider || this.getProviderName()}`);
    const provider = this.getProvider(req.requestedProvider, req.requestedModel);
    const start = Date.now();
    try {
      const res = await provider.generate({ message: req.message, taskType: req.taskType, context: req.context, model: req.requestedModel });
      res.usage = { ...res.usage, latencyMs: Date.now() - start };
      return res;
    } catch (e: any) {
      const sanitized = sanitizeError(e);
      throw new Error(sanitized);
    }
  }

  clearRateLimit() {
    rateLimitMap.clear();
  }
}

export const aiService = new AIService();
