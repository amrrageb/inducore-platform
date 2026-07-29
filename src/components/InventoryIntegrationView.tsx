import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Warehouse,
  AlertTriangle,
  RefreshCw,
  Database,
  Calculator,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  TrendingDown,
  FileSpreadsheet,
  X,
  Building2,
} from 'lucide-react';

export interface UnitConversionRule {
  fromUom: string;
  toUom: string;
  conversionFactor: number;
}

export interface WarehouseLocation {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  plantCode: string;
  storageBin: string;
  country: string;
}

export interface InventoryPolicy {
  minLevel: number;
  maxLevel: number;
  reorderPoint: number;
  suggestedReorderQty: number;
  leadTimeDays: number;
}

export interface ErpIntegrationDetails {
  erpSystem: 'SAP_S4HANA' | 'ORACLE_NETSUITE' | 'MICROSOFT_DYNAMICS' | 'CUSTOM_ERP';
  erpMaterialId: string;
  erpPlantId: string;
  lastSyncTimestamp: string;
  syncStatus: 'SYNCHRONIZED' | 'SYNC_PENDING' | 'ERROR' | 'OUT_OF_SYNC';
  lastErrorMessage?: string;
}

export interface InventoryItemDTO {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  category: string;
  baseUom: string;
  unitConversions: UnitConversionRule[];
  warehouse: WarehouseLocation;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  policy: InventoryPolicy;
  isReorderNeeded: boolean;
  isStockoutRisk: boolean;
  erpIntegration: ErpIntegrationDetails;
  unitPrice: number;
  currency: string;
  totalStockValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryKPISummary {
  totalMaterialsCount: number;
  totalWarehousesCount: number;
  totalStockValuation: number;
  itemsBelowReorderPointCount: number;
  criticalStockoutRiskCount: number;
  totalReservedStockValuation: number;
  erpSyncStatusDistribution: {
    synchronized: number;
    pending: number;
    error: number;
  };
}

export interface ReorderSuggestion {
  inventoryItemId: string;
  materialCode: string;
  materialName: string;
  category: string;
  warehouseName: string;
  currentAvailable: number;
  reorderPoint: number;
  suggestedReorderQty: number;
  leadTimeDays: number;
  unitPrice: number;
  currency: string;
  estimatedReorderCost: number;
  urgency: 'HIGH' | 'CRITICAL' | 'NORMAL';
}

export const InventoryIntegrationView: React.FC = () => {
  const [items, setItems] = useState<InventoryItemDTO[]>([]);
  const [kpi, setKpi] = useState<InventoryKPISummary | null>(null);
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');
  const [reorderFilterOnly, setReorderFilterOnly] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemDTO | null>(null);

  // Modals state
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [adjustOnHand, setAdjustOnHand] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const [showReserveModal, setShowReserveModal] = useState<boolean>(false);
  const [reserveQty, setReserveQty] = useState<number>(0);

  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [policyMin, setPolicyMin] = useState<number>(0);
  const [policyMax, setPolicyMax] = useState<number>(0);
  const [policyReorder, setPolicyReorder] = useState<number>(0);
  const [policySuggestedQty, setPolicySuggestedQty] = useState<number>(0);

  const [showUomCalculator, setShowUomCalculator] = useState<boolean>(false);
  const [uomCalcInputQty, setUomCalcInputQty] = useState<number>(100);
  const [uomCalcTargetUom, setUomCalcTargetUom] = useState<string>('');
  const [uomCalcResult, setUomCalcResult] = useState<{ qty: number; uom: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'ITEMS' | 'REORDER_SUGGESTIONS' | 'WAREHOUSES' | 'ERP_SYNC'>(
    'ITEMS'
  );

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [resItems, resKpi, resSugg] = await Promise.all([
        fetch('/v1/inventory'),
        fetch('/v1/inventory/kpi-summary'),
        fetch('/v1/inventory/reorder-suggestions'),
      ]);

      const dataItems = await resItems.json();
      const dataKpi = await resKpi.json();
      const dataSugg = await resSugg.json();

      if (dataItems.status === 'success') setItems(dataItems.data);
      if (dataKpi.status === 'success') setKpi(dataKpi.data);
      if (dataSugg.status === 'success') setSuggestions(dataSugg.data);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch('/v1/inventory/adjust-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: selectedItem.id,
          newOnHandQuantity: Number(adjustOnHand),
          reason: adjustReason || 'Routine Cycle Count Adjustment',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowAdjustModal(false);
        fetchInventoryData();
        setSelectedItem(data.data);
      } else {
        alert(data.error || 'Adjustment failed');
      }
    } catch (err) {
      console.error('Stock adjustment error:', err);
    }
  };

  const handleReserveStock = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch('/v1/inventory/reserve-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: selectedItem.id,
          quantity: Number(reserveQty),
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowReserveModal(false);
        fetchInventoryData();
        setSelectedItem(data.data);
      } else {
        alert(data.error || 'Reservation failed');
      }
    } catch (err) {
      console.error('Reserve stock error:', err);
    }
  };

  const handleUpdatePolicy = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch('/v1/inventory/policy/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: selectedItem.id,
          minLevel: Number(policyMin),
          maxLevel: Number(policyMax),
          reorderPoint: Number(policyReorder),
          suggestedReorderQty: Number(policySuggestedQty),
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowPolicyModal(false);
        fetchInventoryData();
        setSelectedItem(data.data);
      } else {
        alert(data.error || 'Policy update failed');
      }
    } catch (err) {
      console.error('Policy update error:', err);
    }
  };

  const handleTriggerErpSync = async (id: string) => {
    try {
      const res = await fetch('/v1/inventory/erp-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryItemId: id }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchInventoryData();
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(data.data);
        }
      }
    } catch (err) {
      console.error('ERP sync error:', err);
    }
  };

  const handleCalculateConversion = async () => {
    if (!selectedItem || !uomCalcTargetUom) return;
    try {
      const res = await fetch('/v1/inventory/unit-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: selectedItem.id,
          quantity: Number(uomCalcInputQty),
          targetUom: uomCalcTargetUom,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUomCalcResult({
          qty: data.data.convertedQuantity,
          uom: data.data.uom,
        });
      } else {
        alert(data.error || 'Conversion error');
      }
    } catch (err) {
      console.error('Conversion error:', err);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.materialCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.warehouse.warehouseName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' || item.category === categoryFilter;

    const matchesWarehouse =
      warehouseFilter === 'ALL' || item.warehouse.warehouseId === warehouseFilter;

    const matchesReorder = !reorderFilterOnly || item.isReorderNeeded;

    return matchesSearch && matchesCategory && matchesWarehouse && matchesReorder;
  });

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const warehouses = Array.from(
    new Set(items.map((i) => JSON.stringify(i.warehouse)))
  ).map((str) => JSON.parse(str) as WarehouseLocation);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Boxes className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Inventory & Material Master Integration
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Sprint 12
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Warehouse master, real-time stock availability, reserved allocations, safety min/max rules, and SAP/Oracle ERP sync.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchInventoryData()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Inventory</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      {kpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Valuation
                </p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  €{kpi.totalStockValuation.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                  <span>Reserved: €{kpi.totalReservedStockValuation.toLocaleString()}</span>
                </p>
              </div>
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Materials & Warehouses
                </p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {kpi.totalMaterialsCount} SKUs
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Across {kpi.totalWarehousesCount} International Hubs
                </p>
              </div>
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                <Warehouse className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Replenishment Alerts
                </p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-bold text-amber-400">
                    {kpi.itemsBelowReorderPointCount}
                  </span>
                  <span className="text-xs text-slate-400">Reorders Suggested</span>
                </div>
                {kpi.criticalStockoutRiskCount > 0 && (
                  <p className="text-[11px] text-red-400 font-semibold mt-1 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    <span>{kpi.criticalStockoutRiskCount} Critical Stockout Risk</span>
                  </p>
                )}
              </div>
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ERP Sync Status
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {kpi.erpSyncStatusDistribution.synchronized} Synced
                  </span>
                  {kpi.erpSyncStatusDistribution.pending > 0 && (
                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {kpi.erpSyncStatusDistribution.pending} Pending
                    </span>
                  )}
                  {kpi.erpSyncStatusDistribution.error > 0 && (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">
                      {kpi.erpSyncStatusDistribution.error} Errors
                    </span>
                  )}
                </div>
              </div>
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
                <Database className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('ITEMS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === 'ITEMS'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Material & Stock Master ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('REORDER_SUGGESTIONS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === 'REORDER_SUGGESTIONS'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Reorder Suggestions ({suggestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('WAREHOUSES')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === 'WAREHOUSES'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Warehouse Master ({warehouses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ERP_SYNC')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === 'ERP_SYNC'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>ERP Sync Interfaces</span>
        </button>
      </div>

      {/* TAB 1: Material & Stock Master */}
      {activeTab === 'ITEMS' && (
        <div className="space-y-4">
          {/* Controls & Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search SKU, material name, bin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Warehouse Filter */}
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.warehouseId} value={w.warehouseId}>
                    {w.warehouseName} ({w.country})
                  </option>
                ))}
              </select>

              {/* Reorder Toggle */}
              <button
                onClick={() => setReorderFilterOnly(!reorderFilterOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                  reorderFilterOnly
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reorder Needed Only</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Item List & Item Detail Drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`${selectedItem ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all`}>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Material / SKU</th>
                        <th className="py-3 px-4">Warehouse & Bin</th>
                        <th className="py-3 px-4 text-right">On-Hand</th>
                        <th className="py-3 px-4 text-right">Reserved</th>
                        <th className="py-3 px-4 text-right">Available</th>
                        <th className="py-3 px-4">Min / Max</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredItems.map((item) => {
                        const isSelected = selectedItem?.id === item.id;
                        return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-amber-500/10 border-l-2 border-amber-500'
                                : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-100">{item.materialCode}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                {item.materialName}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-300">{item.warehouse.warehouseCode}</div>
                              <div className="text-[11px] text-slate-500">{item.warehouse.storageBin}</div>
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-200">
                              {item.onHandQuantity.toLocaleString()} {item.baseUom}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-amber-400/90">
                              {item.reservedQuantity.toLocaleString()} {item.baseUom}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-400">
                              {item.availableQuantity.toLocaleString()} {item.baseUom}
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-[11px] text-slate-400">
                                {item.policy.minLevel} / {item.policy.maxLevel}
                              </div>
                              {/* Safety Stock Bar */}
                              <div className="w-20 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.isStockoutRisk
                                      ? 'bg-red-500'
                                      : item.isReorderNeeded
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (item.availableQuantity / item.policy.maxLevel) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {item.isStockoutRisk ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center space-x-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>CRITICAL</span>
                                </span>
                              ) : item.isReorderNeeded ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center space-x-1">
                                  <TrendingDown className="w-3 h-3" />
                                  <span>REORDER</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>OPTIMAL</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Selected Item Detail Panel */}
            {selectedItem && (
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {selectedItem.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-100 mt-1">
                        {selectedItem.materialCode}
                      </h3>
                      <p className="text-xs text-slate-400">{selectedItem.materialName}</p>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-slate-500 hover:text-slate-300 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stock Breakdown */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-500">On-Hand</p>
                      <p className="text-base font-bold text-slate-200 mt-0.5">
                        {selectedItem.onHandQuantity} {selectedItem.baseUom}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-amber-500/80">
                        Reserved
                      </p>
                      <p className="text-base font-bold text-amber-400 mt-0.5">
                        {selectedItem.reservedQuantity} {selectedItem.baseUom}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-emerald-500/80">
                        Available
                      </p>
                      <p className="text-base font-bold text-emerald-400 mt-0.5">
                        {selectedItem.availableQuantity} {selectedItem.baseUom}
                      </p>
                    </div>
                  </div>

                  {/* Stock Policy Gauges */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Safety Policy Levels</span>
                      <span>
                        Reorder Point: <strong className="text-amber-400">{selectedItem.policy.reorderPoint}</strong>
                      </span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Min Safety Stock:</span>
                        <span className="font-semibold text-red-400">{selectedItem.policy.minLevel} {selectedItem.baseUom}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Max Bin Capacity:</span>
                        <span className="font-semibold text-slate-200">{selectedItem.policy.maxLevel} {selectedItem.baseUom}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Lead Time:</span>
                        <span className="font-semibold text-slate-200">{selectedItem.policy.leadTimeDays} Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Warehouse Details */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Warehouse Location</span>
                    </h4>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="text-slate-200 font-semibold">{selectedItem.warehouse.warehouseName}</div>
                      <div className="text-slate-400">
                        Plant: {selectedItem.warehouse.plantCode} | Bin: {selectedItem.warehouse.storageBin}
                      </div>
                      <div className="text-slate-500">Location: {selectedItem.warehouse.country}</div>
                    </div>
                  </div>

                  {/* Unit Conversions List */}
                  {selectedItem.unitConversions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Unit Conversions</span>
                        </h4>
                        <button
                          onClick={() => {
                            setShowUomCalculator(true);
                            setUomCalcTargetUom(selectedItem.unitConversions[0].toUom);
                          }}
                          className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>Converter Tool</span>
                        </button>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                        {selectedItem.unitConversions.map((conv, idx) => (
                          <div key={idx} className="flex justify-between text-slate-300">
                            <span>1 {conv.fromUom} =</span>
                            <span className="font-semibold text-slate-100">
                              {conv.conversionFactor} {conv.toUom}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setAdjustOnHand(selectedItem.onHandQuantity);
                        setShowAdjustModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                    >
                      Adjust Stock
                    </button>

                    <button
                      onClick={() => {
                        setReserveQty(0);
                        setShowReserveModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                    >
                      Reserve Stock
                    </button>

                    <button
                      onClick={() => {
                        setPolicyMin(selectedItem.policy.minLevel);
                        setPolicyMax(selectedItem.policy.maxLevel);
                        setPolicyReorder(selectedItem.policy.reorderPoint);
                        setPolicySuggestedQty(selectedItem.policy.suggestedReorderQty);
                        setShowPolicyModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                    >
                      Min/Max Rules
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Reorder Suggestions */}
      {activeTab === 'REORDER_SUGGESTIONS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Automated Replenishment & Reorder Engine
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Items currently below safety reorder threshold requiring immediate procurement replenishment.
              </p>
            </div>
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold">
              {suggestions.length} Items Pending Action
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug) => (
              <div
                key={sug.inventoryItemId}
                className={`bg-slate-900 border rounded-xl p-5 space-y-4 relative overflow-hidden ${
                  sug.urgency === 'CRITICAL'
                    ? 'border-red-500/40 bg-red-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        sug.urgency === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {sug.urgency} STOCK RISK
                    </span>
                    <h4 className="text-base font-bold text-slate-100 mt-2">
                      {sug.materialCode}
                    </h4>
                    <p className="text-xs text-slate-400">{sug.materialName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Est Reorder Cost</p>
                    <p className="text-lg font-bold text-slate-100 mt-0.5">
                      €{sug.estimatedReorderCost.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Available</span>
                    <strong className="text-red-400 text-sm">{sug.currentAvailable}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Reorder Point</span>
                    <strong className="text-slate-300 text-sm">{sug.reorderPoint}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Suggested Order</span>
                    <strong className="text-emerald-400 text-sm">{sug.suggestedReorderQty}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Hub: {sug.warehouseName}</span>
                  <span>Lead Time: {sug.leadTimeDays} Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Warehouse Master */}
      {activeTab === 'WAREHOUSES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh) => {
            const whItems = items.filter((i) => i.warehouse.warehouseId === wh.warehouseId);
            const totalVal = whItems.reduce((acc, i) => acc + i.onHandQuantity * i.unitPrice, 0);

            return (
              <div
                key={wh.warehouseId}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-800 rounded-lg text-amber-400">
                    <Warehouse className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {wh.plantCode}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100">{wh.warehouseName}</h3>
                  <p className="text-xs text-slate-400">{wh.warehouseCode}</p>
                  <p className="text-xs text-slate-500 mt-1">Country: {wh.country}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Assigned SKUs:</span>
                    <strong className="text-slate-200">{whItems.length} Materials</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Valuation:</span>
                    <strong className="text-emerald-400">€{totalVal.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: ERP Sync Interfaces */}
      {activeTab === 'ERP_SYNC' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Enterprise Resource Planning (ERP) Integration Hub
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Bi-directional sync state for SAP S/4HANA, Oracle NetSuite, and Microsoft Dynamics 365.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Material SKU</th>
                  <th className="py-3 px-4">ERP Target System</th>
                  <th className="py-3 px-4">ERP Material / Plant ID</th>
                  <th className="py-3 px-4">Last Sync Timestamp</th>
                  <th className="py-3 px-4 text-center">Sync Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{item.materialCode}</div>
                      <div className="text-[11px] text-slate-400">{item.materialName}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-cyan-400">
                      {item.erpIntegration.erpSystem}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.erpIntegration.erpMaterialId} / {item.erpIntegration.erpPlantId}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(item.erpIntegration.lastSyncTimestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.erpIntegration.syncStatus === 'SYNCHRONIZED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          SYNCHRONIZED
                        </span>
                      ) : item.erpIntegration.syncStatus === 'SYNC_PENDING' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          PENDING
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          ERROR
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleTriggerErpSync(item.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-colors"
                      >
                        Force Sync
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Adjust Stock On Hand */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Adjust Physical On-Hand Stock</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Material SKU</label>
                <input
                  disabled
                  value={`${selectedItem.materialCode} - ${selectedItem.materialName}`}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">New On-Hand Quantity ({selectedItem.baseUom})</label>
                <input
                  type="number"
                  value={adjustOnHand}
                  onChange={(e) => setAdjustOnHand(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  placeholder="Cycle count variance, damaged goods, scrap..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="flex-1 py-2 bg-amber-500 text-slate-950 font-bold rounded text-xs hover:bg-amber-400"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reserve Stock */}
      {showReserveModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Reserve Inventory Stock</h3>
              <button onClick={() => setShowReserveModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                Allocate available stock to an active Purchase Order or Assembly Work Order.
              </p>
              <div>
                <label className="text-slate-300 block mb-1">Available Stock: {selectedItem.availableQuantity} {selectedItem.baseUom}</label>
                <input
                  type="number"
                  value={reserveQty}
                  onChange={(e) => setReserveQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowReserveModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReserveStock}
                className="flex-1 py-2 bg-amber-500 text-slate-950 font-bold rounded text-xs hover:bg-amber-400"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Min/Max Policy Rules */}
      {showPolicyModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Update Safety Min/Max Policy</h3>
              <button onClick={() => setShowPolicyModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Min Safety Level</label>
                  <input
                    type="number"
                    value={policyMin}
                    onChange={(e) => setPolicyMin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Max Bin Capacity</label>
                  <input
                    type="number"
                    value={policyMax}
                    onChange={(e) => setPolicyMax(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    value={policyReorder}
                    onChange={(e) => setPolicyReorder(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Suggested Reorder Qty</label>
                  <input
                    type="number"
                    value={policySuggestedQty}
                    onChange={(e) => setPolicySuggestedQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePolicy}
                className="flex-1 py-2 bg-amber-500 text-slate-950 font-bold rounded text-xs hover:bg-amber-400"
              >
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UOM Converter Tool */}
      {showUomCalculator && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <span>Unit Conversion Calculator</span>
              </h3>
              <button onClick={() => setShowUomCalculator(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Quantity in Base UOM ({selectedItem.baseUom})</label>
                <input
                  type="number"
                  value={uomCalcInputQty}
                  onChange={(e) => setUomCalcInputQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Target Conversion UOM</label>
                <select
                  value={uomCalcTargetUom}
                  onChange={(e) => setUomCalcTargetUom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                >
                  {selectedItem.unitConversions.map((rule, i) => (
                    <option key={i} value={rule.toUom}>
                      {rule.toUom}
                    </option>
                  ))}
                </select>
              </div>

              {uomCalcResult && (
                <div className="bg-cyan-950/20 border border-cyan-500/30 rounded p-3 text-center">
                  <p className="text-[10px] text-cyan-400 uppercase font-semibold">Converted Value</p>
                  <p className="text-lg font-bold text-slate-100 mt-1">
                    {uomCalcResult.qty} {uomCalcResult.uom}
                  </p>
                </div>
              )}
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowUomCalculator(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded text-xs font-medium hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={handleCalculateConversion}
                className="flex-1 py-2 bg-cyan-500 text-slate-950 font-bold rounded text-xs hover:bg-cyan-400"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
