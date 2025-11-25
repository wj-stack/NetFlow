import React, { useState } from 'react';
import { Plus, Trash2, Tag, Database, Hash, Search, User, Monitor } from 'lucide-react';
import { MetadataItem, MetadataType } from '../types';

interface MetadataManagerProps {
  metadata: MetadataItem[];
  onChange: (newMetadata: MetadataItem[]) => void;
}

// Consistent Input Styles (Matches StrategyForm)
const INPUT_BASE_CLASS = "w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg px-3.5 py-2.5 outline-none transition-all duration-200 hover:border-blue-300 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400";

const TAB_CONFIG = {
  user: {
    label: '用户类型 (User)',
    color: 'blue',
    icon: User,
  },
  client: {
    label: '客户端 (Client)',
    color: 'emerald',
    icon: Monitor,
  },
  realtime: {
    label: '实时标签 (Real-time)',
    color: 'orange',
    icon: Tag,
  },
  offline: {
    label: '离线标签 (Offline)',
    color: 'purple',
    icon: Tag,
  },
};

export const MetadataManager: React.FC<MetadataManagerProps> = ({ metadata, onChange }) => {
  const [newItem, setNewItem] = useState({ label: '', value: '' });
  const [activeTab, setActiveTab] = useState<MetadataType>('user');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = () => {
    if (!newItem.label || !newItem.value) return;
    
    const item: MetadataItem = {
      id: `${activeTab}-${Date.now()}`,
      type: activeTab,
      label: newItem.label,
      value: newItem.value
    };

    onChange([...metadata, item]);
    setNewItem({ label: '', value: '' });
  };

  const handleDelete = (id: string) => {
    onChange(metadata.filter(item => item.id !== id));
  };

  const filteredItems = metadata
    .filter(item => item.type === activeTab)
    .filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()) || item.value.toLowerCase().includes(searchTerm.toLowerCase()));

  const currentTabConfig = TAB_CONFIG[activeTab];
  // FIX: Assign icon component to a capitalized variable to be used in JSX.
  const CurrentTabIcon = currentTabConfig.icon;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 bg-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="text-blue-600" size={24} />
              元数据字典
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              定义用于策略匹配的动态数据集，如用户、客户端和标签。
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(Object.keys(TAB_CONFIG) as MetadataType[]).map(tabKey => {
            // FIX: Assign icon component to a capitalized variable to be used in JSX.
            const TabIcon = TAB_CONFIG[tabKey].icon;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === tabKey
                    ? `bg-white text-${TAB_CONFIG[tabKey].color}-600 shadow-sm`
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <TabIcon size={14} /> {TAB_CONFIG[tabKey].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
        
        {/* Add New Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider flex items-center gap-2">
            <Plus size={14}/> 添加新 {TAB_CONFIG[activeTab].label}
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">显示名称 (Label)</label>
              <input
                type="text"
                placeholder="例如: 高风险用户"
                className={INPUT_BASE_CLASS}
                value={newItem.label}
                onChange={(e) => setNewItem(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">唯一值 (Value ID)</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="high_risk_usr"
                  className={`${INPUT_BASE_CLASS} pl-9 font-mono`}
                  value={newItem.value}
                  onChange={(e) => setNewItem(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newItem.label || !newItem.value}
              className="h-[42px] bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/10 active:scale-95 whitespace-nowrap"
            >
              <Plus size={16} /> 添加
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
             <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
             <input 
                type="text" 
                placeholder="搜索..." 
                className={`${INPUT_BASE_CLASS} pl-10`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CurrentTabIcon size={24} className="opacity-40" />
              </div>
              <p className="text-sm font-medium">未找到 {currentTabConfig.label}</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const Icon = TAB_CONFIG[item.type].icon;
              const color = TAB_CONFIG[item.type].color;
              return (
              <div key={item.id} className={`group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-${color}-900/5 hover:border-${color}-200 transition-all relative`}>
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-${color}-50 text-${color}-600 group-hover:bg-${color}-600 group-hover:text-white`}>
                    <Icon size={18} />
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h4 className="font-bold text-slate-800 text-base mb-1.5">{item.label}</h4>
                <div className="bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100 flex items-center gap-2 w-full">
                    <Hash size={12} className="text-slate-400 flex-shrink-0" />
                    <code className="text-xs text-slate-500 font-mono truncate">
                    {item.value}
                    </code>
                </div>
              </div>
            )})
          )}
        </div>
      </div>
    </div>
  );
};