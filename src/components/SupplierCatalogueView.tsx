import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@inducore/ui-kit';
import {
  Building2,
  Search,
  Star,
  ShieldCheck,
  FileText,
  Tag,
  Heart,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  Download,
  Filter,
} from 'lucide-react';

interface SupplierCertification {
  id: string;
  name: string;
  issuer: string;
  certificateNumber: string;
  issuedDate: string;
  validUntil: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'EXPIRED';
}

interface SupplierDocument {
  id: string;
  title: string;
  documentType: 'ISO_CERTIFICATE' | 'COMPLIANCE' | 'SAFETY_DATA_SHEET' | 'AUDIT_REPORT' | 'TECHNICAL_SPEC';
  fileUrl: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

interface CatalogueProduct {
  id: string;
  supplierId: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  unitPrice: number;
  currency: string;
  minOrderQuantity: number;
  leadTimeDays: number;
  specifications: Record<string, string>;
  tags: string[];
  availabilityStatus: 'IN_STOCK' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK';
}

interface SupplierRating {
  id: string;
  rating: number;
  reviewerUserId: string;
  comment: string;
  createdAt: string;
}

interface SupplierData {
  id: string;
  name: string;
  code: string;
  logoUrl: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: 'ACTIVE' | 'VERIFIED' | 'UNDER_REVIEW' | 'SUSPENDED';
  isFavorite: boolean;
  categories: string[];
  tags: string[];
  certifications: SupplierCertification[];
  documents: SupplierDocument[];
  products: CatalogueProduct[];
  ratings: SupplierRating[];
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export const SupplierCatalogueView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'suppliers' | 'catalogue'>('suppliers');
  const [supplierSubTab, setSupplierSubTab] = useState<'profile' | 'products' | 'certs' | 'docs' | 'ratings'>('profile');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    code: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    categories: 'Automation & PLCs',
    tags: 'ISO9001, Automation',
  });

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    category: 'Automation & PLCs',
    description: '',
    unitPrice: 1500,
    currency: 'USD',
    minOrderQuantity: 1,
    leadTimeDays: 7,
    availabilityStatus: 'IN_STOCK' as const,
    tags: 'Hardware, Industrial',
  });

  const [showAddCert, setShowAddCert] = useState(false);
  const [certForm, setCertForm] = useState({
    name: '',
    issuer: '',
    certificateNumber: '',
    issuedDate: '2024-01-01',
    validUntil: '2029-01-01',
    verificationStatus: 'VERIFIED' as const,
  });

  const [showAddDoc, setShowAddDoc] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    documentType: 'TECHNICAL_SPEC' as const,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSizeBytes: 1048576,
  });

  const [showRateModal, setShowRateModal] = useState(false);
  const [rateForm, setRateForm] = useState({ rating: 5, comment: '' });

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (selectedTag !== 'ALL') params.append('tag', selectedTag);
      if (favoritesOnly) params.append('favoriteOnly', 'true');

      const res = await fetch(`/v1/suppliers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
        if (data.data.length > 0 && !selectedSupplierId) {
          setSelectedSupplierId(data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [searchQuery, selectedCategory, selectedTag, favoritesOnly]);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  // Extract all categories and tags for filtering
  const allCategories = Array.from(
    new Set(suppliers.flatMap(s => [...s.categories, ...s.products.map(p => p.category)]))
  );
  const allTags = Array.from(
    new Set(suppliers.flatMap(s => [...s.tags, ...s.products.flatMap(p => p.tags)]))
  );

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/v1/suppliers/${id}/favorite`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        notify(data.data.isFavorite ? 'Supplier added to favorites' : 'Supplier removed from favorites');
        fetchSuppliers();
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoriesArray = supplierForm.categories.split(',').map(c => c.trim()).filter(Boolean);
    const tagsArray = supplierForm.tags.split(',').map(t => t.trim()).filter(Boolean);

    const res = await fetch('/v1/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...supplierForm,
        categories: categoriesArray,
        tags: tagsArray,
      }),
    });
    const data = await res.json();
    if (data.success) {
      notify(`Supplier "${supplierForm.name}" registered successfully`);
      setShowCreateSupplier(false);
      setSupplierForm({
        name: '',
        code: '',
        website: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        categories: 'Automation & PLCs',
        tags: 'ISO9001, Automation',
      });
      fetchSuppliers();
    } else {
      notify(`Error: ${data.error}`);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const tagsArray = productForm.tags.split(',').map(t => t.trim()).filter(Boolean);

    const res = await fetch(`/v1/suppliers/${selectedSupplier.id}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...productForm,
        unitPrice: Number(productForm.unitPrice),
        minOrderQuantity: Number(productForm.minOrderQuantity),
        leadTimeDays: Number(productForm.leadTimeDays),
        tags: tagsArray,
        specifications: { 'Standard': 'OEM Certified Industrial Grade' },
      }),
    });
    const data = await res.json();
    if (data.success) {
      notify(`Product SKU ${productForm.sku} added to catalogue`);
      setShowAddProduct(false);
      setProductForm({
        sku: '',
        name: '',
        category: 'Automation & PLCs',
        description: '',
        unitPrice: 1500,
        currency: 'USD',
        minOrderQuantity: 1,
        leadTimeDays: 7,
        availabilityStatus: 'IN_STOCK',
        tags: 'Hardware, Industrial',
      });
      fetchSuppliers();
    } else {
      notify(`Error: ${data.error}`);
    }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const res = await fetch(`/v1/suppliers/${selectedSupplier.id}/certifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certForm),
    });
    const data = await res.json();
    if (data.success) {
      notify(`Certification "${certForm.name}" added`);
      setShowAddCert(false);
      setCertForm({
        name: '',
        issuer: '',
        certificateNumber: '',
        issuedDate: '2024-01-01',
        validUntil: '2029-01-01',
        verificationStatus: 'VERIFIED',
      });
      fetchSuppliers();
    } else {
      notify(`Error: ${data.error}`);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const res = await fetch(`/v1/suppliers/${selectedSupplier.id}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docForm),
    });
    const data = await res.json();
    if (data.success) {
      notify(`Document "${docForm.title}" uploaded`);
      setShowAddDoc(false);
      setDocForm({
        title: '',
        documentType: 'TECHNICAL_SPEC',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSizeBytes: 1048576,
      });
      fetchSuppliers();
    } else {
      notify(`Error: ${data.error}`);
    }
  };

  const handleRateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const res = await fetch(`/v1/suppliers/${selectedSupplier.id}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: Number(rateForm.rating),
        reviewerUserId: 'usr-admin',
        comment: rateForm.comment,
      }),
    });
    const data = await res.json();
    if (data.success) {
      notify('Rating & review submitted successfully');
      setShowRateModal(false);
      setRateForm({ rating: 5, comment: '' });
      fetchSuppliers();
    } else {
      notify(`Error: ${data.error}`);
    }
  };

  // Flatten products for global catalogue view
  const allCatalogueProducts = suppliers.flatMap(s =>
    s.products.map(p => ({ ...p, supplierName: s.name, supplierCode: s.code }))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-emerald-500/30 flex items-center space-x-2 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header & Workspace Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <span>Supplier & Product Catalogue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global verified vendor directory, OEM parts catalogue, compliance certifications, and ratings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'suppliers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Supplier Directory ({suppliers.length})
            </button>
            <button
              onClick={() => setActiveTab('catalogue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'catalogue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Global Product Catalogue ({allCatalogueProducts.length})
            </button>
          </div>

          <Button
            label="Register Supplier"
            onClick={() => setShowCreateSupplier(true)}
          />
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* Keyword Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search suppliers, SKUs, or products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 font-medium"
          >
            <option value="ALL">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Favorites Filter */}
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              favoritesOnly
                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>{favoritesOnly ? 'Showing Favorites Only' : 'Filter Favorites'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <Sparkles className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
          Loading Supplier & Product Catalogue...
        </div>
      ) : activeTab === 'suppliers' ? (
        /* View 1: Supplier Directory & Deep Detail Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Supplier List Cards */}
          <div className="lg:col-span-4 space-y-3">
            {suppliers.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                No suppliers matching search filters.
              </div>
            ) : (
              suppliers.map(sup => (
                <div
                  key={sup.id}
                  onClick={() => setSelectedSupplierId(sup.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    selectedSupplierId === sup.id
                      ? 'bg-slate-900 text-white border-slate-800 shadow-md'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={sup.logoUrl}
                        alt={sup.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white"
                      />
                      <div>
                        <h3 className="text-xs font-bold leading-snug">{sup.name}</h3>
                        <p className={`text-[10px] font-mono ${selectedSupplierId === sup.id ? 'text-slate-400' : 'text-slate-500'}`}>
                          {sup.code}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={e => handleToggleFavorite(sup.id, e)}
                      className="p-1.5 hover:bg-slate-200/20 rounded-lg transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          sup.isFavorite ? 'fill-amber-400 text-amber-400' : selectedSupplierId === sup.id ? 'text-slate-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1 font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{sup.averageRating}</span>
                      <span className={selectedSupplierId === sup.id ? 'text-slate-400 font-normal' : 'text-slate-400 font-normal'}>
                        ({sup.ratings.length})
                      </span>
                    </div>

                    <div className="flex space-x-1">
                      <Badge variant={sup.status === 'VERIFIED' ? 'success' : 'neutral'}>{sup.status}</Badge>
                    </div>
                  </div>

                  {/* Categories Tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {sup.categories.slice(0, 2).map(cat => (
                      <span
                        key={cat}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          selectedSupplierId === sup.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Selected Supplier Profile & Tabs */}
          {selectedSupplier && (
            <div className="lg:col-span-8 space-y-6">
              {/* Selected Supplier Header Banner */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedSupplier.logoUrl}
                      alt={selectedSupplier.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm bg-white"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-slate-900">{selectedSupplier.name}</h2>
                        <Badge variant="success">{selectedSupplier.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{selectedSupplier.website || 'No website'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{selectedSupplier.contactEmail}</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button label="Rate Supplier" onClick={() => setShowRateModal(true)} />
                    <Button label="+ Add Product" onClick={() => setShowAddProduct(true)} />
                  </div>
                </div>

                {/* Sub Tab Navigation */}
                <div className="mt-6 border-t border-slate-100 pt-4 flex space-x-2">
                  <button
                    onClick={() => setSupplierSubTab('profile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      supplierSubTab === 'profile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Overview & Contacts
                  </button>
                  <button
                    onClick={() => setSupplierSubTab('products')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      supplierSubTab === 'products' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Catalogue ({selectedSupplier.products.length})
                  </button>
                  <button
                    onClick={() => setSupplierSubTab('certs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      supplierSubTab === 'certs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Certifications ({selectedSupplier.certifications.length})
                  </button>
                  <button
                    onClick={() => setSupplierSubTab('docs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      supplierSubTab === 'docs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Documents ({selectedSupplier.documents.length})
                  </button>
                  <button
                    onClick={() => setSupplierSubTab('ratings')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      supplierSubTab === 'ratings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Ratings & Reviews ({selectedSupplier.ratings.length})
                  </button>
                </div>
              </div>

              {/* Sub-Tab Content */}
              {supplierSubTab === 'profile' && (
                <Card title="Supplier Overview & Address">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 block font-medium">Full Address</span>
                        <span className="font-semibold text-slate-800">{selectedSupplier.address}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Contact Telephone</span>
                        <span className="font-semibold text-slate-800 flex items-center space-x-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedSupplier.contactPhone}</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 block font-medium mb-1">Approved Categories</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedSupplier.categories.map(c => (
                            <Badge key={c} variant="info">{c}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium mb-1">Search Tags</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedSupplier.tags.map(t => (
                            <span key={t} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {supplierSubTab === 'products' && (
                <Card title="Products & Components Catalogue">
                  <div className="space-y-4">
                    {selectedSupplier.products.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No products listed in this supplier's catalogue.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedSupplier.products.map(prod => (
                          <div key={prod.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] font-mono text-emerald-600 font-bold block">{prod.sku}</span>
                                <h4 className="text-xs font-bold text-slate-900">{prod.name}</h4>
                              </div>
                              <Badge variant={prod.availabilityStatus === 'IN_STOCK' ? 'success' : 'neutral'}>
                                {prod.availabilityStatus}
                              </Badge>
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-2">{prod.description}</p>

                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Unit Price</span>
                                <span className="font-bold text-slate-900">${prod.unitPrice.toLocaleString()} {prod.currency}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">MOQ / Lead Time</span>
                                <span className="text-slate-700">{prod.minOrderQuantity} units / {prod.leadTimeDays}d</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {supplierSubTab === 'certs' && (
                <Card title="Compliance & ISO Certifications">
                  <div className="flex justify-end mb-4">
                    <Button label="+ Add Certification" onClick={() => setShowAddCert(true)} />
                  </div>
                  <div className="space-y-3">
                    {selectedSupplier.certifications.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No compliance certificates uploaded.</p>
                    ) : (
                      selectedSupplier.certifications.map(cert => (
                        <div key={cert.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900">{cert.name}</div>
                              <div className="text-[11px] text-slate-500">
                                Issuer: {cert.issuer} • Cert #{cert.certificateNumber}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="success">{cert.verificationStatus}</Badge>
                            <span className="text-[10px] text-slate-400 block mt-1">Valid until {cert.validUntil}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}

              {supplierSubTab === 'docs' && (
                <Card title="Audit Reports & Technical Attachments">
                  <div className="flex justify-end mb-4">
                    <Button label="+ Upload Document" onClick={() => setShowAddDoc(true)} />
                  </div>
                  <div className="space-y-3">
                    {selectedSupplier.documents.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No documents attached.</p>
                    ) : (
                      selectedSupplier.documents.map(doc => (
                        <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900">{doc.title}</div>
                              <div className="text-[11px] text-slate-500">
                                Type: {doc.documentType} • {(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 hover:bg-slate-200/60 rounded-lg text-slate-600 flex items-center space-x-1 text-xs font-semibold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}

              {supplierSubTab === 'ratings' && (
                <Card title="Historical Supplier Feedback & Performance Ratings">
                  <div className="space-y-3">
                    {selectedSupplier.ratings.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No ratings submitted yet.</p>
                    ) : (
                      selectedSupplier.ratings.map(r => (
                        <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 font-bold text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{r.rating}.0 / 5.0</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-700 italic">"{r.comment}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        /* View 2: Global Product Catalogue Grid */
        <Card title="Global OEM & Component Parts Catalogue">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allCatalogueProducts.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
                No components found matching search terms.
              </div>
            ) : (
              allCatalogueProducts.map(prod => (
                <div key={prod.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">{prod.sku}</span>
                      <Badge variant={prod.availabilityStatus === 'IN_STOCK' ? 'success' : 'neutral'}>
                        {prod.availabilityStatus}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{prod.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{prod.description}</p>
                    
                    <div className="pt-2 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Vendor:</span>
                        <span className="font-semibold text-slate-800">{prod.supplierName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Category:</span>
                        <span className="font-semibold text-slate-800">{prod.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Unit Price</span>
                      <span className="text-sm font-bold text-slate-900">${prod.unitPrice.toLocaleString()} {prod.currency}</span>
                    </div>
                    <Button label="Request Quote" onClick={() => notify(`RFQ request initialized for SKU ${prod.sku}`)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Modal 1: Register Supplier */}
      {showCreateSupplier && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Register New Supplier</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABB Robotics Automation"
                  value={supplierForm.name}
                  onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Supplier Registration Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUP-ABB-01"
                  value={supplierForm.code}
                  onChange={e => setSupplierForm({ ...supplierForm, code: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="sales@abb.com"
                    value={supplierForm.contactEmail}
                    onChange={e => setSupplierForm({ ...supplierForm, contactEmail: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 800 555 0199"
                    value={supplierForm.contactPhone}
                    onChange={e => setSupplierForm({ ...supplierForm, contactPhone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="Zurich, Switzerland"
                  value={supplierForm.address}
                  onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowCreateSupplier(false)} />
                <Button label="Register Supplier" onClick={handleCreateSupplier} />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Product to Catalogue */}
      {showAddProduct && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Component to {selectedSupplier.name}</h3>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABB-ROBO-6700"
                    value={productForm.sku}
                    onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="IRB 6700 Industrial Robot Arm"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  placeholder="High payload robot arm for automotive welding..."
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 h-16"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    required
                    value={productForm.unitPrice}
                    onChange={e => setProductForm({ ...productForm, unitPrice: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    required
                    value={productForm.leadTimeDays}
                    onChange={e => setProductForm({ ...productForm, leadTimeDays: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowAddProduct(false)} />
                <Button label="Add Component" onClick={handleAddProduct} />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Certification */}
      {showAddCert && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Compliance Certification</h3>
            <form onSubmit={handleAddCertification} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Certification Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO 45001 Occupational Health"
                  value={certForm.name}
                  onChange={e => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Issuing Authority</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BSI Group"
                  value={certForm.issuer}
                  onChange={e => setCertForm({ ...certForm, issuer: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Certificate Number</label>
                <input
                  type="text"
                  required
                  placeholder="BSI-OHSAS-8821"
                  value={certForm.certificateNumber}
                  onChange={e => setCertForm({ ...certForm, certificateNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowAddCert(false)} />
                <Button label="Save Certification" onClick={handleAddCertification} />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Upload Document */}
      {showAddDoc && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Upload Audit Document / Spec Sheet</h3>
            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Environmental Impact Audit 2026"
                  value={docForm.title}
                  onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Document Type</label>
                <select
                  value={docForm.documentType}
                  onChange={e => setDocForm({ ...docForm, documentType: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="TECHNICAL_SPEC">TECHNICAL_SPEC</option>
                  <option value="ISO_CERTIFICATE">ISO_CERTIFICATE</option>
                  <option value="COMPLIANCE">COMPLIANCE</option>
                  <option value="SAFETY_DATA_SHEET">SAFETY_DATA_SHEET</option>
                  <option value="AUDIT_REPORT">AUDIT_REPORT</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowAddDoc(false)} />
                <Button label="Upload Document" onClick={handleAddDocument} />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Rate Supplier */}
      {showRateModal && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Rate & Review {selectedSupplier.name}</h3>
            <form onSubmit={handleRateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Rating Score (1 - 5 Stars)</label>
                <select
                  value={rateForm.rating}
                  onChange={e => setRateForm({ ...rateForm, rating: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-amber-600"
                >
                  <option value={5}>5 Stars - Outstanding Performance</option>
                  <option value={4}>4 Stars - Meets Expectations</option>
                  <option value={3}>3 Stars - Average Quality</option>
                  <option value={2}>2 Stars - Delivery Delays</option>
                  <option value={1}>1 Star - Unsatisfactory</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Review Comments</label>
                <textarea
                  required
                  placeholder="Provide details on product quality, shipping lead times, and communication..."
                  value={rateForm.comment}
                  onChange={e => setRateForm({ ...rateForm, comment: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 h-20"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowRateModal(false)} />
                <Button label="Submit Review" onClick={handleRateSupplier} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
