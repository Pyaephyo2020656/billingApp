import React from 'react';
import { LayoutDashboard, Users, MapPin, FileText, Settings, LogOut, Wifi } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  
  // Menu list logic based on existing pages
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { name: 'Packages', path: '/plans', icon: <Wifi size={20} /> },
    { name: 'Quarters', path: '/quarters', icon: <MapPin size={20} /> },
    { name: 'Relocation', path: '/relocation', icon: <MapPin size={20} /> },
    { name: 'Invoices', path: '/invoices', icon: <FileText size={20} /> },
    { name: 'User Settings', path: '/settings', icon: <Settings size={20} /> },

  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 text-2xl font-bold border-b border-slate-800 text-left">
        TJD Billing
      </div>
      
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-3 px-6 py-4 transition-colors ${
              location.pathname === item.path ? 'bg-blue-600 font-semibold' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors w-full py-2 px-2 rounded-lg"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;