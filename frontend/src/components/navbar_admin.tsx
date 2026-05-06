import React from 'react';

interface NavbarAdminProps {
  onLogout?: () => void;
}

const NavbarAdmin: React.FC<NavbarAdminProps> = ({ onLogout }) => {
  return (
    <nav className="w-full bg-[#D68227] flex items-center justify-between px-6 py-2 shadow-md shrink-0 z-10 relative">
      <div className="flex items-center gap-4">
        <h1 className="text-white text-2xl font-serif tracking-wider mr-2">JamuKita</h1>
        <button className="text-white/90 hover:text-white transition">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <div 
        className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition"
        onClick={onLogout}
        title="Logout"
      >
        <div className="w-10 h-10 rounded-full border-[2.5px] border-black flex items-center justify-center bg-transparent">
          <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </nav>
  );
};

export default NavbarAdmin;