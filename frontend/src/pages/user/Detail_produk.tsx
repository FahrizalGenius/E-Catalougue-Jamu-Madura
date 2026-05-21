import React, { useEffect, useState } from 'react';

export interface ProductDetailProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any; 
}

const DetailProduk: React.FC<ProductDetailProps> = ({ isOpen, onClose, product }) => {
  // --- STATE UNTUK JAMU AKTIF & DAFTAR REKOMENDASI TERKAIT ---
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [rekomendasiTerkait, setRekomendasiTerkait] = useState<any[]>([]);
  const [loadingTerkait, setLoadingTerkait] = useState<boolean>(false);

  // --- FUNGSI AMBIL DATA DETAIL + SARAN TERKAIT DARI BACKEND ---
  const muatDetailDanSaran = async (idJamu: number) => {
    setLoadingTerkait(true);
    try {
      const response = await fetch(`http://localhost:5000/api/jamu/${idJamu}`);
      const jsonResult = await response.json();
      
      if (jsonResult.status === 'success') {
        setCurrentProduct(jsonResult.data);
        setRekomendasiTerkait(jsonResult.jamu_terkait || []);
      }
    } catch (error) {
      console.error("Gagal memuat jamu terkait:", error);
    } finally {
      setLoadingTerkait(false);
    }
  };

  // Triger fungsi ketika modal dibuka pertama kali membawa properti dari katalog luar
  useEffect(() => {
    if (isOpen && product?.id_jamu) {
      muatDetailDanSaran(product.id_jamu);
    }
  }, [isOpen, product]);

  if (!isOpen || !currentProduct) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred overlay */}
      <div 
        className="absolute inset-0 bg-white/40 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out_forwards] cursor-pointer"
        onClick={onClose}
      ></div>
      
      {/* Definisi Animasi Khusus untuk Modal */}
      <style>
        {`
          @keyframes modalPop {
            0% { opacity: 0; transform: scale(0.9) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #999; border-radius: 4px; }
        `}
      </style>

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-[950px] bg-[#d9d9d9] rounded-[20px] p-6 sm:p-10 shadow-2xl flex flex-col min-h-[500px] animate-[modalPop_0.4s_ease-out_forwards] max-h-[90vh] overflow-y-auto custom-scrollbar">
         
         {/* ATAS: ATRIBUT UTAMA (FLEX ROW KIRI & KANAN) */}
         <div className="flex flex-col md:flex-row w-full mb-8">
            
            {/* Left Side */}
            <div className="w-full md:w-[45%] flex flex-col relative md:pr-8 md:border-r border-gray-400 mb-8 md:mb-0">
               <button 
                 onClick={onClose}
                 className="self-start bg-[#b58e1b] text-white px-8 py-2 rounded-full font-semibold hover:bg-[#9a7815] transition-colors shadow-md text-[15px]"
               >
                 Kembali
               </button>
               
               <div className="mt-8 w-full flex-grow flex items-center justify-center">
                  {currentProduct.image ? (
                     <img 
                       src={`http://localhost:5000/static/uploads/${currentProduct.image}`} 
                       alt={currentProduct.nama_jamu} 
                       className="w-full aspect-square max-w-[320px] object-cover rounded-[24px] shadow-lg border-[4px] border-orange-300"
                       onError={(e) => {
                         (e.target as HTMLImageElement).onerror = null;
                         (e.target as HTMLImageElement).src = "https://via.placeholder.com/400?text=Gambar+Tidak+Ditemukan";
                       }}
                     />
                  ) : (
                     <div className="w-full aspect-square max-w-[320px] bg-gradient-to-b from-yellow-100 to-orange-400 rounded-[24px] overflow-hidden shadow-lg relative flex flex-col items-center justify-center p-4 text-center border-[4px] border-orange-300">
                         <span className="text-red-600 font-black text-[20px] leading-tight mb-1 uppercase break-words w-full px-2">
                           {currentProduct.nama_jamu}
                         </span>
                         <span className="text-red-600 font-black text-[13px] leading-tight mb-4 uppercase">
                           {currentProduct.nama_jenis || 'Tradisional'}
                         </span>
                         <div className="w-16 h-24 bg-black rounded-xl flex flex-col items-center justify-center border-2 border-yellow-500 shadow-xl shrink-0">
                            <span className="text-yellow-500 text-[8px] font-bold mt-1 leading-tight px-1">Jamu Tradisional</span>
                         </div>
                     </div>
                  )}
               </div>
            </div>
            
            {/* Right Side */}
            <div className="w-full md:w-[55%] md:pl-8 flex flex-col justify-center">
               <h2 className="text-[26px] sm:text-[32px] font-bold text-center mb-6 leading-tight text-[#222] font-serif capitalize">
                 {currentProduct.nama_jamu}
               </h2>
               
               <div className="w-full overflow-hidden rounded-xl border border-neutral-500/40 shadow-lg mb-6">
                 <table className="w-full text-[13px] sm:text-[14px] bg-[#323232] text-[#f5f5f5] table-fixed border-collapse">
                   <tbody>
                     <tr className="border-b border-neutral-600/50 hover:bg-[#3a3a3a] transition-colors">
                       <td className="p-3 w-[110px] sm:w-[150px] font-bold text-gray-400 bg-[#252525] border-r border-neutral-600/50 uppercase text-[10px] tracking-wider text-center md:text-left">
                         Nama Jamu
                       </td>
                       <td className="p-3 break-words font-medium text-white capitalize">
                         {currentProduct.nama_jamu || "-"}
                       </td>
                     </tr>
                     
                     <tr className="border-b border-neutral-600/50 hover:bg-[#3a3a3a] transition-colors">
                       <td className="p-3 font-bold text-gray-400 bg-[#252525] border-r border-neutral-600/50 uppercase text-[10px] tracking-wider text-center md:text-left">
                         Asal Daerah
                       </td>
                       <td className="p-3 text-emerald-400 font-semibold tracking-wide capitalize">
                         {currentProduct.nama_kabupaten || "Lokal"}
                       </td>
                     </tr>
                     
                     <tr className="border-b border-neutral-600/50 hover:bg-[#3a3a3a] transition-colors">
                       <td className="p-3 font-bold text-gray-400 bg-[#252525] border-r border-neutral-600/50 uppercase text-[10px] tracking-wider text-center md:text-left">
                         Jenis Bentuk
                       </td>
                       <td className="p-3 font-medium text-neutral-200 capitalize">
                         {currentProduct.nama_jenis || "Tradisional"}
                       </td>
                     </tr>
                     
                     <tr className="border-b border-neutral-600/50 hover:bg-[#3a3a3a] transition-colors">
                       <td className="p-3 font-bold text-gray-400 bg-[#252525] border-r border-neutral-600/50 uppercase text-[10px] tracking-wider text-center md:text-left">
                         Legalitas
                       </td>
                       <td className="p-3 text-amber-400 font-bold tracking-wider uppercase text-[12px]">
                         {currentProduct.nama_perizinan || "Tanpa Perizinan"}
                       </td>
                     </tr>
                     
                     <tr className="border-b border-neutral-600/50 hover:bg-[#3a3a3a] transition-colors">
                       <td className="p-3 font-bold text-gray-400 bg-[#252525] border-r border-neutral-600/50 uppercase text-[10px] tracking-wider text-center md:text-left">
                         Bahan Baku
                       </td>
                       <td className="p-3 italic text-neutral-300 break-words leading-relaxed">
                         {currentProduct.kandungan || "Kandungan Alami Tradisional"}
                       </td>
                     </tr>
                     
                     <tr className="hover:bg-[#3a3a3a] transition-colors">
                       <td className="p-3 font-bold text-gray-400 bg-[#252525] border-r border-neutral-600/50 uppercase text-[10px] tracking-wider text-center md:text-left">
                         Aturan Minum
                       </td>
                       <td className="p-3 break-words text-orange-300 font-medium leading-relaxed">
                         {currentProduct.aturan_minum || "Tidak ada keterangan spesifik"}
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
               
               <div className="flex flex-col">
                 <span className="font-bold text-[#222] mb-2 text-[14px] tracking-wide uppercase">🎯 Khasiat Utama :</span>
                 <div className="bg-[#cdcdcd] rounded-[15px] p-4 text-[13px] sm:text-[14px] text-[#222] text-justify leading-relaxed max-h-28 overflow-y-auto border border-gray-400 shadow-inner custom-scrollbar">
                   {currentProduct.khasiat || "Belum ada deskripsi khasiat yang dimasukkan untuk produk jamu ini, Bang."}
                 </div>
               </div>
            </div>
         </div>

         {/* 🔥 BAWAH: SARAN JAMU TERKAIT LAINNYA (SINKRON COSINE SIMILARITY ML) */}
         <div className="w-full border-t border-gray-400/60 pt-6 mt-2">
            <h3 className="text-[14px] font-bold text-[#222] mb-4 tracking-wide uppercase flex items-center gap-2">
               🌿 Saran Jamu Lainnya (Khasiat Serupa) :
            </h3>

            {loadingTerkait ? (
               <div className="flex items-center justify-center py-8 w-full gap-2">
                  <div className="w-5 h-5 border-2 border-[#b58e1b] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-700 font-semibold animate-pulse">AI sedang meramu saran jamu terdekat...</span>
               </div>
            ) : (
               <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {rekomendasiTerkait.length > 0 ? (
                     rekomendasiTerkait.map((itemRelated) => (
                        <div 
                           key={itemRelated.id_jamu}
                           onClick={() => muatDetailDanSaran(itemRelated.id_jamu)}
                           className="bg-[#eef6ec] p-2.5 rounded-[15px] shadow border border-green-100 hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all duration-300 flex flex-col items-center text-center group"
                        >
                           <div className="w-full aspect-square rounded-xl overflow-hidden bg-orange-100 border border-orange-200 mb-2 shrink-0">
                              {itemRelated.image ? (
                                 <img 
                                    src={`http://localhost:5000/static/uploads/${itemRelated.image}`} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    alt={itemRelated.nama_jamu}
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-orange-500 font-bold text-sm uppercase p-1">
                                    {itemRelated.nama_jamu ? itemRelated.nama_jamu.substring(0, 3) : "JAMU"}
                                 </div>
                              )}
                           </div>
                           <h4 className="font-bold text-[13px] text-gray-800 truncate w-full px-1 capitalize group-hover:text-green-700 transition-colors">
                              {itemRelated.nama_jamu}
                           </h4>
                           <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                              {itemRelated.nama_jenis || "Tradisional"}
                           </span>
                        </div>
                     ))
                  ) : (
                     <div className="col-span-full py-6 text-center text-xs text-gray-600 italic bg-white/40 rounded-xl border border-dashed border-gray-400">
                        Tidak ada jamu pembanding sejenis lainnya di database, Bang.
                     </div>
                  )}
               </div>
            )}
         </div>
         
      </div>
    </div>
  );
};

export default DetailProduk;