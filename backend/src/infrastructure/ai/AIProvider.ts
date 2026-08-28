export type AIRequestContext = {
  businessId: string;
  userId: string;
  businessName: string;
  productCount: number;
  enquiryNew: number;
  avgPrice: number;
};

export type AIProviderRequest = {
  message: string;
  taskType?: string;
  context: AIRequestContext;
  model?: string;
};

export type AIProviderResponse = {
  message: string;
  actions: Array<{ type: string; payload?: any; targetId?: string; approvalRequired?: boolean }>;
  sources?: any[];
  usage?: { inputTokens?: number; outputTokens?: number; latencyMs?: number };
  provider: string;
  model: string;
};

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  generate(req: AIProviderRequest): Promise<AIProviderResponse>;
}
