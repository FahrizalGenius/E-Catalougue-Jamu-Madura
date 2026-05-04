import React, { useState, useEffect } from 'react';
import backgroundImage from './Backdgorund.png';

const Login: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Memberikan sedikit delay agar animasi masuk terlihat jelas
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Overlay Gelap (Opsional, agar form lebih mudah dibaca jika background terlalu terang) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Glassmorphism Card */}
      <div 
        className={`relative w-full max-w-md p-10 rounded-3xl shadow-2xl backdrop-blur-md bg-white/10 border border-white/20 transform transition-all duration-1000 delay-300 ${isMounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-3 drop-shadow-lg tracking-tight">
            Admin Portal
          </h1>
          <p className="text-gray-200 text-sm tracking-wide">
            Silakan masuk ke akun Anda
          </p>
        </div>

        <form className="space-y-6">
          <div className="group relative">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 drop-shadow-sm transition-colors group-focus-within:text-blue-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/20 transition-all duration-300"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="group relative">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 drop-shadow-sm transition-colors group-focus-within:text-blue-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/20 transition-all duration-300"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-200 mt-4">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-400 bg-white/20 text-blue-500 focus:ring-blue-400 focus:ring-offset-0 transition-colors" />
              <span className="group-hover:text-white transition-colors">Ingat saya</span>
            </label>
            <a href="#" className="hover:text-white transition-colors hover:underline underline-offset-4 decoration-white/50">
              Lupa password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full mt-8 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg hover:from-blue-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:ring-offset-2 focus:ring-offset-transparent transform hover:-translate-y-1 hover:shadow-blue-500/25 active:translate-y-0 active:scale-95 transition-all duration-300 shadow-xl"
          >
            Masuk
          </button>
        </form>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Login;