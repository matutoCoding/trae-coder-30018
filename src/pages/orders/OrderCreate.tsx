import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { FuneralOrder } from '@/types';
import { formatCurrency } from '@/utils/storage';
import {
  ArrowLeft,
  Save,
  User,
  CalendarDays,
  Clock,
  MapPinHouse,
  Phone,
  ScrollText,
  Crown,
  Sparkles,
} from 'lucide-react';

const specOptions = [
  { key: 'standard', label: '标准套餐', price: 25800, desc: '基础治丧服务，包含核心礼仪', icon: '📜' },
  { key: 'deluxe', label: '豪华套餐', price: 38800, desc: '完整传统礼仪，纸扎物资丰富', icon: '🎋' },
  { key: 'premium', label: '尊贵套餐', price: 68800, desc: '最高规格，司仪全程，法事超度', icon: '👑' },
];

const auspiciousTimeOptions = [
  '子时 23:00-01:00',
  '丑时 01:00-03:00',
  '寅时 03:00-05:00',
  '卯时 05:00-07:00',
  '辰时 07:00-09:00',
  '巳时 09:00-11:00',
  '午时 11:00-13:00',
  '未时 13:00-15:00',
  '申时 15:00-17:00',
  '酉时 17:00-19:00',
];

export default function OrderCreate() {
  const navigate = useNavigate();
  const addOrder = useAppStore((s) => s.addOrder);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FuneralOrder>>({
    deceased: {
      name: '',
      gender: 'male',
      age: 0,
      birthDate: '',
      deathDate: new Date().toISOString().split('T')[0],
      deathPlace: '家中',
    },
    family: {
      contactName: '',
      relationship: '长子',
      phone: '',
      address: '',
    },
    funeralSpec: 'standard',
    auspiciousDates: {
      funeralDate: '',
      funeralTime: '辰时 07:00-09:00',
      ritualTimes: [],
    },
    remarks: '',
  });

  const updateField = <K extends keyof FuneralOrder>(
    key: K,
    value: FuneralOrder[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateDeceased = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      deceased: { ...prev.deceased!, [key]: value },
    }));
  };

  const updateFamily = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      family: { ...prev.family!, [key]: value },
    }));
  };

  const updateAuspicious = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      auspiciousDates: { ...prev.auspiciousDates!, [key]: value },
    }));
  };

  const handleSubmit = () => {
    const newOrder = addOrder({
      deceased: formData.deceased!,
      family: formData.family!,
      funeralSpec: formData.funeralSpec!,
      auspiciousDates: formData.auspiciousDates!,
      status: 'pending',
      remarks: formData.remarks,
      totalAmount: specOptions.find((s) => s.key === formData.funeralSpec)?.price || 0,
    });
    navigate(`/scheduling?orderId=${newOrder.id}`);
  };

  const selectedSpec = specOptions.find((s) => s.key === formData.funeralSpec);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="btn-ghost"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
          返回订单列表
        </button>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} className="btn-outline">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={step < 3}
            className="btn-gold"
          >
            <Save className="w-4 h-4" strokeWidth={1.8} />
            保存并排班
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: '逝者信息', icon: User },
            { step: 2, label: '家属信息', icon: Phone },
            { step: 3, label: '择吉与规格', icon: Sparkles },
          ].map((item, idx, arr) => (
            <div key={item.step} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step >= item.step
                      ? 'bg-gold text-white shadow-gold'
                      : 'bg-ink-100 text-ink-400'
                  }`}
                >
                  {step > item.step ? (
                    <span className="text-lg">✓</span>
                  ) : (
                    <item.icon className="w-4 h-4" strokeWidth={1.8} />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      step >= item.step ? 'text-ink-800' : 'text-ink-400'
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-ink-400">Step {item.step}</p>
                </div>
              </div>
              {idx < arr.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    step > item.step ? 'bg-gold' : 'bg-ink-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-linen/10 border border-linen/30 flex items-center justify-center">
              <User className="w-4 h-4 text-linen" strokeWidth={1.8} />
            </div>
            <h3 className="section-title">逝者基本信息</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label-base">
                姓名 <span className="text-cinnabar">*</span>
              </label>
              <input
                type="text"
                value={formData.deceased!.name}
                onChange={(e) => updateDeceased('name', e.target.value)}
                className="input-base"
                placeholder="请输入逝者姓名"
              />
            </div>

            <div>
              <label className="label-base">
                性别 <span className="text-cinnabar">*</span>
              </label>
              <div className="flex gap-3">
                {['male', 'female'].map((g) => (
                  <label
                    key={g}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border-2 cursor-pointer transition-all ${
                      formData.deceased!.gender === g
                        ? g === 'male'
                          ? 'border-linen bg-linen/5 text-linen'
                          : 'border-gold bg-gold/5 text-gold-dark'
                        : 'border-ink-200 text-ink-500 hover:border-ink-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      checked={formData.deceased!.gender === g}
                      onChange={() => updateDeceased('gender', g)}
                      className="hidden"
                    />
                    {g === 'male' ? '👴 男性' : '👵 女性'}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label-base">
                年龄（岁）
              </label>
              <input
                type="number"
                value={formData.deceased!.age || ''}
                onChange={(e) => updateDeceased('age', parseInt(e.target.value) || 0)}
                className="input-base"
                placeholder="请输入年龄"
              />
            </div>

            <div>
              <label className="label-base">
                逝世地点
              </label>
              <select
                value={formData.deceased!.deathPlace}
                onChange={(e) => updateDeceased('deathPlace', e.target.value)}
                className="input-base"
              >
                <option value="家中">家中</option>
                <option value="医院">医院</option>
                <option value="养老院">养老院</option>
                <option value="意外">意外地点</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="label-base">
                出生日期
              </label>
              <div className="relative">
                <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
                <input
                  type="date"
                  value={formData.deceased!.birthDate}
                  onChange={(e) => updateDeceased('birthDate', e.target.value)}
                  className="input-base pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label-base">
                逝世日期 <span className="text-cinnabar">*</span>
              </label>
              <div className="relative">
                <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
                <input
                  type="date"
                  value={formData.deceased!.deathDate}
                  onChange={(e) => updateDeceased('deathDate', e.target.value)}
                  className="input-base pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8 pt-6 border-t border-ink-100">
            <button
              onClick={() => setStep(2)}
              disabled={!formData.deceased!.name}
              className="btn-primary"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-jade/10 border border-jade/30 flex items-center justify-center">
              <Phone className="w-4 h-4 text-jade" strokeWidth={1.8} />
            </div>
            <h3 className="section-title">家属联系人信息</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label-base">
                联系人姓名 <span className="text-cinnabar">*</span>
              </label>
              <input
                type="text"
                value={formData.family!.contactName}
                onChange={(e) => updateFamily('contactName', e.target.value)}
                className="input-base"
                placeholder="请输入联系人姓名"
              />
            </div>

            <div>
              <label className="label-base">
                与逝者关系
              </label>
              <select
                value={formData.family!.relationship}
                onChange={(e) => updateFamily('relationship', e.target.value)}
                className="input-base"
              >
                {['长子', '次子', '幼子', '长女', '次女', '幼子', '配偶', '父亲', '母亲', '兄弟', '姐妹', '其他亲属'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="label-base">
                联系电话 <span className="text-cinnabar">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
                <input
                  type="tel"
                  value={formData.family!.phone}
                  onChange={(e) => updateFamily('phone', e.target.value)}
                  className="input-base pl-9"
                  placeholder="请输入联系电话"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="label-base">
                家庭住址 <span className="text-cinnabar">*</span>
              </label>
              <div className="relative">
                <MapPinHouse className="w-4 h-4 absolute left-3 top-3.5 text-ink-400" strokeWidth={1.8} />
                <textarea
                  value={formData.family!.address}
                  onChange={(e) => updateFamily('address', e.target.value)}
                  className="input-base pl-9 min-h-[80px] resize-none"
                  placeholder="请输入详细家庭住址"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-ink-100">
            <button onClick={() => setStep(1)} className="btn-outline">
              上一步
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!formData.family!.contactName || !formData.family!.phone}
              className="btn-primary"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {/* 择吉时辰 */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-gold-dark" strokeWidth={1.8} />
              </div>
              <h3 className="section-title">择吉日吉时</h3>
              <span className="badge bg-gold/10 text-gold-dark border border-gold/30 ml-2">
                📜 黄历推荐
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="label-base">
                  出殡日期 <span className="text-cinnabar">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
                  <input
                    type="date"
                    value={formData.auspiciousDates!.funeralDate}
                    onChange={(e) => updateAuspicious('funeralDate', e.target.value)}
                    className="input-base pl-9"
                  />
                </div>
                <p className="text-xs text-ink-500 mt-1.5">
                  💡 建议：逝世后3-7日内出殡，避开冲煞属相
                </p>
              </div>

              <div>
                <label className="label-base">
                  出殡吉时
                </label>
                <select
                  value={formData.auspiciousDates!.funeralTime}
                  onChange={(e) => updateAuspicious('funeralTime', e.target.value)}
                  className="input-base"
                >
                  {auspiciousTimeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-gold-50 border border-gold/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-gold-dark mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                <div>
                  <p className="text-sm font-medium text-gold-dark mb-1">法事时辰安排</p>
                  <div className="flex flex-wrap gap-2">
                    {['06:00 家祭', '07:30 开光', '09:00 出殡', '10:00 火化', '14:00 安葬'].map((time) => (
                      <label
                        key={time}
                        className={`px-3 py-1.5 rounded-md text-sm border cursor-pointer transition-all ${
                          formData.auspiciousDates!.ritualTimes.includes(time)
                            ? 'bg-gold border-gold text-white'
                            : 'bg-white border-ink-200 text-ink-600 hover:border-gold/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.auspiciousDates!.ritualTimes.includes(time)}
                          onChange={(e) => {
                            const times = formData.auspiciousDates!.ritualTimes;
                            if (e.target.checked) {
                              updateAuspicious('ritualTimes', [...times, time]);
                            } else {
                              updateAuspicious('ritualTimes', times.filter((t) => t !== time));
                            }
                          }}
                          className="hidden"
                        />
                        {time}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 套餐选择 */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-ink-100 border border-ink-200 flex items-center justify-center">
                <Crown className="w-4 h-4 text-ink-600" strokeWidth={1.8} />
              </div>
              <h3 className="section-title">治丧规格选择</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {specOptions.map((spec) => (
                <label
                  key={spec.key}
                  className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                    formData.funeralSpec === spec.key
                      ? 'border-gold bg-gold-50 shadow-gold'
                      : 'border-ink-200 bg-white hover:border-ink-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="spec"
                    checked={formData.funeralSpec === spec.key}
                    onChange={() => updateField('funeralSpec', spec.key as FuneralOrder['funeralSpec'])}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-4xl mb-3">{spec.icon}</div>
                    <h4 className="font-song text-lg font-semibold text-ink-900 mb-1">
                      {spec.label}
                    </h4>
                    <p className="text-xs text-ink-500 mb-3 h-8">{spec.desc}</p>
                    <div className="pt-3 border-t border-ink-100">
                      <p className="font-song text-2xl font-bold text-gold-dark">
                        {formatCurrency(spec.price)}
                      </p>
                    </div>
                  </div>
                  {formData.funeralSpec === spec.key && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-ink-100 border border-ink-200 flex items-center justify-center">
                <ScrollText className="w-4 h-4 text-ink-600" strokeWidth={1.8} />
              </div>
              <h3 className="section-title">特殊要求与备注</h3>
            </div>
            <textarea
              value={formData.remarks || ''}
              onChange={(e) => updateField('remarks', e.target.value)}
              className="input-base min-h-[100px] resize-none"
              placeholder="请填写家属的特殊要求、宗教信仰、禁忌事项等..."
            />
          </div>

          {/* 汇总 */}
          <div className="card p-6 bg-gradient-to-br from-gold-50 to-white border-gold/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-500 mb-1">订单预估金额</p>
                <p className="font-song text-4xl font-bold text-gold-dark">
                  {formatCurrency(selectedSpec?.price || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-ink-500 mb-1">逝者</p>
                <p className="font-semibold text-ink-800">
                  {formData.deceased!.name || '待填写'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-outline">
              上一步
            </button>
            <div className="flex gap-3">
              <button onClick={() => navigate('/orders')} className="btn-outline">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.auspiciousDates!.funeralDate}
                className="btn-gold"
              >
                <Save className="w-4 h-4" strokeWidth={1.8} />
                保存并排班
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
