
import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Surah, Ayah, Hadith, CollectionMetadata, TranslationLang, HadithGrading, CollectionCategory, ResourceLink } from './types';
import { Icons, COLORS } from './constants';
import { getAIInsight, AIInsight, analyzeIsnad, IsnadAnalysis } from './services/geminiService';
import { fetchHadithList } from './services/hadithService';

const HADITH_COLLECTIONS: CollectionMetadata[] = [
  { id: 'bukhari', name: 'Sahih al-Bukhari', description: 'Most authentic collection of Prophetic narrations.', totalHadiths: 7563, category: 'Primary', colorTheme: 'amber' },
  { id: 'muslim', name: 'Sahih Muslim', description: 'Renowned for its rigorous isnad verification.', totalHadiths: 3033, category: 'Primary', colorTheme: 'amber' },
  { id: 'abudawud', name: 'Sunan Abi Dawud', description: 'Focused on legal (Fiqh) narrations.', totalHadiths: 5274, category: 'Primary', colorTheme: 'amber' },
  { id: 'tirmidhi', name: 'Jami` at-Tirmidhi', description: 'Known for categorization and grading notes.', totalHadiths: 3956, category: 'Primary', colorTheme: 'amber' },
  { id: 'nasai', name: 'Sunan an-Nasa\'i', description: 'Detailed in ritual practices.', totalHadiths: 5758, category: 'Primary', colorTheme: 'amber' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', description: 'The sixth of the major collections.', totalHadiths: 4341, category: 'Primary', colorTheme: 'amber' },
  { id: 'bulugh', name: 'Bulugh al-Maram', description: 'Hadith used for Islamic jurisprudence (Fiqh).', totalHadiths: 1596, category: 'Fiqh', colorTheme: 'cyan' },
  { id: 'daraqutni', name: 'Sunan al-Daraqutni', description: 'Specialized in isnad criticism.', totalHadiths: 4898, category: 'Grading', colorTheme: 'indigo' },
  { id: 'riyad', name: 'Riyad as-Salihin', description: 'Moral and spiritual guidance.', totalHadiths: 1896, category: 'Moral', colorTheme: 'rose' }
];

const EXTERNAL_RESOURCES: ResourceLink[] = [
  { title: "King Fahd Complex (Arabic PDFs)", url: "https://www.pdfquran.com", category: "Quran" },
  { title: "Quran Hayat HQ Downloads", url: "https://quranhayat.com/pdf/", category: "Quran" },
  { title: "Kutub al-Sittah PDFs", url: "https://surahquran.com/pdf-hadith-books.html", category: "Hadith" },
  { title: "Archive.org Hadith Collection", url: "https://archive.org/details/all-hadith-books-pdf", category: "Hadith" },
  { title: "Fiqh & Adillah (Archive)", url: "https://archive.org/details/fia2_20200228", category: "Fiqh" },
  { title: "Isnad & Matan Analysis", url: "https://www.scribd.com/document/806521352/Isnad-and-Matan", category: "Research" }
];

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [hadithList, setHadithList] = useState<Hadith[]>([]);
  const [activeCollection, setActiveCollection] = useState<CollectionMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState<TranslationLang>('en');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  
  const [isnadData, setIsnadData] = useState<IsnadAnalysis | null>(null);
  const [isnadLoading, setIsnadLoading] = useState(false);

  useEffect(() => {
    const fetchSurahs = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await res.json();
        setSurahs(data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchSurahs();
  }, []);

  const loadSurah = async (surah: Surah, lang: TranslationLang = targetLang) => {
    setLoading(true);
    setSelectedSurah(surah);
    setView(AppView.SURAH_DETAIL);
    try {
      const langEdition = lang === 'ta' ? 'ta.tamil' : 'en.sahih';
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-simple,${langEdition}`);
      const data = await res.json();
      
      const combined = data.data[0].ayahs.map((ayah: any, i: number) => ({
        ...ayah,
        translatedText: data.data[1].ayahs[i].text
      }));
      setAyahs(combined);
    } catch (err) { alert("Translation load failed. Using defaults."); }
    finally { setLoading(false); }
  };

  const loadHadithCollection = async (collection: CollectionMetadata) => {
    setLoading(true);
    setActiveCollection(collection);
    setView(AppView.HADITH_LIST);
    try {
      const data = await fetchHadithList(collection.id);
      setHadithList(data);
    } catch (err) { alert("Hadith API sync error."); }
    finally { setLoading(false); }
  };

  const handleAskAI = async (text: string, context: string) => {
    setAiModalOpen(true);
    setInsightLoading(true);
    try {
      const langName = targetLang === 'ta' ? 'Tamil' : 'English';
      const insight = await getAIInsight(text, context, langName);
      setAiInsight(insight);
    } catch (err) { alert("AI Insight failed."); }
    finally { setInsightLoading(false); }
  };

  const handleAnalyzeIsnad = async (hadith: Hadith) => {
    setView(AppView.ISNAD_ANALYZER);
    setIsnadLoading(true);
    try {
      const analysis = await analyzeIsnad(hadith.isnad || 'Chain not provided', hadith.arabicText);
      setIsnadData(analysis);
    } catch (err) { alert("Chain study failed."); }
    finally { setIsnadLoading(false); }
  };

  const translationClass = useMemo(() => {
    if (targetLang === 'ta') return 'tamil-standard text-base leading-[1.8] text-gray-700 font-medium';
    return 'text-sm text-gray-600 leading-relaxed font-medium';
  }, [targetLang]);

  const sortedCollections = useMemo(() => {
    const categories: Record<CollectionCategory, CollectionMetadata[]> = {
      Primary: [], Fiqh: [], Grading: [], Moral: []
    };
    HADITH_COLLECTIONS.forEach(c => categories[c.category].push(c));
    return categories;
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#FCFBF7] shadow-2xl overflow-hidden relative font-inter">
      
      {/* Header */}
      <header className="p-4 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center gap-3">
         {view !== AppView.HOME ? (
           <button onClick={() => setView(AppView.HOME)} className="p-2 text-emerald-800 transition-transform active:scale-90"><Icons.Back /></button>
         ) : <div className="scale-75"><Icons.Quran /></div>}
         <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search library..."
              className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none border border-gray-100 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400"><Icons.Search /></div>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
             <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-emerald-900 font-black text-xs uppercase tracking-[0.4em] animate-pulse">Bismillah...</p>
          </div>
        ) : (
          <div className="p-4 space-y-8 animate-fade-in">

            {/* Home Dashboard */}
            {view === AppView.HOME && (
              <div className="space-y-8">
                <div className="relative h-56 w-full rounded-[48px] overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 flex flex-col items-center justify-center text-center p-8">
                   <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                   <h2 className="text-xs font-black text-emerald-300 uppercase tracking-[0.4em] mb-4 relative">Sacred Nur Explorer</h2>
                   <p className="arabic-majeedi text-4xl text-white drop-shadow-lg mb-2 relative">إِنَّ اللَّهَ مَعَ الصَّابِرِينَ</p>
                   <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest relative">Authentic Truth • Advanced AI</p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <MenuCard label="Noble Quran" sub="114 Surahs" icon={<Icons.Quran />} theme="emerald" onClick={() => setView(AppView.QURAN_LIST)} />
                   <MenuCard label="The Sittah" sub="Core Hadith" icon={<Icons.Hadith />} theme="amber" onClick={() => setView(AppView.HADITH_COLLECTIONS)} />
                   <MenuCard label="Fiqh / Grading" sub="Research" icon={<Icons.Isnad />} theme="indigo" onClick={() => setView(AppView.BOOKS_EXPLORER)} />
                   <MenuCard label="Resources" sub="PDF Library" icon={<Icons.Library />} theme="violet" onClick={() => setView(AppView.RESOURCES)} />
                </div>
              </div>
            )}

            {/* Research View */}
            {view === AppView.BOOKS_EXPLORER && (
              <div className="space-y-10">
                 <header>
                    <h2 className="text-2xl font-black text-gray-900">Research & Fiqh</h2>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">Scholarly Collections</p>
                 </header>

                 {Object.entries(sortedCollections).map(([category, books]) => (
                   category !== 'Primary' && (
                   <section key={category}>
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${category === 'Fiqh' ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
                        {category} Books
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                         {books.map(book => (
                           <button key={book.id} onClick={() => loadHadithCollection(book)} className={`w-full bg-white p-5 rounded-[36px] border border-gray-100 shadow-sm text-left active:scale-[0.98] group flex items-center gap-5`}>
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-${book.colorTheme}-50 text-${book.colorTheme}-600 group-hover:scale-110 transition-transform`}>
                                 {book.category === 'Fiqh' ? <Icons.Fiqh /> : <Icons.Isnad />}
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-black text-gray-900 text-lg group-hover:text-emerald-700">{book.name}</h4>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase">{book.totalHadiths} Items • Live AI</p>
                              </div>
                           </button>
                         ))}
                      </div>
                   </section>
                   )
                 ))}
              </div>
            )}

            {/* Resources View */}
            {view === AppView.RESOURCES && (
              <div className="space-y-8">
                 <header>
                    <h2 className="text-2xl font-black text-violet-950">Resource Archives</h2>
                    <p className="text-[10px] text-violet-600 font-bold uppercase tracking-widest">Download Scholarly PDFs</p>
                 </header>
                 <div className="space-y-3">
                    {EXTERNAL_RESOURCES.map((res, i) => (
                      <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="w-full bg-white p-6 rounded-[32px] border border-gray-100 flex items-center justify-between group hover:border-violet-200 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                               <Icons.Link />
                            </div>
                            <div>
                               <h4 className="font-black text-gray-900 text-sm group-hover:text-violet-700">{res.title}</h4>
                               <p className="text-[10px] text-gray-400 uppercase font-black">{res.category}</p>
                            </div>
                         </div>
                         <div className="text-gray-300 group-hover:text-violet-400 transition-colors">
                            <Icons.Back />
                         </div>
                      </a>
                    ))}
                 </div>
              </div>
            )}

            {/* Quran List */}
            {view === AppView.QURAN_LIST && (
               <div className="space-y-3">
                  {surahs.map(s => (
                    <button key={s.number} onClick={() => loadSurah(s)} className="w-full bg-white p-5 rounded-[32px] flex items-center justify-between border border-gray-100 shadow-sm active:scale-[0.98] transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 text-sm font-black flex items-center justify-center">{s.number}</div>
                        <div className="text-left">
                          <h4 className="font-black text-gray-900">{s.englishName}</h4>
                          <p className="text-[10px] text-gray-400 uppercase font-black">{s.numberOfAyahs} verses</p>
                        </div>
                      </div>
                      <span className="arabic-naskh text-2xl text-emerald-800">{s.name}</span>
                    </button>
                  ))}
               </div>
            )}

            {/* Surah Detail */}
            {view === AppView.SURAH_DETAIL && (
               <div className="space-y-10 pb-10">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-emerald-950">{selectedSurah?.englishName}</h2>
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em]">{selectedSurah?.englishNameTranslation}</p>
                  </div>
                  {ayahs.map(ayah => (
                    <div key={ayah.number} className="p-8 bg-white rounded-[48px] border border-gray-100 shadow-sm space-y-8">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full">{ayah.numberInSurah}</span>
                          <button onClick={() => handleAskAI(ayah.text, `Verse ${ayah.numberInSurah} of ${selectedSurah?.englishName}`)} className="flex items-center gap-2 bg-violet-50 text-violet-700 px-5 py-2 rounded-full text-[10px] font-black shadow-sm active:bg-violet-600 active:text-white transition-all">
                             <Icons.AI /> {targetLang === 'ta' ? 'அர்த்தம்' : 'AI Meaning'}
                          </button>
                       </div>
                       <p className={`arabic-majeedi text-4xl text-right leading-[2] text-gray-900 drop-shadow-sm`}>{ayah.text}</p>
                       <div className="pt-6 border-t border-gray-50">
                         <p className={`${translationClass}`}>{ayah.translatedText}</p>
                       </div>
                    </div>
                  ))}
               </div>
            )}

            {/* Hadith List */}
            {view === AppView.HADITH_LIST && (
               <div className="space-y-8 pb-10">
                 <div className="p-2">
                    <h2 className="text-2xl font-black text-gray-900">{activeCollection?.name}</h2>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Chapter Narrations</p>
                 </div>
                 {hadithList.map(h => (
                   <div key={h.id} className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
                      <div className="flex justify-between items-center">
                         <GradingBadge grading={h.grading} />
                         <button onClick={() => handleAnalyzeIsnad(h)} className="flex items-center gap-2 text-[10px] font-black text-indigo-700 bg-indigo-50 px-5 py-2.5 rounded-full shadow-sm active:bg-indigo-600 active:text-white transition-all">
                           🔍 Chain Study
                         </button>
                      </div>
                      <p className={`arabic-majeedi text-3xl text-right leading-[1.8] text-gray-900`}>{h.arabicText}</p>
                      <div className="pt-6 border-t border-gray-50 space-y-4">
                         <p className={`${translationClass} italic`}>"{h.englishText}"</p>
                         <button onClick={() => handleAskAI(h.arabicText, `Hadith from ${h.collection}`)} className="w-full py-4 bg-emerald-50 text-emerald-800 rounded-3xl text-[11px] font-black flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all shadow-inner">
                           <Icons.AI /> {targetLang === 'ta' ? 'தமிழ் அர்த்தம் (AI)' : 'Live AI Insight'}
                         </button>
                      </div>
                   </div>
                 ))}
               </div>
            )}

            {/* Isnad Analyzer View */}
            {view === AppView.ISNAD_ANALYZER && (
              <div className="space-y-10 animate-fade-in pb-10">
                 <header>
                    <h2 className="text-2xl font-black text-indigo-950">Isnad Analysis</h2>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Authentication Study</p>
                 </header>
                 {isnadLoading ? (
                   <div className="py-24 text-center space-y-6">
                      <div className="flex justify-center gap-3">
                         <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                         <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                         <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" />
                      </div>
                      <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Connecting Narrators...</p>
                   </div>
                 ) : isnadData && (
                    <div className="space-y-6">
                       <div className="bg-white p-8 rounded-[40px] border-l-8 border-indigo-600 shadow-lg">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">Final Verdict</h4>
                          <p className="text-2xl font-black text-indigo-900">{isnadData.reliability}</p>
                       </div>
                       <div className="space-y-4">
                          {isnadData.narrators.map((n, i) => (
                            <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative">
                               <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-black text-gray-900">{n.name}</h5>
                                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{n.reliability}</span>
                               </div>
                               <p className="text-xs text-gray-600 leading-relaxed">{n.bio}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end p-4">
           <div className="w-full bg-white rounded-[56px] max-h-[90%] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-500">
              <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto my-6 shrink-0" />
              <div className="px-10 flex items-center justify-between mb-4">
                 <h3 className="text-2xl font-black text-violet-900 flex items-center gap-3">
                   <Icons.AI /> AI Wisdom
                 </h3>
                 <button onClick={() => setAiModalOpen(false)} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-10 no-scrollbar">
                 {insightLoading ? (
                   <div className="py-24 text-center space-y-8">
                      <div className="flex justify-center gap-3">
                        <div className="w-4 h-4 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-4 h-4 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-4 h-4 bg-violet-500 rounded-full animate-bounce" />
                      </div>
                      <p className="text-xs font-black text-violet-900 uppercase tracking-[0.4em]">Decoding Meaning...</p>
                   </div>
                 ) : aiInsight && (
                   <>
                      <div className="bg-violet-50 p-8 rounded-[40px] border border-violet-100 shadow-inner">
                         <h4 className="text-[10px] font-black text-violet-700 uppercase mb-4 flex items-center gap-2">
                           <Icons.AI /> Precision {targetLang.toUpperCase()} Result
                         </h4>
                         <p className={`${translationClass} text-xl italic text-violet-950 font-bold`}>"{aiInsight.translation}"</p>
                      </div>
                      <section>
                         <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.3em]">Commentary</h4>
                         <p className={`${translationClass} text-gray-800 text-lg`}>{aiInsight.explanation}</p>
                      </section>
                      <section className="flex flex-wrap gap-3">
                         {aiInsight.keyThemes.map((t, i) => (
                           <span key={i} className="px-5 py-2.5 bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-700 border border-violet-100 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-sm">#{t}</span>
                         ))}
                      </section>
                   </>
                 )}
              </div>
              <div className="p-10 bg-white border-t border-gray-50 shrink-0">
                 <button onClick={() => setAiModalOpen(false)} className="w-full bg-violet-600 text-white py-5 rounded-[32px] font-black shadow-xl shadow-violet-200 active:scale-95 transition-all text-sm uppercase tracking-widest">Close</button>
              </div>
           </div>
        </div>
      )}

      {/* Persistent Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/95 backdrop-blur-xl border border-gray-100 py-4 px-8 flex justify-between items-center z-40 rounded-[40px] shadow-2xl">
         <NavItem active={view === AppView.HOME} onClick={() => setView(AppView.HOME)} icon={<Icons.Search />} label="Home" color={COLORS.emerald.primary} />
         <NavItem active={view === AppView.QURAN_LIST} onClick={() => setView(AppView.QURAN_LIST)} icon={<Icons.Quran />} label="Quran" color={COLORS.emerald.primary} />
         <NavItem active={view === AppView.BOOKS_EXPLORER} onClick={() => setView(AppView.BOOKS_EXPLORER)} icon={<Icons.Hadith />} label="Research" color={COLORS.amber.primary} />
         
         <button onClick={() => {
           const next = targetLang === 'en' ? 'ta' : 'en';
           setTargetLang(next);
           if (view === AppView.SURAH_DETAIL && selectedSurah) loadSurah(selectedSurah, next);
         }} className="flex flex-col items-center gap-1 group">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase transition-all shadow-md ${targetLang === 'ta' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {targetLang}
            </div>
            <span className="text-[9px] font-black uppercase text-gray-400">Switch</span>
         </button>
      </nav>
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
    <div className={`flex items-center gap-2 ${config.bg} px-4 py-2 rounded-2xl border border-opacity-30`} style={{ borderColor: config.color }}>
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
