import React from 'react';

const NavbarAdmin: React.FC = () => {
  return (
    <nav className="flex h-16 w-full shadow-sm font-sans">
      {/* Brand / Sidebar Toggle Area */}
      <div className="flex items-center justify-between px-6 w-64 bg-[#d47d25] text-white flex-shrink-0">
        <span className="text-2xl font-serif tracking-wide">JamuKita</span>
        <button className="p-1 hover:bg-white/20 rounded transition-colors focus:outline-none">
          {/* Hamburger Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Main Navbar Area */}
      <div className="flex items-center justify-end flex-grow px-6 bg-[#e08e36]">
        {/* Profile Dropdown Trigger */}
        <button className="flex items-center space-x-1 p-2 hover:bg-black/5 rounded transition-colors focus:outline-none text-black">
          {/* Account Circle Icon */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20.2C9.5 20.2 7.29 18.92 6 16.98C6.03 14.99 10 13.9 12 13.9C13.99 13.9 17.97 14.99 18 16.98C16.71 18.92 14.5 20.2 12 20.2Z" fill="black"/>
          </svg>
          {/* Chevron Down */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default NavbarAdmin;