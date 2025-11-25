import React, { useState } from 'react';
import { Copy, Check, FileJson } from 'lucide-react';
import { StrategyItem } from '../types';

interface JsonPreviewProps {
  data: StrategyItem[];
}

export const JsonPreview: React.FC<JsonPreviewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e1e1e] flex flex-col h-full font-mono text-sm">
      <div className="flex justify-between items-center px-6 py-4 bg-[#252526] border-b border-[#333]">
        <div className="flex items-center gap-2">
          <FileJson size={16} className="text-blue-400" />
          <h3 className="text-gray-300 font-medium tracking-wide">config.json</h3>
          <span className="text-xs text-gray-500 ml-2">{data.length} items</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-2 text-xs transition-all px-4 py-2 rounded-lg font-medium ${
             copied 
             ? 'bg-green-500/20 text-green-400' 
             : 'bg-[#333] hover:bg-[#444] text-gray-300 hover:text-white'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <pre className="text-[#9cdcfe] whitespace-pre-wrap break-all leading-relaxed">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};