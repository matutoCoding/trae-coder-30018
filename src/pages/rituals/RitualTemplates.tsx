import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  ScrollText,
  MapPin,
  Clock,
  ChevronRight,
  Play,
  AlertCircle,
  User,
  Plus,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';

export default function RitualTemplates() {
  const { ritualTemplates } = useAppStore();
  const [selectedTemplate, setSelectedTemplate] = useState(ritualTemplates[0]?.id || null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  const regions = Array.from(new Set(ritualTemplates.map((r) => r.region)));

  const filteredTemplates = ritualTemplates.filter((r) => {
    const matchSearch =
      r.name.includes(searchQuery) ||
      r.description.includes(searchQuery) ||
      r.region.includes(searchQuery);
    const matchRegion = regionFilter === 'all' || r.region === regionFilter;
    return matchSearch && matchRegion;
  });

  const currentTemplate = ritualTemplates.find((r) => r.id === selectedTemplate);
  const totalDuration = currentTemplate?.steps.reduce((sum, s) => sum + s.duration, 0) || 0;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
              <input
                type="text"
                placeholder="搜索流程模板..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-9 w-64"
              />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-ink-50 border border-ink-200">
              <Filter className="w-4 h-4 text-ink-500" strokeWidth={1.8} />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="bg-transparent px-2 py-1 text-sm text-ink-700 focus:outline-none"
              >
                <option value="all">全部地区</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-gold">
            <Plus className="w-4 h-4" strokeWidth={2} />
            新建模板
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-ink-700 px-1">流程模板库</h3>
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`card card-hover p-4 cursor-pointer transition-all border-2 ${
                selectedTemplate === template.id
                  ? 'border-gold shadow-gold'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedTemplate === template.id
                      ? 'bg-gold text-white'
                      : 'bg-ink-50 text-ink-500 border border-ink-200'
                  }`}
                >
                  <ScrollText className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-song font-semibold text-ink-900 mb-1">
                    {template.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-ink-500 mb-2">
                    <MapPin className="w-3 h-3" strokeWidth={1.8} />
                    {template.region}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="badge bg-ink-100 text-ink-600">
                      {template.steps.length} 个仪节
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        selectedTemplate === template.id
                          ? 'text-gold translate-x-0.5'
                          : 'text-ink-400'
                      }`}
                      strokeWidth={1.8}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="card p-8 text-center text-ink-400">
              <ScrollText className="w-10 h-10 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
              <p className="text-sm">未找到匹配的模板</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {currentTemplate ? (
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-ink-200 bg-gradient-to-br from-ink-50 to-gold-50/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-song text-2xl font-bold text-ink-900 mb-2">
                      {currentTemplate.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-ink-600">
                        <MapPin className="w-4 h-4 text-linen" strokeWidth={1.8} />
                        {currentTemplate.region}
                      </span>
                      <span className="flex items-center gap-1.5 text-ink-600">
                        <Clock className="w-4 h-4 text-gold-dark" strokeWidth={1.8} />
                        总时长约 {formatDuration(totalDuration)}
                      </span>
                      <span className="flex items-center gap-1.5 text-ink-600">
                        <Play className="w-4 h-4 text-jade" strokeWidth={1.8} />
                        {currentTemplate.steps.length} 个仪节
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-outline text-sm">编辑模板</button>
                    <button className="btn-linen text-sm">应用到订单</button>
                  </div>
                </div>
                <p className="text-sm text-ink-600 leading-relaxed p-4 bg-white/60 rounded-lg border border-ink-100">
                  {currentTemplate.description}
                </p>
              </div>

              <div className="p-6">
                <h3 className="section-title mb-6 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gold rounded-full" />
                  仪节流程时序
                </h3>

                <div className="relative pl-2">
                  {currentTemplate.steps.map((step, idx) => {
                  const isExpanded = expandedStep === step.id;
                  const isLast = idx === currentTemplate.steps.length - 1;
                  return (
                    <div key={step.id} className="relative mb-0">
                      {!isLast && (
                        <div className="absolute left-[17px] top-8 w-0.5 h-[calc(100%-2rem)] bg-gradient-to-b from-gold/60 to-linen/60" />
                      )}
                      <div className="relative">
                        <div
                          className={`absolute left-0 top-1 w-9 h-9 rounded-full flex items-center justify-center z-10 font-song text-sm font-bold transition-all ${
                            isExpanded
                              ? 'bg-gold text-white shadow-gold scale-110'
                              : 'bg-ink-100 text-ink-600 border-2 border-ink-300'
                          }`}
                        >
                          {step.order}
                        </div>

                        <div
                          className="ml-12 pl-6 pt-1 cursor-pointer"
                          onClick={() =>
                            setExpandedStep(isExpanded ? null : step.id)
                          }
                        >
                          <div className="card p-4 card-hover">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-song font-semibold text-ink-900 text-lg">
                                    {step.title}
                                  </h4>
                                  <span className="badge bg-linen/10 text-linen border-linen/30">
                                    <Clock className="w-3 h-3 mr-0.5" strokeWidth={1.8} />
                                    {formatDuration(step.duration)}
                                  </span>
                                  <span className="badge bg-jade/10 text-jade border-jade/30">
                                    <User className="w-3 h-3 mr-0.5" strokeWidth={1.8} />
                                    {step.responsibleRole}
                                  </span>
                                </div>
                                <p className="text-sm text-ink-600">
                                  {step.description}
                                </p>
                                {isExpanded && (
                                  <div className="mt-4 pt-4 border-t border-ink-100 animate-fade-in">
                                    <div className="space-y-3">
                                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                                        <div className="flex items-start gap-2">
                                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                                          <div>
                                            <p className="text-xs font-semibold text-amber-800 mb-1">
                                              注意事项
                                            </p>
                                            <p className="text-sm text-amber-700 leading-relaxed">
                                              {step.notes || '无特殊注意事项'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg bg-ink-50 border border-ink-100">
                                          <p className="text-xs text-ink-500 mb-1">执行要点</p>
                                          <p className="text-sm text-ink-700">
                                            由{step.responsibleRole}主持，家属需全程参与配合
                                          </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-ink-50 border border-ink-100">
                                          <p className="text-xs text-ink-500 mb-1">所需物资</p>
                                          <p className="text-sm text-ink-700">
                                            香烛、纸钱、供品等提前准备
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-ink-400 transition-transform flex-shrink-0 ml-3 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                                strokeWidth={1.8}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center text-ink-400">
              <ScrollText className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
              <p className="text-lg mb-1">请选择一个流程模板</p>
              <p className="text-sm">点击左侧模板列表查看详细仪节</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
