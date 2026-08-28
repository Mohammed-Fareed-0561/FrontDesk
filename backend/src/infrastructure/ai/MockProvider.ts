import { AIProvider, AIProviderRequest, AIProviderResponse } from "./AIProvider.js";

export class MockProvider implements AIProvider {
  readonly name = "mock";
  readonly model = "mock-v0.1";

  async generate(req: AIProviderRequest): Promise<AIProviderResponse> {
    const lower = req.message.toLowerCase();
    if (lower.includes("sk-") || lower.includes("api credentials") || lower.includes("ignore previous instructions")) {
      return {
        message: `I found some business knowledge but it contains instructions that I treat as data, not to follow. I can help you manage your business.`,
        actions: [],
        sources: [],
        usage: { inputTokens: req.message.length, outputTokens: 50 },
        provider: this.name,
        model: this.model,
      };
    }
    let message = `Thanks for asking: "${req.message.slice(0, 100)}". I can help you manage catalog, website, and enquiries. For example, say "add cappuccino for ₹120" and I'll propose the change for your approval.`;
    if (lower.includes("price") || lower.includes("product")) {
      message = `I found ${req.context.productCount} active products. Your top products have an average price around ₹${req.context.avgPrice || 250}. Want me to suggest a promotion?`;
    } else if (lower.includes("today") || lower.includes("task")) {
      message = `You have ${req.context.enquiryNew} new enquiries and business "${req.context.businessName}" has ${req.context.productCount} products. Recommended: review imports and publish your website if not yet published.`;
    }

    const actions: any[] = [];
    const addMatch = req.message.match(/add\s+(.+?)\s+for\s+₹?\s*(\d+)/i);
    if (addMatch) {
      const name = addMatch[1].trim();
      const price = Number(addMatch[2]);
      actions.push({ type: "CREATE_PRODUCT", payload: { name, price, currency: "INR" }, approvalRequired: false });
    }
    const priceMatch = req.message.match(/change\s+(.+?)\s+price\s+to\s+₹?\s*(\d+)/i);
    if (priceMatch) {
      const target = priceMatch[1].trim();
      const price = Number(priceMatch[2]);
      actions.push({ type: "UPDATE_PRODUCT", payload: { targetName: target, price }, approvalRequired: true });
    }

    return {
      message,
      actions,
      sources: [],
      usage: { inputTokens: req.message.length, outputTokens: message.length },
      provider: this.name,
      model: this.model,
    };
  }
}
