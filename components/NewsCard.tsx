
import React from 'react';
import { NewsItem } from '../types';
import { LanguageBadge } from './LanguageBadge';

interface NewsCardProps {
  item: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/60 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <LanguageBadge code={item.language} />
          <span className="text-xs text-slate-500">{item.date}</span>
        </div>
        <a 
          href={item.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-1">Original Headline</h3>
          <p className="text-lg font-semibold text-slate-100 leading-tight">
            {item.headlineOriginal}
          </p>
        </div>
        
        <div className="pt-3 border-t border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-1">English Translation</h3>
          <p className="text-md text-blue-100 italic">
            {item.headlineEnglish}
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
        <span className="truncate max-w-[200px]">{item.source}</span>
        <span className="group-hover:text-blue-400 transition-colors">Read Article &rarr;</span>
      </div>
    </div>
  );
};
