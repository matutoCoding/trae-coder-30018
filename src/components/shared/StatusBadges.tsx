import type { OrderStatus, StaffStatus, FuneralSpec, BandLevel } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { className: string; label: string }> = {
  pending: { className: 'badge-status-pending', label: '待安排' },
  scheduled: { className: 'badge-status-scheduled', label: '已排期' },
  'in-progress': { className: 'badge-status-in-progress', label: '进行中' },
  completed: { className: 'badge-status-completed', label: '已完成' },
  cancelled: { className: 'badge-status-cancelled', label: '已取消' },
};

export function OrderStatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <span className={config.className}>{config.label}</span>;
}

interface StaffStatusBadgeProps {
  status: StaffStatus;
}

const staffStatusConfig: Record<StaffStatus, { className: string; label: string }> = {
  available: { className: 'badge bg-jade/10 text-jade border border-jade/30', label: '空闲' },
  busy: { className: 'badge bg-cinnabar/10 text-cinnabar border border-cinnabar/30', label: '忙碌' },
  leave: { className: 'badge bg-ink-100 text-ink-500 border border-ink-200', label: '休假' },
};

export function StaffStatusBadge({ status }: StaffStatusBadgeProps) {
  const config = staffStatusConfig[status];
  return <span className={config.className}>{config.label}</span>;
}

interface SpecBadgeProps {
  spec: FuneralSpec;
}

const specConfig: Record<FuneralSpec, { className: string; label: string }> = {
  standard: { className: 'badge bg-ink-100 text-ink-600 border border-ink-200', label: '标准' },
  deluxe: { className: 'badge bg-linen/10 text-linen border border-linen/30', label: '豪华' },
  premium: { className: 'badge bg-gold/10 text-gold-dark border border-gold/30', label: '尊贵' },
};

export function SpecBadge({ spec }: SpecBadgeProps) {
  const config = specConfig[spec];
  return <span className={config.className}>{config.label}</span>;
}

interface BandLevelBadgeProps {
  level: BandLevel;
}

const bandLevelConfig: Record<BandLevel, { className: string; label: string }> = {
  普通: { className: 'badge bg-ink-100 text-ink-600 border border-ink-200', label: '普通' },
  资深: { className: 'badge bg-linen/10 text-linen border border-linen/30', label: '资深' },
  金牌: { className: 'badge bg-gold/10 text-gold-dark border border-gold/30', label: '⭐ 金牌' },
};

export function BandLevelBadge({ level }: BandLevelBadgeProps) {
  const config = bandLevelConfig[level];
  return <span className={config.className}>{config.label}</span>;
}

export function StaffStatusDot({ status }: StaffStatusBadgeProps) {
  const dotClass =
    status === 'available'
      ? 'staff-available'
      : status === 'busy'
      ? 'staff-busy'
      : 'staff-leave';
  return <span className={dotClass} />;
}
