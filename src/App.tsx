import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Settings, 
  PlusCircle, 
  Clipboard, 
  Printer, 
  Loader2, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Layers,
  GraduationCap,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export default function App() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Matematika');
  const [grade, setGrade] = useState('SD Kelas 4');
  const [difficulty, setDifficulty] = useState('Sedang');
  const [count, setCount] = useState(5);
  const [type, setType] = useState<'multiple_choice' | 'essay'>('multiple_choice');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  
  // API Key States
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('gemini_api_key', newKey);
  };

  const generateQuestions = async () => {
    if (!topic) {
      setError('Harap masukkan topik soal.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey
        },
        body: JSON.stringify({ topic, subject, grade, difficulty, count, type }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat soal. Periksa koneksi backend.');
      if (err.message?.includes('API Key')) {
        setShowApiKeyInput(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = questions.map((q, i) => {
      let qText = `${i + 1}. ${q.question}\n`;
      if (q.options) {
        qText += q.options.join('\n') + '\n';
      }
      qText += `Jawaban: ${q.answer}\n`;
      if (q.explanation) qText += `Penjelasan: ${q.explanation}\n`;
      return qText;
    }).join('\n');
    navigator.clipboard.writeText(text);
    alert('Soal disalin ke clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#1A1A1A]/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5A5A40] rounded-lg flex items-center justify-center text-white">
              <BookOpen size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SoalGen AI</h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#1A1A1A]/60">
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Beranda</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Riwayat</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Bantuan</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Settings Panel */}
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#1A1A1A]/5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-[#5A5A40]" />
                  <h2 className="font-semibold">Pengaturan Soal</h2>
                </div>
                <button 
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className={`p-2 rounded-lg transition-colors ${showApiKeyInput ? 'bg-[#5A5A40] text-white' : 'hover:bg-[#F5F5F0] text-[#1A1A1A]/40'}`}
                  title="Pengaturan API Key"
                >
                  <Key size={16} />
                </button>
              </div>

              <AnimatePresence>
                {showApiKeyInput && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                    className="overflow-hidden space-y-3"
                  >
                    <div className="p-4 bg-[#F5F5F0] rounded-2xl border border-[#5A5A40]/10">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-2 block flex items-center justify-between">
                        Gemini API Key
                        <span className="text-[#5A5A40] lowercase font-normal italic">Simpan otomatis</span>
                      </label>
                      <div className="relative">
                        <input 
                          type={isKeyVisible ? "text" : "password"} 
                          placeholder="Masukkan AI Studio API Key..." 
                          value={apiKey}
                          onChange={handleApiKeyChange}
                          className="w-full bg-white border-none rounded-xl pl-4 pr-10 py-2 text-xs focus:ring-1 focus:ring-[#5A5A40] outline-none"
                        />
                        <button 
                          onClick={() => setIsKeyVisible(!isKeyVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/20 hover:text-[#5A5A40]"
                        >
                          {isKeyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <p className="text-[9px] text-[#1A1A1A]/40 mt-2 leading-relaxed">
                        Kunci ini disimpan hanya di browser Anda dan digunakan untuk mengakses model AI.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1.5 block">Subjek</label>
                  <select 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                  >
                    <option>Matematika</option>
                    <option>Bahasa Indonesia</option>
                    <option>IPA</option>
                    <option>IPS</option>
                    <option>Bahasa Inggris</option>
                    <option>PPKn</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1.5 block">Topik / Materi</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Pecahan Senilai" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1.5 block">Jenjang</label>
                    <select 
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                    >
                      <option>SD Kelas 4</option>
                      <option>SD Kelas 5</option>
                      <option>SD Kelas 6</option>
                      <option>SMP Kelas 7</option>
                      <option>SMP Kelas 8</option>
                      <option>SMP Kelas 9</option>
                      <option>SMA Kelas 10</option>
                      <option>SMA Kelas 11</option>
                      <option>SMA Kelas 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1.5 block">Kesulitan</label>
                    <select 
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                    >
                      <option>Mudah</option>
                      <option>Sedang</option>
                      <option>Sulit</option>
                      <option>HOTS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1.5 block">Tipe Soal</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F5F0] rounded-xl">
                    <button 
                      onClick={() => setType('multiple_choice')}
                      className={`py-2 text-xs font-medium rounded-lg transition-all ${type === 'multiple_choice' ? 'bg-white shadow-sm text-[#5A5A40]' : 'text-[#1A1A1A]/40'}`}
                    >
                      Pilihan Ganda
                    </button>
                    <button 
                      onClick={() => setType('essay')}
                      className={`py-2 text-xs font-medium rounded-lg transition-all ${type === 'essay' ? 'bg-white shadow-sm text-[#5A5A40]' : 'text-[#1A1A1A]/40'}`}
                    >
                      Essay
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1.5 block">Jumlah Soal: {count}</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1A1A1A]/10 rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 italic">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <button 
                  onClick={generateQuestions}
                  disabled={loading}
                  className="w-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-[#5A5A40]/10"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span>Buat Soal Sekarang</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-[#5A5A40]/10 rounded-3xl p-6 border border-[#5A5A40]/10">
              <h3 className="text-sm font-bold text-[#5A5A40] mb-2">Tips Pembuatan Soal</h3>
              <p className="text-xs text-[#5A5A40]/70 leading-relaxed italic">
                Berikan topik yang spesifik untuk hasil terbaik. Misal: "Siklus Air" lebih baik daripada "IPA".
              </p>
            </div>
          </section>

          {/* Questions Result Panel */}
          <section className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-light flex items-center gap-3">
                Daftar Soal 
                {questions.length > 0 && <span className="text-sm font-sans font-bold bg-[#5A5A40] text-white px-3 py-1 rounded-full">{questions.length}</span>}
              </h2>
              {questions.length > 0 && (
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white rounded-xl transition-colors text-[#1A1A1A]/60 hover:text-[#5A5A40] border border-transparent hover:border-[#5A5A40]/20"
                    title="Salin semua soal"
                  >
                    <Clipboard size={20} />
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="p-2 hover:bg-white rounded-xl transition-colors text-[#1A1A1A]/60 hover:text-[#5A5A40] border border-transparent hover:border-[#5A5A40]/20"
                    title="Cetak soal"
                  >
                    <Printer size={20} />
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {questions.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 print:space-y-8"
                >
                  {questions.map((q, idx) => (
                    <motion.div 
                      key={q.id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-3xl overflow-hidden border border-[#1A1A1A]/5 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="p-1 bg-[#F5F5F0] border-b border-[#1A1A1A]/5 flex items-center justify-between px-6 py-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/30">Soal #{idx + 1}</span>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#1A1A1A]/30 uppercase">
                            <Layers size={10} /> {difficulty}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#1A1A1A]/30 uppercase">
                            <GraduationCap size={10} /> {grade}
                          </div>
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-lg font-medium leading-relaxed mb-6 group-hover:text-[#5A5A40] transition-colors">
                          {q.question}
                        </h3>
                        
                        {q.options && q.options.length > 0 && (
                          <div className="grid md:grid-cols-2 gap-3 mb-8">
                            {q.options.map((opt, i) => (
                              <div 
                                key={i}
                                className="p-4 rounded-2xl bg-[#F5F5F0] text-sm border border-transparent hover:border-[#5A5A40]/20 hover:bg-white transition-all cursor-default flex items-start gap-3"
                              >
                                <span className="w-6 h-6 flex-shrink-0 bg-white rounded-lg flex items-center justify-center font-bold text-[10px] text-[#5A5A40] shadow-sm">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                {opt.replace(/^[A-D][\.\:\s]+/, '')}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-6 border-t border-dashed border-[#1A1A1A]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#5A5A40]">
                              <CheckCircle2 size={14} />
                              KUNCI JAWABAN
                            </div>
                            <p className="text-sm text-[#1A1A1A]/70 font-medium ml-6">{q.answer}</p>
                          </div>
                          
                          {q.explanation && (
                            <div className="md:max-w-xs space-y-1 text-right">
                              <span className="text-[10px] font-bold text-[#1A1A1A]/30 uppercase tracking-widest">Penjelasan</span>
                              <p className="text-[11px] leading-relaxed text-[#1A1A1A]/50 italic">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="flex justify-center pt-8 pb-12 opacity-50 text-[10px] font-bold uppercase tracking-[0.3em] text-[#1A1A1A]">
                    --- Akhir Lembar Soal ---
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border-2 border-dashed border-[#1A1A1A]/10 rounded-[40px] aspect-video flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-16 h-16 bg-[#F5F5F0] rounded-3xl flex items-center justify-center text-[#1A1A1A]/20 mb-6">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="text-xl font-medium text-[#1A1A1A]/80 mb-2">Belum ada soal yang dibuat</h3>
                  <p className="text-sm text-[#1A1A1A]/40 max-w-xs mx-auto">
                    Gunakan panel di samping untuk mulai membuat soal secara otomatis dengan AI.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-[#1A1A1A]/5 flex flex-col md:flex-row items-center justify-between text-[#1A1A1A]/30 text-[10px] font-bold uppercase tracking-widest gap-4">
        <div>&copy; 2024 SOALGEN AI - SEMUA HAK DILINDUNGI</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#5A5A40]">Kebijakan Privasi</a>
          <a href="#" className="hover:text-[#5A5A40]">Syarat Penggunaan</a>
        </div>
      </footer>
    </div>
  );
}
