import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Tambah ini buat pindah halaman
import NavbarAdmin from '../../../components/navbar_admin';
import api from '../../../api/axiosConfig'; // 2. Panggil Asisten Axios

export default function Dashboard() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  
  // 3. State untuk nyimpen data asli dari Flask
  const [dataJamu, setDataJamu] = useState<any[]>([]);

  // 4. FUNGSI NARIK DATA DARI DATABASE
  const ambilDataJamu = async () => {
    try {
      const response = await api.get('/jenis'); 
      // Sesuaikan dengan format JSON dari Flask abang
      setDataJamu(response.data.data || response.data); 
    } catch (error) {
      console.error("Gagal narik data jamu:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    ambilDataJamu(); // Otomatis narik data pas buka halaman
  }, []);

  // 🔥 FUNGSI LOGOUT (VERSI JWT - SUPER SIMPEL!)
  const handleLogout = () => {
    const konfirmasi = window.confirm("Yakin mau logout, Bang?");
    if (konfirmasi) {
      // Tinggal hapus token dari brankas
      localStorage.removeItem('token_jamu');
      // Arahin ke halaman utama (Sesuai request abang di kode tadi)
      navigate('/4dm13n'); 
    }
  };

  // 🔥 FUNGSI HAPUS DATA
  const handleHapus = async (id: number) => {
    const konfirmasi = window.confirm("Yakin mau hapus jamu ini Bang?");
    if (!konfirmasi) return;

    try {
      await api.delete(`/jenis/${id}`); // Tembak rute hapus di Flask
      alert("Data berhasil dihapus!");
      ambilDataJamu(); // Refresh otomatis UI-nya setelah dihapus
    } catch (error) {
      console.error("Gagal hapus data:", error);
      alert("Gagal menghapus data.");
    }
  };

  return (
    <div className={`flex h-screen bg-[#F9F6EE] font-sans overflow-hidden transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Sidebar */}
      <NavbarAdmin />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* HEADER */}
        <header className="bg-[#344F51] text-white px-8 py-5 flex items-center justify-between shadow-md shrink-0">
          
          {/* Kiri */}
          <div className="flex items-center gap-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h1 className="text-2xl font-semibold tracking-wide">Dashboard</h1>
          </div>

          {/* Kanan (Logout) */}
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m-6 14h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
            </svg>
            Logout
          </button>
        </header>

        {/* CONTENT */}
        <div className="p-8 flex-1">
          
          {/* Action Bar */}
          <div className="flex justify-end mb-6">
            <button className="bg-[#018A01] hover:bg-[#006A00] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md">
              <span className="text-2xl leading-none mb-1">+</span>
              <span>Tambah item</span>
            </button>
          </div>

          {/* GRID: LOOPING DATA DARI STATE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dataJamu.length > 0 ? (
              dataJamu.map((item, index) => (
                <div 
                  key={item.id_jenis || index} 
                  className="bg-[#FDE4CA] rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col gap-4 border border-[#F2D6B8]"
                  style={{ 
                    animationDelay: `${index * 100}ms`, 
                    animationFillMode: 'both' 
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-20 rounded-[40%] bg-[#6A7677] flex items-center justify-center text-white text-3xl shrink-0 shadow-inner">
                      +
                    </div>

                    <div className="font-semibold text-[15px] text-center flex-1 leading-snug font-serif">
                      {/* Pastikan nama_jenis sesuai sama kolom di tabel database abang */}
                      {item.nama_jenis || "Nama Jamu Kosong"}
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-2 mt-auto pt-2">
                    
                    {/* EDIT */}
                    <button className="bg-[#FFE100] hover:bg-[#E6CB00] text-black text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 shadow-sm hover:scale-105 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      EDIT
                    </button>

                    {/* HAPUS */}
                    <button 
                      onClick={() => handleHapus(item.id_jenis)} 
                      className="bg-[#8B1A1A] hover:bg-[#731515] text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 shadow-sm hover:scale-105 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      HAPUS
                    </button>

                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-10 font-medium">
                Belum ada data jamu yang ditambahkan nih Bang...
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}