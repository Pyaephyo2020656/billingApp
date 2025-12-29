import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Auth components
import Sidebar from './components/Sidebar';
import Login from './pages/Login';

// Business Page components
import Dashboard from './pages/Dashboard'; // ၁။ Dashboard ကို Import လုပ်ပါ
import CustomerList from './pages/CustomerList';
import UserList from './pages/UserList';
import PackagePlan from './pages/PackagePlan';
import Relocation from './pages/Relocation';
import Invoices from './pages/Invoices';
import Quarter from './pages/Quarter';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar onLogout={() => setIsAuthenticated(false)} />

        <main className="flex-1 ml-64 p-8 min-h-screen">
          <Routes>
            {/* ၂။ ဒီနေရာမှာ Dashboard Component ကို အစားထိုးလိုက်ပါ */}
            <Route path="/" element={<Dashboard />} />

            <Route path="/customers" element={<CustomerList />} />
            <Route path="/plans" element={<PackagePlan />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/quarters" element={<Quarter />} />
            <Route path="/relocation" element={<Relocation />} />
            <Route path="/settings" element={<UserList />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;