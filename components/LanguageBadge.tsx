
import React from 'react';
import { LanguageCode } from '../types';

interface LanguageBadgeProps {
  code: LanguageCode;
  className?: string;
}

const colorMap: Record<LanguageCode, string> = {
  [LanguageCode.RU]: 'bg-red-500/20 text-red-400 border-red-500/30',
  [LanguageCode.CN]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [LanguageCode.JP]: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  [LanguageCode.KR]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [LanguageCode.ES]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  [LanguageCode.PT]: 'bg-green-500/20 text-green-400 border-green-500/30',
  [LanguageCode.TR]: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  [LanguageCode.EN]: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  [LanguageCode.VN]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  [LanguageCode.AR]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  [LanguageCode.EU]: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

export const LanguageBadge: React.FC<LanguageBadgeProps> = ({ code, className = "" }) => {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${colorMap[code]} ${className}`}>
      {code}
    </span>
  );
};
