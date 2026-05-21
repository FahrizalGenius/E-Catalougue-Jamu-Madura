import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../components/navbar_admin";
import api from "../../../api/axiosConfig";

export default function Dashboard() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  // State untuk menampung list jamu asli dari database
  const [dataJamu, setDataJamu] = useState<any[]>([]);

  // --- STATE FILTER & SEARCH ---
  const [searchNama, setSearchNama] = useState<string>(""); 
  const [filterJenis, setFilterJenis] = useState<string[]>([]);
  const [filterKabupaten, setFilterKabupaten] = useState<string[]>(["sampang"]);
  const [filterPerizinan, setFilterPerizinan] = useState<string[]>([]);

  // --- FUNGSI AMBIL DATA ---
  const ambilDataJamu = async () => {
    try {
      const response = await api.get("/jamu");
      
      console.log("=== CEK ISI DATA JAMU DARI FLASK ===");
      console.log(response.data.data);
      
      setDataJamu(response.data.data);
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
      localStorage.removeItem("token_jamu");
      navigate("/4dm13n");
    }
  };

  const handleHapus = async (id: number) => {
    const konfirmasi = window.confirm("Yakin mau hapus jamu ini Bang?");
    if (!konfirmasi) return;

    try {
      await api.delete(`/jamu/${id}`);
      alert("Jamu berhasil dihapus dari peradaban!");
      ambilDataJamu();
    } catch (error) {
      console.error("Gagal hapus data:", error);
      alert("Gagal menghapus data.");
    }
  };

  // --- LOGIKA MULTI-TOGGLE FILTER ---
  const handleToggleFilterJenis = (jenis: string) => {
    setFilterJenis((prev) =>
      prev.includes(jenis) ? prev.filter((item) => item !== jenis) : [...prev, jenis]
    );
  };

  const handleToggleFilterKabupaten = (kabupaten: string) => {
    setFilterKabupaten((prev) =>
      prev.includes(kabupaten) ? prev.filter((item) => item !== kabupaten) : [...prev, kabupaten]
    );
  };

  const handleToggleFilterPerizinan = (perizinan: string) => {
    setFilterPerizinan((prev) =>
      prev.includes(perizinan) ? prev.filter((item) => item !== perizinan) : [...prev, perizinan]
    );
  };

  // --- MASTER DATA DROPDOWN (Dinamis dari Database) ---
  const daftarJenisUnik = Array.from(
    new Set(dataJamu.map((item) => item.nama_jenis).filter(Boolean))
  );
  const daftarKabupatenUnik = Array.from(
    new Set(dataJamu.map((item) => item.nama_kabupaten).filter(Boolean))
  );
  const daftarPerizinanUnik = Array.from(
    new Set(dataJamu.map((item) => item.nama_perizinan).filter(Boolean))
  );

  // --- PROSES PENYARINGAN REAL-TIME ---
  const dataJamuTersering = dataJamu.filter((item) => {
    // 1. Cocokkan Search Nama Jamu
    const cocokNama = item.nama_jamu 
      ? item.nama_jamu.toLowerCase().includes(searchNama.toLowerCase()) 
      : true;

    // 2. Cocokkan Filter Checkbox
    const cocokJenis = filterJenis.length > 0 ? filterJenis.includes(item.nama_jenis) : true;
    const cocokKabupaten = filterKabupaten.length > 0 ? filterKabupaten.includes(item.nama_kabupaten) : true;
    const cocokPerizinan = filterPerizinan.length > 0 ? filterPerizinan.includes(item.nama_perizinan) : true;
    
    return cocokNama && cocokJenis && cocokKabupaten && cocokPerizinan;
  });

  return (
    <div className={`flex flex-col h-screen bg-[#FDFBF7] font-sans overflow-hidden transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <NavbarAdmin onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 h-full bg-[#F5F2EA] flex flex-col border-r border-[#E5DECD] shrink-0">
          {/* Admin Profile */}
          <div className="flex items-center gap-3 px-5 py-6">
            <div className="w-12 h-12 rounded-full bg-black border-2 border-black flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] text-black leading-tight">Admin Jamu</span>
              <span className="text-[10px] text-gray-800 italic mt-0.5">Administrator</span>
            </div>
          </div>

          {/* Navigasi Utama */}
          <div className="px-3 mt-2">
            <button className="w-full bg-[#D68227] text-black font-bold rounded-lg py-2.5 px-4 flex items-center gap-3 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[15px]">Dashboard</span>
            </button>
          </div>

          {/* Info Total Jamu Terfilter */}
          <div className="px-5 mt-4">
            <p className="text-[12px] font-bold text-gray-700">
              Menampilkan: <span className="text-[#D68227] font-extrabold">{dataJamuTersering.length}</span> / {dataJamu.length} Jamu
            </p>
          </div>

          {/* --- SECTION FILTER SIDEBAR --- */}
          <div className="px-4 mt-4 flex flex-col gap-4 overflow-y-auto flex-1 pb-4 custom-sidebar-scroll">
            <div className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-[#E5DECD] pb-1">
              Filter Data
            </div>

            {/* INPUT PENCARIAN NAMA JAMU */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700">Cari Jamu</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchNama}
                  onChange={(e) => setSearchNama(e.target.value)}
                  placeholder="Ketik nama jamu..."
                  className="w-full text-xs bg-white border border-[#E5DECD] rounded-lg py-2 pl-3 pr-8 shadow-inner outline-none focus:border-[#D68227] text-black placeholder-gray-400"
                />
                {searchNama && (
                  <button
                    type="button"
                    onClick={() => setSearchNama("")}
                    className="absolute right-2.5 text-gray-400 hover:text-gray-600 focus:outline-none text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Filter Jenis Jamu */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700">Jenis Jamu</label>
              <div className="max-h-24 overflow-y-auto border border-[#E5DECD] bg-white rounded-lg p-2 flex flex-col gap-1 shadow-inner">
                {daftarJenisUnik.map((jenis) => (
                  <label key={jenis} className="flex items-center gap-2 text-xs text-black cursor-pointer py-0.5 hover:bg-gray-50 px-1 rounded">
                    <input
                      type="checkbox"
                      checked={filterJenis.includes(jenis)}
                      onChange={() => handleToggleFilterJenis(jenis)}
                      className="rounded border-gray-300 text-[#D68227] focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="truncate">{jenis}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Asal Kabupaten */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700">Asal (Kabupaten)</label>
              <div className="max-h-24 overflow-y-auto border border-[#E5DECD] bg-white rounded-lg p-2 flex flex-col gap-1 shadow-inner">
                {daftarKabupatenUnik.map((kab) => (
                  <label key={kab} className="flex items-center gap-2 text-xs text-black cursor-pointer py-0.5 hover:bg-gray-50 px-1 rounded">
                    <input
                      type="checkbox"
                      checked={filterKabupaten.includes(kab)}
                      onChange={() => handleToggleFilterKabupaten(kab)}
                      className="rounded border-gray-300 text-[#D68227] focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="truncate">{kab}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* FILTER STATUS PERIZINAN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700">Perizinan</label>
              <div className="max-h-24 overflow-y-auto border border-[#E5DECD] bg-white rounded-lg p-2 flex flex-col gap-1 shadow-inner">
                {daftarPerizinanUnik.map((izin) => (
                  <label key={izin} className="flex items-center gap-2 text-xs text-black cursor-pointer py-0.5 hover:bg-gray-50 px-1 rounded">
                    <input
                      type="checkbox"
                      checked={filterPerizinan.includes(izin)}
                      onChange={() => handleToggleFilterPerizinan(izin)}
                      className="rounded border-gray-300 text-[#D68227] focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="truncate">{izin}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tombol Reset Semua Filter */}
            {(searchNama !== "" || filterJenis.length > 0 || filterKabupaten.length > 0 || filterPerizinan.length > 0) && (
              <button
                onClick={() => {
                  setSearchNama("");
                  setFilterJenis([]);
                  setFilterKabupaten([]);
                  setFilterPerizinan([]);
                }}
                className="text-left text-[11px] text-[#A52A2A] font-bold hover:underline mt-1"
              >
                × Bersihkan Semua Filter
              </button>
            )}
          </div>

          {/* Logout Button */}
          <div className="px-4 pb-6 mt-auto shrink-0">
            <button
              onClick={handleLogout}
              className="w-full bg-[#CC0000] hover:bg-[#FF0404] text-white font-bold py-2.5 rounded-lg shadow-md transition-colors text-sm"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#FDFBF7]">
          <header className="bg-[#344F51] text-white px-8 py-5 flex items-center shadow-md shrink-0">
            <h1 className="text-xl font-semibold tracking-wide uppercase">Dashboard Manajemen Jamu</h1>
          </header>

          <div className="p-8 flex-1">
            {/* Button Tambah */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => navigate("/admin/add-jamu")}
                className="bg-[#018A01] hover:bg-[#007000] text-white font-bold py-2 px-5 rounded-full flex items-center gap-2 shadow-md transition-transform hover:scale-105"
              >
                <span className="text-xl font-light">+</span>
                <span className="text-sm">Tambah Jamu Baru</span>
              </button>
            </div>

            {/* GRID DATA JAMU */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dataJamuTersering.length > 0 ? (
                dataJamuTersering.map((item) => (
                  <div
                    key={item.id_jamu}
                    className="bg-[#FCE6CF] rounded-xl pt-6 pb-4 px-4 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col gap-4 border border-[#F0D5BB]"
                  >
                    {/* Header Card */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-[#344F51] flex items-center justify-center shrink-0">
                        {item.image ? (
                          <img
                            src={`http://localhost:5000/static/uploads/${item.image}`}
                            alt={item.nama_jamu}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        ) : (
                          <span className="text-white text-2xl font-bold">
                            {item.nama_jamu ? item.nama_jamu.charAt(0) : "J"}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        {/* 🔥 FIX: Tag penutup kurung siku penutup sudah ditambahkan di sini */}
                        <span className="font-bold text-[15px] text-black truncate font-serif leading-tight">
                          {item.nama_jamu}
                        </span>
                        <span className="text-[10px] text-gray-700 italic">
                          {item.nama_jenis || "Tanpa Jenis"} • {item.nama_kabupaten || "Lokal"}
                        </span>
                        <span className="text-[9px] mt-0.5 font-bold text-emerald-800 uppercase bg-emerald-100 px-1.5 py-0.5 rounded self-start">
                          Izin: {item.nama_perizinan || "Tanpa Izin"}
                        </span>
                      </div>
                    </div>

                    {/* Khasiat Singkat */}
                    <div className="bg-white/50 p-2 rounded border border-orange-200 min-h-[50px]">
                        <p className="text-[11px] text-gray-800 line-clamp-3">
                            <span className="font-semibold">Khasiat:</span> {item.khasiat || "Belum ada keterangan."}
                        </p>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-center gap-2 mt-auto pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/admin/edit-jamu/${item.id_jamu}`);
                        }}
                        className="bg-[#FFD700] hover:bg-[#E6C200] text-black text-[10px] font-bold py-1.5 px-3 rounded flex items-center gap-1 transition"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleHapus(item.id_jamu)}
                        className="bg-[#A52A2A] hover:bg-[#8B2323] text-white text-[10px] font-bold py-1.5 px-3 rounded transition"
                      >
                        HAPUS
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center py-20 text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="font-medium italic text-center text-sm">
                    {dataJamu.length > 0 
                      ? "Tidak ada jamu yang cocok dengan kriteria kombinasi filter, Bang." 
                      : "Database masih kosong, Bang. Yuk tambah jamu dulu!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb { background: #E5DECD; border-radius: 4px; }
      `}</style>
    </div>
  );
}