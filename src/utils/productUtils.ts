import { Product, ClothingSize, ProductColor } from '../types';

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80';

export function sanitizeProduct(p: any): Product {
  if (!p || typeof p !== 'object') {
    return {
      id: `prod-${Date.now()}`,
      name: 'Peça JE Imports',
      category: 'streetwear',
      price: 199.9,
      description: 'Peça autêntica JE Imports com acabamento premium e modelagem exclusiva.',
      images: [DEFAULT_FALLBACK_IMAGE],
      sizes: ['P', 'M', 'G', 'GG'],
      colors: [{ name: 'Preto', hex: '#111111' }],
      stock: 10,
      featured: false,
      gender: 'unissex',
      sku: `JE-${Math.floor(100 + Math.random() * 900)}`
    };
  }

  // Sanitize images
  let images: string[] = [];
  if (Array.isArray(p.images)) {
    images = p.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
  }
  if (images.length === 0) {
    if (typeof p.imageUrl === 'string' && p.imageUrl.trim().length > 0) {
      images = [p.imageUrl.trim()];
    } else {
      images = [DEFAULT_FALLBACK_IMAGE];
    }
  }

  // Sanitize sizes
  let sizes: ClothingSize[] = [];
  if (Array.isArray(p.sizes)) {
    sizes = p.sizes.filter((s: any) => typeof s === 'string' && s.trim().length > 0);
  }
  if (sizes.length === 0) {
    sizes = ['P', 'M', 'G', 'GG'];
  }

  // Sanitize colors
  let colors: ProductColor[] = [];
  if (Array.isArray(p.colors)) {
    colors = p.colors.filter((c: any) => c && typeof c.name === 'string');
  }
  if (colors.length === 0) {
    colors = [{ name: 'Preto', hex: '#111111' }];
  }

  const price = typeof p.price === 'number' && !isNaN(p.price) ? Math.max(0, p.price) : Number(p.price) || 0;
  const originalPrice = (typeof p.originalPrice === 'number' && !isNaN(p.originalPrice) && p.originalPrice > 0)
    ? p.originalPrice
    : (p.originalPrice ? Number(p.originalPrice) : undefined);

  return {
    id: String(p.id || `prod-${Date.now()}`),
    name: String(p.name || 'Peça JE Imports'),
    category: p.category || 'streetwear',
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    description: String(p.description || 'Peça autêntica JE Imports com acabamento premium e modelagem exclusiva.'),
    images,
    sizes,
    colors,
    stock: typeof p.stock === 'number' && !isNaN(p.stock) ? Math.max(0, p.stock) : (Number(p.stock) || 10),
    featured: Boolean(p.featured),
    isNew: Boolean(p.isNew),
    isSale: Boolean(p.isSale),
    gender: p.gender || 'unissex',
    material: p.material ? String(p.material) : undefined,
    sku: String(p.sku || `JE-${Math.floor(100 + Math.random() * 900)}`),
  };
}
