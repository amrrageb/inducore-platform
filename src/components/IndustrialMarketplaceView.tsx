import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  CheckCircle,
  Star,
  Users,
  Award,
  Package,
  Wrench,
  Newspaper,
  Handshake,
  Sparkles,
  Send,
  Building2,
  Languages,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

// Multi-language UI dictionaries
const TRANSLATIONS: Record<string, Record<string, string>> = {
  EN: {
    title: 'Industrial Marketplace Network',
    subtitle: 'Global B2B Directory, AI Supplier Matchmaking, Product Catalog & Partnership Ecosystem',
    directory: 'Industrial Directory',
    products: 'Product Discovery',
    services: 'Service Marketplace',
    news: 'News & Knowledge Feed',
    aiMatch: 'AI Capability Matchmaker',
    partnerships: 'Partnerships',
    searchPlaceholder: 'Search by company, CNC milling, ISO certification, country...',
    verifiedSupplier: 'Verified Supplier',
    reputationScore: 'Reputation Score',
    followers: 'Followers',
    follow: 'Follow',
    following: 'Following',
    requestPartnership: 'Request Partnership',
    capabilities: 'Technical Capabilities',
    certifications: 'Accreditations & Certifications',
    viewProfile: 'View Public Profile',
    aiRecommendation: 'AI Matchmaking Reason',
  },
  DE: {
    title: 'Industrielles Marktplatz-Netzwerk',
    subtitle: 'Globales B2B-Verzeichnis, KI-Lieferanten-Matchmaking & Partnerschafts-Ökosystem',
    directory: 'Industrieverzeichnis',
    products: 'Produkt-Katalog',
    services: 'Dienstleistungen',
    news: 'Nachrichten & Wissen',
    aiMatch: 'KI-Fähigkeiten-Matchmaker',
    partnerships: 'Partnerschaften',
    searchPlaceholder: 'Suche nach Unternehmen, CNC-Fräsen, ISO-Zertifizierung...',
    verifiedSupplier: 'Verifizierter Lieferant',
    reputationScore: 'Reputationswert',
    followers: 'Follower',
    follow: 'Folgen',
    following: 'Folgend',
    requestPartnership: 'Partnerschaft anfragen',
    capabilities: 'Technische Fähigkeiten',
    certifications: 'Zertifizierungen & Akkreditierungen',
    viewProfile: 'Öffentliches Profil',
    aiRecommendation: 'KI-Empfehlungsgrund',
  },
  FR: {
    title: 'Réseau Marketplace Industriel',
    subtitle: 'Annuaire B2B Mondial, Recommandation IA Fournisseurs & Écosystème de Partenariat',
    directory: 'Annuaire Industriel',
    products: 'Découverte Produits',
    services: 'Marché des Services',
    news: 'Actualités & Connaissances',
    aiMatch: 'Correspondance IA',
    partnerships: 'Partenariats',
    searchPlaceholder: 'Rechercher une entreprise, usinage CNC, certification ISO...',
    verifiedSupplier: 'Fournisseur Vérifié',
    reputationScore: 'Score de Réputation',
    followers: 'Abonnés',
    follow: 'S’abonner',
    following: 'Abonné',
    requestPartnership: 'Demander un Partenariat',
    capabilities: 'Capacités Techniques',
    certifications: 'Certifications & Accréditations',
    viewProfile: 'Voir le Profil Public',
    aiRecommendation: 'Raison de la recommandation IA',
  },
  AR: {
    title: 'شبكة السوق الصناعي العالمي',
    subtitle: 'دليل الشركات، التوافق الذكي للموردين، كرتالوج المنتجات والشراكات',
    directory: 'الدليل الصناعي',
    products: 'كتالوج المنتجات',
    services: 'سوق الخدمات',
    news: 'الأخبار والمعرفة',
    aiMatch: 'مطابقة القدرات بالذكاء الاصطناعي',
    partnerships: 'الشراكات',
    searchPlaceholder: 'البحث عن شركة، تفريز CNC، شهادات ISO...',
    verifiedSupplier: 'مورد معتمد',
    reputationScore: 'درجة السمعة',
    followers: 'المتابعين',
    follow: 'متابعة',
    following: 'تمت المتابعة',
    requestPartnership: 'طلب شراكة',
    capabilities: 'القدرات التقنية',
    certifications: 'الشهادات والاعتمادات',
    viewProfile: 'عرض الملف العام',
    aiRecommendation: 'سبب التوصية بالذكاء الاصطناعي',
  },
  ZH: {
    title: '工业市场网络',
    subtitle: '全球B2B企业名录、AI供应商匹配、产品目录与合作伙伴生态',
    directory: '工业企业名录',
    products: '产品发现目录',
    services: '服务市场',
    news: '新闻与知识共享',
    aiMatch: 'AI能力智能匹配',
    partnerships: '战略合作',
    searchPlaceholder: '搜索公司、五轴CNC加工、ISO认证、国家...',
    verifiedSupplier: '认证供应商',
    reputationScore: '声誉评分',
    followers: '关注者',
    follow: '关注',
    following: '已关注',
    requestPartnership: '发起合作申请',
    capabilities: '技术能力',
    certifications: '资质与ISO认证',
    viewProfile: '查看公开主页',
    aiRecommendation: 'AI推荐理由',
  },
};

export function IndustrialMarketplaceView() {
  const [lang, setLang] = useState<string>('EN');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.EN;

  const [activeTab, setActiveTab] = useState<'directory' | 'products' | 'services' | 'news' | 'aimatch' | 'partnerships'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [newsFeed, setNewsFeed] = useState<any[]>([]);
  const [partnerships, setPartnerships] = useState<any[]>([]);

  // AI Matchmaker State
  const [aiQuery, setAiQuery] = useState('5-Axis CNC Milling for Inconel subsea valve bodies with ISO 9001 certification');
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [rfqRecs, setRfqRecs] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Partnership Request Modal State
  const [partnershipModalOpen, setPartnershipModalOpen] = useState(false);
  const [targetCompany, setTargetCompany] = useState<any | null>(null);
  const [partnershipType, setPartnershipType] = useState<string>('PREFERRED_SUPPLIER');
  const [proposedScope, setProposedScope] = useState('');
  const [partnerMessage, setPartnerMessage] = useState('');

  const fetchProfiles = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (verifiedOnly) params.append('verifiedOnly', 'true');

      const res = await fetch(`/v1/marketplace/profiles?${params.toString()}`);
      if (res.ok) {
        setProfiles(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMarketplaceData = async () => {
    try {
      const [pRes, sRes, nRes, partRes, rfqRes] = await Promise.all([
        fetch('/v1/marketplace/products'),
        fetch('/v1/marketplace/services'),
        fetch('/v1/marketplace/news'),
        fetch('/v1/marketplace/partnerships?companyId=comp-101'),
        fetch('/v1/marketplace/ai/rfq-recommendations?companyId=comp-101'),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (sRes.ok) setServices(await sRes.json());
      if (nRes.ok) setNewsFeed(await nRes.json());
      if (partRes.ok) setPartnerships(await partRes.json());
      if (rfqRes.ok) setRfqRecs(await rfqRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchMarketplaceData();
  }, [searchQuery, categoryFilter, verifiedOnly]);

  const handleOpenProfile = async (id: string) => {
    try {
      const res = await fetch(`/v1/marketplace/profiles/${id}`);
      if (res.ok) {
        setSelectedProfile(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFollow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/v1/marketplace/profiles/${id}/follow`, { method: 'POST' });
      if (res.ok) {
        fetchProfiles();
        if (selectedProfile && selectedProfile.id === id) {
          handleOpenProfile(id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await fetch('/v1/marketplace/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiQuery,
          minReputationScore: 80,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiRecommendations(data.recommendations || []);
        setAiSummary(data.aiSummary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendPartnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompany) return;
    try {
      const res = await fetch('/v1/marketplace/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCompanyId: targetCompany.id,
          targetCompanyName: targetCompany.companyName,
          partnershipType,
          proposedScope,
          message: partnerMessage,
        }),
      });
      if (res.ok) {
        setPartnershipModalOpen(false);
        setProposedScope('');
        setPartnerMessage('');
        fetchMarketplaceData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondPartnership = async (id: string, accept: boolean) => {
    try {
      const res = await fetch(`/v1/marketplace/partnerships/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept }),
      });
      if (res.ok) {
        fetchMarketplaceData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">{t.title}</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium">
            <Languages className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Language:</span>
            {['EN', 'DE', 'FR', 'AR', 'ZH'].map(code => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                  lang === code ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'directory'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          {t.directory}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          {t.products} ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'services'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Wrench className="w-4 h-4" />
          {t.services} ({services.length})
        </button>

        <button
          onClick={() => setActiveTab('aimatch')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'aimatch'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          {t.aiMatch}
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'news'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          {t.news} ({newsFeed.length})
        </button>

        <button
          onClick={() => setActiveTab('partnerships')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'partnerships'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Handshake className="w-4 h-4" />
          {t.partnerships} ({partnerships.length})
        </button>
      </div>

      {/* TAB 1: INDUSTRIAL DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="Metallurgy">Heavy Metallurgy & Machining</option>
                <option value="Automation">Industrial Automation & Robotics</option>
                <option value="Fluid">Fluid Power & Valves</option>
              </select>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={e => setVerifiedOnly(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                />
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Suppliers Only
              </label>
            </div>
          </div>

          {/* Directory Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(p => (
              <div
                key={p.id}
                onClick={() => handleOpenProfile(p.id)}
                className="bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.logoUrl}
                        alt={p.companyName}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                      />
                      <div>
                        <h3 className="font-bold text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                          {p.companyName}
                          {p.isVerifiedSupplier && (
                            <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/10" title="Verified Industrial Supplier" />
                          )}
                        </h3>
                        <p className="text-xs text-slate-400">{p.headquartersCountry} • {p.industryCategory}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.capabilities.slice(0, 3).map((cap: string, idx: number) => (
                      <span key={idx} className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-medium text-slate-300">
                        {cap}
                      </span>
                    ))}
                    {p.capabilities.length > 3 && (
                      <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-medium text-slate-400">
                        +{p.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="border-t border-slate-700/60 pt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {p.reputationScore}%
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {p.followersCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => handleToggleFollow(p.id, e)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-medium text-[11px] transition"
                    >
                      {t.follow}
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setTargetCompany(p);
                        setPartnershipModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-[11px] transition flex items-center gap-1"
                    >
                      <Handshake className="w-3 h-3" />
                      Partner
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT DISCOVERY */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[10px] font-semibold uppercase tracking-wider">
                    {item.product.category}
                  </span>
                  <span className="text-sm font-bold text-emerald-400">
                    ${item.product.unitPrice.toLocaleString()} {item.product.currency}
                  </span>
                </div>

                <h3 className="font-bold text-white text-md">{item.product.title}</h3>
                <p className="text-xs text-slate-400">{item.product.description}</p>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div className="font-semibold text-slate-300 mb-1">Specifications:</div>
                  {Object.entries(item.product.specifications || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px] text-slate-400">
                      <span>{k}:</span>
                      <span className="text-slate-200 font-mono">{String(v)}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span>Supplier: <strong className="text-slate-200">{item.companyName}</strong></span>
                  <button
                    onClick={() => handleOpenProfile(item.companyId)}
                    className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    View Supplier <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SERVICE MARKETPLACE */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[10px] font-semibold uppercase tracking-wider">
                    {item.service.serviceCategory}
                  </span>
                  <span className="text-sm font-bold text-indigo-400">
                    ${item.service.hourlyRate}/hr
                  </span>
                </div>

                <h3 className="font-bold text-white text-md">{item.service.title}</h3>
                <p className="text-xs text-slate-400">{item.service.description}</p>

                <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between">
                  <span>Guaranteed Lead Time:</span>
                  <span className="font-semibold text-emerald-400">{item.service.leadTimeDays} Days</span>
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span>Provider: <strong className="text-slate-200">{item.companyName}</strong></span>
                  <button
                    onClick={() => handleOpenProfile(item.companyId)}
                    className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Request Service <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI CAPABILITY MATCHMAKER */}
      {activeTab === 'aimatch' && (
        <div className="space-y-6">
          {/* AI Search Box */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Gemini 2.5 Industrial Capability & RFQ Matchmaker
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Describe your specific manufacturing requirement, material tolerances, or required ISO standards to match with verified suppliers.
            </p>

            <form onSubmit={handleRunAISearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. 5-Axis milling for Inconel subsea manifold valves with API 6D certification"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                {aiLoading ? 'Matching Capabilities...' : 'Run AI Capability Match'}
              </button>
            </form>

            {aiSummary && (
              <div className="mt-4 p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-lg text-xs text-indigo-200 leading-relaxed">
                <strong className="text-indigo-300 block mb-1">Executive AI Recommendation Summary:</strong>
                {aiSummary}
              </div>
            )}
          </div>

          {/* AI Recommended Suppliers Grid */}
          {aiRecommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-white">Matched Industrial Suppliers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiRecommendations.map((rec, idx) => (
                  <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-md flex items-center gap-2">
                        {rec.profile.companyName}
                        {rec.profile.isVerifiedSupplier && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                        {rec.matchScore}% Match Score
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{rec.profile.description}</p>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                      <strong className="text-indigo-300 block mb-1">Reasoning:</strong>
                      <span className="text-slate-400">{rec.reasoning}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {rec.matchingCapabilities.map((cap: string, cIdx: number) => (
                        <span key={cIdx} className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded text-[10px] font-medium">
                          ✓ {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommended RFQs for Suppliers */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
            <h3 className="text-md font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Recommended High-Match Buyer RFQs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rfqRecs.map(rfq => (
                <div key={rfq.rfqId} className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400">{rfq.category}</span>
                    <span className="text-xs font-bold text-emerald-400">${rfq.budgetUsd.toLocaleString()} USD</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{rfq.title}</h4>
                  <div className="text-xs text-slate-400">Buyer: <strong className="text-slate-200">{rfq.buyerCompany}</strong></div>
                  <p className="text-[11px] text-slate-300 italic">{rfq.recommendedReason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NEWS & KNOWLEDGE FEED */}
      {activeTab === 'news' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {newsFeed.map(item => (
            <div key={item.newsPost.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <strong className="text-indigo-300 text-sm">{item.companyName}</strong>
                  <span>• {new Date(item.newsPost.publishedAt).toLocaleDateString()}</span>
                </div>
                <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] font-bold text-slate-300 uppercase">
                  {item.newsPost.category}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{item.newsPost.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{item.newsPost.content}</p>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
                Published by {item.newsPost.author}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: PARTNERSHIPS */}
      {activeTab === 'partnerships' && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <h3 className="text-md font-semibold text-white mb-4">Active Strategic Partnership Network Requests</h3>
            <div className="space-y-4">
              {partnerships.map(req => (
                <div key={req.id} className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{req.requesterCompanyName}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-white text-sm">{req.targetCompanyName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-xs text-indigo-300 font-semibold mb-1">Type: {req.partnershipType}</div>
                    <p className="text-xs text-slate-300">{req.proposedScope}</p>
                    <p className="text-xs text-slate-400 italic mt-1">"{req.message}"</p>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespondPartnership(req.id, true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition"
                      >
                        Accept Partnership
                      </button>
                      <button
                        onClick={() => handleRespondPartnership(req.id, false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold border border-slate-700 transition"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED PUBLIC PROFILE MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img src={selectedProfile.logoUrl} alt={selectedProfile.companyName} className="w-16 h-16 rounded-xl border border-slate-700 object-cover" />
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedProfile.companyName}
                    {selectedProfile.isVerifiedSupplier && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  </h2>
                  <p className="text-xs text-slate-400">{selectedProfile.headquartersCountry} • {selectedProfile.industryCategory}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProfile(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company Overview</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedProfile.description}</p>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Verified Certifications</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedProfile.certifications.map((c: any, idx: number) => (
                  <div key={idx} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-xs">
                    <div className="font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {c.name}
                    </div>
                    <div className="text-slate-400 text-[11px]">Issuer: {c.issuingBody} | Valid to: {c.validUntil}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products & Services */}
            {selectedProfile.products.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Catalog Highlights</h4>
                <div className="space-y-2">
                  {selectedProfile.products.map((p: any) => (
                    <div key={p.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white">{p.title}</span>
                        <div className="text-slate-400 text-[11px]">{p.description}</div>
                      </div>
                      <span className="font-bold text-emerald-400">${p.unitPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PARTNERSHIP REQUEST MODAL */}
      {partnershipModalOpen && targetCompany && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Handshake className="w-5 h-5 text-indigo-400" />
                Propose Strategic Partnership
              </h3>
              <button onClick={() => setPartnershipModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Sending partnership proposal to <strong className="text-indigo-300">{targetCompany.companyName}</strong>.
            </p>

            <form onSubmit={handleSendPartnership} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Partnership Type</label>
                <select
                  value={partnershipType}
                  onChange={e => setPartnershipType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="PREFERRED_SUPPLIER">Preferred Tier-1 Supplier Agreement</option>
                  <option value="OEM_JOINT_VENTURE">OEM Joint Venture Manufacturing</option>
                  <option value="SUBCONTRACTOR">Subcontractor Master Contract</option>
                  <option value="TECHNOLOGY_TRANSFER">Technology Licensing & Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Proposed Technical Scope</label>
                <input
                  type="text"
                  required
                  value={proposedScope}
                  onChange={e => setProposedScope(e.target.value)}
                  placeholder="e.g. Master supply of precision forged CNC valve bodies for 2027-2029"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Executive Proposal Message</label>
                <textarea
                  required
                  rows={3}
                  value={partnerMessage}
                  onChange={e => setPartnerMessage(e.target.value)}
                  placeholder="Describe proposed commercial terms, mutual benefits, and timelines..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                Send Formal Partnership Proposal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
