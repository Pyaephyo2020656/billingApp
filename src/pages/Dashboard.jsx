import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { exportToExcel } from '../utils/excelExport';
import { 
  Users, UserCheck, UserMinus, UserX, 
  ChevronLeft, ChevronRight, BarChart3,
  Map, Wifi, AlertCircle, Phone, ArrowRight, X, FileSpreadsheet, Search 
} from 'lucide-react';
import { 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState({ ACTIVE: 0, DISABLE: 0, TERMINATION: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [quarterStats, setQuarterStats] = useState([]);
  const [planStats, setPlanStats] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [dnsnStats, setDnsnStats] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [statusUserList, setStatusUserList] = useState([]);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchDashboardData();
  }, [year]);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, chartRes, qtrRes, plnRes, expRes, dnsnRes] = await Promise.all([
        API.get('/customers/stats/summary'),
        API.get(`/customers/stats/yearly/${year}`),
        API.get('/customers/stats/quarter-dist'),
        API.get('/customers/stats/plan-dist'),
        API.get('/customers/stats/expiring-soon'),
        API.get('/customers/stats/dnsn-dist')
      ]);
      setSummary(sumRes.data);
      setMonthlyData(chartRes.data);
      setQuarterStats(qtrRes.data);
      setPlanStats(plnRes.data);
      setExpiringSoon(expRes.data);
      setDnsnStats(dnsnRes.data);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  // Status Cards (Active, Disable, Terminated)
  const handleCardClick = async (type, title) => {
    if (type === 'TOTAL') return;
    try {
      const res = await API.get(`/customers/status/${type}`);
      setStatusUserList(res.data);
      setModalTitle(title);
      setIsModalOpen(true);
    } catch (err) { console.error(err); }
  };

  // Monthly Growth Click
  const handleMonthClick = async (monthIndex) => {
    try {
      const res = await API.get(`/customers/stats/monthly-users?year=${year}&month=${monthIndex + 1}`);
      setStatusUserList(res.data);
      setModalTitle(`${months[monthIndex]} ${year} - New Installations`);
      setIsModalOpen(true);
    } catch (err) { console.error(err); }
  };

  // DNSN Click (Fixed API Path)
  const handleDnsnClick = async (dnsnName) => {
    try {
      // ဒီမှာ /api ကို ဖြုတ်လိုက်ပါတယ် (Axios မှာ ပါပြီးသားမို့လို့ပါ)
      const res = await API.get(`/customers/stats/dnsn-users?dnsn=${dnsnName}`);
      setStatusUserList(res.data);
      setModalTitle(`DNSN Box: ${dnsnName}`);
      setIsModalOpen(true);
    } catch (err) { console.error("DNSN Click Error:", err); }
  };


  // --- Quarter Click ---
const handleQuarterClick = async (qtrName) => {
  try {
    const res = await API.get(`/customers/stats/quarter-users?quarter=${qtrName}`);
    setStatusUserList(res.data);
    setModalTitle(`Quarter: ${qtrName}`);
    setIsModalOpen(true);
  } catch (err) { console.error("Quarter Click Error:", err); }
};

// --- Package Click ---
const handlePackageClick = async (planName) => {
  try {
    const res = await API.get(`/customers/stats/plan-users?plan=${planName}`);
    setStatusUserList(res.data);
    setModalTitle(`Plan: ${planName}`);
    setIsModalOpen(true);
  } catch (err) { console.error("Package Click Error:", err); }
};

  const statusCards = [
    { type: 'ACTIVE', title: 'Active Users', count: summary.ACTIVE || 0, icon: <UserCheck size={24}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { type: 'DISABLE', title: 'Disabled', count: summary.DISABLE || 0, icon: <UserMinus size={24}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
    { type: 'TERMINATION', title: 'Terminated', count: summary.TERMINATION || 0, icon: <UserX size={24}/>, color: 'text-rose-600', bg: 'bg-rose-50' },
    { type: 'TOTAL', title: 'Total Base', count: (summary.ACTIVE || 0) + (summary.DISABLE || 0) + (summary.TERMINATION || 0), icon: <Users size={24}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-left pb-10 relative">
      
      {/* 1. Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">System Dashboard</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">ISP Performance Metrics</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-slate-100 shadow-sm">
           <button onClick={() => setYear(y => y - 1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft size={20}/></button>
           <div className="px-5 py-1 bg-slate-900 text-white rounded-lg font-black font-mono text-sm">{year}</div>
           <button onClick={() => setYear(y => y + 1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* 2. Status Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statusCards.map((card, idx) => (
          <div key={idx} onClick={() => handleCardClick(card.type, card.title)}
            className={`bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm flex items-center gap-4 transition-all ${card.type !== 'TOTAL' ? 'hover:border-blue-500 hover:shadow-md cursor-pointer hover:-translate-y-1' : ''}`}>
            <div className={`p-4 ${card.bg} ${card.color} rounded-2xl`}>{card.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{card.count.toLocaleString()}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Monthly Growth */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {monthlyData.map((item, idx) => (
          <div key={idx} onClick={() => handleMonthClick(idx)}
            className="bg-white border-2 border-slate-50 p-5 rounded-[1.5rem] hover:border-blue-500 hover:shadow-lg transition-all group cursor-pointer active:scale-95">
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">{months[idx] || 'N/A'}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-800 group-hover:text-blue-700 transition-colors">{item.count || 0}</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase font-sans">Subs</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Quarter Dist */}
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-8">
            <Map size={18} className="text-indigo-600"/> Quarter Distribution
          </h3>
          {/* <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {quarterStats.sort((a, b) => b.count - a.count).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">{idx + 1}</div>
                  <span className="text-sm font-black text-slate-700 tracking-tight">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900 leading-none">{item.count}</span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase">Users</span>
                </div>
              </div>
            ))}
          </div> */}

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {quarterStats.sort((a, b) => b.count - a.count).map((item, idx) => (
                <div 
                  key={idx} 
                  // Click Event ထည့်သွင်းခြင်း
                  onClick={() => handleQuarterClick(item.name)}
                  // cursor-pointer နှင့် hover effect များ ထည့်သွင်းခြင်း
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-400 hover:bg-white hover:shadow-md transition-all group cursor-pointer active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-black text-slate-700 tracking-tight">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900 leading-none">{item.count}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Users</span>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Package Pie Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm text-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2 justify-center">
            <Wifi size={18} className="text-emerald-600"/> Package Popularity
          </h3>
          {/* <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planStats} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="count" nameKey="name">
                  {planStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase'}} />
              </PieChart>
            </ResponsiveContainer>
          </div> */}

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={planStats} 
                    innerRadius={70} 
                    outerRadius={100} 
                    paddingAngle={5} 
                    dataKey="count" 
                    nameKey="name"
                    // Pie segment တစ်ခုချင်းစီကို နှိပ်လိုက်လျှင် အလုပ်လုပ်ရန်
                    onClick={(data) => handlePackageClick(data.name)}
                    // Hover လုပ်လျှင် လက်ပုံစံ ပေါ်စေရန်
                    className="cursor-pointer outline-none"
                  >
                    {planStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        className="hover:opacity-80 transition-opacity outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    wrapperStyle={{fontSize: '11px', fontWeight: '900', textTransform: 'uppercase'}} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>


        </div>
      </div>

      {/* 5. DNSN Distribution (New Section) */}
      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm mt-12 group">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-8">
          <BarChart3 size={24} className="text-indigo-600"/> DNSN / Splitter Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {dnsnStats.map((item, idx) => (
            <div key={idx} onClick={() => handleDnsnClick(item.name)}
              className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-400 hover:bg-white hover:shadow-lg transition-all cursor-pointer active:scale-95 group">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">BOX Name</span>
                <span className="text-sm font-black text-slate-800">{item.name || '---'}</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-indigo-600 leading-none">{item.count}</div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Users</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Expiring Soon Table */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-xl overflow-hidden mt-12">
        <div className="p-8 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200"><AlertCircle size={24}/></div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Expiring Soon</h3>
            </div>
          </div>
          <span className="bg-rose-100 text-rose-700 px-5 py-1.5 rounded-full text-xs font-black">{expiringSoon.length} ALERTS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-black border-b tracking-widest">
              <tr>
                <th className="px-10 py-5 text-left">Customer</th>
                <th className="px-10 py-5 text-center">Expiry Date</th>
                <th className="px-10 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {expiringSoon.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="font-black text-slate-800 text-sm">{c.name}</div>
                    <div className="text-[10px] text-blue-600 font-mono font-bold">{c.packagePlan?.planName}</div>
                  </td>
                  <td className="px-10 py-6 text-center"><div className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-xl font-black text-[11px] inline-block border border-rose-100">{c.expiryDate}</div></td>
                  <td className="px-10 py-6 text-center">
                    <button className="p-2.5 text-slate-300 hover:text-blue-600 rounded-xl transition-all shadow-sm"><ArrowRight size={20}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- User List Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col scale-in-center">
            
            {/* Modal Header */}
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{modalTitle}</h2>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                   Total Users: {statusUserList ? statusUserList.length : 0}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {statusUserList && statusUserList.length > 0 && (
                  <button 
                    onClick={() => {
                      const excelData = statusUserList.map(u => ({
                        'ID': u.customerId || '---',
                        'Name': u.name || '---',
                        'Quarter': u.quarter?.qtrName || '---',
                        'DNSN': u.dnsn || '---',
                        'Phone': u.primaryPhone || '---',
                        'Plan': u.packagePlan?.planName || '---'
                      }));
                      exportToExcel(excelData, `${modalTitle.replace(/\s+/g, '_')}_Report`, 'Subscribers');
                    }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-md text-[10px] font-black uppercase tracking-widest"
                  >
                    <FileSpreadsheet size={18} /> Export Excel
                  </button>
                )}
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                  <X size={24}/>
                </button>
              </div>
            </div>
            
            {/* Modal Table Body */}
            <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="text-[10px] font-black uppercase text-slate-400 border-b tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Customer Name</th>
                    <th className="px-6 py-4 text-left">Quarter</th>
                    <th className="px-6 py-4 text-left">Package</th>
                    <th className="px-6 py-4 text-left">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic">
                  {statusUserList && statusUserList.length > 0 ? (
                    statusUserList.map((user) => (
                      <tr key={user.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-800">
                          {user.name} <span className="text-[10px] text-slate-400 ml-1">({user.customerId})</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600 text-xs">{user.quarter?.qtrName}</td>
                        <td className="px-6 py-4">
                          {/* <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-black border border-blue-100 uppercase">
                            {user.packagePlan?.planName}
                          </span> */}

                          <div className="flex flex-col gap-1">
                                
                                  <span className="px-2 py-1 bg-blue-600 text-white rounded text-[9px] font-black border border-blue-700 uppercase inline-block w-fit shadow-sm">
                                    {user.packagePlan?.planName}
                                  </span>
                                  
                                  <span className="text-[10px] text-blue-500 font-black tracking-tighter ml-1">
                                    ⚡ {user.packagePlan?.bandwidth || 'N/A'}
                                  </span>
                                </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">{user.primaryPhone}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">
                        No subscribers found in this selection
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;