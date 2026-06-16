import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/utils/storage';
import type { MaterialCategory } from '@/types';
import {
  PackageOpen,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Shirt,
  Flower2,
  Flame,
  Sparkles,
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

const categoryConfig: Record<MaterialCategory, { icon: typeof Package; color: string; bg: string }> = {
  孝服: { icon: Shirt, color: 'text-linen', bg: 'bg-linen/10 border-linen/30' },
  纸扎: { icon: Sparkles, color: 'text-gold-dark', bg: 'bg-gold/10 border-gold/30' },
  香烛: { icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  鲜花: { icon: Flower2, color: 'text-cinnabar', bg: 'bg-cinnabar/10 border-cinnabar/30' },
  其他: { icon: Package, color: 'text-ink-600', bg: 'bg-ink-50 border-ink-200' },
};

export default function MaterialManage() {
  const { materials, updateMaterialStock } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'low' | 'stock'>('all');

  const categories: MaterialCategory[] = ['孝服', '纸扎', '香烛', '鲜花', '其他'];

  const categoryStats = categories.map((cat) => {
    const items = materials.filter((m) => m.category === cat);
    return {
      category: cat,
      total: items.length,
      totalValue: items.reduce((sum, m) => sum + m.price * m.stock, 0),
      lowStock: items.filter((m) => m.stock <= m.minStock).length,
    };
  });

  const filteredMaterials = materials.filter((m) => {
    const matchSearch =
      m.name.includes(searchQuery) || m.spec.includes(searchQuery);
    const matchCategory = categoryFilter === 'all' || m.category === categoryFilter;
    const matchTab =
      activeTab === 'all'
        ? true
        : activeTab === 'low'
        ? m.stock <= m.minStock
        : true;
    return matchSearch && matchCategory && matchTab;
  });

  return (
    <div className="space-y-6">
      {/* 分类统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card card-hover p-4 col-span-1 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ink-50 border border-ink-200 flex items-center justify-center">
              <PackageOpen className="w-5 h-5 text-ink-600" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-ink-500">物资总数</p>
              <p className="text-xl font-bold text-ink-900 font-song">{materials.length}</p>
            </div>
          </div>
        </div>
        {categoryStats.map((stat) => {
          const config = categoryConfig[stat.category];
          const Icon = config.icon;
          return (
            <div
              key={stat.category}
              onClick={() => setCategoryFilter(stat.category)}
              className={`card card-hover p-4 cursor-pointer transition-all ${
                categoryFilter === stat.category ? 'ring-2 ring-gold' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} strokeWidth={1.8} />
                </div>
                {stat.lowStock > 0 && (
                  <span className="badge bg-cinnabar/10 text-cinnabar border-cinnabar/30">
                    <AlertTriangle className="w-3 h-3" strokeWidth={1.8} />
                    {stat.lowStock}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-ink-800 mb-0.5">
                {stat.category}
              </p>
              <div className="flex items-end justify-between">
                <p className="text-xs text-ink-500">{stat.total} 项</p>
                <p className="text-sm font-semibold text-gold-dark">
                  {formatCurrency(stat.totalValue)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 工具栏 */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 p-1 rounded-lg bg-ink-50 border border-ink-200">
              {[
                { key: 'all', label: '全部物资' },
                { key: 'low', label: '库存预警' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'low' && (
                    <span className="ml-1.5 text-xs bg-cinnabar/10 text-cinnabar px-1.5 py-0.5 rounded-full">
                      {materials.filter((m) => m.stock <= m.minStock).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
              <input
                type="text"
                placeholder="搜索物资名称、规格..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-9 w-56"
              />
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-ink-50 border border-ink-200">
              <Filter className="w-4 h-4 text-ink-500" strokeWidth={1.8} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent px-2 py-1 text-sm text-ink-700 focus:outline-none"
              >
                <option value="all">全部分类</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn-outline">
              <ArrowDownRight className="w-4 h-4" strokeWidth={1.8} />
              入库登记
            </button>
            <button className="btn-outline">
              <ArrowUpRight className="w-4 h-4" strokeWidth={1.8} />
              出库登记
            </button>
            <button className="btn-gold">
              <Plus className="w-4 h-4" strokeWidth={2} />
              新增物资
            </button>
          </div>
        </div>
      </div>

      {/* 物资列表 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16">分类</th>
                <th>物资信息</th>
                <th>规格</th>
                <th>单价</th>
                <th>当前库存</th>
                <th>库存状态</th>
                <th>库存价值</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((mat) => {
                const config = categoryConfig[mat.category];
                const Icon = config.icon;
                const stockPercent = Math.min(100, (mat.stock / Math.max(1, mat.minStock * 2)) * 50);
                const isLow = mat.stock <= mat.minStock;
                const isOut = mat.stock === 0;
                return (
                  <tr key={mat.id}>
                    <td>
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mx-auto ${config.bg}`}>
                        <Icon className={`w-5 h-5 ${config.color}`} strokeWidth={1.8} />
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-ink-900">{mat.name}</p>
                        <p className="text-xs text-ink-500">{mat.category}</p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-ink-600">{mat.spec}</p>
                    </td>
                    <td>
                      <p className="text-sm font-semibold text-ink-800">{formatCurrency(mat.price)}</p>
                    </td>
                    <td>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-bold ${
                              isOut
                                ? 'text-cinnabar'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-jade'
                            }`}
                          >
                            {mat.stock}
                          </p>
                          <p className="text-xs text-ink-400">/ {mat.unit}</p>
                          <span className="text-xs text-ink-400">
                            (安全: {mat.minStock})
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOut
                                ? 'bg-cinnabar'
                                : isLow
                                ? 'bg-amber-500'
                                : 'bg-jade'
                            }`}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      {isOut ? (
                        <span className="badge bg-cinnabar/10 text-cinnabar border-cinnabar/30">
                          <TrendingDown className="w-3 h-3" strokeWidth={1.8} />
                          已缺货
                        </span>
                      ) : isLow ? (
                        <span className="badge bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" strokeWidth={1.8} />
                          库存不足
                        </span>
                      ) : (
                        <span className="badge bg-jade/10 text-jade border-jade/30">
                          <TrendingUp className="w-3 h-3" strokeWidth={1.8} />
                          库存充足
                        </span>
                      )}
                    </td>
                    <td>
                      <p className="text-sm font-semibold text-gold-dark">
                        {formatCurrency(mat.price * mat.stock)}
                      </p>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateMaterialStock(mat.id, 10, '管理员', '盘点入库')}
                          className="btn-ghost p-1.5 text-jade"
                          title="入库"
                        >
                          <ArrowDownRight className="w-4 h-4" strokeWidth={1.8} />
                        </button>
                        <button
                          onClick={() => updateMaterialStock(mat.id, -1, '管理员', '领用出库')}
                          className="btn-ghost p-1.5 text-cinnabar"
                          title="出库"
                        >
                          <ArrowUpRight className="w-4 h-4" strokeWidth={1.8} />
                        </button>
                        <button className="btn-ghost p-1.5">
                          <MoreHorizontal className="w-4 h-4" strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-ink-400">
                    <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                    <p>未找到匹配的物资</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
