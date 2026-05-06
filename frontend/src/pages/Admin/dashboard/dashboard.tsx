import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarAdmin from '../../../components/navbar_admin';
import api from '../../../api/axiosConfig';

export default function Dashboard() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  
  const [dataJamu, setDataJamu] = useState<any[]>([]);

  const ambilDataJamu = async () => {
    try {
      const response = await api.get('/jenis'); 
      setDataJamu(response.data.data || response.data); 
    } catch (error) {
      console.error("Gagal narik data jamu:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    ambilDataJamu();
  }, []);

  const handleLogout = () => {
    const konfirmasi = window.confirm("Yakin mau logout, Bang?");
    if (konfirmasi) {
      localStorage.removeItem('token_jamu');
      navigate('/4dm13n'); 
    }
  };

  const handleHapus = async (id: number) => {
    const konfirmasi = window.confirm("Yakin mau hapus jamu ini Bang?");
    if (!konfirmasi) return;

    try {
      await api.delete(`/jenis/${id}`);
      alert("Data berhasil dihapus!");
      ambilDataJamu();
    } catch (error) {
      console.error("Gagal hapus data:", error);
      alert("Gagal menghapus data.");
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-[#FDFBF7] font-sans overflow-hidden transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Top Navbar */}
      <NavbarAdmin onLogout={handleLogout} />
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-56 h-full bg-[#F5F2EA] flex flex-col border-r border-[#E5DECD] shrink-0">
          {/* User Profile Section */}
          <div className="flex items-center gap-3 px-5 py-6">
            <div className="w-12 h-12 rounded-full bg-black border-2 border-black flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] text-black leading-tight">Nama user</span>
              <span className="text-[10px] text-gray-800 italic mt-0.5">Administrator</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 mt-2">
            <button className="w-full bg-[#D68227] hover:bg-[#c47522] text-black font-bold rounded-lg py-2.5 px-4 flex items-center gap-3 shadow-md transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[15px] tracking-wide">Dashboard</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#FDFBF7]">
          
          {/* HEADER */}
          <header className="bg-[#344F51] text-white px-8 py-5 flex items-center shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h1 className="text-xl font-semibold tracking-wide">Dashboard</h1>
            </div>
          </header>

          {/* CONTENT */}
          <div className="p-8 flex-1">
            
            {/* Action Bar */}
            <div className="flex justify-end mb-6">
              <button className="bg-[#018A01] hover:bg-[#007000] text-white font-bold py-1.5 px-4 rounded-full flex items-center gap-1 shadow-md transition-transform hover:scale-105">
                <span className="text-xl leading-none font-normal">+</span>
                <span className="text-sm">Tambah item</span>
              </button>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dataJamu.length > 0 ? (
                dataJamu.map((item, index) => (
                  <div 
                    key={item.id_jenis || index} 
                    className="bg-[#FCE6CF] rounded-xl pt-6 pb-4 px-4 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col gap-5 border border-[#F0D5BB]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#6A7677] flex items-center justify-center text-white text-3xl font-light shadow-inner shrink-0">
                        +
                      </div>
                      <div className="font-semibold text-[14px] text-center flex-1 leading-snug font-serif text-black">
                        {item.nama_jenis || "Nama Jamu Kosong"}
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-3 mt-auto">
                      {/* EDIT */}
                      <button className="bg-[#FFD700] hover:bg-[#E6C200] text-black text-[11px] font-bold py-1.5 px-3 rounded flex items-center gap-1.5 shadow-sm hover:scale-105 transition">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        EDIT
                      </button>

                      {/* HAPUS */}
                      <button 
                        onClick={() => handleHapus(item.id_jenis)} 
                        className="bg-[#A52A2A] hover:bg-[#8B2323] text-white text-[11px] font-bold py-1.5 px-3 rounded flex items-center gap-1.5 shadow-sm hover:scale-105 transition"
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
    </div>
  );
}