import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, Save, X, User, Clock, Tag, Monitor, 
  AlertCircle, Zap, ChevronDown, Check, CalendarClock, ChevronsRight, Shield, ArrowDown, ArrowUp
} from 'lucide-react';
import { StrategyFormState, MatchCondition, MetadataItem, SpeedInfo, MetadataType } from '../types';
import { MATCH_FIELDS, MATCH_OPERATORS, STRATEGY_TYPES, INITIAL_SPEED_INFO } from '../constants';

// Simple UUID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

interface StrategyFormProps {
  initialData?: StrategyFormState;
  metadata: MetadataItem[];
  onSave: (data: StrategyFormState) => void;
  onCancel: () => void;
}

// Common Input Styles - updated for cleaner look
const INPUT_BASE_CLASS = "w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none transition-all duration-200 hover:border-blue-300 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400";
const SELECT_BASE_CLASS = "w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none transition-all duration-200 hover:border-blue-300 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer truncate pr-8";

// Helper to filter valid operators based on field type
const getOperatorsForField = (field: string) => {
  if (field === 'effective.period') {
    return MATCH_OPERATORS.filter(op => ['between', '>=', '<=', '>', '<', '=='].includes(op.value));
  }
  return MATCH_OPERATORS.filter(op => ['in', '==', '!='].includes(op.value));
};

// --- Sub-Component: MultiSelect ---
interface MultiSelectProps {
  options: { value: string; label: string }[];
  value: string; // Comma separated string
  onChange: (newValue: string) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues = value ? value.split(',').filter(Boolean) : [];

  const toggleValue = (val: string) => {
    const newValues = selectedValues.includes(val)
      ? selectedValues.filter(v => v !== val)
      : [...selectedValues, val];
    onChange(newValues.join(','));
  };

  const getLabel = (val: string) => options.find(o => o.value === val)?.label || val;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full group" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[38px] px-2 py-1 flex flex-wrap items-center gap-1.5 cursor-pointer transition-all duration-200 rounded-lg border ${
            isOpen 
            ? 'bg-white border-blue-500 ring-4 ring-blue-500/10 shadow-sm' 
            : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white'
        }`}
      >
        {selectedValues.length === 0 ? (
          <span className="text-slate-400 text-sm px-2 py-1">{placeholder || "选择..."}</span>
        ) : (
          selectedValues.map(val => (
            <span key={val} className="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 max-w-full">
              <span className="truncate max-w-[100px]">{getLabel(val)}</span>
              <span 
                onClick={(e) => { e.stopPropagation(); toggleValue(val); }}
                className="text-blue-400 hover:text-blue-600 cursor-pointer rounded-full p-0.5 hover:bg-blue-100 transition-colors"
              >
                <X size={10} strokeWidth={3} />
              </span>
            </span>
          ))
        )}
        <div className="ml-auto text-slate-400 group-hover:text-slate-600 px-1 self-center">
           <ChevronDown size={14} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-300/50 max-h-60 overflow-y-auto py-1.5 animate-in fade-in zoom-in-95 duration-100 origin-top">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">暂无选项</div>
          ) : (
            options.map(opt => {
              const isSelected = selectedValues.includes(opt.value);
              return (
                <div 
                  key={opt.value}
                  onClick={() => toggleValue(opt.value)}
                  className={`px-3 py-2 mx-1 rounded-lg text-sm cursor-pointer flex items-center justify-between transition-all ${
                      isSelected 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate mr-2">{opt.label}</span>
                  {isSelected && <Check size={14} className="text-blue-600 flex-shrink-0" strokeWidth={2.5} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};


// --- Sub-Component: SpeedInput ---
const SpeedInput = ({ label, value, onChange, placeholder = "0", icon: Icon = ChevronsRight }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
      <Icon size={12} className="text-slate-400" />
      {label}
    </label>
    <div className="relative">
      <input
        type="number"
        className="w-full bg-slate-100 border border-slate-200/80 rounded-lg text-lg font-mono font-semibold text-slate-800 outline-none pr-16 pl-3 py-2 transition-colors hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <span className="text-[11px] font-bold text-slate-400 absolute right-4 top-3.5 select-none tracking-wide">KB/s</span>
    </div>
  </div>
);


export const StrategyForm: React.FC<StrategyFormProps> = ({ initialData, metadata, onSave, onCancel }) => {
  const [formData, setFormData] = useState<StrategyFormState>(() => {
    if (initialData) return initialData;
    return {
      id: generateId(),
      desc: '',
      strategyType: 'speed_limit',
      speedInfo: INITIAL_SPEED_INFO,
      duration: '',
      conditions: []
    };
  });
  
  const [activeSpeedTab, setActiveSpeedTab] = useState<'global' | 'task'>('global');


  const handleBasicChange = (field: keyof StrategyFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSpeedChange = (path: string, value: string) => {
    setFormData(prev => {
        const keys = path.split('.');
        const newSpeedInfo = JSON.parse(JSON.stringify(prev.speedInfo)); // Deep copy
        let current = newSpeedInfo;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return { ...prev, speedInfo: newSpeedInfo };
    });
  };

  const addCondition = (fieldValue: string = 'user.type') => {
    let defaultOperator = '==';
    if (fieldValue === 'effective.period') defaultOperator = 'between';
    else if (['user.type', 'tags.realtime', 'tags.offline', 'client.type'].includes(fieldValue)) defaultOperator = 'in';

    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { id: generateId(), field: fieldValue, operator: defaultOperator, value: '' }]
    }));
  };

  const removeCondition = (id: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id)
    }));
  };

  const updateCondition = (id: string, field: keyof MatchCondition, value: string) => {
    if (field === 'field') {
      let nextOperator = '==';
      if (value === 'effective.period') {
          nextOperator = 'between';
      } else if (['user.type', 'tags.realtime', 'tags.offline', 'client.type'].includes(value)) {
          nextOperator = 'in';
      }
      
      setFormData(prev => ({
          ...prev,
          conditions: prev.conditions.map(c => c.id === id ? { ...c, [field]: value, operator: nextOperator, value: '' } : c)
      }));
    } else {
      setFormData(prev => ({
          ...prev,
          conditions: prev.conditions.map(c => c.id === id ? { ...c, [field]: value } : c)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getFieldIcon = (field: string) => {
    if (field.includes('user')) return <User size={16} className="text-blue-500" />;
    if (field.includes('period') || field.includes('time')) return <Clock size={16} className="text-orange-500" />;
    if (field.includes('tag')) return <Tag size={16} className="text-purple-500" />;
    if (field.includes('client')) return <Monitor size={16} className="text-emerald-500" />;
    return <AlertCircle size={16} className="text-gray-400" />;
  };

  const renderValueInput = (condition: MatchCondition) => {
    let options: { value: string; label: string }[] = [];
    let metadataType: MetadataType | null = null;
    
    switch (condition.field) {
        case 'user.type':
            metadataType = 'user';
            break;
        case 'client.type':
            metadataType = 'client';
            break;
        case 'tags.realtime':
            metadataType = 'realtime';
            break;
        case 'tags.offline':
            metadataType = 'offline';
            break;
    }

    if (metadataType) {
        options = metadata
            .filter(m => m.type === metadataType)
            .map(m => ({ value: m.value, label: m.label }));

        if (condition.operator === 'in') {
            return (
                <MultiSelect 
                    options={options} 
                    value={condition.value} 
                    onChange={(val) => updateCondition(condition.id, 'value', val)}
                    placeholder="请选择 (可多选)..."
                />
            );
        } else {
            return (
                <div className="relative">
                    <select
                      className={SELECT_BASE_CLASS}
                      value={condition.value}
                      onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                    >
                      <option value="">请选择...</option>
                      {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                    </div>
                </div>
            );
        }
    }
    
    if (condition.field === 'effective.period') {
       if (condition.operator === 'between') {
           const [start, end] = condition.value.includes('-') ? condition.value.split('-') : ['', ''];
           
           const handleTimeRangeChange = (type: 'start' | 'end', val: string) => {
               const newStart = type === 'start' ? val : start;
               const newEnd = type === 'end' ? val : end;
               updateCondition(condition.id, 'value', `${newStart}-${newEnd}`);
           };

           return (
               <div className="w-full flex items-center bg-slate-50 border border-slate-200 rounded-lg transition-all duration-200 hover:border-blue-300 hover:bg-white focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 overflow-hidden min-h-[38px]">
                  <div className="pl-3 pr-2 text-orange-400 flex-shrink-0">
                      <CalendarClock size={16} />
                  </div>
                  <input
                    type="time"
                    className="flex-1 min-w-0 bg-transparent text-sm text-slate-800 outline-none text-center font-mono h-full cursor-pointer py-1.5"
                    value={start}
                    onChange={(e) => handleTimeRangeChange('start', e.target.value)}
                  />
                  <span className="text-slate-400 text-xs font-medium px-1 flex-shrink-0">-</span>
                  <input
                    type="time"
                    className="flex-1 min-w-0 bg-transparent text-sm text-slate-800 outline-none text-center font-mono h-full cursor-pointer py-1.5"
                    value={end}
                    onChange={(e) => handleTimeRangeChange('end', e.target.value)}
                  />
               </div>
           );
       } else {
           return (
            <div className="relative">
               <input
                type="time"
                className={INPUT_BASE_CLASS}
                value={condition.value}
                onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
              />
            </div>
           );
       }
    }

    return (
      <input
        type="text"
        placeholder="请输入值..."
        className={INPUT_BASE_CLASS}
        value={condition.value}
        onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {initialData ? '编辑策略' : '新建策略'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">配置流量分配规则与触发条件</p>
        </div>
        <div className="flex gap-3">
           <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg flex items-center gap-2 text-sm font-medium transition-all"
          >
            <X size={16} /> 取消
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg shadow-blue-600/30 transition-all active:scale-95 hover:-translate-y-0.5"
          >
            <Save size={16} /> 保存配置
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-5">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              基础信息
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">策略描述</label>
                <input
                  type="text"
                  required
                  placeholder="例如: 白金会员晚高峰下载加速..."
                  className={INPUT_BASE_CLASS}
                  value={formData.desc}
                  onChange={(e) => handleBasicChange('desc', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Match Conditions */}
          <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm relative z-0">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                匹配条件 (Match Rules)
              </h3>
              
              {/* Quick Add Menu */}
              <div className="group relative">
                <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-blue-100 hover:border-blue-200">
                  <Plus size={16} strokeWidth={2.5}/> 快速添加规则 <ChevronDown size={14} strokeWidth={2.5}/>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden transform origin-top-right scale-95 group-hover:scale-100">
                  <button type="button" onClick={() => addCondition('user.type')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50">
                    <User size={16} className="text-blue-500"/> 用户类型
                  </button>
                  <button type="button" onClick={() => addCondition('effective.period')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50">
                    <Clock size={16} className="text-orange-500"/> 生效时间
                  </button>
                  <button type="button" onClick={() => addCondition('tags.realtime')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50">
                    <Tag size={16} className="text-purple-500"/> 实时标签
                  </button>
                  <button type="button" onClick={() => addCondition('client.type')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <Monitor size={16} className="text-emerald-500"/> 客户端类型
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {formData.conditions.length === 0 && (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                  <Zap size={36} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500 font-medium">暂无匹配规则，所有流量默认不匹配</p>
                  <p className="text-xs text-slate-400 mt-1">请点击右上角添加规则</p>
                </div>
              )}
              
              {/* Header Row for Table-like Layout */}
              {formData.conditions.length > 0 && (
                <div className="grid grid-cols-12 gap-3 px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:grid">
                  <div className="col-span-4 pl-10">匹配字段</div>
                  <div className="col-span-3">操作符</div>
                  <div className="col-span-5">匹配值</div>
                </div>
              )}

              {formData.conditions.map((condition, index) => (
                <div 
                  key={condition.id} 
                  // Use descending z-index so top rows cover bottom rows.
                  style={{ zIndex: formData.conditions.length - index }}
                  className="relative group grid grid-cols-1 sm:grid-cols-12 gap-3 items-start p-3 bg-white border border-slate-200 rounded-xl transition-all hover:border-blue-300 hover:shadow-md animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  
                  {/* Field Column */}
                  <div className="col-span-12 sm:col-span-4 flex gap-3 items-center">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
                      {getFieldIcon(condition.field)}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="relative">
                          <select
                            className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer hover:text-blue-600 py-2 pr-6 appearance-none transition-colors truncate"
                            value={condition.field}
                            onChange={(e) => updateCondition(condition.id, 'field', e.target.value)}
                          >
                            {MATCH_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                           <ChevronDown size={14} className="absolute right-0 top-2.5 text-slate-400 pointer-events-none" />
                       </div>
                    </div>
                  </div>

                  {/* Operator Column */}
                  <div className="col-span-12 sm:col-span-3">
                    <div className="relative h-full flex items-center">
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-mono font-medium text-slate-600 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer hover:border-blue-300 transition-all truncate pr-6"
                          value={condition.operator}
                          onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
                        >
                          {getOperatorsForField(condition.field).map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Value Column */}
                  <div className="col-span-12 sm:col-span-5 flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {renderValueInput(condition)}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeCondition(condition.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                      title="删除规则"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Response Action */}
          <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] pointer-events-none rotate-12">
                <Zap size={200} />
             </div>
             
             <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                执行策略 (Action)
              </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">策略类型</label>
                <div className="relative">
                    <select
                      className={SELECT_BASE_CLASS}
                      value={formData.strategyType}
                      onChange={(e) => handleBasicChange('strategyType', e.target.value)}
                    >
                      {STRATEGY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3.5 top-2.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
               <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1 flex justify-between">
                   <span>生效时长 (秒)</span>
                   <span className="text-xs text-slate-400 font-normal">可选 (默认永久)</span>
                </label>
                <input
                  type="number"
                  placeholder="例如: 3600"
                  className={INPUT_BASE_CLASS}
                  value={formData.duration}
                  onChange={(e) => handleBasicChange('duration', e.target.value)}
                />
              </div>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60 relative z-10">
              <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Zap size={16} className="text-emerald-500 fill-emerald-500"/>
                配速参数配置
              </label>
              
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                 {/* Left Side: Limits */}
                 <div className="xl:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                        <ArrowDown size={18} className="text-red-500"/> 限速 (Limit)
                    </h4>
                    <SpeedInput 
                        label="全局 Global" 
                        value={formData.speedInfo.limit.global} 
                        onChange={(e) => handleSpeedChange('limit.global', e.target.value)} 
                        placeholder="-1"
                    />
                    <SpeedInput 
                        label="任务 Task" 
                        value={formData.speedInfo.limit.task} 
                        onChange={(e) => handleSpeedChange('limit.task', e.target.value)} 
                        placeholder="-1"
                    />
                 </div>

                 {/* Right Side: Acceleration */}
                 <div className="xl:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                            <ArrowUp size={18} className="text-green-500"/> 加速 (Speed)
                        </h4>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                            <button type="button" onClick={() => setActiveSpeedTab('global')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeSpeedTab === 'global' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                全局
                            </button>
                            <button type="button" onClick={() => setActiveSpeedTab('task')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeSpeedTab === 'task' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                任务
                            </button>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <SpeedInput 
                            label="保底速度 (Base Speed)" 
                            value={formData.speedInfo.speed[activeSpeedTab].bs} 
                            onChange={(e) => handleSpeedChange(`speed.${activeSpeedTab}.bs`, e.target.value)} 
                        />
                        <SpeedInput 
                            label="会员加速 (VIP Speed)" 
                            value={formData.speedInfo.speed[activeSpeedTab].vs} 
                            onChange={(e) => handleSpeedChange(`speed.${activeSpeedTab}.vs`, e.target.value)} 
                        />
                        <SpeedInput 
                            label="目标速度 (Target Speed)" 
                            value={formData.speedInfo.speed[activeSpeedTab].ts} 
                            onChange={(e) => handleSpeedChange(`speed.${activeSpeedTab}.ts`, e.target.value)} 
                        />
                    </div>
                 </div>
              </div>

              <div className="mt-4 flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 text-emerald-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 
                    <strong>-1</strong> 不限速
                </span>
                <span className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded border border-red-100 text-red-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 
                    <strong>0</strong> 阻断连接
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};