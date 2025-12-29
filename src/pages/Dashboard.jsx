import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  Users, UserCheck, UserMinus, UserX, 
  TrendingUp, Calendar, ChevronLeft, ChevronRight, BarChart3,
  Map, Wifi, AlertCircle, Phone, ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState({ ACTIVE: 0, DISABLE: 0, TERMINATION: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [quarterStats, setQuarterStats] = useState([]);
  const [planStats, setPlanStats] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchDashboardData();
  }, [year]);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, chartRes, qtrRes, plnRes, expRes] = await Promise.all([
        API.get('/customers/stats/summary'),
        API.get(`/customers/stats/yearly/${year}`),
        API.get('/customers/stats/quarter-dist'), // Backend မှာ ရေးခဲ့သည့် Quarter API
        API.get('/customers/stats/plan-dist'),    // Backend မှာ ရေးခဲ့သည့် Plan API
        API.get('/customers/stats/expiring-soon') // Backend မှာ ရေးခဲ့သည့် Expiry API
      ]);
      setSummary(sumRes.data);
      setMonthlyData(chartRes.data);
      setQuarterStats(qtrRes.data);
      setPlanStats(plnRes.data);
      setExpiringSoon(expRes.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  };

  const statusCards = [
    { title: 'Active Users', count: summary.ACTIVE || 0, icon: <UserCheck size={24}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Disabled', count: summary.DISABLE || 0, icon: <UserMinus size={24}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Terminated', count: summary.TERMINATION || 0, icon: <UserX size={24}/>, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Total Base', count: (summary.ACTIVE || 0) + (summary.DISABLE || 0) + (summary.TERMINATION || 0), icon: <Users size={24}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-left pb-10">
      
      {/* 1. Header & Year Selector (မူလပုံစံ) */}
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

      {/* 2. Key Status Metrics (မူလပုံစံ) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statusCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 ${card.bg} ${card.color} rounded-2xl`}>{card.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{card.count.toLocaleString()}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Monthly Breakdown Grid (မူလပုံစံ) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 ml-2">
           <BarChart3 size={18} className="text-blue-600"/>
           <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Monthly Growth ({year})</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {monthlyData.map((item, idx) => (
            <div key={idx} className="bg-white border-2 border-slate-50 p-5 rounded-[1.5rem] hover:border-blue-500 hover:shadow-lg transition-all group">
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
                {months[idx] || 'N/A'} 
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                  {item.count || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase font-sans">Subs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. NEW: Distribution Charts (Quarter & Plan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Quarter Stats */}
       {/* Quarter Distribution - Clean List Style */}
<div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm h-full">
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
      <Map size={18} className="text-indigo-600"/> Quarter Distribution
    </h3>
    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">
      By Neighborhood
    </span>
  </div>

  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
    {quarterStats.sort((a, b) => b.count - a.count).map((item, idx) => (
      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
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
    {quarterStats.length === 0 && (
      <div className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">No data available</div>
    )}
  </div>
</div>

        {/* Plan Stats */}
       <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm text-center">
  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2 justify-center">
    <Wifi size={18} className="text-emerald-600"/> Package Popularity
  </h3>
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
        >
          {/* planStats ထဲမှာပါသမျှ အကုန် loop ပတ်ပြီး အရောင်ခွဲပေးပါမည် */}
          {planStats.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        {/* <Tooltip 
          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} 
          itemStyle={{fontWeight: 'black', fontSize: '12px'}}
        /> */}

            <Tooltip 
                formatter={(value, name) => [`${value} Users`, `${name}`]} 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
            />



        {/* Legend က package အမည်အားလုံးကို အောက်မှာ အလိုအလျောက် စီပြပေးပါမည် */}
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle" 
          wrapperStyle={{fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase'}}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>
      </div>

      {/* 5. NEW: Expiring Soon Table */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-xl overflow-hidden mt-12">
        <div className="p-8 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200">
              <AlertCircle size={24}/>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Expiring Soon</h3>
              <p className="text-rose-600 text-[10px] font-bold uppercase tracking-widest leading-none mt-1">Next 7 days billing alerts</p>
            </div>
          </div>
          <span className="bg-rose-100 text-rose-700 px-5 py-1.5 rounded-full text-xs font-black">{expiringSoon.length} ALERTS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-black border-b tracking-widest">
              <tr>
                <th className="px-10 py-5 text-left">Customer Information</th>
                <th className="px-10 py-5 text-left">Contact Info</th>
                <th className="px-10 py-5 text-center">Expiry Date</th>
                <th className="px-10 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {expiringSoon.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="font-black text-slate-800 text-sm">{c.name}</div>
                    <div className="text-[10px] text-blue-600 font-mono font-bold uppercase tracking-tighter">
                       {c.packagePlan?.planName} ({c.packagePlan?.bandwidth})
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 font-bold text-slate-600 text-xs">
                       <Phone size={13} className="text-slate-400"/> {c.primaryPhone}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-xl font-black text-[11px] inline-block border border-rose-100 shadow-sm">
                      {c.expiryDate}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <button className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm">
                      <ArrowRight size={20}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expiringSoon.length === 0 && (
            <div className="p-20 text-center">
               <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No billings expiring this week</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;