import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime } from '@/utils/storage';
import { OrderStatusBadge } from '@/components/shared/StatusBadges';
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Phone,
  MessageCircle,
  Handshake,
  User,
  Calendar,
  FileText,
  ChevronRight,
  Send,
  Paperclip,
  Bell,
  CheckCircle,
} from 'lucide-react';

const methodIcons = {
  '电话': Phone,
  '微信': MessageCircle,
  '面谈': Handshake,
};

const methodColors = {
  '电话': 'bg-linen/10 text-linen border-linen/30',
  '微信': 'bg-jade/10 text-jade border-jade/30',
  '面谈': 'bg-gold/10 text-gold-dark border-gold/30',
};

export default function Communication() {
  const { orders, communications, addCommunication } = useAppStore();
  const [selectedOrder, setSelectedOrder] = useState(orders[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
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

  const orderComms = communications
    .filter((c) => c.orderId === selectedOrder)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredOrders = orders.filter(
    (o) =>
      o.deceased.name.includes(searchQuery) ||
      o.family.contactName.includes(searchQuery) ||
      o.orderNo.includes(searchQuery)
  );

  const currentOrder = orders.find((o) => o.id === selectedOrder);

  const displayComms = orderComms.filter(
    (c) => methodFilter === 'all' || c.method === methodFilter
  );

  const handleSubmit = () => {
    if (selectedOrder && newComm.content) {
      addCommunication({
        orderId: selectedOrder,
        date: new Date().toISOString(),
        method: newComm.method,
        content: newComm.content,
        operator: newComm.operator,
        followUp: newComm.followUp || undefined,
      });
      setShowAddModal(false);
      setNewComm({ method: '电话', content: '', operator: '周师傅', followUp: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="搜索订单、逝者、家属..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 w-64"
            />
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-ink-50 border border-ink-200">
            <Filter className="w-4 h-4 text-ink-500" strokeWidth={1.8} />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-transparent px-2 py-1 text-sm text-ink-700 focus:outline-none"
            >
              <option value="all">全部沟通方式</option>
              <option value="电话">电话</option>
              <option value="微信">微信</option>
              <option value="面谈">面谈</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            if (!selectedOrder) {
              alert('请先选择订单');
              return;
            }
            setShowAddModal(true);
          }}
          className="btn-gold"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          添加沟通记录
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[700px]">
        {/* 订单列表 */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-ink-200 bg-ink-50">
            <h3 className="section-title text-base">订单列表</h3>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            {filteredOrders.map((order) => {
              const commCount = communications.filter(
                (c) => c.orderId === order.id
              ).length;
              const hasFollowUp = communications.some(
                (c) => c.orderId === order.id && c.followUp
              );
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order.id)}
                  className={`p-4 border-b border-ink-100 cursor-pointer transition-colors ${
                    selectedOrder === order.id
                      ? 'bg-gold-50/50 border-l-4 border-l-gold'
                      : 'hover:bg-ink-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-ink-900">
                        {order.deceased.name}
                        <span className="text-ink-400 text-xs ml-1.5">
                          {order.deceased.age}岁
                        </span>
                      </p>
                      <p className="text-xs text-ink-500 font-mono mt-0.5">
                        {order.orderNo}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-500 flex items-center gap-1">
                      <User className="w-3 h-3" strokeWidth={1.8} />
                      {order.family.contactName} ({order.family.relationship})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-ink-500">
                        <MessageSquare className="w-3 h-3" strokeWidth={1.8} />
                        {commCount}
                      </span>
                      {hasFollowUp && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Bell className="w-3 h-3 animate-pulse-soft" strokeWidth={1.8} />
                          待跟进
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 沟通记录 */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col">
          {currentOrder ? (
            <>
              {/* 订单信息头 */}
              <div className="p-5 border-b border-ink-200 bg-gradient-to-r from-ink-50 to-gold-50/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-linen to-linen-dark flex items-center justify-center text-white font-song text-2xl font-bold shadow-md">
                      {currentOrder.deceased.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="font-song text-xl font-bold text-ink-900">
                          {currentOrder.deceased.name} 治丧沟通
                        </h2>
                        <OrderStatusBadge status={currentOrder.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-ink-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" strokeWidth={1.8} />
                          {currentOrder.family.contactName}
                          <span className="text-ink-400">
                            ({currentOrder.family.relationship})
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" strokeWidth={1.8} />
                          {currentOrder.family.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" strokeWidth={1.8} />
                          出殡 {currentOrder.auspiciousDates.funeralDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-gold text-sm"
                  >
                    <Send className="w-4 h-4" strokeWidth={1.8} />
                    记录沟通
                  </button>
                </div>
              </div>

              {/* 沟通时间线 */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
                {displayComms.length > 0 ? (
                  <div className="space-y-6">
                    {displayComms.map((comm, idx) => {
                      const Icon = methodIcons[comm.method] || MessageSquare;
                      const colorConfig = methodColors[comm.method];
                      return (
                        <div key={comm.id} className="relative animate-fade-in">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border ${colorConfig}`}
                              >
                                <Icon className="w-4 h-4" strokeWidth={1.8} />
                              </div>
                              {idx < displayComms.length - 1 && (
                                <div className="flex-1 w-0.5 bg-ink-200 my-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              <div className="card card-hover">
                                <div className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={`badge ${colorConfig}`}
                                      >
                                        <Icon className="w-3 h-3 mr-0.5" strokeWidth={1.8} />
                                        {comm.method}
                                      </span>
                                      <span className="text-xs text-ink-500 flex items-center gap-1">
                                        <User className="w-3 h-3" strokeWidth={1.8} />
                                        {comm.operator} 记录
                                      </span>
                                    </div>
                                    <span className="text-xs text-ink-400 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" strokeWidth={1.8} />
                                      {formatDateTime(comm.date)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
                                    {comm.content}
                                  </p>
                                  {comm.attachments && comm.attachments.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-ink-100">
                                      <p className="text-xs text-ink-500 mb-2 flex items-center gap-1">
                                        <FileText className="w-3 h-3" strokeWidth={1.8} />
                                        附件
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {comm.attachments.map((att, i) => (
                                          <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-ink-50 border border-ink-200 text-xs text-ink-600 hover:bg-ink-100 cursor-pointer"
                                          >
                                            <Paperclip className="w-3 h-3" strokeWidth={1.8} />
                                            {att}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {comm.followUp && (
                                    <div className="mt-3 pt-3 border-t border-ink-100">
                                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                                        <div className="flex items-start gap-2">
                                          <Bell className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0 animate-pulse-soft" strokeWidth={1.8} />
                                          <div>
                                            <p className="text-xs font-semibold text-amber-800 mb-1">
                                              待跟进事项
                                            </p>
                                            <p className="text-sm text-amber-700">
                                              {comm.followUp}
                                            </p>
                                            <button className="mt-2 text-xs text-jade flex items-center gap-1 font-medium">
                                              <CheckCircle className="w-3 h-3" strokeWidth={1.8} />
                                              标记已完成
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 text-ink-400">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" strokeWidth={1.5} />
                    <p className="text-lg mb-1">暂无沟通记录</p>
                    <p className="text-sm mb-4">开始记录与家属的第一次沟通吧</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="btn-gold"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2} />
                      添加第一条记录
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-ink-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
                <p className="text-lg mb-1">请选择一个订单</p>
                <p className="text-sm">查看和记录家属沟通内容</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 添加沟通弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-lg p-6 animate-slide-up">
            <h3 className="section-title mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gold" strokeWidth={1.8} />
              添加沟通记录
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label-base">沟通方式</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(methodIcons) as Array<keyof typeof methodIcons>).map(
                    (m) => {
                      const Icon = methodIcons[m];
                      const selected = newComm.method === m;
                      const config = methodColors[m];
                      return (
                        <label
                          key={m}
                          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selected
                              ? config + ' border-opacity-100'
                              : 'border-ink-200 hover:border-ink-300 text-ink-500'
                          }`}
                        >
                          <input
                            type="radio"
                            name="method"
                            checked={selected}
                            onChange={() =>
                              setNewComm({ ...newComm, method: m })
                            }
                            className="hidden"
                          />
                          <Icon className="w-5 h-5" strokeWidth={1.8} />
                          <span className="text-sm font-medium">{m}</span>
                        </label>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="label-base">沟通内容</label>
                <textarea
                  value={newComm.content}
                  onChange={(e) => setNewComm({ ...newComm, content: e.target.value })}
                  className="input-base min-h-[120px] resize-none"
                  placeholder="请记录与家属沟通的详细内容，包括需求、确认事项、特殊要求等..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base">记录人</label>
                  <input
                    type="text"
                    value={newComm.operator}
                    onChange={(e) => setNewComm({ ...newComm, operator: e.target.value })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base">待跟进事项</label>
                  <input
                    type="text"
                    value={newComm.followUp}
                    onChange={(e) => setNewComm({ ...newComm, followUp: e.target.value })}
                    className="input-base"
                    placeholder="可选，如：明天确认寿衣款式"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-ink-100">
              <button onClick={() => setShowAddModal(false)} className="btn-outline">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newComm.content}
                className="btn-primary"
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
