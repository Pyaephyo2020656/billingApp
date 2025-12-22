import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Auth components
import Sidebar from './components/Sidebar';
import Login from './pages/Login';

// Business Page components
import CustomerList from './pages/CustomerList';
import UserList from './pages/UserList';
import PackagePlan from './pages/PackagePlan';
import Relocation from './pages/Relocation';
import Invoices from './pages/Invoices';
import Quarter from './pages/Quarter';

function App() {
  // Temporary authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Authentication check logic
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="flex bg-slate-50 min-h-screen">
        {/* Navigation Sidebar */}
        <Sidebar onLogout={() => setIsAuthenticated(false)} />

        {/* Main Routing Area with margin for sidebar */}
        <main className="flex-1 ml-64 p-8 min-h-screen">
          <Routes>
            {/* Dashboard Root */}
            <Route path="/" element={
              <div className="text-left">
                <h1 className="text-2xl font-bold text-slate-800 font-sans">Dashboard Overview</h1>
                <p className="text-slate-500 mt-2">Manage your ISP customers and billing from one place.</p>
              </div>
            } />

            {/* Customer Routes */}
            <Route path="/customers" element={<CustomerList />} />

            {/* Billing & Package Routes */}
            <Route path="/plans" element={<PackagePlan />} />
            <Route path="/invoices" element={<Invoices />} />

            <Route path="/quarters" element={<Quarter />} />

            {/* Service Routes */}
            <Route path="/relocation" element={<Relocation />} />

            {/* User & Admin Routes */}
            <Route path="/settings" element={<UserList />} />

            {/* 404/Fallback to Home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;