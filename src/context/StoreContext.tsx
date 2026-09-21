import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  CartItem, 
  ClothingSize, 
  ProductColor, 
  Order, 
  Coupon, 
  FilterOptions,
  ClothingCategory
} from '../types';
import { INITIAL_PRODUCTS, AVAILABLE_COUPONS } from '../data/initialProducts';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'sku'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetCatalogToDefault: () => void;
  
  cart: CartItem[];
  addToCart: (product: Product, size: ClothingSize, color: ProductColor, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
  
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  discountAmount: number;

  orders: Order[];
  activeOrdersCount: number;
  deliveredOrdersCount: number;
  createOrder: (orderData: Omit<Order, 'id' | 'date'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAdminAuthenticated: boolean;
  verifyAdminPassword: (password: string) => boolean;
  changeAdminPassword: (newPassword: string) => void;
  adminLogout: () => void;
  isOrdersOpen: boolean;
  setIsOrdersOpen: (open: boolean) => void;
  isPixModalOpen: boolean;
  setIsPixModalOpen: (open: boolean) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  customLogoUrl: string | null;
  setCustomLogoUrl: (url: string | null) => void;

  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const defaultFilters: FilterOptions = {
  category: 'todos',
  search: '',
  gender: 'todos',
  size: '',
  sortBy: 'featured',
  maxPrice: 600,
  onlySale: false,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products with localStorage and server synchronization
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('je_store_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading products from storage:', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Helper to persist products to the server disk so everyone visiting gets updated prices and photos
  const saveProductsToServer = async (prodsToSave: Product[]) => {
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: prodsToSave }),
      });
    } catch (err) {
      console.warn('[Sync] Could not reach server backend:', err);
    }
  };

  // Helper to persist logo to server
  const saveLogoToServer = async (logoUrl: string | null) => {
    try {
      await fetch('/api/store-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { customLogoUrl: logoUrl } }),
      });
    } catch (err) {
      console.warn('[Sync] Could not sync logo with server:', err);
    }
  };

  // Helper to persist orders to server disk so all clients see live status
  const saveOrdersToServer = async (ordersToSave: Order[]) => {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: ordersToSave }),
      });
    } catch (err) {
      console.warn('[Sync] Could not sync orders with server:', err);
    }
  };

  // Local storage caching
  useEffect(() => {
    try {
      localStorage.setItem('je_store_products', JSON.stringify(products));
    } catch (e) {
      console.error('Error persisting products:', e);
    }
  }, [products]);

  // Initial fetch and continuous real-time synchronization with server
  useEffect(() => {
    let isMounted = true;

    const fetchFromServer = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
          const serverJson = JSON.stringify(data.products);
          const currentJson = localStorage.getItem('je_store_products');
          if (serverJson !== currentJson) {
            setProducts(data.products);
            localStorage.setItem('je_store_products', serverJson);
          }
        }
      } catch {
        // Offline / static export fallback
      }

      try {
        const resLogo = await fetch('/api/store-settings');
        if (!resLogo.ok) return;
        const dataLogo = await resLogo.json();
        if (isMounted && dataLogo.settings && dataLogo.settings.customLogoUrl !== undefined) {
          setCustomLogoUrlState(dataLogo.settings.customLogoUrl || null);
        }
      } catch {
        // Offline
      }

      try {
        const resOrders = await fetch('/api/orders');
        if (!resOrders.ok) return;
        const dataOrders = await resOrders.json();
        if (isMounted && dataOrders.success && Array.isArray(dataOrders.orders)) {
          const serverOrdersJson = JSON.stringify(dataOrders.orders);
          const currentOrdersJson = localStorage.getItem('je_store_orders');
          if (serverOrdersJson !== currentOrdersJson) {
            setOrders(dataOrders.orders);
            localStorage.setItem('je_store_orders', serverOrdersJson);
          }
        }
      } catch {
        // Offline
      }
    };

    fetchFromServer();

    // Poll every 6 seconds to update prices/photos for all active visitors
    const interval = setInterval(fetchFromServer, 6000);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchFromServer();
      }
    };
    window.addEventListener('focus', fetchFromServer);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', fetchFromServer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Cart with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('je_store_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading cart:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('je_store_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error persisting cart:', e);
    }
  }, [cart]);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('je_store_wishlist');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading wishlist:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('je_store_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error persisting wishlist:', e);
    }
  }, [wishlist]);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('je_store_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading orders:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('je_store_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Error persisting orders:', e);
    }
  }, [orders]);

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Admin Authentication State & Password Persistence
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('je_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [adminPassword, setAdminPasswordState] = useState<string>(() => {
    try {
      return localStorage.getItem('je_admin_password') || 'admin123';
    } catch {
      return 'admin123';
    }
  });

  const verifyAdminPassword = (inputPass: string): boolean => {
    if (inputPass.trim() === adminPassword.trim()) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('je_admin_authenticated', 'true');
      } catch (e) {
        console.error('Error saving admin session:', e);
      }
      return true;
    }
    return false;
  };

  const changeAdminPassword = (newPassword: string) => {
    setAdminPasswordState(newPassword);
    try {
      localStorage.setItem('je_admin_password', newPassword);
    } catch (e) {
      console.error('Error saving admin password:', e);
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('je_admin_authenticated');
    } catch (e) {
      console.error('Error clearing admin session:', e);
    }
  };

  // Custom Logo URL with localStorage persistence
  const [customLogoUrl, setCustomLogoUrlState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('je_store_custom_logo') || null;
    } catch (e) {
      return null;
    }
  });

  const setCustomLogoUrl = (url: string | null) => {
    setCustomLogoUrlState(url);
    saveLogoToServer(url);
    try {
      if (url) {
        localStorage.setItem('je_store_custom_logo', url);
      } else {
        localStorage.removeItem('je_store_custom_logo');
      }
    } catch (e) {
      console.error('Error persisting custom logo:', e);
    }
  };

  // Filters & Search
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const resetFilters = () => setFilters(defaultFilters);

  // Coupons
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Product Catalog actions with server sync
  const addProduct = (newProdData: Omit<Product, 'id' | 'sku'>) => {
    const newId = `prod-${Date.now()}`;
    const newSku = `JE-${newProdData.category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const product: Product = {
      ...newProdData,
      id: newId,
      sku: newSku,
    };
    setProducts((prev) => {
      const next = [product, ...prev];
      saveProductsToServer(next);
      return next;
    });
    showToast(`"${product.name}" adicionado e sincronizado para todos!`, 'success');
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      saveProductsToServer(next);
      return next;
    });
    showToast('Preços e fotos atualizados para todos que acessarem o site!', 'info');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProductsToServer(next);
      return next;
    });
    showToast('Produto removido e atualizado para todos.', 'info');
  };

  const resetCatalogToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    saveProductsToServer(INITIAL_PRODUCTS);
    showToast('Catálogo restaurado para as peças padrão em todos os acessos.', 'info');
  };

  // Cart actions
  const addToCart = (
    product: Product, 
    size: ClothingSize, 
    color: ProductColor, 
    quantity: number = 1
  ) => {
    const cartItemId = `${product.id}-${size}-${color.name}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            product,
            selectedSize: size,
            selectedColor: color,
            quantity,
          },
        ];
      }
    });
    showToast(`"${product.name}" (${size}) adicionado à sacola!`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removido da sacola.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartTotalCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  // Wishlist actions
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removido dos favoritos', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Salvo nos seus favoritos!', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Coupon handling
  const applyCoupon = (code: string) => {
    const upperCode = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === upperCode);
    if (!found) {
      return { success: false, message: 'Cupom inválido ou expirado.' };
    }
    if (found.minSpend && cartSubtotal < found.minSpend) {
      return {
        success: false,
        message: `Valor mínimo para este cupom é R$ ${found.minSpend.toFixed(2)}.`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Cupom ${found.code} aplicado com sucesso!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (cartSubtotal * appliedCoupon.value) / 100;
    }
    return Math.min(appliedCoupon.value, cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);

  // Orders
  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status !== 'entregue').length;
  }, [orders]);

  const deliveredOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'entregue').length;
  }, [orders]);

  const createOrder = (orderData: Omit<Order, 'id' | 'date'>): Order => {
    const id = `JE-${Math.floor(100000 + Math.random() * 900000)}`;
    const date = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id,
      date,
      trackingCode: `BR${Math.floor(100000000 + Math.random() * 900000000)}JE`,
    };
    setOrders((prev) => {
      const next = [newOrder, ...prev];
      saveOrdersToServer(next);
      return next;
    });
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const now = new Date().toISOString();
    setOrders((prev) => {
      const next = prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            updatedAt: now,
            ...(status === 'entregue' ? { deliveredAt: now } : {}),
          };
        }
        return o;
      });
      saveOrdersToServer(next);
      return next;
    });

    const statusReadable =
      status === 'entregue'
        ? 'Entregue (Entrega Feita)'
        : status === 'em_andamento'
          ? 'Em Andamento'
          : status === 'em_separacao'
            ? 'Em Separação'
            : status === 'enviado'
              ? 'Em Rota de Entrega'
              : status === 'aprovado'
                ? 'Pagamento Aprovado'
                : 'Pendente';

    showToast(`Pedido #${orderId}: status alterado para "${statusReadable}".`, 'success');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetCatalogToDefault,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        orders,
        activeOrdersCount,
        deliveredOrdersCount,
        createOrder,
        updateOrderStatus,
        filters,
        setFilters,
        resetFilters,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAdminOpen,
        setIsAdminOpen,
        isAdminAuthenticated,
        verifyAdminPassword,
        changeAdminPassword,
        adminLogout,
        isOrdersOpen,
        setIsOrdersOpen,
        isPixModalOpen,
        setIsPixModalOpen,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        selectedProduct,
        setSelectedProduct,
        customLogoUrl,
        setCustomLogoUrl,
        toasts,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
