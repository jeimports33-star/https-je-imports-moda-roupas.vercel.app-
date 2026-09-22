import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS } from './src/data/initialProducts';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'store_settings.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure catalog is seeded with initial products if empty or missing
function initializeCatalog() {
  try {
    let shouldSeed = false;
    if (!fs.existsSync(PRODUCTS_FILE)) {
      shouldSeed = true;
    } else {
      const content = fs.readFileSync(PRODUCTS_FILE, 'utf8').trim();
      if (!content || content === '[]') {
        shouldSeed = true;
      }
    }

    if (shouldSeed) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf8');
      console.log(`[CATALOG SEED] Initialized products catalog with ${INITIAL_PRODUCTS.length} items`);
    }
  } catch (err) {
    console.error('[CATALOG SEED] Error initializing catalog:', err);
  }
}

initializeCatalog();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with generous limit for photo uploads
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  // Serve uploaded images statically
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Disable caching for all API endpoints and allow cross-origin requests
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cache-Control, Pragma');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // API health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Store status overview
  app.get('/api/status', (_req, res) => {
    try {
      let productsCount = 0;
      let ordersCount = 0;
      if (fs.existsSync(PRODUCTS_FILE)) {
        const p = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        if (Array.isArray(p)) productsCount = p.length;
      }
      if (fs.existsSync(ORDERS_FILE)) {
        const o = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        if (Array.isArray(o)) ordersCount = o.length;
      }
      res.json({
        success: true,
        serverStatus: 'online',
        productsCount,
        ordersCount,
        serverTime: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Status check failed', details: err?.message });
    }
  });

  // Dedicated upload endpoint for photos (from camera/gallery)
  app.post('/api/upload-image', (req, res) => {
    try {
      const { imageData, filename } = req.body;
      if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({ error: 'imageData (base64 string) is required' });
      }

      // Check if it has a data URL prefix
      const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      let buffer: Buffer;
      let extension = 'jpg';

      if (matches && matches.length === 3) {
        const mime = matches[1];
        if (mime.includes('png')) extension = 'png';
        else if (mime.includes('webp')) extension = 'webp';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(imageData, 'base64');
      }

      const safeName = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;
      const filePath = path.join(UPLOADS_DIR, safeName);
      fs.writeFileSync(filePath, buffer);

      console.log(`[UPLOAD] Image saved: ${safeName} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return res.json({
        success: true,
        url: `/uploads/${safeName}`,
        filename: safeName,
        sizeKb: Math.round(buffer.length / 1024)
      });
    } catch (err: any) {
      console.error('[API] Error uploading image:', err);
      return res.status(500).json({ error: 'Failed to upload image', details: err?.message });
    }
  });

  // Helper to read current products on disk
  const readProductsFromDisk = () => {
    try {
      if (fs.existsSync(PRODUCTS_FILE)) {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8').trim();
        if (data && data !== '[]') {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      console.error('[API] Error reading products file:', e);
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf8');
    return INITIAL_PRODUCTS;
  };

  // Get current products catalog (accessible to all clients visiting the store)
  const handleGetProducts = (_req: express.Request, res: express.Response) => {
    try {
      const prods = readProductsFromDisk();
      return res.json({ success: true, products: prods, count: prods.length });
    } catch (err: any) {
      console.error('[API] Error reading products:', err);
      return res.status(500).json({ error: 'Failed to read products', details: err?.message });
    }
  };

  app.get('/api/products', handleGetProducts);
  app.get('/api/products/*', handleGetProducts);
  app.get('/api/product', handleGetProducts);

  // Update products catalog (persists changes across all users)
  const handleSaveProducts = (req: express.Request, res: express.Response) => {
    try {
      let productsList: any[] = [];
      const body = req.body || {};

      if (Array.isArray(body.products)) {
        productsList = body.products;
      } else if (Array.isArray(body)) {
        productsList = body;
      } else if (body.product && typeof body.product === 'object') {
        const single = body.product;
        const current = readProductsFromDisk();
        const idx = current.findIndex((p: any) => String(p.id) === String(single.id));
        if (idx >= 0) current[idx] = { ...current[idx], ...single };
        else current.unshift(single);
        productsList = current;
      } else if (body.id) {
        const current = readProductsFromDisk();
        const idx = current.findIndex((p: any) => String(p.id) === String(body.id));
        if (idx >= 0) current[idx] = { ...current[idx], ...body };
        else current.unshift(body);
        productsList = current;
      }

      if (!Array.isArray(productsList) || productsList.length === 0) {
        // Fallback to existing products
        productsList = readProductsFromDisk();
      }

      // Ensure every product has safe images, sizes, colors
      const sanitized = productsList.map((p: any) => {
        const rawImgs = Array.isArray(p.images) ? p.images.filter((img: any) => typeof img === 'string' && img.trim()) : [];
        const imgs = rawImgs.length > 0 ? rawImgs : ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80'];
        return {
          ...p,
          images: imgs,
          sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['P', 'M', 'G', 'GG'],
          colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [{ name: 'Preto', hex: '#111111' }],
          price: typeof p.price === 'number' && !isNaN(p.price) ? p.price : (Number(p.price) || 0)
        };
      });

      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(sanitized, null, 2), 'utf8');
      console.log(`[CATALOG SYNC] Persisted ${sanitized.length} products to disk`);
      return res.json({ 
        success: true, 
        count: sanitized.length, 
        products: sanitized,
        updatedAt: new Date().toISOString() 
      });
    } catch (err: any) {
      console.error('[API] Error saving products:', err);
      return res.status(500).json({ error: 'Failed to save products', details: err?.message });
    }
  };

  app.post('/api/products', handleSaveProducts);
  app.put('/api/products', handleSaveProducts);
  app.patch('/api/products', handleSaveProducts);
  app.post('/api/product', handleSaveProducts);
  app.put('/api/product', handleSaveProducts);

  // Single product update endpoint: /api/products/:id
  const handleUpdateSingleProduct = (req: express.Request, res: express.Response) => {
    try {
      const id = req.params.id;
      const updates = req.body || {};
      const current = readProductsFromDisk();
      const idx = current.findIndex((p: any) => String(p.id) === String(id));
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...updates };
      } else {
        current.unshift({ id, ...updates });
      }
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(current, null, 2), 'utf8');
      return res.json({ success: true, product: current[idx >= 0 ? idx : 0] });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update product', details: err?.message });
    }
  };

  app.post('/api/products/:id', handleUpdateSingleProduct);
  app.put('/api/products/:id', handleUpdateSingleProduct);
  app.patch('/api/products/:id', handleUpdateSingleProduct);
  app.delete('/api/products/:id', (req, res) => {
    try {
      const id = req.params.id;
      const current = readProductsFromDisk().filter((p: any) => String(p.id) !== String(id));
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(current, null, 2), 'utf8');
      return res.json({ success: true, count: current.length });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete product', details: err?.message });
    }
  });

  // Store settings (logo, custom configuration)
  app.get('/api/store-settings', (_req, res) => {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        return res.json({ success: true, settings: JSON.parse(data) });
      }
      return res.json({ success: true, settings: {} });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to read settings' });
    }
  });

  app.post('/api/store-settings', (req, res) => {
    try {
      const { settings } = req.body;
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings || {}, null, 2), 'utf8');
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  // Get all customer orders
  app.get('/api/orders', (_req, res) => {
    try {
      if (fs.existsSync(ORDERS_FILE)) {
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        return res.json({ success: true, orders: JSON.parse(data) });
      }
      return res.json({ success: true, orders: [] });
    } catch (err: any) {
      console.error('[API] Error reading orders:', err);
      return res.status(500).json({ error: 'Failed to read orders' });
    }
  });

  // Save / create / sync orders
  app.post('/api/orders', (req, res) => {
    try {
      const { orders, order } = req.body;
      let existing: any[] = [];
      if (fs.existsSync(ORDERS_FILE)) {
        try {
          existing = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
          if (!Array.isArray(existing)) existing = [];
        } catch (_) {
          existing = [];
        }
      }

      if (Array.isArray(orders)) {
        existing = orders;
      } else if (order && order.id) {
        const idx = existing.findIndex(o => o.id === order.id);
        if (idx >= 0) {
          existing[idx] = order;
        } else {
          existing.unshift(order);
        }
      }

      fs.writeFileSync(ORDERS_FILE, JSON.stringify(existing, null, 2), 'utf8');
      return res.json({ success: true, count: existing.length, orders: existing });
    } catch (err: any) {
      console.error('[API] Error saving orders:', err);
      return res.status(500).json({ error: 'Failed to save orders' });
    }
  });

  // Update order status specifically (e.g. 'em_andamento', 'entregue')
  app.post('/api/orders/update-status', (req, res) => {
    try {
      const { orderId, status } = req.body;
      if (!orderId || !status) {
        return res.status(400).json({ error: 'orderId and status are required' });
      }

      let existing: any[] = [];
      if (fs.existsSync(ORDERS_FILE)) {
        try {
          existing = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
          if (!Array.isArray(existing)) existing = [];
        } catch (_) {
          existing = [];
        }
      }

      const orderIndex = existing.findIndex(o => o.id === orderId);
      if (orderIndex >= 0) {
        existing[orderIndex].status = status;
        existing[orderIndex].updatedAt = new Date().toISOString();
        if (status === 'entregue') {
          existing[orderIndex].deliveredAt = new Date().toISOString();
        }
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(existing, null, 2), 'utf8');
        return res.json({ success: true, order: existing[orderIndex], orders: existing });
      } else {
        return res.status(404).json({ error: 'Order not found' });
      }
    } catch (err: any) {
      console.error('[API] Error updating order status:', err);
      return res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
