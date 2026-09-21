import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'store_settings.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with generous limit for base64 photo uploads
  app.use(express.json({ limit: '25mb' }));

  // API routes FIRST
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get current products catalog (accessible to all clients visiting the store)
  app.get('/api/products', (_req, res) => {
    try {
      if (fs.existsSync(PRODUCTS_FILE)) {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const parsed = JSON.parse(data);
        return res.json({ success: true, products: parsed });
      }
      return res.json({ success: true, products: [] });
    } catch (err: any) {
      console.error('[API] Error reading products:', err);
      return res.status(500).json({ error: 'Failed to read products', details: err?.message });
    }
  });

  // Update products catalog (persists changes across all users)
  app.post('/api/products', (req, res) => {
    try {
      const { products } = req.body;
      if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Invalid products array' });
      }
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
      console.log(`[CATALOG SYNC] Persisted ${products.length} products to disk`);
      return res.json({ 
        success: true, 
        count: products.length, 
        updatedAt: new Date().toISOString() 
      });
    } catch (err: any) {
      console.error('[API] Error saving products:', err);
      return res.status(500).json({ error: 'Failed to save products', details: err?.message });
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
