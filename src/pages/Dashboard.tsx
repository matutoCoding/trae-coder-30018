import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDate } from '@/utils/storage';
import { OrderStatusBadge, SpecBadge } from '@/components/shared/StatusBadges';
import {
  ClipboardList,
  Users,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Clock,
  TrendingUp,
  Package,
} from 'lucide-react';

export default function Dashboard() {
  const { orders, staff, materials, getDashboardStats, schedules, bandSchedules } = useAppStore();
  const stats = getDashboardStats();

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const todayOrders = orders.filter(
    (o) =>
      o.status === 'pending' ||
      o.status === 'scheduled' ||
      o.status === 'in-progress'
  );

  const lowStockMaterials = materials.filter((m) => m.stock <= m.minStock);

  const statCards = [
    {
      label: '累计订单',
      value: stats.totalOrders,
      icon: ClipboardList,
      color: 'text-linen bg-linen/10 border-linen/30',
    },
    {
      label: '在办订单',
      value: stats.activeOrders,
      icon: Clock,
      color: 'text-jade bg-jade/10 border-jade/30',
    },
    {
      label: '团队人员',
      value: stats.totalStaff,
      icon: Users,
      color: 'text-ink-600 bg-ink-50 border-ink-200',
    },
    {
      label: '本月营收',
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      color: 'text-gold-dark bg-gold-50 border-gold/30',
    },
    {
      label: '待结算分账',
      value: stats.pendingSettlements,
      icon: TrendingUp,
      color: 'text-cinnabar bg-cinnabar/10 border-cinnabar/30',
    },
    {
      label: '库存预警',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="card card-hover p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-ink-500 mb-1">{stat.label}</p>
                <p className="text-xl font-semibold font-song text-ink-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg border flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" strokeWidth={1.8} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-ink-200 flex items-center justify-between">
            <h3 className="section-title">近期治丧订单</h3>
            <button className="btn-ghost text-xs">
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>逝者</th>
                  <th>家属</th>
                  <th>规格</th>
                  <th>出殡日期</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs text-ink-500">
                      {order.orderNo}
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">
                          {order.deceased.name}
                          <span className="text-ink-400 text-xs ml-2">
                            {order.deceased.gender === 'male' ? '公' : '婆'}{' '}
                            {order.deceased.age}岁
                          </span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm">
                        {order.family.contactName}
                        <span className="text-ink-400 ml-1">
                          ({order.family.relationship})
                        </span>
                      </p>
                    </td>
                    <td>
                      <SpecBadge spec={order.funeralSpec} />
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-ink-400" />
                        {formatDate(order.auspiciousDates.funeralDate)}
                      </div>
                    </td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Today's Tasks */}
          <div className="card">
            <div className="p-5 border-b border-ink-200">
              <h3 className="section-title">今日待办</h3>
            </div>
            <div className="p-5 space-y-3">
              {todayOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-ink-50 hover:bg-ink-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-ink-200 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-linen" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {order.deceased.name} 治丧事宜
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {formatDate(order.auspiciousDates.funeralDate)} ·{' '}
                      {order.auspiciousDates.funeralTime}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              ))}
              {todayOrders.length === 0 && (
                <p className="text-center text-ink-400 text-sm py-4">
                  暂无待办订单
                </p>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="card">
            <div className="p-5 border-b border-ink-200 flex items-center justify-between">
              <h3 className="section-title">库存预警</h3>
              <span className="badge bg-amber-50 text-amber-700 border border-amber-200">
                {lowStockMaterials.length} 项
              </span>
            </div>
            <div className="p-5 space-y-3">
              {lowStockMaterials.slice(0, 4).map((mat) => (
                <div key={mat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-600" strokeWidth={1.8} />
                    <div>
                      <p className="text-sm font-medium">{mat.name}</p>
                      <p className="text-xs text-ink-500">{mat.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        mat.stock === 0 ? 'text-cinnabar' : 'text-amber-600'
                      }`}
                    >
                      {mat.stock} {mat.unit}
                    </p>
                    <p className="text-xs text-ink-400">
                      安全库存 {mat.minStock}
                    </p>
                  </div>
                </div>
              ))}
              {lowStockMaterials.length === 0 && (
                <p className="text-center text-ink-400 text-sm py-4">
                  库存充足，无预警
                </p>
              )}
            </div>
          </div>

          {/* Today's Schedule Summary */}
          <div className="card">
            <div className="p-5 border-b border-ink-200">
              <h3 className="section-title">今日排班</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-linen/5 border border-linen/20">
                  <p className="text-xs text-ink-500">执事人员</p>
                  <p className="text-lg font-semibold text-linen mt-1">
                    {schedules.filter(
                      (s) => s.date === new Date().toISOString().split('T')[0]
                    ).length}
                    <span className="text-xs font-normal text-ink-400 ml-1">人次</span>
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
                  <p className="text-xs text-ink-500">乐队场次</p>
                  <p className="text-lg font-semibold text-gold-dark mt-1">
                    {bandSchedules.filter(
                      (b) => b.date === new Date().toISOString().split('T')[0]
                    ).length}
                    <span className="text-xs font-normal text-ink-400 ml-1">场</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-ink-50 border border-ink-100">
                <p className="text-xs text-ink-500">在职人员状态</p>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="staff-available" />
                    <span className="text-sm text-jade font-medium">
                      {staff.filter((s) => s.status === 'available').length} 空闲
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="staff-busy" />
                    <span className="text-sm text-cinnabar font-medium">
                      {staff.filter((s) => s.status === 'busy').length} 忙碌
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="staff-leave" />
                    <span className="text-sm text-ink-500 font-medium">
                      {staff.filter((s) => s.status === 'leave').length} 休假
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
