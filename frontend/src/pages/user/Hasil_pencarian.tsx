import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavbarUser from '../../components/navbar_user';
import FooterUser from '../../components/footer_user';
import DetailProduk from './Detail_produk';
import bgImageLeft from './Background hadap kiri.png';

const Recommendation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🎯 TANGKAP TEKS KELUHAN YANG DIKIRIM DARI DASHBOARD UTAMA
  const kataKunciAwal = location.state?.pencarian || "";

  // State Modal Detail Produk
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // State Input Teks & Penampung Data Hasil Prediksi Machine Learning
  const [searchText, setSearchText] = useState(kataKunciAwal);
  const [dataRekomendasi, setDataRekomendasi] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState<{ asli: string, terkoreksi: string, mode: 'showing_corrected' | 'showing_original' } | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter limit hasil rekomendasi (5 atau 10, default 5)
  const [limit, setLimit] = useState<number>(5);
  // Metadata model NLP
  const [prediksiLabel, setPrediksiLabel] = useState<string>("");
  const [confidence, setConfidence] = useState<number | null>(null);

  // 🛰️ FUNGSI HIT API BACKEND FLASK UNTUK MENDAPATKAN REKOMENDASI ML
  const ambilRekomendasiML = async (queryTeks: string, skipCorrection: boolean = false) => {
    if (!queryTeks.trim()) return;
    
    setLoading(true);
    if (!skipCorrection) {
      setSuggestion(null); // Reset suggestion saat mencari baru
    }
    try {
      const response = await fetch('http://localhost:5000/api/jamu/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          keluhan: queryTeks,
          skip_correction: skipCorrection
        }),
      });
      
      const jsonResult = await response.json();
      
      if (jsonResult.status === 'success') {
        setDataRekomendasi(jsonResult.data || []);
        setPrediksiLabel(jsonResult.prediksi_label || "");
        setConfidence(jsonResult.confidence !== undefined ? jsonResult.confidence : null);
        if (jsonResult.teks_asli && jsonResult.teks_terkoreksi && jsonResult.teks_asli.toLowerCase() !== jsonResult.teks_terkoreksi.toLowerCase()) {
          setSuggestion({
            asli: jsonResult.teks_asli,
            terkoreksi: jsonResult.teks_terkoreksi,
            mode: skipCorrection ? 'showing_original' : 'showing_corrected'
          });
        } else {
          setSuggestion(null);
        }
      } else {
        setDataRekomendasi([]);
        setPrediksiLabel("");
        setConfidence(null);
        setSuggestion(null);
      }
    } catch (error) {
      console.error("Gagal mengambil data rekomendasi ML:", error);
      setDataRekomendasi([]);
      setPrediksiLabel("");
      setConfidence(null);
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kataKunciAwal) {
      ambilRekomendasiML(kataKunciAwal);
    }
  }, [kataKunciAwal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ambilRekomendasiML(searchText);
  };

  const handleCardClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <NavbarUser />

      {/* Main Content dengan background kiri terkunci (bg-fixed) */}
      <main 
        className="flex-grow pt-40 pb-24 flex flex-col items-center bg-cover bg-fixed bg-left bg-no-repeat relative"
        style={{ backgroundImage: `url('${bgImageLeft}')` }}
      >
        {/* Overlay tipis agar teks tetap terbaca tajam */}
        <div className="absolute inset-0 bg-white/50 pointer-events-none z-0"></div>
        
        <div className="w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col">
          
          {/* TOP SECTION: JUDUL HALAMAN & KAPSUL PENCARIAN */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-6 animate-[slideDownFade_0.8s_ease-out_forwards]">
            <h1 className="text-[36px] sm:text-[42px] font-bold font-serif text-[#222] tracking-tight">
              Hasil Pencaharian
            </h1>
            
            {/* Search Input Kapsul */}
            <form 
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-[#e8dbdf] rounded-full px-6 py-4 w-full sm:w-auto sm:min-w-[420px] shadow-md transition-transform focus-within:scale-[1.02] border border-gray-300/40"
            >
              <button 
                type="button"
                onClick={() => navigate("/")} 
                className="text-[#555] hover:text-black transition-colors focus:outline-none mr-3"
                title="Kembali ke Halaman Utama"
              >
                 <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                 </svg>
              </button>
              
              <input 
                type="text" 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Tulis keluhan tubuh Anda di sini..." 
                className="bg-transparent border-none outline-none flex-grow text-[#222] px-2 text-[18px] placeholder-[#777] focus:ring-0"
              />
              
              {searchText && (
                <button 
                  type="button"
                  onClick={() => setSearchText("")} 
                  className="text-[#666] hover:text-red-600 transition-colors focus:outline-none ml-2"
                >
                   <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                </button>
              )}
            </form>
          </div>
          
          {/* LOGIKA SUGGESTI TYPO (PREMIUM GOOGLE-LIKE STYLE) */}
          {suggestion && !loading && (
            <div className="w-full mb-10 bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-emerald-200/50 shadow-lg animate-[slideDownFade_0.5s_ease-out_forwards] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start md:items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0 shadow-inner">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                
                <div>
                  {suggestion.mode === 'showing_corrected' ? (
                    <>
                      <p className="text-gray-800 text-[18px] md:text-[20px] font-medium">
                        Menampilkan hasil untuk:{" "}
                        <span className="font-bold text-emerald-800 italic px-1">
                          "{suggestion.terkoreksi}"
                        </span>
                      </p>
                      <p className="text-gray-500 text-[14px] md:text-[15px] mt-1.5 font-medium">
                        Tetap cari alih-alih:{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setSearchText(suggestion.asli);
                            ambilRekomendasiML(suggestion.asli, true);
                          }}
                          className="text-[#34C759] font-semibold hover:text-emerald-700 underline focus:outline-none transition-all duration-300"
                        >
                          "{suggestion.asli}"
                        </button>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-800 text-[18px] md:text-[20px] font-medium">
                        Menampilkan hasil untuk:{" "}
                        <span className="font-bold text-gray-700 italic px-1">
                          "{suggestion.asli}"
                        </span>
                      </p>
                      <p className="text-emerald-800 text-[15px] md:text-[16px] mt-1.5 font-semibold flex items-center gap-1.5">
                        <span className="text-gray-500 font-medium">Mungkin maksud Anda:</span>{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setSearchText(suggestion.terkoreksi);
                            ambilRekomendasiML(suggestion.terkoreksi, false);
                          }}
                          className="text-[#34C759] font-bold hover:text-emerald-700 underline focus:outline-none transition-all duration-300 scale-100 hover:scale-105 inline-block"
                        >
                          "{suggestion.terkoreksi}"
                        </button>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LOGIKA LOADING SPINNER SAAT MACHINE LEARNING BERHITUNG */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 w-full col-span-full">
              <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700 font-bold text-lg animate-pulse">Model AI sedang menganalisis ramuan jamu terbaik...</p>
            </div>
          ) : (
            <>
              {/* TOOLBAR: ANALISIS NLP & FILTER LIMIT */}
              {dataRekomendasi.length > 0 && (
                <div className="mb-10 p-5 bg-white/80 backdrop-blur-md border border-emerald-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md animate-[slideDownFade_0.5s_ease-out_forwards]">
                  <div className="flex items-center gap-3">
                    {prediksiLabel ? (
                      <>
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <p className="text-[16px] font-medium text-gray-800">
                          Kategori Keluhan Terdeteksi: <span className="font-bold text-emerald-800 capitalize">{prediksiLabel.replace('_', ' ')}</span>
                          {confidence !== null && (
                            <span className="text-gray-500 text-sm ml-2">
                              (Tingkat Keyakinan: {(confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="text-[16px] font-medium text-gray-800">
                        Menampilkan rekomendasi jamu berdasarkan keluhan Anda.
                      </p>
                    )}
                  </div>
                  
                  {/* Limit Selector (Dropdown 5 atau 10) */}
                  <div className="flex items-center gap-3 bg-[#e8dbdf]/60 p-1.5 rounded-xl border border-gray-300/40 w-full md:w-auto justify-between md:justify-start">
                    <span className="text-xs font-bold text-gray-700 px-2">Tampilkan:</span>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="bg-white/90 text-gray-800 text-xs font-black py-1.5 px-3 pr-8 rounded-lg border border-gray-300/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all duration-300 cursor-pointer appearance-none relative"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.25em 1.25em',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <option value={5}>5 Rekomendasi</option>
                      <option value={10}>10 Rekomendasi</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 🔥 GRID KATALOG 5 KOLOM (Dibatasi oleh State limit) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-6 justify-items-center justify-center">
                {dataRekomendasi.length > 0 ? (
                  dataRekomendasi.slice(0, limit).map((item, idx) => (
                    <div 
                      key={item.id_jamu || idx}
                      onClick={() => handleCardClick(item)}
                      className="bg-[#eef6ec] w-full max-w-[240px] rounded-[20px] p-4 pb-5 shadow-lg flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl cursor-pointer transition-all duration-300 border border-green-100 animate-[slideUpFade_0.8s_ease-out_forwards]"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      {/* Gambar Produk */}
                      <div className="w-full aspect-[4/5] bg-gradient-to-b from-yellow-100 to-orange-400 rounded-2xl shadow-inner overflow-hidden mb-4 relative flex flex-col items-center justify-center p-2 text-center border-[3px] border-orange-300">
                         {item.image ? (
                            <img 
                              src={`http://localhost:5000/static/uploads/${item.image}`} 
                              alt={item.nama_jamu} 
                              className="w-full h-full object-cover rounded-xl"
                            />
                         ) : (
                            <>
                              <span className="text-red-600 font-black text-[18px] leading-tight mb-1 uppercase px-1">{item.nama_jamu}</span>
                              <span className="text-red-600 font-black text-[12px] leading-tight mb-2 uppercase">{item.nama_jenis || 'Tradisional'}</span>
                            </>
                         )}
                      </div>
                      
                      {/* Detail Informasi Teks Kartu */}
                      <div className="w-full text-center flex-grow flex flex-col justify-between">
                         <div className="flex flex-col h-full justify-between items-center">
                            <div>
                               <h3 className="text-gray-900 font-bold text-[18px] mb-1 truncate w-full px-1 capitalize">{item.nama_jamu}</h3>
                               <p className="text-gray-600 text-[14px] font-semibold mb-2 uppercase tracking-wide">{item.nama_jenis || "Jamu Madura"}</p>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 w-full">
                               <span className="inline-block px-3 py-0.5 bg-green-100 text-green-800 text-[12px] font-bold italic rounded-full shadow-sm">{item.nama_kabupaten || "Lokal"}</span>
                               {item.relevansi !== undefined && (
                                  <span className="inline-block px-3 py-0.5 bg-emerald-600 text-white text-[12px] font-black rounded-full shadow-md">
                                     Skor NLP: {item.relevansi}%
                                  </span>
                               )}
                            </div>
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  /* TAMPILAN JIKA KELUHAN TIDAK COCOK DENGAN RAMUAN APAPUN */
                  <div className="col-span-full py-28 text-center text-gray-500 font-medium text-xl italic bg-white/60 w-full rounded-2xl border-2 border-dashed border-gray-300 shadow-inner px-6">
                     Tidak ada ramuan jamu yang cocok dengan keluhan "{searchText || kataKunciAwal}", Bang. Coba masukkan gejala lain.
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>

      <FooterUser />

      {/* Modal Detail Produk */}
      <DetailProduk 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />

      <style>
        {`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideDownFade {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default Recommendation;