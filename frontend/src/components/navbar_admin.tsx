import React from 'react';

const NavbarAdmin: React.FC = () => {
  return (
    <aside className="w-64 h-screen bg-[#F9F6EE] flex flex-col border-r border-[#E5DECD] animate-fade-in-right shrink-0">
      {/* User Profile Section */}
      <div className="flex items-center gap-4 px-6 py-8 mt-4">
        {/* Simple User Icon SVG */}
        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center shrink-0 shadow-md transform transition duration-500 hover:rotate-12">
          <svg className="w-8 h-8 text-[#F9F6EE]" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-gray-900 leading-tight">Nama user</span>
          <span className="text-[11px] text-gray-500 font-medium">Administrator</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 mt-4">
        <button className="w-full bg-[#E08A30] hover:bg-[#CD7A25] text-black font-bold rounded-xl py-3 px-4 flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md group">
          <svg className="w-6 h-6 shrink-0 transition-transform duration-300 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-base tracking-wide">Dashboard</span>
        </button>
      </div>
    </aside>
  );
};

export default NavbarAdmin;