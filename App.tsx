import React, { useState } from 'react';
import { 
  Settings, Plus, LayoutGrid, FileJson, Trash2, Edit, PlayCircle, Database, 
  Activity, ArrowUpRight, Zap, Clock, ShieldCheck
} from 'lucide-react';
import { StrategyFormState, StrategyItem, MetadataItem, FinalSpeedInfo } from './types';
import { DEFAULT_METADATA } from './constants';
import { StrategyForm } from './components/StrategyForm';
import { JsonPreview } from './components/JsonPreview';
import { MetadataManager } from './components/MetadataManager';

const numberify = (s: string, fallback = 0) => {
    if (s === null || s.trim() === '') return fallback;
    const num = parseFloat(s);
    return isNaN(num) ? fallback : num;
};

const convertFormToStrategyItem = (form: StrategyFormState): StrategyItem => {
  const speedInfo: FinalSpeedInfo = {
    limit: {
      global: numberify(form.speedInfo.limit.global, -1),
      task: numberify(form.speedInfo.limit.task, -1),
    },
    speed: {
      global: {
        bs: numberify(form.speedInfo.speed.global.bs),
        vs: numberify(form.speedInfo.speed.global.vs),
        ts: numberify(form.speedInfo.speed.global.ts),
      },
      task: {
        bs: numberify(form.speedInfo.speed.task.bs),
        vs: numberify(form.speedInfo.speed.task.vs),
        ts: numberify(form.speedInfo.speed.task.ts),
      }
    },
  };

  if (form.duration) {
    speedInfo.expire = numberify(form.duration);
  }

  return {
    filter: {
      desc: form.desc,
      responseOnMatch: {
        strategy: form.strategyType,
        strategy_id: form.id, 
        speed_info: speedInfo,
      },
      matchAll: form.conditions.map(c => ({
        match: [c.field, c.operator, c.value]
      }))
    }
  };
};

const stringify = (n: number | undefined) => (n === undefined || n === null ? '' : String(n));

const convertStrategyItemToForm = (item: StrategyItem): StrategyFormState => {
  const filter = item.filter;
  const speedInfo = filter.responseOnMatch.speed_info;
  
  return {
    id: filter.responseOnMatch.strategy_id,
    desc: filter.desc,
    strategyType: filter.responseOnMatch.strategy,
    speedInfo: {
      limit: {
        global: stringify(speedInfo.limit?.global),
        task: stringify(speedInfo.limit?.task),
      },
      speed: {
        global: {
          bs: stringify(speedInfo.speed?.global?.bs),
          vs: stringify(speedInfo.speed?.global?.vs),
          ts: stringify(speedInfo.speed?.global?.ts),
        },
        task: {
          bs: stringify(speedInfo.speed?.task?.bs),
          vs: stringify(speedInfo.speed?.task?.vs),
          ts: stringify(speedInfo.speed?.task?.ts),
        },
      }
    },
    duration: stringify(speedInfo.expire),
    conditions: filter.matchAll.map((m, idx) => ({
      id: `cond-${idx}-${Date.now()}`,
      field: m.match[0],
      operator: m.match[1],
      value: m.match[2]
    }))
  };
};

const App: React.FC = () => {
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [metadata, setMetadata] = useState<MetadataItem[]>(DEFAULT_METADATA);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<StrategyFormState | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'list' | 'json' | 'metadata'>('list');

  const loadExampleData = () => {
    const examples: StrategyItem[] = [
      {
        filter: {
          desc: "白金会员晚高峰下载保障策略",
          responseOnMatch: {
            strategy: "spike_fill_valley",
            strategy_id: "example_1",
            speed_info: {
              limit: { global: -1, task: -1 },
              speed: {
                global: { bs: 4096, vs: 10240, ts: 51200 },
                task: { bs: 2048, vs: 5120, ts: 25600 }
              },
              expire: 3600
            }
          },
          matchAll: [
            { match: ["user.type", "in", "3"] }, // Platinum Member
            { match: ["effective.period", "between", "18:00-23:00"] }
          ]
        }
      },
      {
        filter: {
          desc: "高带宽风险用户限速",
          responseOnMatch: {
            strategy: "speed_limit",
            strategy_id: "example_2",
            speed_info: {
              limit: { global: 512, task: 512 },
              speed: {
                global: { bs: 0, vs: 0, ts: 0 },
                task: { bs: 0, vs: 0, ts: 0 }
              }
            }
          },
          matchAll: [
            { match: ["user.type", "in", "1"] }, // Regular User
            { match: ["tags.realtime", "==", "high_bw_usage"] }
          ]
        }
      }
    ];
    setStrategies(examples);
  };

  const handleCreate = () => {
    setCurrentStrategy(undefined);
    setIsEditing(true);
  };

  const handleEdit = (item: StrategyItem) => {
    setCurrentStrategy(convertStrategyItemToForm(item));
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除此策略吗？")) {
      setStrategies(prev => prev.filter(s => s.filter.responseOnMatch.strategy_id !== id));
    }
  };

  const handleSave = (formData: StrategyFormState) => {
    const newItem = convertFormToStrategyItem(formData);
    
    setStrategies(prev => {
      const exists = prev.findIndex(s => s.filter.responseOnMatch.strategy_id === formData.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = newItem;
        return updated;
      }
      return [...prev, newItem];
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      {/* Refined Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col shadow-2xl relative z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-800/50 bg-slate-950">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Activity size={20} className="text-white" />
             </div>
             <div>
                <h1 className="font-bold text-lg tracking-tight leading-none">NetFlow</h1>
                <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Configurator</span>
             </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1.5 mt-4 flex-1">
          <button 
            onClick={() => { setActiveTab('list'); setIsEditing(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === 'list' && !isEditing 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutGrid size={20} className={activeTab === 'list' ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
            <span className="font-medium">策略看板</span>
          </button>
          
          <button 
             onClick={() => { setActiveTab('metadata'); setIsEditing(false); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                 activeTab === 'metadata' 
                 ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                 : 'text-slate-400 hover:bg-slate-800 hover:text-white'
             }`}
          >
            <Database size={20} className={activeTab === 'metadata' ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
            <span className="font-medium">元数据字典</span>
          </button>
          
          <button 
             onClick={() => { setActiveTab('json'); setIsEditing(false); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                 activeTab === 'json' 
                 ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                 : 'text-slate-400 hover:bg-slate-800 hover:text-white'
             }`}
          >
            <FileJson size={20} className={activeTab === 'json' ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
            <span className="font-medium">JSON 预览</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800/50 bg-slate-950/30">
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                 <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">快速操作</h4>
                 <button 
                    onClick={loadExampleData}
                    className="w-full flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-slate-700/50 py-2 px-3 rounded-lg transition-colors"
                 >
                   <PlayCircle size={16} /> 加载示例数据
                 </button>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-transparent pointer-events-none z-0"></div>
        
        {/* Top Header */}
        {!isEditing && (
            <header className="px-10 py-8 flex justify-between items-end relative z-10 shrink-0">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {activeTab === 'list' ? '策略管理' : activeTab === 'metadata' ? '元数据管理' : '配置预览'}
                  </h2>
                  <p className="text-slate-500 mt-2 text-sm max-w-lg">
                    {activeTab === 'list' 
                        ? '配置不同用户群体在特定场景下的网络配速策略，支持实时与离线标签组合。'
                        : '管理系统中可用的标签定义，用于策略匹配条件。'
                    }
                  </p>
                </div>
                {activeTab === 'list' && (
                  <button
                    onClick={handleCreate}
                    className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl shadow-lg shadow-gray-200 flex items-center gap-2 font-medium transition-all transform hover:-translate-y-0.5"
                  >
                    <Plus size={18} /> 新建策略
                  </button>
                )}
            </header>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-hidden px-10 pb-10 relative z-10">
          {isEditing ? (
            <div className="h-full max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300">
              <StrategyForm 
                initialData={currentStrategy}
                metadata={metadata}
                onSave={handleSave} 
                onCancel={() => setIsEditing(false)} 
              />
            </div>
          ) : activeTab === 'json' ? (
             <div className="h-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
                <JsonPreview data={strategies} />
             </div>
          ) : activeTab === 'metadata' ? (
             <div className="h-full max-w-5xl mx-auto">
                <MetadataManager metadata={metadata} onChange={setMetadata} />
             </div>
          ) : (
            /* Strategy Grid */
            <div className="h-full overflow-y-auto custom-scrollbar pb-20">
              {strategies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                     <LayoutGrid size={32} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-medium text-gray-500">暂无策略配置</p>
                  <button onClick={loadExampleData} className="mt-4 text-blue-600 font-medium hover:underline">点击加载示例</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {strategies.map((strategy) => (
                    <div 
                      key={strategy.filter.responseOnMatch.strategy_id} 
                      className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group flex flex-col"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                           <Zap size={12} fill="currentColor" className="opacity-50"/>
                           {strategy.filter.responseOnMatch.strategy}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => handleEdit(strategy)} 
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                             >
                               <Edit size={16} />
                             </button>
                             <button 
                                onClick={() => handleDelete(strategy.filter.responseOnMatch.strategy_id)} 
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             >
                               <Trash2 size={16} />
                             </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-800 text-lg mb-3 leading-snug line-clamp-2 min-h-[3.5rem]">
                        {strategy.filter.desc}
                      </h3>
                      
                      {/* Speed Metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Global Limit</span>
                            <div className="font-mono text-lg font-semibold text-slate-700 flex items-baseline gap-1">
                                {strategy.filter.responseOnMatch.speed_info.limit.global === -1 ? 'N/A' : strategy.filter.responseOnMatch.speed_info.limit.global} 
                                {strategy.filter.responseOnMatch.speed_info.limit.global !== -1 && <span className="text-[10px] text-slate-400 font-sans">KB/s</span>}
                            </div>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Global VIP Speed</span>
                            <div className="font-mono text-lg font-semibold text-slate-700 flex items-baseline gap-1">
                                {strategy.filter.responseOnMatch.speed_info.speed.global.vs} 
                                <span className="text-[10px] text-slate-400 font-sans">KB/s</span>
                            </div>
                         </div>
                      </div>

                      {/* Conditions Preview */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-2">
                             <ShieldCheck size={14} className="text-slate-400" />
                             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">触发条件</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {strategy.filter.matchAll.slice(0, 3).map((m, i) => (
                              <span key={i} className="text-xs px-2.5 py-1.5 rounded-md bg-white border border-gray-200 text-slate-600 font-medium truncate max-w-[120px] shadow-sm">
                                {m.match[1] === 'in' ? '包含' : m.match[1]} <span className="text-slate-900">{m.match[2]}</span>
                              </span>
                            ))}
                            {strategy.filter.matchAll.length > 3 && (
                              <span className="text-xs px-2 py-1.5 rounded-md bg-gray-50 border border-gray-200 text-gray-400">
                                +{strategy.filter.matchAll.length - 3}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;