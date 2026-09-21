export type ClothingCategory = 
  | 'todos'
  | 'camisetas'
  | 'casacos'
  | 'calcas'
  | 'streetwear'
  | 'vestidos'
  | 'calcados'
  | 'acessorios';

export type ClothingSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG' | '36' | '38' | '40' | '42' | '44';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: ClothingCategory;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  sizes: ClothingSize[];
  colors: ProductColor[];
  stock: number;
  featured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  gender: 'masculino' | 'feminino' | 'unissex';
  material?: string;
  sku: string;
}

export interface CartItem {
  id: string; // unique item cart key: `${product.id}-${size}-${color.name}`
  product: Product;
  selectedSize: ClothingSize;
  selectedColor: ProductColor;
  quantity: number;
}

export type PaymentType = 'pix' | 'credit_card' | 'debit_card' | 'boleto';

export interface ShippingAddress {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: ShippingAddress;
  email?: string;
  cpf?: string;
}

export interface CreditCardData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  installments: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  customer: CustomerInfo;
  paymentMethod: PaymentType;
  paymentDetails?: {
    pixCode?: string;
    pixQrCodeUrl?: string;
    cardLastFour?: string;
    cardBrand?: string;
    installments?: number;
    boletoBarcode?: string;
    boletoDueDate?: string;
  };
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'pendente' | 'aprovado' | 'em_andamento' | 'em_separacao' | 'enviado' | 'entregue';
  trackingCode?: string;
  customerNote?: string;
  whatsappSent?: boolean;
  deliveredAt?: string;
  updatedAt?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
}

export interface FilterOptions {
  category: ClothingCategory;
  search: string;
  gender: 'todos' | 'masculino' | 'feminino' | 'unissex';
  size: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'discount' | 'newest';
  maxPrice: number;
  onlySale: boolean;
}
