import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LanguageCode, LanguageNames, NewsItem, NewsState } from './types';
import { fetchCryptoNewsForLanguage } from './claudeService'; // ← geminiService에서 변경
import { NewsCard } from './components/NewsCard';
import { LanguageBadge } from './components/LanguageBadge';

const App: React.FC = () => {
  const [state, setState] = useState<NewsState>({
    items: [],
    isLoading: false,
    lastUpdated: null,
    activeLanguage: 'ALL',
    selectedDate: new Date().toISOString().split('T')[0]
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const availableDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const fetchAllNewsForDate = useCallback(async (date: string) => {
    setIsRefreshing(true);
    setState(prev => ({ ...prev, isLoading: true, selectedDate: date }));
    
    const languages = Object.values(LanguageCode);
    const allFetchedNews: NewsItem[] = [];
    
    for (const lang of languages) {
      const news = await fetchCryptoNewsForLanguage(lang, date);
      allFetchedNews.push(...news);
      // 각 언어 수집 후 UI 즉시 업데이트 (진행 상황 표시)
      setState(prev => ({
        ...prev,
        items: [...allFetchedNews],
      }));
    }

    setState(prev => ({
      ...prev,
      items: allFetchedNews,
      isLoading: false,
      lastUpdated: new Date().toLocaleTimeString(),
    }));
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchAllNewsForDate(state.selectedDate);
  }, [fetchAllNewsForDate, state.selectedDate]);

  const handleDateSelect = (date: string) => {
    setSidebarOpen(false);
    setState(prev => ({ ...prev, selectedDate: date }));
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, NewsItem[]> = {};
    const filtered = state.activeLanguage === 'ALL' 
      ? state.items 
      : state.items.filter(item => item.language === state.activeLanguage);

    filtered.forEach(item => {
      if (!groups[item.language]) groups[item.language] = [];
      groups[item.language].push(item);
    });
    return groups;
  }, [state.items, state.activeLanguage]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-200">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-bold text-white tracking-tight">CS Intelligence</h1>
        <div className="w-6"></div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">News Archiver</h1>
              <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">Exchange CS Support</p>
            </div>
          </div>

          <nav className="flex-grow space-y-8">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4 px-2">Reports Archive</h2>
              <div className="space-y-1">
                {availableDates.map(date => {
                  const isActive = state.selectedDate === date;
                  const displayDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
                  return (
                    <button
                      key={date}
                      onClick={() => handleDateSelect(date)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs transition-all flex items-center justify-between ${
                        isActive 
                          ? 'bg-blue-600 text-white font-bold' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{displayDate}</span>
                      {isActive && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <button 
              onClick={() => fetchAllNewsForDate(state.selectedDate)}
              disabled={isRefreshing}
              className="w-full py-2 bg-slate-800 border border-slate-700 rounded text-[11px] font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Manual Sync
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Sub Header */}
        <div className="bg-slate-900/40 border-b border-slate-800 p-6 shrink-0">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                News Report: {new Date(state.selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="text-blue-400 uppercase tracking-tighter">Powered by Claude AI</span>
                <span>•</span>
                <span>{state.items.length} Articles Total</span>
                {state.isLoading && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-400 animate-pulse">수집 중...</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setState(prev => ({ ...prev, activeLanguage: 'ALL' }))}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all border ${
                  state.activeLanguage === 'ALL' 
                    ? 'bg-blue-600 text-white border-blue-500' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                All Languages
              </button>
              {Object.values(LanguageCode).map(code => (
                <button
                  key={code}
                  onClick={() => setState(prev => ({ ...prev, activeLanguage: code }))}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold border transition-all ${
                    state.activeLanguage === code 
                      ? 'bg-blue-600 text-white border-blue-500' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List Content Area */}
        <div className="flex-grow overflow-y-auto bg-slate-950 p-6">
          <div className="max-w-6xl mx-auto">
            {state.isLoading && state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 text-sm font-medium">Claude AI가 글로벌 뉴스를 수집 중입니다...</p>
                <p className="text-slate-600 text-xs mt-2">{state.selectedDate} 기준 11개 언어 검색 중</p>
              </div>
            ) : Object.keys(groupedItems).length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800 rounded-lg py-12 px-6 text-center">
                <p className="text-slate-500 text-sm">선택한 날짜/언어에 대한 뉴스가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {(Object.keys(groupedItems) as LanguageCode[]).map(langCode => (
                  <section key={langCode} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        {LanguageNames[langCode]} 
                        <span className="text-[10px] text-slate-500 font-mono lowercase">({groupedItems[langCode].length} items)</span>
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {groupedItems[langCode].map(item => (
                        <NewsCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer info */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 shrink-0 flex justify-between items-center">
          <p className="text-[10px] text-slate-600 font-mono">CS Dashboard · Powered by Claude AI</p>
          <p className="text-[10px] text-slate-600 font-mono italic">Last synced: {state.lastUpdated || 'Never'}</p>
        </div>
      </main>
    </div>
  );
};

export default App;
