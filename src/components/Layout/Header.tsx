import { Bell, Search, Settings, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="bg-white border-b border-ink-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && (
            <p className="text-sm text-ink-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {actions && <div className="flex items-center gap-2 mr-4">{actions}</div>}

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="搜索订单、人员..."
              className="input-base pl-9 w-56 bg-ink-50"
            />
          </div>

          <button className="btn-ghost relative p-2">
            <Bell className="w-5 h-5" strokeWidth={1.8} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-cinnabar rounded-full" />
          </button>

          <button className="btn-ghost p-2">
            <Settings className="w-5 h-5" strokeWidth={1.8} />
          </button>

          <div className="flex items-center gap-2 pl-4 border-l border-ink-200">
            <div className="w-9 h-9 rounded-full bg-linen/10 border border-linen/30 flex items-center justify-center">
              <User className="w-4 h-4 text-linen" strokeWidth={1.8} />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-ink-800">周管理员</p>
              <p className="text-xs text-ink-500">团队管理员</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
