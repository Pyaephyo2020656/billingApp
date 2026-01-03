import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Auth components
import Sidebar from './components/Sidebar';
import Login from './pages/Login';

// Business Page components
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import UserList from './pages/UserList';
import PackagePlan from './pages/PackagePlan';
import Relocation from './pages/Relocation';
import Invoices from './pages/Invoices';
import Quarter from './pages/Quarter';
import StatusHistory from './pages/StatusHistory'; // Import မကျန်အောင် သေချာထည့်ထားပါသည်

function App() {
  // Login ဝင်ထားခြင်း ရှိမရှိ စစ်ဆေးခြင်း
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  // လက်ရှိ User ရဲ့ Role ကို localStorage မှ ယူခြင်း
  const userRole = localStorage.getItem('userRole') || 'VIEWER';

  // Role အလိုက် ဝင်ခွင့်စစ်ဆေးသည့် Component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!allowedRoles.includes(userRole)) {
      // အကယ်၍ ဝင်ခွင့်မရှိသော Role ဖြစ်ပါက Customer List သို့ ပြန်ပို့မည်
      return <Navigate to="/customers" replace />;
    }
    return children;
  };

  const handleLoginSuccess = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  // Login မဝင်ရသေးပါက Login Page သာ ပြမည်
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="flex bg-slate-50 min-h-screen">
        {/* Sidebar သို့ Role ပို့ပေးရန် လိုအပ်ပါသည် */}
        <Sidebar onLogout={handleLogout} userRole={userRole} />

        <main className="flex-1 ml-64 p-8 min-h-screen">
          <Routes>
            {/* ၁။ Dashboard: ADMIN နှင့် BOSS သာ ကြည့်ခွင့်ရှိသည် */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'BOSS']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* ၂။ View Only Pages: Roles အားလုံး ကြည့်ခွင့်ရှိသည် */}
            <Route path="/customers" element={<CustomerList userRole={userRole} />} />
            <Route path="/relocation" element={<Relocation userRole={userRole} />} />
            <Route path="/status-history" element={<StatusHistory userRole={userRole} />} />

            {/* ၃။ Operations: ADMIN နှင့် STAFF သာ လုပ်ပိုင်ခွင့်ရှိသည် */}
            <Route 
              path="/plans" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <PackagePlan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quarters" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <Quarter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <Invoices />
                </ProtectedRoute>
              } 
            />

            {/* ၄။ Settings: ADMIN တစ်ဦးတည်းသာ ဝင်ခွင့်ရှိသည် */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserList />
                </ProtectedRoute>
              } 
            />

            {/* မရှိသော URL များအတွက် Dashboard သို့ ပြန်ပို့မည် */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;