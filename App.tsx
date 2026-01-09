
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppView, Surah, Ayah, Hadith, CollectionMetadata, TranslationLang, HadithGrading, CollectionCategory, ResourceLink, AIEngine } from './types';
import { Icons, COLORS } from './constants';
import { getAIInsight, AIInsight, analyzeIsnad, IsnadAnalysis } from './services/geminiService';
import { fetchHadithList } from './services/hadithService';

const SOURCED_BOOKS: CollectionMetadata[] = [
  { id: 'bukhari', name: 'Sahih al-Bukhari', author: 'Imam Bukhari', description: 'Most authentic collection of Prophetic narrations.', totalHadiths: 7563, category: 'Primary', colorTheme: 'emerald' },
  { id: 'muslim', name: 'Sahih Muslim', author: 'Imam Muslim', description: 'Renowned for rigorous isnad verification.', totalHadiths: 3033, category: 'Primary', colorTheme: 'emerald' },
  { id: 'bulugh', name: 'Bulugh al-Maram', author: 'Ibn Hajar', description: 'Attainment of the Objective in Fiqh evidence.', totalHadiths: 1596, category: 'Bulugh', colorTheme: 'rose', pdfUrl: 'https://archive.org/download/bulugh-al-maram/bulugh-al-maram.pdf' },
  { id: 'abudawud', name: 'Sunan Abi Dawud', author: 'Abu Dawud', description: 'Focused on legal (Fiqh) narrations.', totalHadiths: 4800, category: 'Primary', colorTheme: 'emerald' },
  { id: 'nukhbat', name: 'Nukhbat al-Fikr', author: 'Ibn Hajar', description: 'Concise primer on Hadith terminology.', totalHadiths: 'Terminology', category: 'Grading', colorTheme: 'amber' },
  { id: 'tahdhib', name: 'Tahdhib al-Tahdhib', author: 'Ibn Hajar', description: 'Biographical dictionary of narrators.', totalHadiths: 'Rijal', category: 'Rijal', colorTheme: 'indigo' }
];

const EXTERNAL_ARCHIVE: ResourceLink[] = [
  { title: "King Fahd Complex", url: "https://www.pdfquran.com", category: "Quran", description: "Official Arabic Quran PDFs" },
  { title: "Six Books Collection", url: "https://surahquran.com/pdf-hadith-books.html", category: "Hadith", description: "Complete Kutub al-Sittah" },
  { title: "Isnad Verification", url: "https://ebook.univeyes.com/143046", category: "Research", description: "Methodology Manuscripts" }
];

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [hadithList, setHadithList] = useState<Hadith[]>([]);
  const [activeBook, setActiveBook] = useState<CollectionMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState<TranslationLang>('en');
  const [aiEngine, setAiEngine] = useState<AIEngine>('gemini');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  
  const [isnadData, setIsnadData] = useState<IsnadAnalysis | null>(null);
  const [isnadLoading, setIsnadLoading] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await res.json();
        setSurahs(data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const handleOpenBook = async (book: CollectionMetadata) => {
    if (book.pdfUrl) {
      setActivePdfUrl(book.pdfUrl);
      setView(AppView.PDF_VIEWER);
      return;
    }
    setLoading(true);
    setActiveBook(book);
    setView(AppView.HADITH_LIST);
    try {
      const data = await fetchHadithList(book.id);
      setHadithList(data);
    } catch (err) { alert("Resource sync error."); }
    finally { setLoading(false); }
  };

  const handleLiveTranslate = async (text: string, context: string) => {
    setInsightLoading(true);
    setAiModalOpen(true);
    setAiInsight(null);
    setIsnadData(null);
    try {
      const langName = targetLang === 'ta' ? 'Tamil' : 'English';
      const insight = await getAIInsight(text, context, langName, aiEngine);
      setAiInsight(insight);
    } catch (err: any) { 
      alert(err.message || "Translation error."); 
      setAiModalOpen(false);
    } finally { setInsightLoading(false); }
  };

  const handleAnalyzeIsnad = async (hadith: Hadith) => {
    setIsnadLoading(true);
    setAiModalOpen(true);
    setAiInsight(null);
    setIsnadData(null);
    try {
      const data = await analyzeIsnad(hadith.isnad || hadith.arabicText, hadith.arabicText, aiEngine);
      setIsnadData(data);
    } catch (err: any) {
      alert(err.message || "Isnad analysis error.");
      setAiModalOpen(false);
    } finally { setIsnadLoading(false); }
  };

  const loadSurah = async (surah: Surah) => {
    setLoading(true);
    setSelectedSurah(surah);
    setView(AppView.SURAH_DETAIL);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,en.sahih`);
      const data = await res.json();
      if (data.data && data.data.length >= 2) {
        const uthmani = data.data[0].ayahs;
        const english = data.data[1].ayahs;
        const combined = uthmani.map((a: any, i: number) => ({
          ...a,
          translatedText: english[i].text
        }));
        setAyahs(combined);
      }
    } catch (err) { alert("Failed to load content."); }
    finally { setLoading(false); }
  };

  const categories = useMemo(() => {
    const cats: Record<CollectionCategory, CollectionMetadata[]> = {
      Primary: [], Grading: [], Rijal: [], Fiqh: [], Bulugh: []
    };
    SOURCED_BOOKS.forEach(b => cats[b.category].push(b));
    return cats;
  }, []);

  const renderGranularText = useCallback((text: string, context: string, textClass: string) => {
    // Regex split for sentences in both Arabic and English
    const sentences = text.split(/(?<=[.!?؟])\s+/);
    const groups: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      groups.push(sentences.slice(i, i + 2).join(' '));
    }

    return (
      <div className="space-y-4">
        {groups.map((group, idx) => (
          <div key={idx} className="group/item relative pb-4 border-b border-gray-50 last:border-0 last:pb-0">
             <p className={`${textClass} transition-colors group-hover/item:text-black`}>{group}</p>
             <div className="absolute -right-2 top-0 opacity-0 group-hover/item:opacity-100 transition-all flex gap-1">
                <button 
                  onClick={() => handleLiveTranslate(group, context)}
                  className="p-1.5 bg-violet-600 text-white rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all"
                  title="Translate Segment"
                >
                  <Icons.AI />
                </button>
             </div>
          </div>
        ))}
      </div>
    );
  }, [targetLang, aiEngine]);

  const translationClass = targetLang === 'ta' ? 'tamil-standard text-base leading-relaxed text-gray-700' : 'text-sm text-gray-600 leading-relaxed';

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#FCFBF7] shadow-2xl overflow-hidden relative font-inter">
      
      <header className="glass p-4 sticky top-0 z-30 flex items-center gap-3">
         {view !== AppView.HOME ? (
           <button onClick={() => setView(AppView.HOME)} className="p-2 text-emerald-800 transition-transform active:scale-90"><Icons.Back /></button>
         ) : <div className="scale-75"><Icons.Quran /></div>}
         <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search sacred texts..."
              className="w-full bg-white/50 rounded-2xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none border border-white/50 transition-all shadow-inner"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400"><Icons.Search /></div>
         </div>
         <button 
           onClick={() => setAiEngine(aiEngine === 'gemini' ? 'local' : 'gemini')}
           className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase transition-all shadow-sm ${aiEngine === 'local' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-400 border-gray-100'}`}
         >
           {aiEngine === 'local' ? 'OFFLINE' : 'GEMINI'}
         </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
             <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-emerald-900 font-black text-xs uppercase tracking-[0.4em] animate-pulse">Consulting Archives...</p>
          </div>
        ) : (
          <div className="p-4 space-y-8 animate-fade-in">

            {view === AppView.HOME && (
              <div className="space-y-8">
                <div className="relative h-56 w-full rounded-[48px] overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 flex flex-col items-center justify-center text-center p-8">
                   <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                   <h2 className="text-xs font-black text-emerald-300 uppercase tracking-[0.4em] mb-4 relative">Sacred Nur Library</h2>
                   <p className="arabic-majeedi text-4xl text-white drop-shadow-lg mb-2 relative">إِنَّ اللَّهَ مَعَ الصَّابِرِينَ</p>
                   <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest relative">Universal Wisdom • {aiEngine === 'local' ? 'Phi-3 Offline' : 'Gemini AI'}</p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <MenuCard label="Noble Quran" sub="114 Surahs" icon={<Icons.Quran />} theme="emerald" onClick={() => setView(AppView.QURAN_LIST)} />
                   <MenuCard label="Bulugh al-Maram" sub="Fiqh Evidence" icon={<Icons.Bulugh />} theme="rose" onClick={() => handleOpenBook(SOURCED_BOOKS.find(b => b.id === 'bulugh')!)} />
                   <MenuCard label="Research Hub" sub="Ilm al-Rijal" icon={<Icons.Isnad />} theme="indigo" onClick={() => setView(AppView.RESEARCH_HUB)} />
                   <MenuCard label="Library PDFs" sub="Direct Access" icon={<Icons.Library />} theme="violet" onClick={() => setView(AppView.RESOURCES)} />
                </div>
              </div>
            )}

            {view === AppView.RESEARCH_HUB && (
              <div className="space-y-10">
                 <header>
                    <h2 className="text-2xl font-black text-gray-900">Digital Archive</h2>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Classical Scholarly Database</p>
                 </header>

                 {Object.entries(categories).map(([cat, books]) => (
                   books.length > 0 && (
                   <section key={cat} className="space-y-4">
                      <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full bg-${books[0].colorTheme}-500`} />
                         {cat === 'Bulugh' ? 'Legal Evidence' : cat}
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                         {books.map(book => (
                           <button key={book.id} onClick={() => handleOpenBook(book)} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5 active:scale-[0.98] group transition-all">
                              <div className={`w-12 h-12 rounded-2xl bg-${book.colorTheme}-50 text-${book.colorTheme}-600 flex items-center justify-center text-xl`}>
                                 {cat === 'Rijal' ? <Icons.Isnad /> : cat === 'Bulugh' ? <Icons.Bulugh /> : <Icons.Hadith />}
                              </div>
                              <div className="text-left flex-1">
                                 <h4 className="font-black text-gray-900 group-hover:text-emerald-700">{book.name}</h4>
                                 <p className="text-[9px] text-gray-400 font-bold uppercase">{book.author} • {book.totalHadiths}</p>
                              </div>
                           </button>
                         ))}
                      </div>
                   </section>
                   )
                 ))}
              </div>
            )}

            {view === AppView.PDF_VIEWER && activePdfUrl && (
              <div className="h-full flex flex-col space-y-4 pb-20">
                <header className="flex justify-between items-center px-2">
                  <h2 className="text-lg font-black text-gray-900">Scholarly Manuscript</h2>
                  <button onClick={() => window.open(activePdfUrl, '_blank')} className="text-[10px] font-black text-emerald-700 underline uppercase">Open in Browser</button>
                </header>
                <div className="flex-1 bg-gray-200 rounded-[40px] overflow-hidden shadow-inner border border-gray-100 h-[600px]">
                  <iframe src={activePdfUrl} className="w-full h-full border-none" title="PDF Viewer" />
                </div>
              </div>
            )}

            {view === AppView.RESOURCES && (
               <div className="space-y-8">
                  <header>
                    <h2 className="text-2xl font-black text-violet-950">Resource Archive</h2>
                    <p className="text-[10px] text-violet-600 font-bold uppercase tracking-widest">Open Source Scholarly PDF Sources</p>
                  </header>
                  <div className="space-y-3">
                    {EXTERNAL_ARCHIVE.map((res, i) => (
                      <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center justify-between group transition-all hover:border-violet-300">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                               <Icons.Link />
                            </div>
                            <div>
                               <h4 className="font-black text-gray-900 group-hover:text-violet-700">{res.title}</h4>
                               <p className="text-[9px] text-gray-400 uppercase font-bold">{res.category} • {res.description}</p>
                            </div>
                         </div>
                         <div className="text-gray-300 group-hover:text-violet-500 transform rotate-180">
                            <Icons.Back />
                         </div>
                      </a>
                    ))}
                  </div>
               </div>
            )}

            {view === AppView.HADITH_LIST && (
               <div className="space-y-8 pb-10">
                 <div className="flex items-center justify-between px-2">
                    <div>
                       <h2 className="text-2xl font-black text-gray-900">{activeBook?.name}</h2>
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{activeBook?.author}</p>
                    </div>
                 </div>
                 {hadithList.map(h => (
                   <div key={h.id} className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
                      <div className="flex justify-between items-center">
                         <GradingBadge grading={h.grading} />
                         <button onClick={() => handleAnalyzeIsnad(h)} className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-5 py-2.5 rounded-full shadow-sm active:bg-indigo-600 active:text-white">
                           🔍 Verify Chain
                         </button>
                      </div>
                      
                      {renderGranularText(h.arabicText, `Hadith from ${h.collection}`, "arabic-majeedi text-3xl text-right leading-[2] text-gray-900")}
                      
                      <div className="pt-6 border-t border-gray-50 space-y-5">
                         {renderGranularText(h.englishText, `Translation of Hadith ${h.hadithNumber}`, `${translationClass} italic`)}
                         
                         {h.tamilText && (
                           <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                              <p className="text-[9px] font-black text-emerald-800 uppercase mb-2">Tamil Insight</p>
                              <p className="tamil-standard text-gray-800 leading-relaxed font-medium">"{h.tamilText}"</p>
                           </div>
                         )}

                         <div className="flex gap-3">
                            <button onClick={() => handleLiveTranslate(h.arabicText, `Hadith ${h.hadithNumber}`)} className="flex-1 py-4 bg-emerald-600 text-white rounded-[24px] text-[11px] font-black flex items-center justify-center gap-3 shadow-lg shadow-emerald-200">
                               <Icons.AI /> Full AI Insight
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            )}

            {view === AppView.SURAH_DETAIL && selectedSurah && (
               <div className="space-y-8">
                  <header className="px-2">
                    <h2 className="text-2xl font-black text-gray-900">{selectedSurah.englishName}</h2>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{selectedSurah.englishNameTranslation} • {selectedSurah.numberOfAyahs} Ayahs</p>
                  </header>
                  <div className="space-y-6 pb-20">
                    {ayahs.map(a => (
                      <div key={a.number} className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm space-y-6">
                         <div className="flex justify-between items-center">
                            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center justify-center border border-emerald-100">{a.numberInSurah}</span>
                            <button onClick={() => handleLiveTranslate(a.text, `Surah ${selectedSurah.englishName} Ayah ${a.numberInSurah}`)} className="p-2 text-violet-600 hover:scale-110 transition-transform">
                              <Icons.AI />
                            </button>
                         </div>
                         <p className="arabic-majeedi text-3xl text-right leading-[2.2] text-gray-900">{a.text}</p>
                         <p className="text-sm text-gray-600 leading-relaxed italic border-t border-gray-50 pt-4">"{a.translatedText}"</p>
                      </div>
                    ))}
                  </div>
               </div>
            )}

            {view === AppView.QURAN_LIST && (
              <div className="space-y-3">
                 {surahs.map(s => (
                   <button key={s.number} onClick={() => loadSurah(s)} className="w-full bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between transition-all active:scale-[0.98]">
                      <div className="flex items-center gap-5">
                         <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black flex items-center justify-center">{s.number}</div>
                         <div className="text-left">
                            <h4 className="font-black text-gray-900">{s.englishName}</h4>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">{s.numberOfAyahs} Verses</p>
                         </div>
                      </div>
                      <span className="arabic-naskh text-2xl text-emerald-800">{s.name}</span>
                   </button>
                 ))}
              </div>
            )}

          </div>
        )}
      </main>

      {/* Persistent Scholarly Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm glass py-4 px-8 flex justify-between items-center z-40 rounded-[40px] shadow-2xl">
         <NavItem active={view === AppView.HOME} onClick={() => setView(AppView.HOME)} icon={<Icons.Search />} label="Home" color={COLORS.emerald.primary} />
         <NavItem active={view === AppView.QURAN_LIST || view === AppView.SURAH_DETAIL} onClick={() => setView(AppView.QURAN_LIST)} icon={<Icons.Quran />} label="Quran" color={COLORS.emerald.primary} />
         <NavItem active={view === AppView.RESEARCH_HUB || view === AppView.HADITH_LIST || view === AppView.PDF_VIEWER} onClick={() => setView(AppView.RESEARCH_HUB)} icon={<Icons.Hadith />} label="Library" color={COLORS.amber.primary} />
         
         <button onClick={() => setTargetLang(targetLang === 'en' ? 'ta' : 'en')} className="flex flex-col items-center gap-1 group">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase transition-all shadow-md ${targetLang === 'ta' ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-gray-100 text-gray-500'}`}>
              {targetLang}
            </div>
            <span className="text-[8px] font-black uppercase text-gray-400">{targetLang}</span>
         </button>
      </nav>

      {/* AI Wisdom Modal */}
      {aiModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end p-4">
           <div className="w-full bg-white rounded-[56px] max-h-[90%] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-500">
              <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto my-6 shrink-0" />
              <div className="px-10 flex items-center justify-between mb-2 shrink-0">
                 <h3 className="text-2xl font-black text-indigo-900 flex items-center gap-3">
                   <Icons.AI /> {aiEngine === 'local' ? 'Offline Insight' : 'Gemini AI'}
                 </h3>
                 <button onClick={() => setAiModalOpen(false)} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <Icons.Back />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-10 no-scrollbar">
                 {(insightLoading || isnadLoading) ? (
                   <div className="py-24 text-center space-y-8">
                      <div className="flex justify-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping [animation-delay:0.2s]" />
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping [animation-delay:0.4s]" />
                      </div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Generating Scholarly Response...</p>
                   </div>
                 ) : (
                   <>
                     {aiInsight && (
                       <>
                          <div className="bg-emerald-50/50 p-8 rounded-[40px] border border-emerald-100 shadow-inner">
                             <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-4 flex items-center gap-2">
                               <Icons.AI /> Translation ({targetLang.toUpperCase()})
                             </h4>
                             <p className={`${translationClass} text-xl italic text-gray-900 font-bold`}>"{aiInsight.translation}"</p>
                          </div>
                          <section>
                             <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.3em]">Explanatory Insight</h4>
                             <p className={`${translationClass} text-gray-800 text-lg`}>{aiInsight.explanation}</p>
                          </section>
                          <section className="flex flex-wrap gap-2">
                             {aiInsight.keyThemes.map((t, i) => (
                               <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl text-[9px] font-black uppercase tracking-widest">#{t}</span>
                             ))}
                          </section>
                       </>
                     )}
                     {isnadData && (
                        <div className="space-y-8 animate-fade-in">
                          <div className="bg-indigo-50/50 p-8 rounded-[40px] border border-indigo-100 shadow-inner">
                              <h4 className="text-[10px] font-black text-indigo-700 uppercase mb-4 flex items-center gap-2">
                                🛡️ Chain Reliability
                              </h4>
                              <p className="text-2xl font-black text-indigo-900">{isnadData.reliability}</p>
                          </div>
                          <div className="space-y-4">
                            {isnadData.narrators.map((n, i) => (
                              <div key={i} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                  <h5 className="font-black text-gray-900 mb-1">{n.name}</h5>
                                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2">{n.reliability}</p>
                                  <p className="text-xs text-gray-600 leading-relaxed">{n.bio}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                     )}
                   </>
                 )}
              </div>
              <div className="p-10 bg-white border-t border-gray-50">
                 <button onClick={() => setAiModalOpen(false)} className="w-full bg-indigo-950 text-white py-5 rounded-[32px] font-black shadow-xl active:scale-95 transition-all">Dismiss</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function MenuCard({ label, sub, icon, theme, onClick }: any) {
  const themeMap: any = {
    emerald: `from-emerald-50 to-emerald-100/30 text-emerald-800 border-emerald-100`,
    amber: `from-amber-50 to-amber-100/30 text-amber-800 border-amber-100`,
    indigo: `from-indigo-50 to-indigo-100/30 text-indigo-800 border-indigo-100`,
    cyan: `from-cyan-50 to-cyan-100/30 text-cyan-800 border-cyan-100`,
    violet: `from-violet-50 to-violet-100/30 text-violet-800 border-violet-100`,
    rose: `from-rose-50 to-rose-100/30 text-rose-800 border-rose-100`,
  };
  return (
    <button onClick={onClick} className={`bg-gradient-to-br ${themeMap[theme]} p-8 rounded-[44px] border text-left active:scale-95 transition-all shadow-sm hover:shadow-xl group`}>
       <div className="mb-5 transform group-hover:scale-110 transition-transform">{icon}</div>
       <h4 className="font-black text-sm uppercase tracking-tight mb-1">{label}</h4>
       <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{sub}</p>
    </button>
  );
}

function GradingBadge({ grading }: { grading: HadithGrading }) {
  const map: any = {
    Sahih: { color: COLORS.sahih, bg: 'bg-emerald-50', label: 'Authentic' },
    Hasan: { color: COLORS.hasan, bg: 'bg-amber-50', label: 'Good' },
    Daif: { color: COLORS.daif, bg: 'bg-red-50', label: 'Weak' },
    'Da\'if': { color: COLORS.daif, bg: 'bg-red-50', label: 'Weak' }
  };
  const config = map[grading] || map.Sahih;
  return (
    <div className={`flex items-center gap-2 ${config.bg} px-4 py-1.5 rounded-2xl border border-opacity-30 shadow-inner`} style={{ borderColor: config.color }}>
       <Icons.Shield color={config.color} />
       <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.color }}>{grading}</span>
    </div>
  );
}

function NavItem({ active, onClick, icon, label, color }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'scale-110' : 'opacity-40'}`}>
       <div className={`relative z-10 ${active ? '' : 'grayscale'}`}>{icon}</div>
       <span className={`text-[9px] font-black uppercase tracking-widest ${active ? '' : 'text-gray-400'}`} style={active ? { color: color } : {}}>{label}</span>
    </button>
  );
}
