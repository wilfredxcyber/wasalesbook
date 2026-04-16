export type PaymentStatus = 'Unpaid' | 'Paid';

export interface CatalogueProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl?: string; // base64 or URL
  createdAt: string;
}
export type DeliveryStatus = 'Pending' | 'Delivered';

export interface Order {
  id: string;
  customerName: string;
  product: string;
  amount: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  notes: string;
  phone?: string;  // WhatsApp number
  imageUrl?: string; // Optional image (base64 string for local storage)
  createdAt: string; // ISO date string
}

export interface ReceiptDesign {
  themeId: string;
  fontId: string;
  dividerStyle?: 'zigzag' | 'dashed' | 'solid' | 'wavy';
  logoShape?: 'circle' | 'square' | 'squircle';
  footerMessage?: string;
  customBgColor?: string;
  customTextColor?: string;
  customAccentColor?: string;
  watermark?: 'none' | 'paid' | 'thank_you' | 'handmade' | 'verified';
}

export interface BusinessProfile {
  userName: string;
  email: string;
  currencySymbol: string;
  predefinedProducts: string[];
  paymentDetails: string;
  notifications: boolean;
  logoUrl?: string;
  isStorefrontPublished?: boolean;
  storefrontContactLink?: string;
  receiptDesign?: ReceiptDesign;
}

export interface DailySummary {
  totalOrders: number;
  totalRevenue: number;
  totalCollected: number;
  totalOwed: number;
  pendingDelivery: number;
  delivered: number;
}
