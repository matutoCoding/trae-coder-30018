import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatCurrency } from '@/utils/storage';
import { OrderStatusBadge, SpecBadge } from '@/components/shared/StatusBadges';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Phone,
  MapPin,
  ChevronRight,
  Eye,
  Edit,
} from 'lucide-react';

export default function OrderList() {
  const navigate = useNavigate();
  const { orders, communications } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specFilter, setSpecFilter] = useState<string>('all');

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.deceased.name.includes(searchQuery) ||
      order.family.contactName.includes(searchQuery) ||
      order.orderNo.includes(searchQuery);
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchSpec = specFilter === 'all' || order.funeralSpec === specFilter;
    return matchSearch && matchStatus && matchSpec;
  });

  const statusTabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待安排' },
    { key: 'scheduled', label: '已排期' },
    { key: 'in-progress', label: '进行中' },
    { key: 'completed', label: '已完成' },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
              <input
                type="text"
                placeholder="搜索订单号、逝者或家属姓名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-9 w-72"
              />
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-ink-50 border border-ink-200">
              <Filter className="w-4 h-4 text-ink-500" strokeWidth={1.8} />
              <select
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
                className="bg-transparent px-2 py-1 text-sm text-ink-700 focus:outline-none"
              >
                <option value="all">全部规格</option>
                <option value="standard">标准</option>
                <option value="deluxe">豪华</option>
                <option value="premium">尊贵</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => navigate('/orders/new')}
            className="btn-gold"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            新建接单
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 mt-4 pt-4 border-t border-ink-100 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`tab-item whitespace-nowrap ${
                statusFilter === tab.key ? 'tab-active' : ''
              }`}
            >
              {tab.label}
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-ink-100 text-ink-500">
                {tab.key === 'all'
                  ? orders.length
                  : orders.filter((o) => o.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>订单信息</th>
                <th>逝者信息</th>
                <th>家属联系</th>
                <th>出殡日期</th>
                <th>规格/金额</th>
                <th>沟通记录</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="group">
                  <td>
                    <div>
                      <p className="font-mono text-xs text-ink-400 mb-1">
                        {order.orderNo}
                      </p>
                      <p className="text-xs text-ink-500">
                        登记于 {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                          order.deceased.gender === 'male'
                            ? 'bg-linen/10 text-linen border border-linen/30'
                            : 'bg-gold/10 text-gold-dark border border-gold/30'
                        }`}
                      >
                        {order.deceased.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-ink-900">
                          {order.deceased.name}
                        </p>
                        <p className="text-xs text-ink-500">
                          {order.deceased.gender === 'male' ? '享年' : '享寿'}{' '}
                          {order.deceased.age}岁 · {order.deceased.deathPlace}仙逝
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-sm font-medium">
                        {order.family.contactName}
                      </p>
                      <p className="text-xs text-ink-500 mb-0.5">
                        ({order.family.relationship})
                      </p>
                      <p className="text-xs text-ink-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.family.phone}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Calendar className="w-3.5 h-3.5 text-linen" strokeWidth={1.8} />
                        {formatDate(order.auspiciousDates.funeralDate)}
                      </div>
                      <p className="text-xs text-ink-500 mt-0.5">
                        吉时 {order.auspiciousDates.funeralTime}
                      </p>
                      {order.route && (
                        <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {order.route.length} 个途经点
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <SpecBadge spec={order.funeralSpec} />
                      {order.totalAmount && (
                        <p className="text-sm font-semibold text-gold-dark mt-2">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-sm text-ink-600">
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.8} />
                      {communications.filter((c) => c.orderId === order.id).length} 条
                    </span>
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="btn-ghost p-1.5"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                      <button
                        onClick={() => navigate(`/scheduling?orderId=${order.id}`)}
                        className="btn-ghost p-1.5"
                        title="排班安排"
                      >
                        <Edit className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                      <button
                        onClick={() => navigate(`/settlement?orderId=${order.id}`)}
                        className="btn-ghost p-1.5"
                        title="结算分账"
                      >
                        <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-ink-400">
                    <p className="text-lg mb-2">暂无订单记录</p>
                    <p className="text-sm">调整筛选条件或点击「新建接单」开始登记</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination mock */}
        <div className="px-5 py-4 border-t border-ink-100 flex items-center justify-between">
          <p className="text-sm text-ink-500">
            显示 {filteredOrders.length} / {orders.length} 条记录
          </p>
          <div className="flex items-center gap-1">
            <button className="btn-outline text-xs px-3 py-1.5">上一页</button>
            <button className="btn-primary text-xs px-3 py-1.5 bg-gold border-gold hover:bg-gold-dark">1</button>
            <button className="btn-outline text-xs px-3 py-1.5">2</button>
            <button className="btn-outline text-xs px-3 py-1.5">下一页</button>
          </div>
        </div>
      </div>
    </div>
  );
}
