import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Plus, 
  Trash2, 
  Settings2, 
  RotateCcw, 
  Save, 
  Image as ImageIcon, 
  Upload,
  Link as LinkIcon,
  Check, 
  Edit3,
  Search,
  Sparkles,
  DollarSign,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  LogOut,
  QrCode,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MessageCircle,
  Phone,
  MapPin,
  ExternalLink,
  Calendar,
  Filter
} from 'lucide-react';
import { ClothingCategory, ClothingSize, ProductColor, Product, Order } from '../types';
import { 
  formatCurrency,
  OFFICIAL_PIX_CODE,
  OFFICIAL_PIX_KEY,
  OFFICIAL_PIX_BENEFICIARY,
  OFFICIAL_PIX_CITY
} from '../utils/paymentUtils';
import { PixQrCode } from './PixQrCode';
import { JeLogo } from './JeLogo';

const ALL_SIZES: ClothingSize[] = ['PP', 'P', 'M', 'G', 'GG', 'XG', '36', '38', '40', '42', '44'];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
];

export const AdminCatalogModal: React.FC = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    isAdminAuthenticated,
    verifyAdminPassword,
    changeAdminPassword,
    adminLogout,
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    resetCatalogToDefault,
    customLogoUrl,
    setCustomLogoUrl,
    orders,
    updateOrderStatus,
    activeOrdersCount,
    deliveredOrdersCount,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'orders' | 'logo' | 'security' | 'pix'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'todos' | 'em_andamento' | 'entregue' | 'pendente'>('todos');
  const [logoInput, setLogoInput] = useState(customLogoUrl || '');

  // Password Unlock States
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Security Tab States (Change Password)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editing state for full product edit modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Adding New Clothing Item
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('camisetas');
  const [price, setPrice] = useState(159.90);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(199.90);
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState<'masculino' | 'feminino' | 'unissex'>('unissex');
  const [material, setMaterial] = useState('100% Algodão Premium Fio 30.1');
  const [stock, setStock] = useState(20);
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0]);
  const [selectedSizes, setSelectedSizes] = useState<ClothingSize[]>(['P', 'M', 'G', 'GG']);
  const [colors, setColors] = useState<ProductColor[]>([
    { name: 'Preto', hex: '#171717' },
    { name: 'Branco', hex: '#ffffff' },
  ]);
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#2563eb');
  const [isNew, setIsNew] = useState(true);
  const [isSale, setIsSale] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<ClothingCategory>('camisetas');
  const [editPrice, setEditPrice] = useState(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState<number | undefined>(undefined);
  const [editDescription, setEditDescription] = useState('');
  const [editGender, setEditGender] = useState<'masculino' | 'feminino' | 'unissex'>('unissex');
  const [editMaterial, setEditMaterial] = useState('');
  const [editStock, setEditStock] = useState(0);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editSelectedSizes, setEditSelectedSizes] = useState<ClothingSize[]>([]);
  const [editColors, setEditColors] = useState<ProductColor[]>([]);
  const [editColorName, setEditColorName] = useState('');
  const [editColorHex, setEditColorHex] = useState('#171717');
  const [editIsNew, setEditIsNew] = useState(false);
  const [editIsSale, setEditIsSale] = useState(false);

  if (!isAdminOpen) return null;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Por favor, digite a senha do administrador.');
      return;
    }

    const success = verifyAdminPassword(passwordInput);
    if (success) {
      setPasswordError(null);
      setPasswordInput('');
      showToast('Acesso de administrador autorizado!', 'success');
    } else {
      setPasswordError('Senha incorreta. Apenas o administrador autorizado pode gerenciar o catálogo.');
    }
  };

  // Handle Change Password
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);
    if (!newPassword.trim()) {
      setSecurityMessage({ type: 'error', text: 'Digite a nova senha desejada.' });
      return;
    }
    if (newPassword.length < 4) {
      setSecurityMessage({ type: 'error', text: 'A senha deve conter no mínimo 4 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'As senhas digitadas não coincidem.' });
      return;
    }

    changeAdminPassword(newPassword.trim());
    setNewPassword('');
    setConfirmPassword('');
    setSecurityMessage({ type: 'success', text: 'Senha do administrador alterada com sucesso!' });
    showToast('Senha do administrador alterada com sucesso!', 'success');
  };

  // Password Lock Screen if not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div 
        id="admin-auth-modal"
        className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4 animate-in fade-in duration-200"
      >
        <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl overflow-hidden">
          {/* Subtle golden top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#DFBA73] to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              setIsAdminOpen(false);
              setPasswordError(null);
              setPasswordInput('');
            }}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon and Title */}
          <div className="text-center space-y-3 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-[#DFBA73]/15 border border-[#DFBA73]/30 text-[#DFBA73] flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#DFBA73] block mb-1">
                JE IMPORTS • ÁREA RESTRITA
              </span>
              <h2 className="font-display font-extrabold text-2xl text-white">
                Acesso do Administrador
              </h2>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Este painel permite gerenciar produtos, preços, estoque e fotos da loja. Digite a senha master para desbloquear o acesso.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Senha do Administrador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <KeyRound className="w-4 h-4 text-[#DFBA73]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="Digite sua senha..."
                  autoFocus
                  className={`w-full pl-10 pr-10 py-3 bg-neutral-950 border text-white text-sm rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                    passwordError 
                      ? 'border-red-500 focus:ring-red-500/30' 
                      : 'border-neutral-700 focus:border-[#DFBA73] focus:ring-[#DFBA73]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-5 rounded-2xl bg-[#DFBA73] hover:bg-[#c59b4b] text-neutral-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#DFBA73]/20 active:scale-[0.98] cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Desbloquear Painel</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Open Edit Product Modal
  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCategory(prod.category);
    setEditPrice(prod.price);
    setEditOriginalPrice(prod.originalPrice);
    setEditDescription(prod.description);
    setEditGender(prod.gender);
    setEditMaterial(prod.material || '');
    setEditStock(prod.stock);
    setEditImageUrl(prod.images[0] || '');
    setEditSelectedSizes([...prod.sizes]);
    setEditColors([...prod.colors]);
    setEditIsNew(Boolean(prod.isNew));
    setEditIsSale(Boolean(prod.isSale));
  };

  // Save changes to edited product
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editName.trim()) return;

    updateProduct(editingProduct.id, {
      name: editName.trim(),
      category: editCategory,
      price: Number(editPrice),
      originalPrice: editOriginalPrice ? Number(editOriginalPrice) : undefined,
      description: editDescription.trim(),
      gender: editGender,
      material: editMaterial.trim(),
      stock: Number(editStock),
      images: [editImageUrl.trim() || editingProduct.images[0]],
      sizes: editSelectedSizes.length > 0 ? editSelectedSizes : ['M'],
      colors: editColors.length > 0 ? editColors : [{ name: 'Padrão', hex: '#000000' }],
      isNew: editIsNew,
      isSale: editIsSale,
    });

    showToast(`Peça "${editName}" atualizada com sucesso!`, 'success');
    setEditingProduct(null);
  };

  // Image Upload helper using FileReader
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    target: 'add' | 'edit'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (target === 'add') {
          setImageUrl(result);
          showToast('Foto carregada do dispositivo!', 'success');
        } else {
          setEditImageUrl(result);
          showToast('Foto da peça atualizada!', 'success');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomLogoUrl(result);
        setLogoInput(result);
        showToast('Foto do Leão da logo atualizada com sucesso!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (logoInput.trim()) {
      setCustomLogoUrl(logoInput.trim());
      showToast('Link da foto da logo atualizado com sucesso!', 'success');
    }
  };

  const handleResetLogo = () => {
    setCustomLogoUrl(null);
    setLogoInput('');
    showToast('Logo restaurada para o Leão oficial padrão!', 'info');
  };

  const handleToggleSize = (size: ClothingSize) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== size));
      }
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleToggleEditSize = (size: ClothingSize) => {
    if (editSelectedSizes.includes(size)) {
      if (editSelectedSizes.length > 1) {
        setEditSelectedSizes(editSelectedSizes.filter((s) => s !== size));
      }
    } else {
      setEditSelectedSizes([...editSelectedSizes, size]);
    }
  };

  const handleAddColor = () => {
    if (!colorNameInput.trim()) return;
    setColors([...colors, { name: colorNameInput.trim(), hex: colorHexInput }]);
    setColorNameInput('');
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length > 1) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const handleAddEditColor = () => {
    if (!editColorName.trim()) return;
    setEditColors([...editColors, { name: editColorName.trim(), hex: editColorHex }]);
    setEditColorName('');
  };

  const handleRemoveEditColor = (index: number) => {
    if (editColors.length > 1) {
      setEditColors(editColors.filter((_, i) => i !== index));
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProduct({
      name: name.trim(),
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description: description.trim() || 'Peça autêntica JE Imports com acabamento premium e modelagem exclusiva.',
      images: [imageUrl],
      sizes: selectedSizes,
      colors,
      stock: Number(stock),
      gender,
      material,
      isNew,
      isSale,
      featured: true,
    });

    // Reset and return to list
    setName('');
    setDescription('');
    setActiveTab('list');
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      id="admin-catalog-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6"
    >
      <div 
        id="admin-catalog-modal-container"
        className="relative bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DFBA73] text-neutral-950 flex items-center justify-center font-black">
              JE
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
                <span>Gerenciador de Catálogo da Loja</span>
                <span className="text-[11px] bg-neutral-800 text-[#DFBA73] font-mono px-2 py-0.5 rounded-full border border-neutral-700">
                  ADMIN
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Adicione novas roupas, cole fotos ou faça upload, e ajuste valores e estoque facilmente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                adminLogout();
                showToast('Painel administrativo bloqueado com sucesso.', 'info');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-red-950/70 text-neutral-300 hover:text-red-300 border border-neutral-700 hover:border-red-800/60 transition-colors"
              title="Bloquear painel e encerrar sessão de administrador"
            >
              <Lock className="w-3.5 h-3.5 text-[#DFBA73]" />
              <span className="hidden sm:inline">Bloquear Painel</span>
            </button>

            <button
              type="button"
              onClick={resetCatalogToDefault}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-colors"
              title="Restaurar catálogo inicial da loja"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="admin-tab-list"
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-neutral-950 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Peças Cadastradas ({products.length})
            </button>

            <button
              id="admin-tab-add"
              type="button"
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'add'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Adicionar Nova Roupa</span>
            </button>

            <button
              id="admin-tab-orders"
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'orders'
                  ? 'bg-neutral-900 text-white shadow-sm ring-2 ring-emerald-500'
                  : 'text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Pedidos dos Clientes ({orders.length})</span>
              {activeOrdersCount > 0 ? (
                <span className="min-w-4.5 h-4.5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {activeOrdersCount}
                </span>
              ) : deliveredOrdersCount > 0 ? (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  ✓
                </span>
              ) : null}
            </button>

            <button
              id="admin-tab-logo"
              type="button"
              onClick={() => setActiveTab('logo')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'logo'
                  ? 'bg-neutral-900 text-[#DFBA73] shadow-sm border border-[#DFBA73]/40'
                  : 'text-neutral-800 bg-[#DFBA73]/15 hover:bg-[#DFBA73]/25 border border-[#DFBA73]/30'
              }`}
            >
              <span>🦁 Foto da Logo (Leão)</span>
            </button>

            <button
              id="admin-tab-security"
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'security'
                  ? 'bg-neutral-900 text-[#DFBA73] shadow-sm border border-[#DFBA73]/40'
                  : 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#DFBA73]" />
              <span>Senha do Admin</span>
            </button>

            <button
              id="admin-tab-pix"
              type="button"
              onClick={() => setActiveTab('pix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'pix'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code PIX</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar por nome, SKU ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: PRODUCT LIST & FAST ACTIONS */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-500 pb-1">
                <span>Clique em <strong>Editar Peça</strong> para alterar fotos, tamanhos e descrição completa, ou altere o preço diretamente na tabela.</span>
                <span className="font-bold text-neutral-900">{filteredProducts.length} peças encontradas</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-neutral-200 shadow-xs">
                <table className="w-full text-left text-xs text-neutral-600">
                  <thead className="bg-neutral-100 text-neutral-900 uppercase font-bold border-b border-neutral-200">
                    <tr>
                      <th className="p-3">Foto / Peça</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Valor de Venda (R$)</th>
                      <th className="p-3">Estoque</th>
                      <th className="p-3">Tamanhos</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100">
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-neutral-900 line-clamp-1">{prod.name}</p>
                              <p className="text-[11px] text-neutral-400">SKU: {prod.sku}</p>
                              {prod.originalPrice && (
                                <span className="text-[10px] text-rose-600 font-semibold">
                                  De {formatCurrency(prod.originalPrice)} por {formatCurrency(prod.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="capitalize font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {prod.category}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] font-bold">R$</span>
                              <input
                                type="number"
                                defaultValue={prod.price}
                                step="0.10"
                                onBlur={(e) => {
                                  const val = Number(e.target.value);
                                  if (val > 0) {
                                    updateProduct(prod.id, { price: val });
                                    showToast(`Preço de "${prod.name}" alterado para ${formatCurrency(val)}`, 'success');
                                  }
                                }}
                                className="w-24 pl-6 pr-2 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                                title="Altere o valor em Reais e clique fora para salvar"
                              />
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              defaultValue={prod.stock}
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (val >= 0) {
                                  updateProduct(prod.id, { stock: val });
                                  showToast(`Estoque de "${prod.name}" atualizado para ${val} un.`, 'info');
                                }
                              }}
                              className="w-16 px-2 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                              min="0"
                              title="Altere o estoque e clique fora para salvar"
                            />
                            <span className="text-[11px] text-neutral-400 font-medium">un.</span>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {prod.sizes.map((sz) => (
                              <span key={sz} className="text-[10px] bg-neutral-100 text-neutral-800 font-bold px-1.5 py-0.5 rounded">
                                {sz}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(prod)}
                              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors border border-neutral-200"
                              title="Editar foto, valores, tamanhos e descrição da peça"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir "${prod.name}" do catálogo?`)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Remover peça do catálogo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW CLOTHING ITEM FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateProduct} className="max-w-3xl mx-auto space-y-6">
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Cadastrar Nova Peça no Catálogo</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Cole o link da foto ou carregue uma imagem direto do seu celular ou computador.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nome */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Nome da Roupa / Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Camiseta Oversized JE Imports Heavyweight"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-medium"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950 font-medium"
                  >
                    <option value="camisetas">Camisetas</option>
                    <option value="casacos">Casacos & Jaquetas</option>
                    <option value="streetwear">Streetwear & Hoodies</option>
                    <option value="calcas">Calças & Shorts</option>
                    <option value="vestidos">Vestidos</option>
                    <option value="calcados">Calçados & Sneakers</option>
                    <option value="acessorios">Acessórios</option>
                  </select>
                </div>

                {/* Gênero */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Gênero
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950 font-medium"
                  >
                    <option value="unissex">Unissex</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>

                {/* Preço de Venda (VALOR) */}
                <div>
                  <label className="text-xs font-bold text-neutral-900 block mb-1 flex items-center justify-between">
                    <span>Valor de Venda (R$) *</span>
                    <span className="text-[11px] text-emerald-600 font-bold">Preço final</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">R$</span>
                    <input
                      type="number"
                      step="0.10"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="159.90"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-bold text-neutral-900"
                    />
                  </div>
                </div>

                {/* Preço Original (Opcional) */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Preço Original "De" (Opcional - R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">R$</span>
                    <input
                      type="number"
                      step="0.10"
                      value={originalPrice || ''}
                      onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Ex: 219.90 (para exibir desconto de/por)"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </div>
                </div>

                {/* Estoque */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Estoque Inicial (Unidades) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Material / Tecido
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Ex: 100% Algodão Heavyweight Fio 30.1"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>

                {/* Descrição */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Descrição da Roupa
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes sobre a modelagem, caimento, estampas, acabamento e estilo..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>

                {/* FOTO DO PRODUTO: COLAR LINK OU CARREGAR DO APARELHO */}
                <div className="sm:col-span-2 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Foto do Produto (Colar URL ou Enviar Arquivo)</span>
                    </label>
                    <span className="text-[11px] text-neutral-500">Formato JPG, PNG ou WebP</span>
                  </div>

                  {/* Preview and Inputs */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Live Image Preview */}
                    <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-dashed border-neutral-300 bg-white flex items-center justify-center shrink-0 shadow-xs">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt="Prévia da roupa" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-neutral-400">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px]">Sem foto</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2.5 w-full">
                      {/* Option 1: Paste URL */}
                      <div>
                        <span className="text-[11px] font-semibold text-neutral-600 block mb-1">
                          Opção 1: Colar link / URL da foto:
                        </span>
                        <div className="relative">
                          <LinkIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://exemplo.com/minha-foto.jpg"
                            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
                          />
                        </div>
                      </div>

                      {/* Option 2: Upload from Device */}
                      <div>
                        <span className="text-[11px] font-semibold text-neutral-600 block mb-1">
                          Opção 2: Carregar do seu celular ou computador:
                        </span>
                        <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-xl border border-neutral-300 cursor-pointer shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Escolher foto do aparelho</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'add')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Preset quick picks */}
                  <div className="pt-2 border-t border-neutral-200">
                    <span className="text-[11px] text-neutral-500 block mb-1.5 font-medium">Ou selecione uma foto pronta do catálogo:</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setImageUrl(img)}
                          className={`w-12 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                            imageUrl === img ? 'border-neutral-950 scale-105 ring-2 ring-neutral-950/20' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grade de Tamanhos */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 block">
                    Tamanhos Disponíveis para esta peça:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_SIZES.map((sz) => {
                      const isSel = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleToggleSize(sz)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSel
                              ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cores da Peça */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-neutral-700 block">
                    Cores Disponíveis:
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {colors.map((c, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-semibold border border-neutral-200 shadow-xs"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                        {colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(i)}
                            className="text-neutral-400 hover:text-rose-600 ml-1 font-bold"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Nome da cor (ex: Bege)"
                      value={colorNameInput}
                      onChange={(e) => setColorNameInput(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                    />
                    <input
                      type="color"
                      value={colorHexInput}
                      onChange={(e) => setColorHexInput(e.target.value)}
                      className="w-8 h-8 p-0 border border-neutral-300 rounded-lg cursor-pointer bg-white"
                      title="Escolher tom"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl transition-colors"
                    >
                      + Adicionar Cor
                    </button>
                  </div>
                </div>

                {/* Flags */}
                <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="accent-neutral-950 w-4 h-4 rounded"
                    />
                    <span>Marcar como "Novo Lançamento"</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSale}
                      onChange={(e) => setIsSale(e.target.checked)}
                      className="accent-rose-600 w-4 h-4 rounded"
                    />
                    <span>Destacar em Promoção</span>
                  </label>
                </div>

              </div>

              {/* Submit button */}
              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-5 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                >
                  Cancelar
                </button>

                <button
                  id="admin-submit-new-product"
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Peça no Catálogo</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CUSTOM STORE LOGO (PHOTO DO LEÃO) */}
          {activeTab === 'logo' && (
            <div id="admin-logo-settings" className="max-w-3xl mx-auto py-4 space-y-8">
              
              {/* Info Header */}
              <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 p-6 rounded-3xl border border-[#DFBA73]/30 text-white space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFBA73]/20 text-[#DFBA73] text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalização Oficial da Marca</span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-white">
                  Foto do Leão da Logo da Loja
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                  Coloque a sua foto do leão aqui! Você pode fazer upload da imagem salva no seu celular/computador ou colar um link direto da foto. Assim que você enviar, a foto do seu leão vai substituir a logo em toda a loja (no topo, no banner e no rodapé).
                </p>
              </div>

              {/* Upload & URL Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. File Upload */}
                <div className="p-6 rounded-3xl border-2 border-dashed border-[#DFBA73]/40 bg-neutral-50 hover:bg-[#DFBA73]/5 transition-all text-center space-y-4 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#DFBA73]/20 text-[#DFBA73] flex items-center justify-center shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">
                      Enviar Foto do Leão
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1">
                      Selecione a foto do leão salva no seu dispositivo (PNG, JPG, WEBP)
                    </p>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition-all active:scale-95">
                    <ImageIcon className="w-4 h-4 text-[#DFBA73]" />
                    <span>Escolher Foto do Aparelho</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 2. Paste URL */}
                <div className="p-6 rounded-3xl border border-neutral-200 bg-white shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-neutral-900">
                      Ou Colar Link da Foto
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Cole o link ou URL direto de onde a foto do seu leão está hospedada
                    </p>
                  </div>

                  <form onSubmit={handleSaveLogoUrl} className="space-y-3">
                    <input
                      type="url"
                      placeholder="https://exemplo.com/foto-do-leao.png"
                      value={logoInput}
                      onChange={(e) => setLogoInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-mono"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4 text-[#DFBA73]" />
                      <span>Salvar Link da Foto</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Live Previews */}
              <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 text-white space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[#DFBA73]">
                    Pré-Visualização ao Vivo na Loja
                  </h4>
                  {customLogoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar Leão Vetorial Padrão</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Navbar Header Preview */}
                  <div className="p-4 rounded-2xl bg-white text-neutral-950 border border-neutral-300 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Como aparece no topo do site (Navbar):
                    </span>
                    <div className="h-16 flex items-center px-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <JeLogo size="md" textColor="dark" />
                    </div>
                  </div>

                  {/* Banner Card Preview */}
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFBA73] block">
                      Como aparece no Banner Principal:
                    </span>
                    <div className="h-16 flex items-center justify-center bg-neutral-950 rounded-xl border border-[#DFBA73]/30">
                      <JeLogo size="lg" textColor="gold" />
                    </div>
                  </div>
                </div>

                {customLogoUrl && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Sua foto do leão está ativa e sendo exibida em todas as páginas da loja!</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: ADMIN SECURITY & PASSWORD SETTINGS */}
          {activeTab === 'security' && (
            <div id="admin-security-settings" className="max-w-3xl mx-auto py-4 space-y-6">
              
              {/* Info Header */}
              <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 p-6 rounded-3xl border border-[#DFBA73]/30 text-white space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFBA73]/20 text-[#DFBA73] text-[11px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Controle de Acesso Exclusivo</span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-white">
                  Segurança & Senha do Administrador
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                  Defina quem tem permissão para gerenciar a loja JE Imports. Toda vez que alguém tentar acessar o painel de gerenciamento, o sistema exigirá esta senha mestra.
                </p>
              </div>

              {/* Current Status Card */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                        Painel Desbloqueado
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-xs text-neutral-500">
                      Você está conectado como Administrador da Loja
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    adminLogout();
                    showToast('Painel bloqueado com sucesso.', 'info');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-red-950 text-white hover:text-red-200 border border-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#DFBA73]" />
                  <span>Bloquear / Encerrar Sessão</span>
                </button>
              </div>

              {/* Change Password Form */}
              <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#DFBA73]" />
                    <span>Alterar Senha do Administrador</span>
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Crie uma nova senha de sua preferência para proteger o catálogo e os dados de sua loja.
                  </p>
                </div>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Nova Senha Desejada
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite a nova senha..."
                        className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        title={showNewPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha para confirmar..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </div>

                  {securityMessage && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      securityMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {securityMessage.type === 'success' ? (
                        <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      )}
                      <span>{securityMessage.text}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-[#DFBA73]" />
                      <span>Salvar Nova Senha</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        changeAdminPassword('admin123');
                        setNewPassword('');
                        setConfirmPassword('');
                        setSecurityMessage({ type: 'success', text: 'Senha restaurada para a padrão: admin123' });
                        showToast('Senha padrão restaurada: admin123', 'info');
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Restaurar Padrão (admin123)
                    </button>
                  </div>
                </form>
              </div>

              {/* Instructions Callout */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-2">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#DFBA73]" />
                  <span>Como funciona o acesso do Administrador:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-neutral-500">
                  <li>Visitantes normais do site não conseguirão editar o catálogo, alterar preços ou apagar roupas.</li>
                  <li>Ao clicar em "Gerenciar Catálogo", o sistema pedirá a senha do administrador cadastrada.</li>
                  <li>Após digitar a senha correta, o acesso fica liberado durante a sua navegação.</li>
                  <li>Você pode clicar em "Bloquear Painel" a qualquer momento para voltar a exigir a senha.</li>
                </ul>
              </div>

            </div>
          )}

          {/* TAB 5: PIX OFICIAL E QR CODE */}
          {activeTab === 'pix' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">Configuração & Verificação do PIX da Loja</h3>
                    <p className="text-xs text-neutral-500">
                      QR Code gerado 100% no navegador para todos os bancos brasileiros com chave oficial e código Copia e Cola.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <PixQrCode
                    code={OFFICIAL_PIX_CODE}
                    beneficiary={OFFICIAL_PIX_BENEFICIARY}
                    pixKey={OFFICIAL_PIX_KEY}
                    city={OFFICIAL_PIX_CITY}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: GESTÃO DE PEDIDOS DOS CLIENTES */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500">Total de Pedidos</span>
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-display font-black text-2xl text-neutral-900 mt-2">
                    {orders.length}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Histórico completo</p>
                </div>

                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-800">Em Andamento / Pendentes</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-display font-black text-2xl text-amber-950 mt-2">
                    {activeOrdersCount}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">Exibindo número na caixa de pedidos</p>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800">Entregas Feitas (Concluídas)</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-display font-black text-2xl text-emerald-950 mt-2">
                    {deliveredOrdersCount}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Número acima da caixa removido</p>
                </div>

                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-xs text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-300">Receita dos Pedidos</span>
                    <div className="w-8 h-8 rounded-xl bg-neutral-800 text-[#DFBA73] flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-display font-black text-xl text-[#DFBA73] mt-2">
                    {formatCurrency(orders.reduce((acc, o) => acc + o.total, 0))}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Soma de vendas registradas</p>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Buscar por #Pedido, Cliente, Telefone ou Cidade..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  {orderSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setOrderSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('todos')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      orderStatusFilter === 'todos'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Todos ({orders.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('em_andamento')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                      orderStatusFilter === 'em_andamento'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Em Andamento ({activeOrdersCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('entregue')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                      orderStatusFilter === 'entregue'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Entregues ({deliveredOrdersCount})</span>
                  </button>
                </div>
              </div>

              {/* Orders List */}
              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-neutral-800 text-base">Nenhum pedido de cliente registrado ainda</h3>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    Assim que um cliente fizer uma compra pelo carrinho, o pedido aparecerá aqui com todos os detalhes para você colocar em andamento ou confirmar a entrega!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter((order) => {
                      if (orderStatusFilter === 'em_andamento') {
                        if (order.status === 'entregue') return false;
                      } else if (orderStatusFilter === 'entregue') {
                        if (order.status !== 'entregue') return false;
                      }
                      if (!orderSearchTerm.trim()) return true;
                      const term = orderSearchTerm.toLowerCase();
                      const matchesId = order.id.toLowerCase().includes(term);
                      const matchesName = order.customer.name.toLowerCase().includes(term);
                      const matchesPhone = order.customer.phone.toLowerCase().includes(term);
                      const matchesCity = order.customer.address.city.toLowerCase().includes(term);
                      const matchesStreet = order.customer.address.street.toLowerCase().includes(term);
                      return matchesId || matchesName || matchesPhone || matchesCity || matchesStreet;
                    })
                    .map((order) => {
                      const isDelivered = order.status === 'entregue';
                      const isInProgress = order.status === 'em_andamento';
                      const cleanPhone = order.customer.phone.replace(/\D/g, '');

                      return (
                        <div
                          key={order.id}
                          className={`bg-white rounded-2xl border transition-all p-5 space-y-4 ${
                            isDelivered
                              ? 'border-emerald-200 bg-emerald-50/20 shadow-2xs'
                              : isInProgress
                                ? 'border-blue-200 bg-blue-50/20 shadow-2xs ring-1 ring-blue-400/30'
                                : 'border-neutral-200 shadow-xs'
                          }`}
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="font-display font-extrabold text-base text-neutral-950">
                                  Pedido #{order.id}
                                </span>

                                {/* Current Status Badge */}
                                {isDelivered ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                                    Entrega Feita (Entregue)
                                  </span>
                                ) : isInProgress ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 animate-pulse">
                                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                                    Em Andamento
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    Pendente / Aguardando
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-400">
                                Registrado em {new Date(order.date).toLocaleDateString('pt-BR')} às {new Date(order.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="font-display font-black text-lg text-neutral-950 block">
                                {formatCurrency(order.total)}
                              </span>
                              <span className="text-xs text-neutral-500 capitalize">
                                Pagamento: {order.paymentMethod === 'pix' ? 'PIX (Chave Oficial)' : order.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'Cartão de Débito'}
                              </span>
                            </div>
                          </div>

                          {/* ACTION BUTTONS: COLOCAR EM ANDAMENTO OU CONFIRMAR ENTREGA */}
                          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/90 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                                <Settings2 className="w-3.5 h-3.5 text-neutral-600" />
                                Controle de Status do Pedido (Atualiza para o Cliente em Tempo Real):
                              </span>
                              {isDelivered && (
                                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  Número pendente removido da caixa do cliente
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              {/* Botão: Colocar Em Andamento */}
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'em_andamento')}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                  isInProgress
                                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                                    : 'bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 hover:border-blue-400'
                                }`}
                              >
                                <Clock className="w-4 h-4" />
                                <span>{isInProgress ? '✓ Em Andamento (Ativo)' : 'Colocar em Andamento'}</span>
                              </button>

                              {/* Botão: Confirmar Entrega Feita */}
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'entregue')}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                  isDelivered
                                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                                    : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 hover:border-emerald-400'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isDelivered ? '✓ Entrega Feita (Concluído)' : 'Confirmar Entrega Feita'}</span>
                              </button>

                              {/* Dropdown alternativo com outros status */}
                              <div className="flex items-center gap-1.5 ml-auto">
                                <span className="text-[11px] text-neutral-500 font-medium">Outro status:</span>
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                                  className="text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 font-semibold focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer"
                                >
                                  <option value="pendente">Pendente / Aguardando</option>
                                  <option value="aprovado">Pagamento Confirmado</option>
                                  <option value="em_andamento">Em Andamento</option>
                                  <option value="em_separacao">Em Separação</option>
                                  <option value="enviado">Em Rota de Entrega</option>
                                  <option value="entregue">Entrega Feita (Entregue)</option>
                                </select>
                              </div>
                            </div>

                            {/* Status Explanation text */}
                            <p className="text-[11px] text-neutral-500 italic">
                              {isDelivered
                                ? 'Status atual: Entregue ao destinatário. O cliente vê a confirmação de entrega feita e o número acima do botão "Meus Pedidos" sumiu.'
                                : isInProgress
                                  ? 'Status atual: Em Andamento. O cliente vê na barra de progresso que o pedido está sendo preparado e o número de pendência continua ativo.'
                                  : 'Status atual: Pendente. Aguardando você colocar em andamento ou confirmar a entrega.'}
                            </p>
                          </div>

                          {/* Customer & Address Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100">
                            <div className="space-y-1.5">
                              <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                                <span>Cliente: {order.customer.name}</span>
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-neutral-600">Telefone / WhatsApp: {order.customer.phone}</span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/55${cleanPhone}?text=Olá ${encodeURIComponent(order.customer.name)}! Estamos acompanhando seu pedido #${order.id} na JE Imports. Status atual: ${encodeURIComponent(isDelivered ? 'Entrega Feita com sucesso' : isInProgress ? 'Em Andamento e preparação' : 'Recebido com sucesso')}.`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] transition-colors"
                                    title="Conversar com cliente no WhatsApp"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                              </div>
                              {order.customer.email && (
                                <p className="text-neutral-500">Email: {order.customer.email}</p>
                              )}
                              {order.customerNote && (
                                <p className="text-neutral-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                                  <strong>Observação do Cliente:</strong> "{order.customerNote}"
                                </p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                                <span>Endereço de Entrega:</span>
                              </p>
                              <p className="text-neutral-700">
                                {order.customer.address.street}, {order.customer.address.number}
                                {order.customer.address.complement ? ` - ${order.customer.address.complement}` : ''}
                              </p>
                              <p className="text-neutral-600">
                                Bairro: {order.customer.address.neighborhood || 'Não informado'} • CEP: {order.customer.address.zipCode}
                              </p>
                              <p className="text-neutral-600">
                                Cidade: {order.customer.address.city}/{order.customer.address.state}
                              </p>
                            </div>
                          </div>

                          {/* Items Ordered List */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-neutral-700 block">
                              Itens Solicitados ({order.items.reduce((acc, it) => acc + it.quantity, 0)} peça(s)):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {order.items.map((it) => (
                                <div
                                  key={it.id}
                                  className="flex items-center gap-3 p-2 rounded-xl bg-white border border-neutral-200 text-xs"
                                >
                                  <img
                                    src={it.product.images[0]}
                                    alt={it.product.name}
                                    className="w-11 h-13 object-cover rounded-lg border shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-neutral-900 truncate">{it.product.name}</p>
                                    <p className="text-[11px] text-neutral-500">
                                      Tamanho: <strong>{it.selectedSize}</strong> • Cor: {it.selectedColor.name}
                                    </p>
                                    <p className="text-[11px] text-neutral-600">
                                      {it.quantity}x {formatCurrency(it.product.price)} = <strong>{formatCurrency(it.product.price * it.quantity)}</strong>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL EDITAR PEÇA ESPECÍFICA (PHOTO, PRICE, DETAILS) */}
        {editingProduct && (
          <div 
            id="edit-product-modal"
            className="absolute inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Edit3 className="w-5 h-5 text-[#DFBA73]" />
                  <div>
                    <h3 className="font-bold text-sm text-white">Editar Peça: {editingProduct.name}</h3>
                    <p className="text-[11px] text-neutral-400">SKU: {editingProduct.sku}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Nome da Roupa *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-900 block mb-1">Valor de Venda (R$) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">R$</span>
                      <input
                        type="number"
                        step="0.10"
                        required
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-bold text-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Preço Original "De" (R$)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">R$</span>
                      <input
                        type="number"
                        step="0.10"
                        value={editOriginalPrice || ''}
                        onChange={(e) => setEditOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Ex: 199.90"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Categoria</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950 font-medium"
                    >
                      <option value="camisetas">Camisetas</option>
                      <option value="casacos">Casacos & Jaquetas</option>
                      <option value="streetwear">Streetwear & Hoodies</option>
                      <option value="calcas">Calças & Shorts</option>
                      <option value="vestidos">Vestidos</option>
                      <option value="calcados">Calçados & Sneakers</option>
                      <option value="acessorios">Acessórios</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Estoque Disponível (un.)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editStock}
                      onChange={(e) => setEditStock(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </div>

                  {/* FOTO: COLAR LINK OU ENVIAR ARQUIVO */}
                  <div className="sm:col-span-2 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2.5">
                    <label className="text-xs font-bold text-neutral-900 block">
                      Foto da Peça (Colar Link ou Carregar Arquivo):
                    </label>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-20 rounded-lg overflow-hidden border border-neutral-300 bg-white shrink-0">
                        {editImageUrl ? (
                          <img src={editImageUrl} alt="Prévia" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px]">
                            Sem foto
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="relative">
                          <LinkIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={editImageUrl}
                            onChange={(e) => setEditImageUrl(e.target.value)}
                            placeholder="Colar URL da imagem (https://...)"
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
                          />
                        </div>

                        <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-lg border border-neutral-300 cursor-pointer shadow-xs">
                          <Upload className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Carregar nova foto do aparelho</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'edit')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Grade de tamanhos edit */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-neutral-700 block">Tamanhos:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_SIZES.map((sz) => {
                        const isSel = editSelectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleEditSize(sz)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                              isSel
                                ? 'bg-neutral-950 text-white border-neutral-950'
                                : 'bg-white text-neutral-700 border-neutral-200'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Descrição edit */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Descrição</label>
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </div>

                  {/* Flags edit */}
                  <div className="sm:col-span-2 flex items-center gap-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsNew}
                        onChange={(e) => setEditIsNew(e.target.checked)}
                        className="accent-neutral-950 w-4 h-4 rounded"
                      />
                      <span>Novo Lançamento</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsSale}
                        onChange={(e) => setEditIsSale(e.target.checked)}
                        className="accent-rose-600 w-4 h-4 rounded"
                      />
                      <span>Em Promoção</span>
                    </label>
                  </div>

                </div>

                {/* Edit Footer Buttons */}
                <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
