export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    request_id?: string;
  };
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type User = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type Business = {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  businessType: string | null;
  industry: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  status: string;
  timezone: string;
  currency: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  businessId: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  sku: string | null;
  price: number | null;
  compareAtPrice: number | null;
  costPrice: number | null;
  currency: string;
  status: "draft" | "active" | "archived";
  availability: "available" | "unavailable" | "out_of_stock" | "coming_soon";
  stockQuantity: number | null;
  trackInventory: boolean;
  isFeatured: boolean;
  sortOrder: number;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category?: Category | null;
  images?: ProductImage[];
};

export type ProductImage = {
  id: string;
  productId: string;
  mediaId: string | null;
  url: string | null;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
};

export type Enquiry = {
  id: string;
  businessId: string;
  customerId: string | null;
  conversationId: string | null;
  subject: string | null;
  message: string | null;
  status: "new" | "contacted" | "in_progress" | "waiting" | "resolved" | "closed";
  priority: string | null;
  assignedTo: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  customer?: Customer | null;
  conversation?: Conversation | null;
};

export type Customer = {
  id: string;
  businessId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  source: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Conversation = {
  id: string;
  businessId: string;
  customerId: string | null;
  channel: string;
  status: "open" | "waiting" | "resolved" | "archived";
  assignedTo: string | null;
  lastMessageAt: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  customer?: Customer | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderType: "customer" | "business" | "ai" | "system";
  senderId: string | null;
  content: string | null;
  messageType: string | null;
  externalMessageId: string | null;
  metadata: string | null;
  createdAt: string;
};

export type ImportJob = {
  id: string;
  businessId: string;
  createdBy: string | null;
  sourceType: string;
  sourceReference: string | null;
  status: "pending" | "processing" | "review_required" | "completed" | "failed" | "cancelled";
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  items?: ImportItem[];
  conflicts?: ImportConflict[];
  sources?: ImportSource[];
};

export type ImportItem = {
  id: string;
  importJobId: string;
  entityType: string;
  entityData: string;
  confidenceScore: number | null;
  status: "pending" | "approved" | "rejected";
  sourceReference: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ImportConflict = {
  id: string;
  importJobId: string;
  entityType: string;
  entityId: string | null;
  existingValue: string | null;
  importedValue: string | null;
  resolution: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

export type ImportSource = {
  id: string;
  importJobId: string;
  sourceType: string;
  sourceUrl: string | null;
  mediaId: string | null;
  sourceMetadata: string | null;
  createdAt: string;
};

export type Website = {
  id: string;
  businessId: string;
  name: string | null;
  status: "draft" | "published";
  draftVersionId: string | null;
  publishedVersionId: string | null;
  themeConfig: string | null;
  createdAt: string;
  updatedAt: string;
  pages?: WebsitePage[];
  versions?: WebsiteVersion[];
};

export type WebsitePage = {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  pageType: string | null;
  status: string;
  sortOrder: number;
  seoConfig: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sections?: WebsiteSection[];
};

export type WebsiteSection = {
  id: string;
  pageId: string;
  sectionType: string;
  sortOrder: number;
  content: string;
  styleConfig: string | null;
  visibilityConfig: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WebsiteVersion = {
  id: string;
  websiteId: string;
  versionNumber: number;
  snapshot: string;
  createdBy: string | null;
  createdAt: string;
  publishedAt: string | null;
};

export type BusinessMemory = {
  id: string;
  businessId: string;
  key: string | null;
  content: string;
  memoryType: string | null;
  importance: number | null;
  confidence: number | null;
  source: string | null;
  status: "suggested" | "active" | "archived";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ApprovalRequest = {
  id: string;
  businessId: string;
  actionExecutionId: string | null;
  requestedByType: string | null;
  requestedById: string | null;
  status: "pending" | "approved" | "rejected" | "expired";
  reason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
};

export type Order = {
  id: string;
  businessId: string;
  customerId: string | null;
  orderNumber: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "pending" | "paid" | "failed" | "refunded" | "partially_refunded" | null;
  currency: string;
  subtotal: number | null;
  discountAmount: number | null;
  taxAmount: number | null;
  deliveryAmount: number | null;
  totalAmount: number | null;
  notes: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
  items: OrderItem[];
  customer?: Customer | null;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
  nameSnapshot: string;
  unitPrice: number | null;
  quantity: number;
  discountAmount: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  metadata: string | null;
  createdAt: string;
  product?: Product | null;
};

export type Payment = {
  id: string;
  businessId: string;
  orderId: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  provider: string | null;
  transactionReference: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Service = {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  durationMinutes: number | null;
  currency: string;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Booking = {
  id: string;
  businessId: string;
  customerId: string | null;
  serviceId: string | null;
  staffId: string | null;
  locationId: string | null;
  bookingNumber: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  source: string | null;
  customerNotes: string | null;
  internalNotes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
  customer?: Customer | null;
  service?: Service | null;
};

export type AnalyticsOverview = {
  counts: {
    products: number;
    enquiries: number;
    newEnquiries: number;
    customers: number;
    imports: number;
  };
  financials: {
    paidRevenue: number;
  };
  website: { status: string; id: string } | null;
  recentEvents: { type: string; at: string }[];
};
