// import React as from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Admin/auth/login';
// import NavbarAdmin from './components/navbar_admin';

// 👇 PERBAIKAN 1: Huruf "D" wajib besar untuk import komponen React
import Dashboard from './pages/Admin/dashboard/dashboard';

// --- FUNGSI SATPAM (PROTECTED ROUTE) ---
// Tugasnya ngecek apakah user punya "tiket" masuk ke dashboard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  
  // 👇 PERBAIKAN 2: Samakan nama kunci dengan yang ada di Login.tsx
  const isAuthenticated = localStorage.getItem('token_jamu'); 
  
  if (!isAuthenticated) {
    // Kalau nggak ada tiket, tendang balik ke halaman Login
    return <Navigate to="/4dm13n" replace />; 
  }
  
  // Kalau ada tiket, silakan masuk
  return children; 
};

function App() {
  return (
    // Router wajib membungkus seluruh aplikasi agar fitur pindah halaman aktif
    <Router>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          
          <Routes>
            {/* RUTE 1: Halaman Login (Bebas diakses siapa saja) */}
            <Route path="/4dm13n" element={<Login />} />

            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  {/* 👇 PERBAIKAN 3: Panggil komponennya pakai huruf D besar */}
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>

        </div>
      </div>
    </Router>
  );
}

export default App;