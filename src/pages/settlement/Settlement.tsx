import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/utils/storage';
import { OrderStatusBadge, SpecBadge } from '@/components/shared/StatusBadges';
import type { ExpenseCategory, PaymentMethod } from '@/types';
import {
  Calculator, Search, Plus, DollarSign, Users, FileBarChart,
  TrendingDown, Receipt, PiggyBank, CheckCircle2, Clock,
  ChevronRight, User, Award, Share2, Wallet, Download,
  AlertCircle, XCircle, X, Check, RotateCcw, Banknote,
  HandCoins, Filter,
} from 'lucide-react';

const expenseCategories: ExpenseCategory[] = ['服务费', '物资费', '乐队费', '场地费', '其他'];
const paymentMethods: PaymentMethod[] = ['现金', '微信', '支付宝', '银行转账', '其他'];
const payoutMethods = ['现金', '微信', '支付宝', '银行转账'];

const categoryColors: Record<ExpenseCategory, string> = {
  '服务费': 'bg-linen/10 text-linen border-linen/30',
  '物资费': 'bg-gold/10 text-gold-dark border-gold/30',
  '乐队费': 'bg-cinnabar/10 text-cinnabar border-cinnabar/30',
  '场地费': 'bg-jade/10 text-jade border-jade/30',
  '其他': 'bg-ink-100 text-ink-700 border-ink-200',
};

const methodIcons: Record<PaymentMethod, string> = {
  '现金': '💵', '微信': '💚', '支付宝': '💙', '银行转账': '🏦', '其他': '💰',
};

type SettlementTab = 'expenses' | 'shares' | 'payments';

export default function Settlement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    orders, staff, expenses, staffShares, schedules, payments,
    addExpense, updateExpense, addStaffShare, updateStaffShare, addPayment,
  } = useAppStore();

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SettlementTab>('expenses');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState<string | null>(null);
  const [shareFilter, setShareFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const [newExpense, setNewExpense] = useState({
    category: '服务费' as ExpenseCategory, item: '', amount: '', paid: false,
  });
  const [newPayment, setNewPayment] = useState({
    amount: '', method: '银行转账' as PaymentMethod, remark: '', operator: '周师傅',
  });
  const [payoutForm, setPayoutForm] = useState({
    method: '微信', date: new Date().toISOString().split('T')[0], operator: '周师傅',
  });

  useEffect(() => {
    const orderIdFromUrl = searchParams.get('orderId');
    const tabFromUrl = searchParams.get('tab');
    if (orderIdFromUrl && orders.find((o) => o.id === orderIdFromUrl)) {
      setSelectedOrder(orderIdFromUrl);
      if (['expenses', 'shares', 'payments'].includes(tabFromUrl || '')) {
        setActiveTab(tabFromUrl as SettlementTab);
      }
    } else if (!selectedOrder && orders.length > 0) {
      const defaultOrder =
        orders.find((o) => o.status === 'completed' || o.status === 'in-progress')?.id ||
        orders[0]?.id || null;
      setSelectedOrder(defaultOrder);
    }
  }, [searchParams, orders]);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('orderId', orderId);
    setSearchParams(newParams);
  };

  const handleTabChange = (tab: SettlementTab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  const currentOrder = orders.find((o) => o.id === selectedOrder);
  const orderExpenses = expenses.filter((e) => e.orderId === selectedOrder);
  const orderShares = staffShares.filter((s) => s.orderId === selectedOrder);
  const orderSchedules = schedules.filter((s) => s.orderId === selectedOrder);
  const orderPayments = payments.filter((p) => p.orderId === selectedOrder);

  const totalExpense = useMemo(() => orderExpenses.reduce((sum, e) => sum + e.amount, 0), [orderExpenses]);
  const paidExpense = useMemo(() => orderExpenses.filter((e) => e.paid).reduce((sum, e) => sum + e.amount, 0), [orderExpenses]);
  const unpaidExpenseCount = orderExpenses.filter((e) => !e.paid).length;
  const totalShare = useMemo(() => orderShares.reduce((sum, s) => sum + s.total, 0), [orderShares]);
  const settledShare = useMemo(() => orderShares.filter((s) => s.settled).reduce((sum, s) => sum + s.total, 0), [orderShares]);
  const paidOutShare = useMemo(() => orderShares.filter((s) => s.paidOut).reduce((sum, s) => sum + s.total, 0), [orderShares]);
  const unsettledShareCount = orderShares.filter((s) => !s.settled).length;
  const unpaidOutCount = orderShares.filter((s) => s.settled && !s.paidOut).length;
  const totalReceived = useMemo(() => orderPayments.reduce((sum, p) => sum + p.amount, 0), [orderPayments]);
  const orderTotalAmount = currentOrder?.totalAmount || 0;
  const totalUnreceived = Math.max(0, orderTotalAmount - totalReceived);
  const hasUnpaidExpenses = unpaidExpenseCount > 0;
  const hasUnsettledShares = unsettledShareCount > 0;
  const hasExpenses = orderExpenses.length > 0;
  const hasShares = orderShares.length > 0;
  const hasPayments = orderPayments.length > 0;
  const allSettled = !hasUnpaidExpenses && !hasUnsettledShares && hasExpenses && hasShares && unpaidOutCount === 0;
  const settlementNotStarted = !hasExpenses && !hasShares && !hasPayments;
  const profit = orderTotalAmount - totalExpense - totalShare;

  const expenseByCategory = orderExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const filteredOrders = orders.filter(
    (o) => o.deceased.name.includes(searchQuery) || o.family.contactName.includes(searchQuery) || o.orderNo.includes(searchQuery)
  );

  const filteredShares = useMemo(() => {
    if (shareFilter === 'paid') return orderShares.filter((s) => s.paidOut);
    if (shareFilter === 'unpaid') return orderShares.filter((s) => s.settled && !s.paidOut);
    return orderShares;
  }, [orderShares, shareFilter]);

  const handleGenerateShares = () => {
    const staffScheduleMap = new Map<string, number>();
    orderSchedules.forEach((sched) => {
      const count = staffScheduleMap.get(sched.staffId) || 0;
      staffScheduleMap.set(sched.staffId, count + 1);
    });
    staffScheduleMap.forEach((scheduleCount, staffId) => {
      const alreadyExists = orderShares.some((s) => s.staffId === staffId);
      if (!alreadyExists) {
        const s = staff.find((x) => x.id === staffId);
        if (s) {
          const base = s.dailyRate * scheduleCount;
          addStaffShare({
            orderId: selectedOrder!,
            staffId,
            baseAmount: base,
            bonus: 0,
            total: base,
            settled: false,
            paidOut: false,
          });
        }
      }
    });
  };

  const handleAddExpense = () => {
    if (selectedOrder && newExpense.item && newExpense.amount) {
      addExpense({
        orderId: selectedOrder,
        category: newExpense.category,
        item: newExpense.item,
        amount: parseFloat(newExpense.amount),
        paid: newExpense.paid,
      });
      setShowAddExpenseModal(false);
      setNewExpense({ category: '服务费', item: '', amount: '', paid: false });
    }
  };

  const handleToggleExpensePaid = (expenseId: string) => {
    const exp = orderExpenses.find((e) => e.id === expenseId);
    if (exp) updateExpense(expenseId, { paid: !exp.paid });
  };

  const handleToggleShareSettled = (shareId: string) => {
    const share = orderShares.find((s) => s.id === shareId);
    if (share) updateStaffShare(shareId, { settled: !share.settled });
  };

  const handleSettleAllShares = () => {
    orderShares.forEach((share) => {
      if (!share.settled) updateStaffShare(share.id, { settled: true });
    });
  };

  const handleUnsettleAllShares = () => {
    orderShares.forEach((share) => {
      if (share.settled) updateStaffShare(share.id, { settled: false, paidOut: false, paidMethod: undefined, paidDate: undefined, paidOperator: undefined });
    });
  };

  const handlePayout = (shareId: string) => {
    updateStaffShare(shareId, {
      paidOut: true,
      paidMethod: payoutForm.method,
      paidDate: payoutForm.date,
      paidOperator: payoutForm.operator,
    });
    setShowPayoutModal(null);
  };

  const handleCancelPayout = (shareId: string) => {
    updateStaffShare(shareId, {
      paidOut: false,
      paidMethod: undefined,
      paidDate: undefined,
      paidOperator: undefined,
    });
  };

  const handleAddPayment = () => {
    if (selectedOrder && newPayment.amount) {
      addPayment({
        orderId: selectedOrder,
        amount: parseFloat(newPayment.amount),
        method: newPayment.method,
        date: new Date().toISOString(),
        remark: newPayment.remark || undefined,
        operator: newPayment.operator,
      });
      setShowAddPaymentModal(false);
      setNewPayment({ amount: '', method: '银行转账', remark: '', operator: '周师傅' });
    }
  };

  const getOrderSettlementStatus = (orderId: string) => {
    const orderExps = expenses.filter((e) => e.orderId === orderId);
    const orderShrs = staffShares.filter((s) => s.orderId === orderId);
    const hasExp = orderExps.length > 0;
    const hasShr = orderShrs.length > 0;
    const allExpPaid = orderExps.every((e) => e.paid);
    const allShrSettled = orderShrs.every((s) => s.settled);
    const allPaidOut = orderShrs.filter((s) => s.settled).every((s) => s.paidOut);
    if (!hasExp && !hasShr) return 'not-started';
    if (hasExp && hasShr && allExpPaid && allShrSettled && allPaidOut) return 'completed';
    return 'in-progress';
  };

  return (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card card-hover p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-gold-dark" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-ink-500">订单总额</p>
              <p className="text-xl font-bold text-ink-900 font-song">{formatCurrency(orderTotalAmount)}</p>
            </div>
          </div>
        </div>
        <div className="card card-hover p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cinnabar/10 border border-cinnabar/30 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-cinnabar" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-ink-500">费用支出</p>
              <p className="text-xl font-bold text-cinnabar font-song">{formatCurrency(totalExpense)}</p>
              {hasExpenses && hasUnpaidExpenses && <p className="text-xs text-amber-600 mt-0.5">{unpaidExpenseCount} 项未付</p>}
            </div>
          </div>
        </div>
        <div className="card card-hover p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linen/10 border border-linen/30 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-linen" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-ink-500">人员分账</p>
              <p className="text-xl font-bold text-linen font-song">{formatCurrency(totalShare)}</p>
              {hasShares && unpaidOutCount > 0 && <p className="text-xs text-amber-600 mt-0.5">{unpaidOutCount} 人待发放</p>}
            </div>
          </div>
        </div>
        <div className="card card-hover p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-jade/10 border border-jade/30 flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-jade" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-ink-500">预估利润</p>
              <p className={`text-xl font-bold font-song ${profit >= 0 ? 'text-jade' : 'text-cinnabar'}`}>{formatCurrency(profit)}</p>
            </div>
          </div>
        </div>
        <div className="card card-hover p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ink-50 border border-ink-200 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-ink-600" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-ink-500">未收款</p>
              <p className="text-xl font-bold text-cinnabar font-song">{formatCurrency(totalUnreceived)}</p>
              {hasPayments && <p className="text-xs text-jade mt-0.5">已收 {formatCurrency(totalReceived)}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
          <input type="text" placeholder="搜索订单..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-base pl-9 w-64" />
        </div>
        <div className="flex gap-2">
          <button className="btn-outline"><FileBarChart className="w-4 h-4" strokeWidth={1.8} />查看报表</button>
          <button className="btn-gold"><Download className="w-4 h-4" strokeWidth={1.8} />导出结算单</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 订单选择列表 */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-ink-200 bg-ink-50">
            <h3 className="section-title text-base">选择订单结算</h3>
          </div>
          <div className="overflow-y-auto max-h-[700px]">
            {filteredOrders.map((order) => {
              const orderTotal = expenses.filter((e) => e.orderId === order.id).reduce((sum, e) => sum + e.amount, 0);
              const shareTotal = staffShares.filter((s) => s.orderId === order.id).reduce((sum, s) => sum + s.total, 0);
              const status = getOrderSettlementStatus(order.id);
              return (
                <div key={order.id} onClick={() => handleOrderSelect(order.id)}
                  className={`p-4 border-b border-ink-100 cursor-pointer transition-colors ${selectedOrder === order.id ? 'bg-gold-50/50 border-l-4 border-l-gold' : 'hover:bg-ink-50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-ink-900">{order.deceased.name}</p>
                      <p className="text-xs text-ink-500 font-mono mt-0.5">{order.orderNo}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <OrderStatusBadge status={order.status} />
                      <SpecBadge spec={order.funeralSpec} />
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-ink-500">订单收入</span><span className="font-medium text-gold-dark">{formatCurrency(order.totalAmount || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-500">费用+分账</span><span className="font-medium text-cinnabar">{formatCurrency(orderTotal + shareTotal)}</span></div>
                    <div className="pt-2 mt-2 border-t border-ink-100 flex justify-between items-center">
                      <span className="text-ink-500">
                        {status === 'completed' ? <span className="flex items-center gap-1 text-jade"><CheckCircle2 className="w-3 h-3" strokeWidth={1.8} />已结清</span>
                          : status === 'not-started' ? <span className="flex items-center gap-1 text-ink-400"><XCircle className="w-3 h-3" strokeWidth={1.8} />未开始</span>
                          : <span className="flex items-center gap-1 text-amber-600"><Clock className="w-3 h-3" strokeWidth={1.8} />进行中</span>}
                      </span>
                      <ChevronRight className="w-4 h-4 text-ink-300" strokeWidth={1.8} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 结算详情 */}
        <div className="lg:col-span-3 space-y-6">
          {currentOrder ? (
            <>
              {/* 订单摘要 */}
              <div className="card p-6 bg-gradient-to-br from-ink-50 via-white to-gold-50/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold">
                      <Calculator className="w-8 h-8 text-white" strokeWidth={1.8} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="font-song text-2xl font-bold text-ink-900">{currentOrder.deceased.name} 治丧结算单</h2>
                        <OrderStatusBadge status={currentOrder.status} /><SpecBadge spec={currentOrder.funeralSpec} />
                      </div>
                      <p className="text-xs text-ink-500 font-mono mb-2">{currentOrder.orderNo}</p>
                      <div className="flex flex-wrap items-center gap-5 text-sm">
                        <span className="flex items-center gap-1.5 text-ink-600"><User className="w-4 h-4" strokeWidth={1.8} />{currentOrder.family.contactName}（{currentOrder.family.relationship}）</span>
                        <span className="flex items-center gap-1.5 text-ink-600"><DollarSign className="w-4 h-4 text-gold-dark" strokeWidth={1.8} />订单金额 {formatCurrency(orderTotalAmount)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-500 mb-1">净利润</p>
                    <p className={`font-song text-3xl font-bold ${profit >= 0 ? 'text-jade' : 'text-cinnabar'}`}>{profit >= 0 ? '+' : ''}{formatCurrency(profit)}</p>
                  </div>
                </div>
              </div>

              {/* 结算状态提醒 */}
              {allSettled ? (
                <div className="p-4 rounded-lg bg-jade/5 border border-jade/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-jade/10 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-5 h-5 text-jade" strokeWidth={1.8} /></div>
                  <div><p className="font-medium text-jade">本单已全部结清 ✓</p><p className="text-sm text-ink-500">所有 {orderExpenses.length} 项费用已支付，{orderShares.length} 位人员分账已确认且已发放</p></div>
                </div>
              ) : settlementNotStarted ? (
                <div className="p-4 rounded-lg bg-ink-50 border border-ink-200 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center flex-shrink-0"><AlertCircle className="w-5 h-5 text-ink-500" strokeWidth={1.8} /></div>
                  <div className="flex-1">
                    <p className="font-medium text-ink-700 mb-2">尚未开始结算</p>
                    <div className="space-y-1.5 text-sm text-ink-600">
                      <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-ink-400" />在「费用明细」Tab 中添加相关费用</p>
                      <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-ink-400" />在「收款记录」Tab 中登记家属付款</p>
                      <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-ink-400" />到「人员分账」Tab 一键生成分账</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><AlertCircle className="w-5 h-5 text-amber-600" strokeWidth={1.8} /></div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-800 mb-2">结算进行中，还差以下内容待处理：</p>
                    <div className="space-y-1.5 text-sm">
                      {!hasExpenses && <p className="flex items-center gap-2 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />尚未录入费用明细</p>}
                      {hasUnpaidExpenses && <p className="flex items-center gap-2 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />还有 <span className="font-semibold">{unpaidExpenseCount}</span> 项费用未支付（{formatCurrency(totalExpense - paidExpense)}）</p>}
                      {!hasShares && <p className="flex items-center gap-2 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />尚未生成分账明细</p>}
                      {hasUnsettledShares && <p className="flex items-center gap-2 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />还有 <span className="font-semibold">{unsettledShareCount}</span> 位人员分账未确认（{formatCurrency(totalShare - settledShare)}）</p>}
                      {unpaidOutCount > 0 && <p className="flex items-center gap-2 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />还有 <span className="font-semibold">{unpaidOutCount}</span> 位人员待发放（{formatCurrency(settledShare - paidOutShare)}）</p>}
                      {totalUnreceived > 0 && <p className="flex items-center gap-2 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />家属还有 <span className="font-semibold">{formatCurrency(totalUnreceived)}</span> 未收款</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="card overflow-hidden">
                <div className="border-b border-ink-200 px-5">
                  <div className="flex gap-1">
                    {[
                      { key: 'expenses', label: '费用明细', icon: Receipt, count: orderExpenses.length, amount: totalExpense },
                      { key: 'payments', label: '收款记录', icon: Banknote, count: orderPayments.length, amount: totalReceived },
                      { key: 'shares', label: '人员分账', icon: Users, count: orderShares.length, amount: totalShare },
                    ].map((tab) => (
                      <button key={tab.key} onClick={() => handleTabChange(tab.key as SettlementTab)}
                        className={`tab-item flex items-center gap-2 py-3.5 ${activeTab === tab.key ? 'tab-active' : ''}`}>
                        <tab.icon className="w-4 h-4" strokeWidth={1.8} />
                        {tab.label}
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-ink-100 text-ink-600">{tab.count}</span>
                        <span className="text-xs font-semibold text-gold-dark">{formatCurrency(tab.amount)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  {/* 费用明细Tab */}
                  {activeTab === 'expenses' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {expenseCategories.map((cat) => {
                          const amount = expenseByCategory[cat] || 0;
                          const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                          return (
                            <div key={cat} className="p-3 rounded-lg bg-ink-50 border border-ink-100">
                              <p className="text-xs text-ink-500 mb-1">{cat}</p>
                              <p className="font-semibold text-ink-800">{formatCurrency(amount)}</p>
                              <div className="mt-2 h-1 bg-ink-200 rounded-full overflow-hidden"><div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} /></div>
                              <p className="text-xs text-ink-400 mt-1">{pct.toFixed(1)}%</p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-ink-700">费用清单</h4>
                        <button onClick={() => setShowAddExpenseModal(true)} className="btn-gold text-sm"><Plus className="w-4 h-4" strokeWidth={1.8} />添加费用</button>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-ink-200">
                        <table className="data-table">
                          <thead><tr><th>类别</th><th>费用项目</th><th>金额</th><th>支付状态</th><th>操作</th></tr></thead>
                          <tbody>
                            {orderExpenses.map((exp) => (
                              <tr key={exp.id}>
                                <td><span className={`badge ${categoryColors[exp.category]}`}>{exp.category}</span></td>
                                <td className="font-medium">{exp.item}</td>
                                <td className="font-semibold text-cinnabar">{formatCurrency(exp.amount)}</td>
                                <td>
                                  <button onClick={() => handleToggleExpensePaid(exp.id)}
                                    className={`badge cursor-pointer transition-colors ${exp.paid ? 'bg-jade/10 text-jade border-jade/30 hover:bg-jade/20' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'}`}>
                                    {exp.paid ? <><CheckCircle2 className="w-3 h-3 mr-0.5" strokeWidth={1.8} />已支付</> : <><Clock className="w-3 h-3 mr-0.5" strokeWidth={1.8} />待支付</>}
                                  </button>
                                </td>
                                <td><button className="btn-ghost p-1.5 text-ink-400 hover:text-ink-600" onClick={() => handleToggleExpensePaid(exp.id)}>{exp.paid ? <RotateCcw className="w-4 h-4" strokeWidth={1.8} /> : <Check className="w-4 h-4" strokeWidth={1.8} />}</button></td>
                              </tr>
                            ))}
                            {orderExpenses.length === 0 && (
                              <tr><td colSpan={5} className="text-center py-12 text-ink-400"><Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" strokeWidth={1.5} /><p className="text-sm">暂无费用记录</p><p className="text-xs mt-1">点击右上角「添加费用」开始录入</p></td></tr>
                            )}
                            <tr className="bg-ink-50/80">
                              <td colSpan={2} className="text-right font-semibold text-ink-800">费用合计</td>
                              <td className="font-bold text-cinnabar">{formatCurrency(totalExpense)}</td>
                              <td colSpan={2}><p className="text-xs text-ink-500">已付 {formatCurrency(paidExpense)} / 未付 {formatCurrency(totalExpense - paidExpense)}</p></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 收款记录Tab */}
                  {activeTab === 'payments' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-gold-50/50 border border-gold/20 text-center">
                          <p className="text-xs text-ink-500 mb-1">订单总额</p>
                          <p className="font-song text-2xl font-bold text-gold-dark">{formatCurrency(orderTotalAmount)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-jade/5 border border-jade/30 text-center">
                          <p className="text-xs text-ink-500 mb-1">已收款</p>
                          <p className="font-song text-2xl font-bold text-jade">{formatCurrency(totalReceived)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-cinnabar/5 border border-cinnabar/30 text-center">
                          <p className="text-xs text-ink-500 mb-1">未收款</p>
                          <p className="font-song text-2xl font-bold text-cinnabar">{formatCurrency(totalUnreceived)}</p>
                        </div>
                      </div>

                      {orderTotalAmount > 0 && (
                        <div className="p-4 rounded-lg bg-ink-50 border border-ink-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-ink-600">收款进度</span>
                            <span className="text-sm font-semibold text-ink-800">{orderTotalAmount > 0 ? ((totalReceived / orderTotalAmount) * 100).toFixed(1) : 0}%</span>
                          </div>
                          <div className="h-3 bg-ink-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-jade to-jade-dark rounded-full transition-all" style={{ width: `${Math.min(100, orderTotalAmount > 0 ? (totalReceived / orderTotalAmount) * 100 : 0)}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-ink-700">收款记录</h4>
                        <button onClick={() => setShowAddPaymentModal(true)} className="btn-gold text-sm"><Plus className="w-4 h-4" strokeWidth={1.8} />登记收款</button>
                      </div>

                      {orderPayments.length > 0 ? (
                        <div className="space-y-3">
                          {orderPayments.map((pay) => (
                            <div key={pay.id} className="p-4 rounded-lg bg-white border border-ink-100 hover:border-ink-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-jade/10 flex items-center justify-center text-lg">{methodIcons[pay.method]}</div>
                                  <div>
                                    <p className="font-medium text-ink-900">{formatCurrency(pay.amount)}</p>
                                    <p className="text-xs text-ink-500">{pay.method} · {pay.operator} · {new Date(pay.date).toLocaleDateString('zh-CN')}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="badge bg-jade/10 text-jade border-jade/30">已到账</span>
                                  {pay.remark && <p className="text-xs text-ink-400 mt-1">{pay.remark}</p>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-ink-400">
                          <Banknote className="w-10 h-10 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
                          <p className="text-sm">暂无收款记录</p>
                          <p className="text-xs mt-1">点击右上角「登记收款」开始录入</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 人员分账Tab */}
                  {activeTab === 'shares' && (
                    <div className="space-y-6">
                      {orderSchedules.length > 0 && orderShares.length === 0 && (
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-amber-600" strokeWidth={1.8} />
                            <div><p className="font-medium text-amber-800">可自动生成分账</p><p className="text-sm text-amber-700">根据排班记录和人员日薪，为 {orderSchedules.length} 人次计算分账</p></div>
                          </div>
                          <button onClick={handleGenerateShares} className="btn-gold text-sm"><TrendingDown className="w-4 h-4" strokeWidth={1.8} />一键生成分账</button>
                        </div>
                      )}
                      {orderSchedules.length === 0 && (
                        <div className="p-4 rounded-lg bg-ink-50 border border-ink-200 flex items-center justify-between">
                          <div className="flex items-center gap-3"><Users className="w-5 h-5 text-ink-500" strokeWidth={1.8} /><div><p className="font-medium text-ink-700">暂无排班记录</p><p className="text-sm text-ink-500">请先到执事排班页面为该订单安排人员</p></div></div>
                          <button onClick={() => navigate(`/scheduling?orderId=${selectedOrder}`)} className="btn-outline text-sm">去排班</button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-semibold text-ink-700">人员分账明细</h4>
                          {orderShares.length > 0 && (
                            <div className="flex rounded-lg border border-ink-200 overflow-hidden">
                              {(['all', 'unpaid', 'paid'] as const).map((f) => (
                                <button key={f} onClick={() => setShareFilter(f)}
                                  className={`px-3 py-1 text-xs transition-colors ${shareFilter === f ? 'bg-gold text-white' : 'bg-white text-ink-600 hover:bg-ink-50'}`}>
                                  {{ all: '全部', unpaid: '待发放', paid: '已发放' }[f]}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {orderShares.length > 0 && (
                          <div className="flex gap-2">
                            {hasUnsettledShares ? (
                              <button onClick={handleSettleAllShares} className="btn-gold text-sm"><CheckCircle2 className="w-4 h-4" strokeWidth={1.8} />一键全部确认</button>
                            ) : allSettled ? (
                              <button onClick={handleUnsettleAllShares} className="btn-outline text-sm"><RotateCcw className="w-4 h-4" strokeWidth={1.8} />全部改回待结算</button>
                            ) : null}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredShares.map((share) => {
                          const s = staff.find((x) => x.id === share.staffId);
                          if (!s) return null;
                          const pct = totalShare > 0 ? (share.total / totalShare) * 100 : 0;
                          return (
                            <div key={share.id} className={`card card-hover p-4 border-2 transition-all ${share.paidOut ? 'border-jade/40 bg-jade/5' : share.settled ? 'border-gold/30 bg-gold-50/30' : 'border-transparent'}`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-linen to-linen-dark flex items-center justify-center text-white font-semibold shadow-sm">{s.name.charAt(0)}</div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-semibold text-ink-900">{s.name}</h5>
                                      <button onClick={() => handleToggleShareSettled(share.id)}
                                        className={`badge cursor-pointer transition-colors ${share.settled ? 'bg-jade/10 text-jade border-jade/30 hover:bg-jade/20' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'}`}>
                                        {share.settled ? '已确认' : '待确认'}
                                      </button>
                                      {share.paidOut && <span className="badge bg-jade/20 text-jade border-jade/40">已发放</span>}
                                    </div>
                                    <p className="text-xs text-ink-500">{s.role} · {s.phone}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-song text-xl font-bold text-gold-dark">{formatCurrency(share.total)}</p>
                                  <div className="w-20 h-1.5 mt-2 bg-ink-100 rounded-full overflow-hidden ml-auto"><div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} /></div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-ink-100">
                                <div className="text-center"><p className="text-xs text-ink-500">基本工资</p><p className="font-semibold text-ink-800">{formatCurrency(share.baseAmount)}</p></div>
                                <div className="text-center"><p className="text-xs text-ink-500">奖金/补贴</p>
                                  <input type="number" value={share.bonus} onChange={(e) => { const bonus = parseInt(e.target.value) || 0; updateStaffShare(share.id, { bonus, total: share.baseAmount + bonus }); }}
                                    className="w-full text-center text-sm border-b border-ink-200 focus:outline-none focus:border-gold font-semibold text-amber-600" />
                                </div>
                                <div className="text-center"><p className="text-xs text-ink-500">日薪标准</p><p className="font-semibold text-linen">{formatCurrency(s.dailyRate)}</p></div>
                              </div>

                              {/* 发放信息 */}
                              {share.settled && (
                                <div className="mt-3 pt-3 border-t border-ink-100">
                                  {share.paidOut ? (
                                    <div className="flex items-center justify-between">
                                      <div className="text-xs text-ink-500 space-y-0.5">
                                        <p>发放方式：{share.paidMethod} · 经办人：{share.paidOperator}</p>
                                        <p>发放日期：{share.paidDate}</p>
                                      </div>
                                      <button onClick={() => handleCancelPayout(share.id)} className="text-xs text-ink-400 hover:text-ink-600">撤回发放</button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-amber-600 flex items-center gap-1"><Clock className="w-3 h-3" strokeWidth={1.8} />待发放</span>
                                      <button onClick={() => setShowPayoutModal(share.id)} className="text-xs font-medium text-linen hover:text-linen-dark">记录发放</button>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="mt-3 pt-3 border-t border-ink-100 flex justify-between items-center">
                                <span className="text-xs text-ink-500">排班 {orderSchedules.filter(x => x.staffId === share.staffId).length} 个班次</span>
                                <button onClick={() => handleToggleShareSettled(share.id)}
                                  className={`text-sm font-medium ${share.settled ? 'text-ink-500 hover:text-ink-700' : 'text-linen hover:text-linen-dark'}`}>
                                  {share.settled ? '改为待确认' : '确认结算'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {orderShares.length === 0 && (
                          <div className="col-span-2 text-center py-12 text-ink-400 border-2 border-dashed border-ink-200 rounded-xl">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                            <p className="text-sm">{orderSchedules.length > 0 ? '点击上方「一键生成分账」按钮，根据排班自动计算' : '请先安排排班，再生成分账'}</p>
                          </div>
                        )}
                      </div>

                      {orderShares.length > 0 && (
                        <div className="p-5 rounded-xl bg-gradient-to-r from-gold-50 to-amber-50 border border-gold/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-ink-600 mb-1 flex items-center gap-1.5"><DollarSign className="w-4 h-4" strokeWidth={1.8} />人员分账合计</p>
                              <p className="font-song text-2xl font-bold text-gold-dark">{formatCurrency(totalShare)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-ink-600 mb-1">已发放 / 待发放</p>
                              <p className="text-lg font-semibold">
                                <span className="text-jade">{formatCurrency(paidOutShare)}</span>
                                <span className="text-ink-300 mx-2">/</span>
                                <span className="text-cinnabar">{formatCurrency(settledShare - paidOutShare)}</span>
                              </p>
                              <p className="text-xs text-ink-500 mt-1">{unpaidOutCount} 人待发放</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card p-16 text-center text-ink-400">
              <Calculator className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
              <p className="text-lg mb-1">请选择需要结算的订单</p>
              <p className="text-sm">从左侧订单列表中选择一个订单开始结算</p>
            </div>
          )}
        </div>
      </div>

      {/* 添加费用弹窗 */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
            <div className="p-5 border-b border-ink-100 flex items-center justify-between">
              <h3 className="font-song text-lg font-semibold text-ink-900">添加费用</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="p-1 rounded-md hover:bg-ink-100 text-ink-400"><X className="w-5 h-5" strokeWidth={1.8} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-ink-700 mb-2">费用类别</label>
                <div className="grid grid-cols-5 gap-2">
                  {expenseCategories.map((cat) => (
                    <button key={cat} onClick={() => setNewExpense({ ...newExpense, category: cat })}
                      className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${newExpense.category === cat ? 'border-gold bg-gold-50 text-gold-dark' : 'border-ink-200 text-ink-500 hover:border-ink-300'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-medium text-ink-700 mb-2">费用项目</label><input type="text" value={newExpense.item} onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })} className="input-base" placeholder="例如：豪华寿衣、灵堂租赁等" /></div>
              <div><label className="block text-sm font-medium text-ink-700 mb-2">金额（元）</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">¥</span><input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} className="input-base pl-7" placeholder="0.00" /></div></div>
              <div className="flex items-center gap-3"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newExpense.paid} onChange={(e) => setNewExpense({ ...newExpense, paid: e.target.checked })} className="w-4 h-4 rounded border-ink-300 text-gold focus:ring-gold" /><span className="text-sm text-ink-700">已支付</span></label></div>
            </div>
            <div className="p-5 border-t border-ink-100 flex justify-end gap-2">
              <button onClick={() => setShowAddExpenseModal(false)} className="btn-outline">取消</button>
              <button onClick={handleAddExpense} disabled={!newExpense.item || !newExpense.amount} className="btn-gold"><Plus className="w-4 h-4" strokeWidth={1.8} />添加</button>
            </div>
          </div>
        </div>
      )}

      {/* 登记收款弹窗 */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
            <div className="p-5 border-b border-ink-100 flex items-center justify-between">
              <h3 className="font-song text-lg font-semibold text-ink-900">登记收款</h3>
              <button onClick={() => setShowAddPaymentModal(false)} className="p-1 rounded-md hover:bg-ink-100 text-ink-400"><X className="w-5 h-5" strokeWidth={1.8} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-ink-50 border border-ink-100">
                <div className="flex justify-between text-sm"><span className="text-ink-500">订单总额</span><span className="font-semibold text-gold-dark">{formatCurrency(orderTotalAmount)}</span></div>
                <div className="flex justify-between text-sm mt-1"><span className="text-ink-500">已收款</span><span className="font-semibold text-jade">{formatCurrency(totalReceived)}</span></div>
                <div className="flex justify-between text-sm mt-1"><span className="text-ink-500">待收款</span><span className="font-semibold text-cinnabar">{formatCurrency(totalUnreceived)}</span></div>
              </div>
              <div><label className="block text-sm font-medium text-ink-700 mb-2">收款金额（元）</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">¥</span><input type="number" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} className="input-base pl-7" placeholder="0.00" /></div></div>
              <div><label className="block text-sm font-medium text-ink-700 mb-2">收款方式</label>
                <div className="grid grid-cols-5 gap-2">
                  {paymentMethods.map((m) => (
                    <button key={m} onClick={() => setNewPayment({ ...newPayment, method: m })}
                      className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${newPayment.method === m ? 'border-gold bg-gold-50 text-gold-dark' : 'border-ink-200 text-ink-500 hover:border-ink-300'}`}>
                      {methodIcons[m]} {m}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-medium text-ink-700 mb-2">备注</label><input type="text" value={newPayment.remark} onChange={(e) => setNewPayment({ ...newPayment, remark: e.target.value })} className="input-base" placeholder="例如：首付款、尾款等" /></div>
              <div><label className="block text-sm font-medium text-ink-700 mb-2">经办人</label><input type="text" value={newPayment.operator} onChange={(e) => setNewPayment({ ...newPayment, operator: e.target.value })} className="input-base" /></div>
            </div>
            <div className="p-5 border-t border-ink-100 flex justify-end gap-2">
              <button onClick={() => setShowAddPaymentModal(false)} className="btn-outline">取消</button>
              <button onClick={handleAddPayment} disabled={!newPayment.amount} className="btn-gold"><Plus className="w-4 h-4" strokeWidth={1.8} />确认收款</button>
            </div>
          </div>
        </div>
      )}

      {/* 发放弹窗 */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-slide-up">
            <div className="p-5 border-b border-ink-100 flex items-center justify-between">
              <h3 className="font-song text-lg font-semibold text-ink-900">记录发放</h3>
              <button onClick={() => setShowPayoutModal(null)} className="p-1 rounded-md hover:bg-ink-100 text-ink-400"><X className="w-5 h-5" strokeWidth={1.8} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-ink-700 mb-2">发放方式</label>
                <div className="grid grid-cols-4 gap-2">
                  {payoutMethods.map((m) => (
                    <button key={m} onClick={() => setPayoutForm({ ...payoutForm, method: m })}
                      className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${payoutForm.method === m ? 'border-gold bg-gold-50 text-gold-dark' : 'border-ink-200 text-ink-500 hover:border-ink-300'}`}>{m}</button>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-medium text-ink-700 mb-2">发放日期</label><input type="date" value={payoutForm.date} onChange={(e) => setPayoutForm({ ...payoutForm, date: e.target.value })} className="input-base" /></div>
              <div><label className="block text-sm font-medium text-ink-700 mb-2">经办人</label><input type="text" value={payoutForm.operator} onChange={(e) => setPayoutForm({ ...payoutForm, operator: e.target.value })} className="input-base" /></div>
            </div>
            <div className="p-5 border-t border-ink-100 flex justify-end gap-2">
              <button onClick={() => setShowPayoutModal(null)} className="btn-outline">取消</button>
              <button onClick={() => handlePayout(showPayoutModal)} className="btn-gold"><Check className="w-4 h-4" strokeWidth={1.8} />确认发放</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
