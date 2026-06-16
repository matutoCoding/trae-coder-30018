import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarClock,
  ScrollText,
  PackageOpen,
  Music,
  MessageSquare,
  Calculator,
  Cloud,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { to: '/', label: '数据概览', icon: LayoutDashboard, end: true },
  { to: '/orders', label: '治丧接单', icon: ClipboardList },
  { to: '/scheduling', label: '执事排班', icon: CalendarClock },
  { to: '/rituals', label: '民俗流程', icon: ScrollText },
  { to: '/materials', label: '物资管理', icon: PackageOpen },
  { to: '/band', label: '乐队安排', icon: Music },
  { to: '/communication', label: '客户沟通', icon: MessageSquare },
  { to: '/settlement', label: '结算分账', icon: Calculator },
];

export default function Sidebar() {
  const orders = useAppStore((s) => s.orders);
  const staffShares = useAppStore((s) => s.staffShares);

  const activeOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'scheduled' || o.status === 'in-progress'
  ).length;

  const pendingSettlements = staffShares.filter((s) => !s.settled).length;

  return (
    <aside className="w-64 bg-ink-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-ink-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/20 border border-gold/40 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-gold" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-song text-lg font-semibold tracking-wider">孝思堂</h1>
            <p className="text-ink-400 text-xs">白事执事管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-ink-800 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-ink-400">在办订单</span>
          <span className="text-gold font-semibold">{activeOrders}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-400">待结算</span>
          <span className="text-cinnabar font-semibold">{pendingSettlements}</span>
        </div>
        <div className="pt-2 mt-2 border-t border-ink-800">
          <p className="text-ink-500 text-xs text-center">
            © {new Date().getFullYear()} 孝思堂 · 慎终追远
          </p>
        </div>
      </div>
    </aside>
  );
}
