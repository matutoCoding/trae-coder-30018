import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BandLevelBadge } from '@/components/shared/StatusBadges';
import { formatCurrency } from '@/utils/storage';
import {
  Music,
  Plus,
  Search,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Star,
  Users,
  ChevronRight,
  Mic2,
  Play,
} from 'lucide-react';

export default function BandSchedule() {
  const { bands, bandSchedules, orders } = useAppStore();
  const [selectedBand, setSelectedBand] = useState(bands[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentBand = bands.find((b) => b.id === selectedBand);
  const bandScheduleList = bandSchedules.filter((bs) => bs.bandId === selectedBand);

  const filteredBands = bands.filter(
    (b) => b.name.includes(searchQuery) || b.leader.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card card-hover p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Music className="w-6 h-6 text-gold-dark" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-ink-500">乐队总数</p>
              <p className="text-2xl font-bold text-ink-900 font-song">{bands.length}</p>
            </div>
          </div>
        </div>
        <div className="card card-hover p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linen/10 border border-linen/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-linen" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-ink-500">乐师人数</p>
              <p className="text-2xl font-bold text-ink-900 font-song">
                {bands.reduce((sum, b) => sum + b.members.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card card-hover p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-jade/10 border border-jade/30 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-jade" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-ink-500">本月场次</p>
              <p className="text-2xl font-bold text-ink-900 font-song">{bandSchedules.length}</p>
            </div>
          </div>
        </div>
        <div className="card card-hover p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cinnabar/10 border border-cinnabar/30 flex items-center justify-center">
              <Star className="w-6 h-6 text-cinnabar" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-ink-500">金牌乐队</p>
              <p className="text-2xl font-bold text-ink-900 font-song">
                {bands.filter((b) => b.level === '金牌').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="搜索乐队名称、队长..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 w-64"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline">
            <Mic2 className="w-4 h-4" strokeWidth={1.8} />
            曲目管理
          </button>
          <button className="btn-gold">
            <Plus className="w-4 h-4" strokeWidth={2} />
            新增乐队
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 乐队列表 */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-ink-700 px-1">乐队列表</h3>
          {filteredBands.map((band) => (
            <div
              key={band.id}
              onClick={() => setSelectedBand(band.id)}
              className={`card card-hover p-4 cursor-pointer transition-all border-2 ${
                selectedBand === band.id
                  ? 'border-gold shadow-gold'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                      selectedBand === band.id
                        ? 'bg-gold text-white'
                        : band.level === '金牌'
                        ? 'bg-gold/10 text-gold-dark border border-gold/30'
                        : band.level === '资深'
                        ? 'bg-linen/10 text-linen border border-linen/30'
                        : 'bg-ink-50 text-ink-600 border border-ink-200'
                    }`}
                  >
                    <Music className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h4 className="font-song font-semibold text-ink-900">
                      {band.name}
                    </h4>
                    <p className="text-xs text-ink-500">队长：{band.leader}</p>
                  </div>
                </div>
                <BandLevelBadge level={band.level} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" strokeWidth={1.8} />
                    {band.members.length}人
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" strokeWidth={1.8} />
                    {bandSchedules.filter((s) => s.bandId === band.id).length}场
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-500">出场费</p>
                  <p className="font-semibold text-gold-dark">{formatCurrency(band.fee)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 乐队详情 */}
        <div className="lg:col-span-2 space-y-6">
          {currentBand ? (
            <>
              {/* 乐队信息卡 */}
              <div className="card overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-ink-50 via-gold-50/30 to-ink-50 border-b border-ink-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold">
                        <Music className="w-8 h-8 text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h2 className="font-song text-2xl font-bold text-ink-900 flex items-center gap-2">
                          {currentBand.name}
                          <BandLevelBadge level={currentBand.level} />
                        </h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-ink-600">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" strokeWidth={1.8} />
                            {currentBand.members.length}位乐师
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-gold" fill="currentColor" strokeWidth={1.8} />
                            出场费 {formatCurrency(currentBand.fee)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-outline text-sm">编辑乐队</button>
                      <button className="btn-gold text-sm">
                        <Calendar className="w-4 h-4" strokeWidth={1.8} />
                        安排演出
                      </button>
                    </div>
                  </div>
                </div>

                {/* 成员列表 */}
                <div className="p-6">
                  <h3 className="section-title mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gold rounded-full" />
                    乐队成员
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentBand.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-ink-50 border border-ink-100 hover:bg-ink-100 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-linen/10 border border-linen/30 flex items-center justify-center">
                          <Mic2 className="w-4 h-4 text-linen" strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink-900">{member.name}</p>
                          <p className="text-xs text-gold-dark font-medium">
                            {member.instrument}
                          </p>
                        </div>
                        <a
                          href={`tel:${member.phone}`}
                          className="btn-ghost p-2 text-jade"
                        >
                          <Phone className="w-4 h-4" strokeWidth={1.8} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 演出排班 */}
              <div className="card overflow-hidden">
                <div className="p-5 border-b border-ink-200 flex items-center justify-between">
                  <h3 className="section-title flex items-center gap-2">
                    <span className="w-1 h-5 bg-linen rounded-full" />
                    演出安排
                  </h3>
                  <span className="badge bg-linen/10 text-linen border-linen/30">
                    {bandScheduleList.length} 场安排
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  {bandScheduleList.map((schedule) => {
                    const order = orders.find((o) => o.id === schedule.orderId);
                    return (
                      <div
                        key={schedule.id}
                        className="relative pl-8 pb-5 last:pb-0 border-l-2 border-linen/30 last:border-l-0"
                      >
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-linen border-4 border-white shadow-sm" />
                        <div className="card p-4 ml-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-ink-900 mb-1">
                                {order?.deceased.name || '治丧'} 治丧演出
                              </h4>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-ink-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-linen" strokeWidth={1.8} />
                                  {schedule.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-gold-dark" strokeWidth={1.8} />
                                  {schedule.timeSlot}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-cinnabar" strokeWidth={1.8} />
                                  {schedule.location.length > 30
                                    ? schedule.location.slice(0, 30) + '...'
                                    : schedule.location}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-ink-300" strokeWidth={1.8} />
                          </div>
                          <div className="pt-3 border-t border-ink-100">
                            <p className="text-xs text-ink-500 mb-2">演出曲目：</p>
                            <div className="flex flex-wrap gap-1.5">
                              {schedule.setlist.map((song, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-ink-50 border border-ink-200 text-xs text-ink-700"
                                >
                                  <Music className="w-3 h-3 text-gold" strokeWidth={1.8} />
                                  {song}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {bandScheduleList.length === 0 && (
                    <div className="text-center py-8 text-ink-400">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
                      <p className="text-sm">暂无演出安排</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card p-12 text-center text-ink-400">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
              <p className="text-lg mb-1">请选择一支乐队</p>
              <p className="text-sm">点击左侧乐队查看详情与排班</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
