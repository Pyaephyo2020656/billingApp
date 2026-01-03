import React from 'react';
import { LayoutDashboard, Users, MapPin, FileText, Settings, LogOut, Wifi, History } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ onLogout, userRole }) => { // App.jsx မှ userRole ကို လက်ခံသည်
  const location = useLocation();
  
  // Menu Item တစ်ခုချင်းစီတွင် ကြည့်ခွင့်ရှိသော Roles များကို သတ်မှတ်ခြင်း
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <LayoutDashboard size={20} />, 
      allowed: ['ADMIN', 'BOSS'] // Boss နှင့် Admin သာ မြင်ရမည်
    },
    { 
      name: 'Customers', 
      path: '/customers', 
      icon: <Users size={20} />, 
      allowed: ['ADMIN', 'BOSS', 'STAFF', 'VIEWER'] // အားလုံး မြင်ရမည်
    },
    { 
      name: 'Packages', 
      path: '/plans', 
      icon: <Wifi size={20} />, 
      allowed: ['ADMIN', 'STAFF'] // Admin နှင့် Staff သာ မြင်ရမည်
    },
    { 
      name: 'Quarters', 
      path: '/quarters', 
      icon: <MapPin size={20} />, 
      allowed: ['ADMIN', 'STAFF'] 
    },
    { 
      name: 'Relocation', 
      path: '/relocation', 
      icon: <MapPin size={20} />, 
      allowed: ['ADMIN', 'BOSS', 'STAFF', 'VIEWER'] 
    },
    { 
      name: 'Invoices', 
      path: '/invoices', 
      icon: <FileText size={20} />, 
      allowed: ['ADMIN', 'STAFF'] 
    },
    { 
      name: 'Status Logs', 
      path: '/status-history', 
      icon: <History size={20}/>, 
      allowed: ['ADMIN', 'BOSS', 'STAFF', 'VIEWER'] 
    },
    { 
      name: 'User Settings', 
      path: '/settings', 
      icon: <Settings size={20} />, 
      allowed: ['ADMIN'] // Admin တစ်ဦးတည်းသာ မြင်ရမည်
    },
  ];

  // လက်ရှိ User ရဲ့ Role ပေါ်မူတည်ပြီး Menu ကို Filter လုပ်ခြင်း
  const filteredMenu = menuItems.filter(item => item.allowed.includes(userRole));

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-10 font-sans">
      <div className="p-6 text-2xl font-black border-b border-slate-800 text-left tracking-tighter italic uppercase">
        TJD Billing
        <div className="text-[10px] text-blue-500 font-bold tracking-[0.3em] mt-1 not-italic">
          {userRole} MODE
        </div>
      </div>
      
      <nav className="flex-1 mt-6">
        {filteredMenu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-3 px-6 py-4 transition-all duration-200 ${
              location.pathname === item.path 
                ? 'bg-blue-600 font-bold shadow-lg' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="text-sm tracking-wide">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800 bg-slate-900/50">
        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 text-slate-400 hover:text-red-400 transition-colors w-full py-2 px-2 rounded-lg font-bold text-sm"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;