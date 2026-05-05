import React, { useState, useEffect } from 'react';
import backgroundImage from './Backdgorund.png';
import { loginadmin } from '../../../api/auth_Service';
import { useNavigate } from 'react-router-dom'; // Cukup panggil useNavigate saja

const Login: React.FC = () => {
  // 1. DEKLARASIKAN NAVIGASI DI SINI BANG 👇
  const navigate = useNavigate();

  const [isMounted, setIsMounted] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState({ text: '', type: '' });

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Animasi saat masuk
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Timer untuk lockout (hukuman kalau salah password)
  useEffect(() => {
    let interval: any;
    if (lockoutTime > 0) {
      interval = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTime === 0 && failedAttempts >= 3) {
      setFailedAttempts(0);
      setPesan({ text: '', type: '' });
    }
    return () => clearInterval(interval);
  }, [lockoutTime, failedAttempts]);

  const handlelogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutTime > 0) return; // Cegah klik kalau lagi dihukum

    setLoading(true);
    setPesan({ text: '', type: '' });

    try {
      const response = await loginadmin(username, password);
      setPesan({ text: response.message, type: 'success' });
      setFailedAttempts(0); // Reset percobaan kalau sukses

      // 2. KASIH TIKET MASUK BIAR NGGAK DITENDANG SATPAM 👇
      localStorage.setItem('isLoggedIn', 'true');

      // 3. PINDAH HALAMAN (Pakai huruf kecil 'n' dan disamakan dengan rute di App.tsx) 👇
      navigate('/dashboard');
      
    } catch (error: any) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        setLockoutTime(30);
        setPesan({ text: `Terlalu banyak percobaan. Coba lagi dalam 30 detik.`, type: 'error' });
      } else {
        setPesan({ text: `${error.message}. (Sisa percobaan: ${3 - newAttempts})`, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div 
        className={`relative w-full max-w-md p-10 rounded-3xl shadow-2xl backdrop-blur-md bg-white/10 border border-white/20 transform transition-all duration-1000 delay-300 ${isMounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-3 drop-shadow-lg tracking-tight">
            Selamat Datang Di Jamu Kita 
          </h1>
          <p className="text-gray-200 text-sm tracking-wide">
            Silakan masuk ke akun Anda
          </p>
        </div>

        <form className="space-y-6" onSubmit={handlelogin}>
          <div className="group relative">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 drop-shadow-sm transition-colors group-focus-within:text-blue-300" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={lockoutTime > 0}
              className={`w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/20 transition-all duration-300 ${lockoutTime > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Username"
              required
            />
          </div>

          <div className="group relative">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 drop-shadow-sm transition-colors group-focus-within:text-blue-300" htmlFor="password">
              Kata sandi
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={lockoutTime > 0}
              className={`w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/20 transition-all duration-300 ${lockoutTime > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Kata Sandi"
              required
            />
          </div>

          {pesan.text && (
            <div className={`text-center text-sm font-semibold p-2 rounded-lg ${pesan.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 'bg-green-500/20 text-green-200 border border-green-500/50'}`}>
              {pesan.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || lockoutTime > 0}
            className={`w-full mt-8 py-3.5 px-4 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:ring-offset-2 focus:ring-offset-transparent transform transition-all duration-300 shadow-xl ${
              loading || lockoutTime > 0
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-400 hover:to-indigo-500 hover:-translate-y-1 hover:shadow-blue-500/25 active:translate-y-0 active:scale-95'
            }`}
          >
            {lockoutTime > 0 ? `Terkunci (${lockoutTime}s)` : loading ? 'Memeriksa...' : 'Masuk'}
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