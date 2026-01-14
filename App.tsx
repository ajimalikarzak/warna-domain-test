
import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { GeminiService } from './geminiService';
import { ImageHistoryItem } from './types';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [instruction, setInstruction] = useState('');
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  const presets = [
    { label: 'Ultra Sharp Excel', prompt: 'Prioritize text sharpness. Pure black ink, crisp characters, Excel blue headers. Auto-straighten and deskew the document.' },
    { label: 'High Contrast Green', prompt: 'Maximum contrast between text and background. Emerald green theme. Auto-straighten and deskew.' },
    { label: 'Digital Scan (Clean)', prompt: 'Make it look like a high-quality digital PDF. No grain, no noise, very bold text. Auto-straighten and align.' },
  ];

  // Listener untuk Paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                setSelectedImage(result);
                setProcessedImage(null);
                if (activeTab !== 'editor') setActiveTab('editor');
              };
              reader.readAsDataURL(blob);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  // Simulasi progres visual
  useEffect(() => {
    let interval: any;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return prev; // Menunggu hasil asli di 98%
          const step = prev < 60 ? 1.5 : 0.5;
          return Math.min(98, prev + step);
        });
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleProcess = async (customPrompt?: string) => {
    if (!selectedImage || loading) return;
    setLoading(true);
    setProcessedImage(null);
    try {
      const finalPrompt = customPrompt || instruction;
      const colorized = await GeminiService.colorizePhotocopy(selectedImage, finalPrompt);
      
      setProgress(100);
      setTimeout(() => {
        setProcessedImage(colorized);
        setLoading(false);
        const newItem: ImageHistoryItem = {
          id: Date.now().toString(),
          original: selectedImage,
          processed: colorized,
          timestamp: Date.now(),
          prompt: finalPrompt || 'Auto-Aligned Restoration'
        };
        setHistory(prev => [newItem, ...prev]);
      }, 400);
    } catch (error) {
      console.error(error);
      alert("Proses gagal. Pastikan gambar terbaca dengan jelas.");
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    setInstruction('');
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900 selection:bg-indigo-100">
      <nav className="glass sticky top-0 z-50 py-4 px-6 mb-8 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6-9a3 3 0 116 0 3 3 0 01-6 0zm-1 12H5a2 2 0 01-2-2V9a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v2m4-4h1a2 2 0 012 2v2m-4 6h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">
                Colori<span className="text-indigo-600">FX</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Smart Deskew & Sharp Text</p>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('editor')} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Editor</button>
            <button onClick={() => setActiveTab('history')} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>History</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        {activeTab === 'editor' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-6">
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest">1. Input Document</h2>
                {!selectedImage ? (
                  <div className="space-y-4">
                    <ImageUploader onImageSelected={setSelectedImage} isLoading={loading} />
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold shadow-sm">Ctrl + V</kbd>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Supported Paste</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-100 bg-white group">
                    <img src={selectedImage} alt="Original" className="w-full h-48 object-contain" />
                    {!loading && (
                      <button onClick={reset} className="absolute top-2 right-2 p-2 bg-white/90 text-slate-900 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:scale-110">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                )}
              </section>

              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest">2. Styling & Instruction</h2>
                <div className="space-y-2 mb-4">
                  {presets.map(p => (
                    <button
                      key={p.label}
                      onClick={() => { setInstruction(p.prompt); handleProcess(p.prompt); }}
                      disabled={!selectedImage || loading}
                      className="w-full text-left text-[11px] py-3 px-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-600 hover:bg-indigo-50 transition-all font-black text-slate-900 flex justify-between items-center group disabled:opacity-50 shadow-sm"
                    >
                      {p.label}
                      <svg className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-600 transition-all shadow-inner">
                  <textarea
                    className="w-full p-4 bg-white text-slate-900 placeholder:text-slate-400 outline-none text-sm h-24 resize-none font-bold"
                    placeholder="Custom instruction (e.g. 'Make it perfectly vertical')..."
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => handleProcess()}
                  disabled={!selectedImage || loading}
                  className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-600 disabled:opacity-50 transition-all uppercase tracking-widest relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? `Processing ${Math.round(progress)}%` : 'Transform Document'}
                  </span>
                  {loading && (
                    <div 
                      className="absolute left-0 top-0 h-full bg-indigo-500/40 transition-all duration-300 ease-linear" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  )}
                </button>
              </section>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-full min-h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Restored Document Output</h2>
                  {processedImage && (
                    <a href={processedImage} download="colorized-restoration.png" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95">
                      Download PNG
                    </a>
                  )}
                </div>
                
                <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 relative group min-h-[400px]">
                  {processedImage ? (
                    <img src={processedImage} alt="Colorized" className="w-full h-full object-contain bg-white transition-transform duration-700 group-hover:scale-[1.02]" />
                  ) : (
                    <div className="text-center p-12 w-full h-full flex items-center justify-center">
                      {loading ? (
                        <div className="flex flex-col items-center gap-8 w-full max-w-md">
                           <div className="relative w-full bg-slate-200 h-4 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600 bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear] transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                              ></div>
                           </div>
                           <div className="flex flex-col items-center animate-pulse">
                              <p className="font-black text-4xl text-indigo-600 leading-none mb-3">{Math.round(progress)}%</p>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-4">Analyzing Angle & Enhancing Ink</p>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center opacity-20">
                          <svg className="w-24 h-24 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <p className="text-sm font-black uppercase tracking-widest text-slate-900">Output Preview Area</p>
                          <p className="text-[10px] font-bold mt-2">Upload or Paste a photo to start</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                  <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-100 shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-900 mb-1">AI Smart Features Active</h4>
                    <p className="text-[11px] text-indigo-800 font-bold leading-relaxed opacity-80">
                      Sistem akan mendeteksi rotasi dokumen secara otomatis, meluruskan grid tabel, dan mengkonversi teks pudar menjadi tinta hitam tajam (HD Readability).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300 opacity-50">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">No transformation history yet</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all group">
                  <div className="flex h-44 bg-slate-100">
                    <img src={item.original} className="w-1/2 object-contain bg-slate-50 border-r border-slate-100 grayscale opacity-60" alt="B&W" />
                    <img src={item.processed} className="w-1/2 object-contain bg-white" alt="Color" />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter truncate max-w-[150px]">{item.prompt}</p>
                      <p className="text-[9px] font-bold text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => { setSelectedImage(item.original); setProcessedImage(item.processed); setActiveTab('editor'); }} className="text-[10px] font-black bg-slate-900 text-white w-full py-3 rounded-xl hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-md">Open in Editor</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default App;
