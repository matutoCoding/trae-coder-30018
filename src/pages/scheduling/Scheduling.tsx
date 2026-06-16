import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { StaffStatusBadge, StaffStatusDot } from '@/components/shared/StatusBadges';
import { formatCurrency } from '@/utils/storage';
import {
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  UserPlus,
  MapPin,
  Clock,
  Shield,
  Route,
  Trash2,
} from 'lucide-react';

const shiftConfig = {
  morning: { label: '早班', color: 'bg-amber-100 text-amber-800 border-amber-200', hours: '05:00 - 12:00' },
  afternoon: { label: '下午', color: 'bg-linen/10 text-linen border-linen/30', hours: '12:00 - 18:00' },
  night: { label: '夜班', color: 'bg-ink-100 text-ink-700 border-ink-200', hours: '18:00 - 次日' },
  full: { label: '全天', color: 'bg-gold/10 text-gold-dark border-gold/30', hours: '全天在岗' },
};

export default function Scheduling() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { orders, staff, schedules, addSchedule, removeSchedule } = useAppStore();
  const [activeTab, setActiveTab] = useState<'calendar' | 'staff' | 'pallbearer' | 'route'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState<string | null>(orderId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newSchedule, setNewSchedule] = useState({ staffId: '', shift: 'full' as const, task: '', position: '' });
  const [pallbearerSelection, setPallbearerSelection] = useState({ main: [] as string[], backup: [] as string[] });

  const displayOrders = selectedOrder
    ? orders.filter((o) => o.id === selectedOrder)
    : orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');

  const orderSchedules = selectedOrder
    ? schedules.filter((s) => s.orderId === selectedOrder)
    : schedules;

  const pallbearerStaff = staff.filter((s) => s.role === '抬棺');

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const getSchedulesForDate = (dateStr: string) => {
    return schedules.filter((s) => s.date === dateStr);
  };

  const handleAddSchedule = () => {
    if (selectedOrder && newSchedule.staffId && selectedDate) {
      addSchedule({
        orderId: selectedOrder,
        staffId: newSchedule.staffId,
        date: selectedDate,
        shift: newSchedule.shift,
        task: newSchedule.task,
        position: newSchedule.position || undefined,
      });
      setShowAddModal(false);
      setNewSchedule({ staffId: '', shift: 'full', task: '', position: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="card">
        <div className="border-b border-ink-200 px-5">
          <div className="flex gap-1">
            {[
              { key: 'calendar', label: '排班日历', icon: Calendar },
              { key: 'staff', label: '人员档案', icon: Users },
              { key: 'pallbearer', label: '抬棺编组', icon: Shield },
              { key: 'route', label: '出殡路线', icon: Route },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`tab-item flex items-center gap-2 py-3 ${
                  activeTab === tab.key ? 'tab-active' : ''
                }`}
              >
                <tab.icon className="w-4 h-4" strokeWidth={1.8} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* 订单筛选 */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-ink-600">关联订单：</label>
              <select
                value={selectedOrder || ''}
                onChange={(e) => setSelectedOrder(e.target.value || null)}
                className="input-base w-64"
              >
                <option value="">全部在办订单</option>
                {orders
                  .filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNo} - {o.deceased.name} 治丧
                    </option>
                  ))}
              </select>
            </div>
            {activeTab === 'calendar' && (
              <button
                onClick={() => {
                  if (!selectedOrder) {
                    alert('请先选择关联订单');
                    return;
                  }
                  setShowAddModal(true);
                }}
                className="btn-primary ml-auto"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                添加排班
              </button>
            )}
          </div>

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {/* 已排班列表 */}
              {selectedOrder && orderSchedules.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-ink-700 mb-3">已排班人员</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {orderSchedules.map((sched) => {
                      const s = staff.find((st) => st.id === sched.staffId);
                      if (!s) return null;
                      const shift = shiftConfig[sched.shift];
                      return (
                        <div
                          key={sched.id}
                          className="card p-4 group relative"
                        >
                          <button
                            onClick={() => removeSchedule(sched.id)}
                            className="absolute top-2 right-2 p-1 rounded hover:bg-cinnabar/10 text-ink-300 hover:text-cinnabar transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                          </button>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full bg-ink-50 border border-ink-200 flex items-center justify-center text-sm font-semibold ${
                                s.status === 'available' ? 'text-jade' : s.status === 'busy' ? 'text-cinnabar' : 'text-ink-500'
                              }`}
                            >
                              {s.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-sm truncate">{s.name}</p>
                                <StaffStatusDot status={s.status} />
                              </div>
                              <p className="text-xs text-ink-500">{s.role}</p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs border ${shift.color}`}>
                              {shift.label} · {shift.hours}
                            </span>
                            {sched.task && (
                              <p className="text-xs text-ink-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" strokeWidth={1.8} />
                                {sched.task}
                              </p>
                            )}
                            <p className="text-xs text-ink-400">{sched.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 日历视图 */}
              <div className="card border-ink-200 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-ink-100 bg-ink-50">
                  <button onClick={prevMonth} className="btn-ghost p-2">
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.8} />
                  </button>
                  <h3 className="font-song text-xl font-semibold text-ink-800">
                    {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                  </h3>
                  <button onClick={nextMonth} className="btn-ghost p-2">
                    <ChevronRight className="w-5 h-5" strokeWidth={1.8} />
                  </button>
                </div>
                <div className="grid grid-cols-7 border-b border-ink-100">
                  {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
                    <div
                      key={day}
                      className={`py-3 text-center text-xs font-semibold ${
                        i === 0 || i === 6 ? 'text-cinnabar' : 'text-ink-500'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="border-b border-r border-ink-100 min-h-[100px]" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const daySchedules = getSchedulesForDate(dateStr);
                    const today = new Date().toISOString().split('T')[0] === dateStr;
                    const isWeekend = (firstDayOfMonth + i) % 7 === 0 || (firstDayOfMonth + i) % 7 === 6;

                    return (
                      <div
                        key={day}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          if (selectedOrder) setShowAddModal(true);
                        }}
                        className={`border-b border-r border-ink-100 min-h-[100px] p-2 cursor-pointer transition-colors hover:bg-ink-50 ${
                          today ? 'bg-gold-50' : ''
                        }`}
                      >
                        <div
                          className={`text-sm font-medium mb-1 ${
                            today
                              ? 'w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center'
                              : isWeekend
                              ? 'text-cinnabar'
                              : 'text-ink-700'
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-1">
                          {daySchedules.slice(0, 3).map((sched) => {
                            const s = staff.find((st) => st.id === sched.staffId);
                            const shift = shiftConfig[sched.shift];
                            return (
                              <div
                                key={sched.id}
                                className={`text-xs px-1.5 py-0.5 rounded truncate border ${shift.color}`}
                                title={`${s?.name} - ${sched.task}`}
                              >
                                {s?.name}: {sched.task || shift.label}
                              </div>
                            );
                          })}
                          {daySchedules.length > 3 && (
                            <p className="text-xs text-ink-400">+{daySchedules.length - 3} 更多</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-ink-500">共 {staff.length} 名团队成员</p>
                <button className="btn-gold">
                  <UserPlus className="w-4 h-4" strokeWidth={1.8} />
                  添加人员
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {staff.map((s) => (
                  <div key={s.id} className="card card-hover p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                            s.status === 'available'
                              ? 'bg-jade/10 text-jade border border-jade/30'
                              : s.status === 'busy'
                              ? 'bg-cinnabar/10 text-cinnabar border border-cinnabar/30'
                              : 'bg-ink-100 text-ink-500 border border-ink-200'
                          }`}
                        >
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-ink-900">{s.name}</p>
                            <StaffStatusDot status={s.status} />
                          </div>
                          <p className="text-sm text-ink-500">{s.role}</p>
                        </div>
                      </div>
                      <StaffStatusBadge status={s.status} />
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-ink-600">
                        <Clock className="w-3.5 h-3.5 text-ink-400" strokeWidth={1.8} />
                        {s.phone}
                      </p>
                      <div className="flex items-start gap-2">
                        <Users className="w-3.5 h-3.5 text-ink-400 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                        <div className="flex flex-wrap gap-1">
                          {s.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-1.5 py-0.5 text-xs rounded bg-ink-100 text-ink-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 mt-2 border-t border-ink-100 flex items-center justify-between">
                        <p className="text-xs text-ink-500">日薪</p>
                        <p className="font-semibold text-gold-dark">{formatCurrency(s.dailyRate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pallbearer Tab */}
          {activeTab === 'pallbearer' && (
            <div className="space-y-6">
              {!selectedOrder ? (
                <div className="text-center py-12 text-ink-400">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                  <p>请先选择关联订单</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="section-title flex items-center gap-2">
                          <Shield className="w-5 h-5 text-gold-dark" strokeWidth={1.8} />
                          主抬棺人员（{pallbearerSelection.main.length}/8）
                        </h4>
                        <span className="text-xs text-ink-500">传统为8人抬棺</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {pallbearerStaff.map((s) => {
                          const selected = pallbearerSelection.main.includes(s.id);
                          return (
                            <label
                              key={s.id}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                selected
                                  ? 'bg-gold-50 border-gold'
                                  : 'border-ink-200 hover:border-ink-300'
                              } ${s.status !== 'available' ? 'opacity-50' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                disabled={s.status !== 'available'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPallbearerSelection((p) => ({
                                      ...p,
                                      main: [...p.main, s.id],
                                      backup: p.backup.filter((id) => id !== s.id),
                                    }));
                                  } else {
                                    setPallbearerSelection((p) => ({
                                      ...p,
                                      main: p.main.filter((id) => id !== s.id),
                                    }));
                                  }
                                }}
                                className="hidden"
                              />
                              <span
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                  selected ? 'bg-gold text-white' : 'bg-ink-50 text-ink-600'
                                }`}
                              >
                                {s.name.charAt(0)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{s.name}</p>
                                <p className="text-xs text-ink-500 flex items-center gap-1">
                                  <StaffStatusDot status={s.status} />
                                  {s.status === 'available' ? '空闲' : s.status === 'busy' ? '忙碌' : '休假'}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="card p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="section-title flex items-center gap-2">
                          <Users className="w-5 h-5 text-linen" strokeWidth={1.8} />
                          后备人员（{pallbearerSelection.backup.length}/4）
                        </h4>
                        <span className="text-xs text-ink-500">预备紧急替补</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {pallbearerStaff
                          .filter((s) => !pallbearerSelection.main.includes(s.id))
                          .map((s) => {
                            const selected = pallbearerSelection.backup.includes(s.id);
                            return (
                              <label
                                key={s.id}
                                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                  selected
                                    ? 'bg-linen/10 border-linen'
                                    : 'border-ink-200 hover:border-ink-300'
                                } ${s.status !== 'available' ? 'opacity-50' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  disabled={s.status !== 'available'}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setPallbearerSelection((p) => ({
                                        ...p,
                                        backup: [...p.backup, s.id],
                                      }));
                                    } else {
                                      setPallbearerSelection((p) => ({
                                        ...p,
                                        backup: p.backup.filter((id) => id !== s.id),
                                      }));
                                    }
                                  }}
                                  className="hidden"
                                />
                                <span
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    selected ? 'bg-linen text-white' : 'bg-ink-50 text-ink-600'
                                  }`}
                                >
                                  {s.name.charAt(0)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{s.name}</p>
                                  <p className="text-xs text-ink-500">{s.phone}</p>
                                </div>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* 位置分配 */}
                  {pallbearerSelection.main.length > 0 && (
                    <div className="card p-5">
                      <h4 className="section-title mb-4">棺柩位置分配示意</h4>
                      <div className="flex justify-center">
                        <div className="inline-block p-6 bg-ink-50 rounded-xl border border-ink-200">
                          <div className="text-center mb-4">
                            <p className="text-xs text-ink-500 mb-1">↑ 出殡方向 ↑</p>
                          </div>
                          <div className="grid grid-cols-2 gap-x-16 gap-y-3">
                            {['左前', '右前', '左二', '右二', '左三', '右三', '左后', '右后'].map(
                              (pos, idx) => {
                                const staffId = pallbearerSelection.main[idx];
                                const s = staff.find((st) => st.id === staffId);
                                return (
                                  <div
                                    key={pos}
                                    className={`w-20 h-16 rounded-lg border-2 flex flex-col items-center justify-center ${
                                      s
                                        ? 'bg-gold-50 border-gold/60'
                                        : 'bg-white border-dashed border-ink-200'
                                    }`}
                                  >
                                    {s ? (
                                      <>
                                        <p className="text-sm font-semibold text-ink-800">{s.name}</p>
                                        <p className="text-xs text-gold-dark mt-0.5">{pos}</p>
                                      </>
                                    ) : (
                                      <p className="text-xs text-ink-400">{pos}</p>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                          <div className="mt-6 flex justify-center">
                            <div className="px-24 py-10 bg-ink-200/60 rounded-sm border-2 border-ink-400 text-center">
                              <p className="text-ink-600 font-song">灵柩</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Route Tab */}
          {activeTab === 'route' && (
            <div className="space-y-6">
              {!selectedOrder ? (
                <div className="text-center py-12 text-ink-400">
                  <Route className="w-12 h-12 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                  <p>请先选择关联订单</p>
                </div>
              ) : (
                <>
                  <div className="card p-5">
                    <h4 className="section-title mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-cinnabar" strokeWidth={1.8} />
                      出殡路线规划
                    </h4>

                    <div className="max-w-2xl">
                      {(() => {
                        const order = orders.find((o) => o.id === selectedOrder);
                        const route = order?.route || [
                          { name: '家中（灵堂）', address: order?.family.address || '' },
                          { name: '殡仪馆', address: '请输入殡仪馆地址' },
                          { name: '公墓/陵园', address: '请输入安葬地址' },
                        ];

                        return (
                          <div className="relative">
                            {route.map((point, idx) => (
                              <div key={idx} className="relative pl-10 pb-8 last:pb-0">
                                {idx < route.length - 1 && (
                                  <div className="absolute left-[15px] top-8 w-0.5 h-full bg-gradient-to-b from-gold to-linen" />
                                )}
                                <div
                                  className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    idx === 0
                                      ? 'bg-jade text-white border-2 border-jade-light'
                                      : idx === route.length - 1
                                      ? 'bg-cinnabar text-white border-2 border-cinnabar-light'
                                      : 'bg-gold text-white border-2 border-gold-light'
                                  }`}
                                >
                                  {idx + 1}
                                </div>
                                <div className="card p-4 ml-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-ink-900">{point.name}</h5>
                                    {point.arriveTime && point.leaveTime && (
                                      <span className="badge bg-ink-100 text-ink-600">
                                        {point.arriveTime} - {point.leaveTime}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-ink-600 flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-ink-400 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                                    {point.address}
                                  </p>
                                  {idx === 0 && (
                                    <div className="mt-3 pt-3 border-t border-ink-100">
                                      <p className="text-xs text-ink-500 mb-2">预计出发时间</p>
                                      <input
                                        type="time"
                                        defaultValue="07:00"
                                        className="input-base w-32 text-sm"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            <button className="btn-outline w-full mt-4">
                              <Plus className="w-4 h-4" strokeWidth={1.8} />
                              添加途经点
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 订单摘要 */}
                  {selectedOrder && (
                    <div className="card p-5 bg-gradient-to-br from-linen/5 to-white">
                      <h4 className="section-title mb-3">治丧摘要</h4>
                      {(() => {
                        const order = orders.find((o) => o.id === selectedOrder);
                        if (!order) return null;
                        return (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-ink-500 mb-1">逝者</p>
                              <p className="font-semibold">{order.deceased.name} · {order.deceased.age}岁</p>
                            </div>
                            <div>
                              <p className="text-ink-500 mb-1">出殡日期</p>
                              <p className="font-semibold">{order.auspiciousDates.funeralDate}</p>
                            </div>
                            <div>
                              <p className="text-ink-500 mb-1">吉时</p>
                              <p className="font-semibold">{order.auspiciousDates.funeralTime}</p>
                            </div>
                            <div>
                              <p className="text-ink-500 mb-1">治丧地址</p>
                              <p className="font-medium truncate">{order.family.address}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <h3 className="section-title mb-6">添加排班</h3>
            <div className="space-y-4">
              <div>
                <label className="label-base">排班日期</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label-base">选择人员</label>
                <select
                  value={newSchedule.staffId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, staffId: e.target.value })}
                  className="input-base"
                >
                  <option value="">请选择人员...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.role} ({s.status === 'available' ? '空闲' : s.status === 'busy' ? '忙碌' : '休假'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base">班次</label>
                  <select
                    value={newSchedule.shift}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, shift: e.target.value as typeof newSchedule.shift })
                    }
                    className="input-base"
                  >
                    {Object.entries(shiftConfig).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-base">岗位位置</label>
                  <input
                    type="text"
                    value={newSchedule.position}
                    onChange={(e) => setNewSchedule({ ...newSchedule, position: e.target.value })}
                    className="input-base"
                    placeholder="如：左前、司仪等"
                  />
                </div>
              </div>
              <div>
                <label className="label-base">工作任务</label>
                <input
                  type="text"
                  value={newSchedule.task}
                  onChange={(e) => setNewSchedule({ ...newSchedule, task: e.target.value })}
                  className="input-base"
                  placeholder="如：主礼司仪、灵堂布置等"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-ink-100">
              <button onClick={() => setShowAddModal(false)} className="btn-outline">
                取消
              </button>
              <button
                onClick={handleAddSchedule}
                disabled={!selectedDate || !newSchedule.staffId}
                className="btn-primary"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
