// import React as from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Admin/auth/login';
// import NavbarAdmin from './components/navbar_admin';
import Dashboard from './pages/Admin/dashboard/dashboard';

// --- FUNGSI SATPAM (PROTECTED ROUTE) ---
// Tugasnya ngecek apakah user punya "tiket" masuk ke dashboard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isLoggedIn'); 
  
  if (!isAuthenticated) {
    // Kalau nggak ada tiket, tendang balik ke halaman Login (/)
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