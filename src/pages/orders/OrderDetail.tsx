import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/storage';
import { OrderStatusBadge, SpecBadge } from '@/components/shared/StatusBadges';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Phone as PhoneIcon,
  MessageCircle,
  Handshake,
  Edit,
  Calculator,
  Users,
  Package,
  Music,
  ChevronDown,
  ChevronUp,
  Plus,
  Send,
  Paperclip,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Banknote,
} from 'lucide-react';

const methodIcons = {
  '电话': PhoneIcon,
  '微信': MessageCircle,
  '面谈': Handshake,
};

const methodColors = {
  '电话': 'bg-linen/10 text-linen border-linen/30',
  '微信': 'bg-jade/10 text-jade border-jade/30',
  '面谈': 'bg-gold/10 text-gold-dark border-gold/30',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, communications, schedules, staff, materials, bandSchedules, bands, expenses, staffShares, payments, addCommunication } = useAppStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('deceased');
  const [showAddComm, setShowAddComm] = useState(false);
  const [newComm, setNewComm] = useState<{
    method: '电话' | '微信' | '面谈';
    content: string;
    operator: string;
    followUp: string;
  }>({
    method: '电话',
    content: '',
    operator: '周师傅',
    followUp: '',
  });

  const order = orders.find((o) => o.id === id);
  const orderComms = communications
    .filter((c) => c.orderId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const orderSchedules = schedules.filter((s) => s.orderId === id);
  const orderExpenses = expenses.filter((e) => e.orderId === id);
  const orderShares = staffShares.filter((s) => s.orderId === id);
  const orderPayments = payments.filter((p) => p.orderId === id);
  const orderBands = bandSchedules.filter((b) => b.orderId === id);

  const totalExpense = orderExpenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpense = orderExpenses.filter((e) => e.paid).reduce((sum, e) => sum + e.amount, 0);
  const unpaidExpenseCount = orderExpenses.filter((e) => !e.paid).length;
  const totalShare = orderShares.reduce((sum, s) => sum + s.total, 0);
  const settledShare = orderShares.filter((s) => s.settled).reduce((sum, s) => sum + s.total, 0);
  const paidOutShare = orderShares.filter((s) => s.paidOut).reduce((sum, s) => sum + s.total, 0);
  const unsettledShareCount = orderShares.filter((s) => !s.settled).length;
  const unpaidOutCount = orderShares.filter((s) => s.settled && !s.paidOut).length;
  const totalReceived = orderPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalUnreceived = Math.max(0, (order?.totalAmount || 0) - totalReceived);
  const hasExpenses = orderExpenses.length > 0;
  const hasShares = orderShares.length > 0;
  const hasPayments = orderPayments.length > 0;
  const allSettled = hasExpenses && hasShares && unpaidExpenseCount === 0 && unsettledShareCount === 0 && unpaidOutCount === 0;
  const settlementNotStarted = !hasExpenses && !hasShares && !hasPayments;
  const profit = (order?.totalAmount || 0) - totalExpense - totalShare;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddComm = () => {
    if (id && newComm.content) {
      addCommunication({
        orderId: id,
        date: new Date().toISOString(),
        method: newComm.method,
        content: newComm.content,
        operator: newComm.operator,
        followUp: newComm.followUp || undefined,
      });
      setShowAddComm(false);
      setNewComm({ method: '电话', content: '', operator: '周师傅', followUp: '' });
    }
  };

  if (!order) {
    return (
      <div className="card p-16 text-center text-ink-400">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
        <p className="text-lg mb-2">订单不存在</p>
        <button onClick={() => navigate('/orders')} className="btn-gold mt-4">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
          返回订单列表
        </button>
      </div>
    );
  }

  const SectionCard = ({
    id,
    title,
    icon: Icon,
    children,
    badge,
  }: {
    id: string;
    title: string;
    icon: any;
    children: React.ReactNode;
    badge?: React.ReactNode;
  }) => (
    <div className="card overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full p-5 flex items-center justify-between bg-ink-50/50 hover:bg-ink-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gold-dark" strokeWidth={1.8} />
          </div>
          <h3 className="font-song text-lg font-semibold text-ink-900">{title}</h3>
          {badge}
        </div>
        {expandedSection === id ? (
          <ChevronUp className="w-5 h-5 text-ink-400" strokeWidth={1.8} />
        ) : (
          <ChevronDown className="w-5 h-5 text-ink-400" strokeWidth={1.8} />
        )}
      </button>
      {expandedSection === id && <div className="p-5">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" strokeWidth={1.8} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-song text-2xl font-bold text-ink-900">
                {order.deceased.name} 治丧订单详情
              </h1>
              <OrderStatusBadge status={order.status} />
              <SpecBadge spec={order.funeralSpec} />
            </div>
            <p className="text-sm text-ink-500 font-mono">{order.orderNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/scheduling?orderId=${order.id}`)}
            className="btn-outline"
          >
            <Users className="w-4 h-4" strokeWidth={1.8} />
            排班安排
          </button>
          <button
            onClick={() => navigate(`/settlement?orderId=${order.id}`)}
            className="btn-gold"
          >
            <Calculator className="w-4 h-4" strokeWidth={1.8} />
            结算分账
          </button>
        </div>
      </div>

      {/* 结算状态提醒条 */}
      {allSettled ? (
        <div className="p-4 rounded-lg bg-jade/5 border border-jade/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-jade/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-jade" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-jade">本单已全部结清 ✓</p>
            <p className="text-sm text-ink-500">
              所有 {orderExpenses.length} 项费用已支付，{orderShares.length} 位人员分账已确认且已发放
            </p>
          </div>
          <button
            onClick={() => navigate(`/settlement?orderId=${order.id}&tab=expenses`)}
            className="btn-outline text-sm flex-shrink-0"
          >
            查看明细
          </button>
        </div>
      ) : settlementNotStarted ? (
        <div className="p-4 rounded-lg bg-ink-50 border border-ink-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-ink-500" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-ink-700 mb-1">尚未开始结算</p>
            <div className="space-y-1 text-sm text-ink-600">
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-ink-400" />请先录入费用明细</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-ink-400" />登记家属收款</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-ink-400" />确认排班后生成分账</p>
            </div>
          </div>
          <button onClick={() => navigate(`/settlement?orderId=${order.id}&tab=expenses`)} className="btn-gold text-sm flex-shrink-0">开始结算</button>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-amber-800 mb-1">结算进行中</p>
            <div className="space-y-1 text-sm text-amber-700">
              {!hasExpenses && <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />尚未录入费用明细</p>}
              {unpaidExpenseCount > 0 && <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />还有 {unpaidExpenseCount} 项费用未支付（{formatCurrency(totalExpense - paidExpense)}）</p>}
              {!hasShares && <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />尚未生成分账明细</p>}
              {unsettledShareCount > 0 && <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />还有 {unsettledShareCount} 位人员分账未确认（{formatCurrency(totalShare - settledShare)}）</p>}
              {unpaidOutCount > 0 && <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />还有 {unpaidOutCount} 位人员待发放（{formatCurrency(settledShare - paidOutShare)}）</p>}
              {totalUnreceived > 0 && <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />家属还有 {formatCurrency(totalUnreceived)} 未收款</p>}
            </div>
          </div>
          <button onClick={() => navigate(`/settlement?orderId=${order.id}`)} className="btn-gold text-sm flex-shrink-0">去处理</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：主要信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 逝者信息 */}
          <SectionCard id="deceased" title="逝者信息" icon={User}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                    order.deceased.gender === 'male'
                      ? 'bg-linen/10 text-linen border-2 border-linen/30'
                      : 'bg-gold/10 text-gold-dark border-2 border-gold/30'
                  }`}
                >
                  {order.deceased.name.charAt(0)}
                </div>
                <div>
                  <p className="font-song text-xl font-semibold text-ink-900">
                    {order.deceased.name}
                  </p>
                  <p className="text-sm text-ink-500">
                    {order.deceased.gender === 'male' ? '先考' : '先妣'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-1">享寿</p>
                <p className="text-lg font-semibold text-ink-800">{order.deceased.age} 岁</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-1">出生日期</p>
                <p className="text-sm text-ink-800">{formatDate(order.deceased.birthDate)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-1">逝世日期</p>
                <p className="text-sm text-ink-800">{formatDate(order.deceased.deathDate)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-1">仙逝地点</p>
                <p className="text-sm text-ink-800">{order.deceased.deathPlace}</p>
              </div>
            </div>
          </SectionCard>

          {/* 家属信息 */}
          <SectionCard id="family" title="家属信息" icon={Phone}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-ink-400 mb-1">联系人</p>
                <p className="text-lg font-semibold text-ink-800">
                  {order.family.contactName}
                  <span className="text-sm font-normal text-ink-500 ml-2">
                    ({order.family.relationship})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-1">联系电话</p>
                <p className="text-sm text-ink-800 font-mono">{order.family.phone}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-1">住址</p>
                <p className="text-sm text-ink-800">{order.family.address}</p>
              </div>
            </div>
          </SectionCard>

          {/* 择吉信息 */}
          <SectionCard id="auspicious" title="择吉时辰" icon={Calendar}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-gold-50/50 border border-gold/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gold-dark" strokeWidth={1.8} />
                  <p className="text-xs text-ink-500">出殡日期</p>
                </div>
                <p className="font-song text-xl font-semibold text-gold-dark">
                  {formatDate(order.auspiciousDates.funeralDate)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-linen/5 border border-linen/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-linen" strokeWidth={1.8} />
                  <p className="text-xs text-ink-500">出殡吉时</p>
                </div>
                <p className="font-song text-xl font-semibold text-linen">
                  {order.auspiciousDates.funeralTime}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-ink-50 border border-ink-200">
                <p className="text-xs text-ink-500 mb-2">仪式时辰</p>
                <div className="space-y-1">
                  {order.auspiciousDates.ritualTimes.map((t, i) => (
                    <p key={i} className="text-sm text-ink-700 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-ink-400" />
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {order.route && order.route.length > 0 && (
              <div className="mt-6 pt-6 border-t border-ink-100">
                <p className="text-sm font-semibold text-ink-700 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cinnabar" strokeWidth={1.8} />
                  出殡路线（{order.route.length} 个途经点）
                </p>
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-ink-200" />
                  {order.route.map((point, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-linen border-2 border-white shadow" />
                      <div className="p-3 rounded-lg bg-ink-50 border border-ink-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-ink-800">{point.name}</p>
                            <p className="text-xs text-ink-500 mt-0.5">{point.address}</p>
                          </div>
                          {point.arriveTime && (
                            <span className="text-xs text-ink-500">
                              预计 {point.arriveTime} 到达
                            </span>
                          )}
                        </div>
                        {point.notes && (
                          <p className="text-xs text-amber-600 mt-2">⚠ {point.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* 沟通记录 */}
          <SectionCard
            id="communication"
            title="客户沟通记录"
            icon={MessageSquare}
            badge={
              <span className="badge bg-ink-100 text-ink-600">
                {orderComms.length} 条记录
              </span>
            }
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-ink-500">
                记录与家属的所有沟通内容，便于后续跟进
              </p>
              <button onClick={() => setShowAddComm(true)} className="btn-gold text-sm">
                <Plus className="w-4 h-4" strokeWidth={1.8} />
                添加记录
              </button>
            </div>

            {orderComms.length > 0 ? (
              <div className="space-y-4">
                {orderComms.map((comm) => {
                  const Icon = methodIcons[comm.method];
                  return (
                    <div key={comm.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full border flex items-center justify-center ${methodColors[comm.method]}`}
                        >
                          <Icon className="w-5 h-5" strokeWidth={1.8} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-ink-800">
                            {comm.operator}
                          </span>
                          <span className={`badge text-xs ${methodColors[comm.method]}`}>
                            {comm.method}
                          </span>
                          <span className="text-xs text-ink-400">
                            {formatDateTime(comm.date)}
                          </span>
                        </div>
                        <p className="text-sm text-ink-700 leading-relaxed">
                          {comm.content}
                        </p>
                        {comm.followUp && (
                          <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-700">
                            <span className="font-medium">跟进事项：</span>
                            {comm.followUp}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-ink-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
                <p className="text-sm">暂无沟通记录</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* 右侧：辅助信息 */}
        <div className="space-y-6">
          {/* 财务概览 */}
          <div className="card p-5 bg-gradient-to-br from-gold-50/50 to-amber-50/50 border-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-song text-lg font-semibold text-ink-900">财务概览</h3>
              <button onClick={() => navigate(`/settlement?orderId=${order.id}`)} className="text-xs text-gold-dark hover:underline">查看结算 →</button>
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-600">订单金额</span>
                <span className="font-song text-xl font-bold text-gold-dark">{formatCurrency(order.totalAmount || 0)}</span>
              </div>
            </div>

            {/* 收款进度 */}
            <div onClick={() => navigate(`/settlement?orderId=${order.id}&tab=payments`)}
              className="p-3 mb-3 rounded-lg bg-white/60 hover:bg-white cursor-pointer transition-colors border border-ink-100 hover:border-jade/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-ink-600 flex items-center gap-1.5"><Banknote className="w-4 h-4 text-jade" strokeWidth={1.8} />收款进度</span>
                <span className="text-lg font-semibold text-jade">{formatCurrency(totalReceived)}</span>
              </div>
              <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-gradient-to-r from-jade to-jade-dark rounded-full transition-all"
                  style={{ width: order.totalAmount && order.totalAmount > 0 ? `${Math.min(100, (totalReceived / order.totalAmount) * 100)}%` : '0%' }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-jade">已收 {formatCurrency(totalReceived)}</span>
                <span className={totalUnreceived > 0 ? 'text-cinnabar' : 'text-ink-400'}>{totalUnreceived > 0 ? `未收 ${formatCurrency(totalUnreceived)}` : '已收齐'}</span>
              </div>
            </div>

            {/* 费用支出 */}
            <div onClick={() => navigate(`/settlement?orderId=${order.id}&tab=expenses`)}
              className="p-3 mb-3 rounded-lg bg-white/60 hover:bg-white cursor-pointer transition-colors border border-ink-100 hover:border-gold/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-ink-600 flex items-center gap-1.5"><Receipt className="w-4 h-4 text-cinnabar" strokeWidth={1.8} />费用支出</span>
                <span className="text-lg font-semibold text-cinnabar">{formatCurrency(totalExpense)}</span>
              </div>
              <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-cinnabar rounded-full transition-all"
                  style={{ width: order.totalAmount && order.totalAmount > 0 ? `${Math.min(100, (totalExpense / order.totalAmount) * 100)}%` : '0%' }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-jade">已付 {formatCurrency(paidExpense)}</span>
                <span className={unpaidExpenseCount > 0 ? 'text-amber-600' : 'text-ink-400'}>{unpaidExpenseCount > 0 ? `${unpaidExpenseCount} 项未付` : '已付清'}</span>
              </div>
            </div>

            {/* 人员分账 */}
            <div onClick={() => navigate(`/settlement?orderId=${order.id}&tab=shares`)}
              className="p-3 mb-3 rounded-lg bg-white/60 hover:bg-white cursor-pointer transition-colors border border-ink-100 hover:border-linen/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-ink-600 flex items-center gap-1.5"><Users className="w-4 h-4 text-linen" strokeWidth={1.8} />人员分账</span>
                <span className="text-lg font-semibold text-linen">{formatCurrency(totalShare)}</span>
              </div>
              <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-linen rounded-full transition-all"
                  style={{ width: order.totalAmount && order.totalAmount > 0 ? `${Math.min(100, (totalShare / order.totalAmount) * 100)}%` : '0%' }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-jade">已发 {formatCurrency(paidOutShare)}</span>
                <span className={!hasShares ? 'text-ink-400' : unpaidOutCount > 0 ? 'text-amber-600' : 'text-ink-400'}>{!hasShares ? '未生成分账' : unpaidOutCount > 0 ? `${unpaidOutCount} 人待发放` : '已发放'}</span>
              </div>
            </div>

            {/* 利润 */}
            <div className="pt-3 mt-3 border-t border-gold/20">
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-700 font-medium">预估利润</span>
                <span className={`font-song text-xl font-bold ${profit >= 0 ? 'text-jade' : 'text-cinnabar'}`}>{profit >= 0 ? '+' : ''}{formatCurrency(profit)}</span>
              </div>
              <div className="flex justify-between text-xs text-ink-400 mt-1">
                <span>总收入 - 费用 - 分账</span>
                <span>{order.totalAmount && order.totalAmount > 0 ? `${((profit / order.totalAmount) * 100).toFixed(1)}% 利润率` : '—'}</span>
              </div>
            </div>
          </div>

          {/* 排班情况 */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-song text-lg font-semibold text-ink-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-linen" strokeWidth={1.8} />
                排班情况
              </h3>
              <span className="badge bg-linen/10 text-linen border-linen/30">
                {orderSchedules.length} 人次
              </span>
            </div>
            {orderSchedules.length > 0 ? (
              <div className="space-y-2">
                {orderSchedules.map((sched) => {
                  const s = staff.find((x) => x.id === sched.staffId);
                  return (
                    <div
                      key={sched.id}
                      className="p-3 rounded-lg bg-ink-50 border border-ink-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-linen/10 flex items-center justify-center text-sm font-semibold text-linen">
                          {s?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink-800">{s?.name}</p>
                          <p className="text-xs text-ink-500">{sched.task}</p>
                        </div>
                      </div>
                      <span className="text-xs text-ink-500">{formatDate(sched.date)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-ink-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
                <p className="text-sm">暂无排班</p>
              </div>
            )}
            <button
              onClick={() => navigate(`/scheduling?orderId=${order.id}`)}
              className="btn-outline w-full mt-4 text-sm"
            >
              <Edit className="w-4 h-4" strokeWidth={1.8} />
              管理排班
            </button>
          </div>

          {/* 乐队安排 */}
          {orderBands.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-song text-lg font-semibold text-ink-900 flex items-center gap-2">
                  <Music className="w-5 h-5 text-cinnabar" strokeWidth={1.8} />
                  乐队安排
                </h3>
                <span className="badge bg-cinnabar/10 text-cinnabar border-cinnabar/30">
                  {orderBands.length} 场
                </span>
              </div>
              <div className="space-y-2">
                {orderBands.map((bs) => {
                  const band = bands.find((b) => b.id === bs.bandId);
                  return (
                    <div
                      key={bs.id}
                      className="p-3 rounded-lg bg-ink-50 border border-ink-100"
                    >
                      <p className="text-sm font-medium text-ink-800">{band?.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-ink-500">
                          {formatDate(bs.date)} {bs.timeSlot}
                        </span>
                        <span className="text-xs text-ink-500">{bs.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 备注信息 */}
          {order.remarks && (
            <div className="card p-5">
              <h3 className="font-song text-lg font-semibold text-ink-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-ink-500" strokeWidth={1.8} />
                特殊备注
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed p-3 bg-amber-50 rounded-lg border border-amber-100">
                {order.remarks}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 添加沟通记录弹窗 */}
      {showAddComm && (
        <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up">
            <div className="p-5 border-b border-ink-100">
              <h3 className="font-song text-lg font-semibold text-ink-900">添加沟通记录</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  沟通方式
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['电话', '微信', '面谈'] as const).map((m) => {
                    const Icon = methodIcons[m];
                    const selected = newComm.method === m;
                    return (
                      <label
                        key={m}
                        className={`p-3 rounded-lg border-2 cursor-pointer flex flex-col items-center gap-1.5 transition-all ${
                          selected
                            ? 'border-gold bg-gold-50 text-gold-dark'
                            : 'border-ink-200 hover:border-ink-300 text-ink-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          checked={selected}
                          onChange={() => setNewComm({ ...newComm, method: m })}
                          className="hidden"
                        />
                        <Icon className="w-5 h-5" strokeWidth={1.8} />
                        <span className="text-sm font-medium">{m}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  沟通内容
                </label>
                <textarea
                  value={newComm.content}
                  onChange={(e) => setNewComm({ ...newComm, content: e.target.value })}
                  rows={4}
                  className="input-base resize-none"
                  placeholder="请详细记录沟通内容..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    经办人
                  </label>
                  <input
                    type="text"
                    value={newComm.operator}
                    onChange={(e) => setNewComm({ ...newComm, operator: e.target.value })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    跟进事项
                  </label>
                  <input
                    type="text"
                    value={newComm.followUp}
                    onChange={(e) => setNewComm({ ...newComm, followUp: e.target.value })}
                    className="input-base"
                    placeholder="需要后续跟进的..."
                  />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-ink-100 flex justify-end gap-2">
              <button
                onClick={() => setShowAddComm(false)}
                className="btn-outline"
              >
                取消
              </button>
              <button
                onClick={handleAddComm}
                disabled={!newComm.content}
                className="btn-gold"
              >
                <Send className="w-4 h-4" strokeWidth={1.8} />
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
