import Login from './pages/Admin/auth/login';
// import NavbarAdmin from './components/navbar_admin';

function App() {
  return (
    <div className="flex flex-col min-h-screen">

      
      {/* Halaman Login */}
      <div className="flex-grow">
        <Login />
      </div>
    </div>
  );
}

export default App;
