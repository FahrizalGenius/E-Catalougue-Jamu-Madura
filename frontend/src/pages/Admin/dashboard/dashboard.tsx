import React, { useEffect, useState } from 'react';
import NavbarAdmin from '../../../components/navbar_admin';

const Dashboard: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = [
    { id: 1, lines: ["Jamu Pelancar", "Haid"] },
    { id: 2, lines: ["Beras Kencur"] },
    { id: 3, lines: ["Kunyit Asem"] },
    { id: 4, lines: ["Jahe Merah", "AMH"] },
    { id: 5, lines: ["Kunci Sirih"] },
    { id: 6, lines: ["Sinom"] },
    { id: 7, lines: ["Wedang Uwuh"] },
    { id: 8, lines: ["Sidomuncul", "JSH"] }
  ];

  return (
    <div className={`flex h-screen bg-[#F9F6EE] font-sans overflow-hidden transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Sidebar with animations inside */}
      <NavbarAdmin />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-[#344F51] text-white px-8 py-5 flex items-center gap-4 shadow-md shrink-0 transform transition-transform duration-500 translate-y-0">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h1 className="text-2xl font-semibold tracking-wide">Dashboard</h1>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 flex-1">
          {/* Action Bar */}
          <div className="flex justify-end mb-6">
            <button className="bg-[#018A01] hover:bg-[#006A00] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md">
              <span className="text-2xl leading-none mb-1">+</span>
              <span>Tambah item</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-[#FDE4CA] rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col gap-4 border border-[#F2D6B8] group"
                style={{ 
                  animationDelay: `${index * 100}ms`, 
                  animationFillMode: 'both' 
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-20 rounded-[40%] bg-[#6A7677] flex items-center justify-center text-white text-3xl shrink-0 shadow-inner group-hover:bg-[#586465] transition-colors duration-300">
                    +
                  </div>
                  <div className="font-semibold text-[15px] text-center flex-1 leading-snug font-serif">
                    {item.lines.map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < item.lines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-center gap-2 mt-auto pt-2">
                  <button className="bg-[#FFE100] hover:bg-[#E6CB00] text-black text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 shadow-sm transition-transform duration-200 hover:scale-105">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    EDIT
                  </button>
                  <button className="bg-[#8B1A1A] hover:bg-[#731515] text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 shadow-sm transition-transform duration-200 hover:scale-105">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    HAPUS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;