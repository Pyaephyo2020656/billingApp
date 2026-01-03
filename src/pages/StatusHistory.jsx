import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { History, Search, RefreshCcw, Calendar, Clock, CheckCircle } from 'lucide-react';

const StatusHistory = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usageStats, setUsageStats] = useState(null);

  // ၁။ Log အားလုံးကို ဝင်ဝင်ချင်း ဆွဲထုတ်ရန်
  const fetchData = useCallback(async () => {
    try {
      const url = searchTerm ? `/status-logs/all?search=${searchTerm}` : '/status-logs/all';
      const res = await API.get(url);
      setLogs(res.data);
      
      // တစ်ယောက်တည်းကို ရှာထားတာဆိုရင် Actual Usage တွက်ပေးမည်
      if (searchTerm && res.data.length > 0) {
        calculateUsage(res.data);
      } else {
        setUsageStats(null);
      }
    } catch (err) { console.error("Fetch error:", err); }
  }, [searchTerm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ၂။ Actual Usage ရက်တွက်ချက်သည့် Logic
  const calculateUsage = (customerLogs) => {
    const customer = customerLogs[0].customer;
    if (!customer?.installDate) return;

    const installDate = new Date(customer.installDate);
    const today = new Date();
    const totalDays = Math.floor((today - installDate) / (1000 * 60 * 60 * 24));

    // Disable ဖြစ်ခဲ့သော ရက်များကို တွက်ခြင်း (ရိုးရှင်းသော ဥပမာ logic)
    let disabledDays = 0;
    customerLogs.forEach((log, index) => {
      if (log.newStatus === 'DISABLE' && index > 0) {
        const startDate = new Date(log.changeDate);
        const endDate = customerLogs[index - 1] ? new Date(customerLogs[index - 1].changeDate) : today;
        disabledDays += Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
      }
    });

    setUsageStats({
      total: totalDays,
      active: totalDays - disabledDays,
      inactive: disabledDays
    });
  };

  return (
    <div className="p-4 text-left font-sans max-w-[1600px] mx-auto">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg"><History size={24}/></div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Status History Logs</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search ID or Name to calculate usage..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-bold text-sm" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchData} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-slate-900 transition-all shadow-md"><RefreshCcw size={18}/></button>
          </div>
        </div>

        {/* Actual Usage Stats Cards (ပေါ်လာမည့် နေရာ) */}
        {usageStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top duration-500">
            <div className="bg-white p-6 rounded-[2rem] border-l-8 border-blue-500 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Service Days</p>
                <h4 className="text-2xl font-black text-slate-800">{usageStats.total} Days</h4>
              </div>
              <Calendar className="text-blue-100" size={40}/>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border-l-8 border-emerald-500 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Actual Active Usage</p>
                <h4 className="text-2xl font-black text-emerald-600">{usageStats.active} Days</h4>
              </div>
              <CheckCircle className="text-emerald-100" size={40}/>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border-l-8 border-rose-500 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Suspended (Disabled)</p>
                <h4 className="text-2xl font-black text-rose-600">{usageStats.inactive} Days</h4>
              </div>
              <Clock className="text-rose-100" size={40}/>
            </div>
          </div>
        )}

        {/* Table Area */}
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b">
                <tr>
                  <th className="px-6 py-4 text-left">Date & Time</th>
                  <th className="px-6 py-4 text-left">Customer Information</th>
                  <th className="px-6 py-4 text-center">Status Change</th>
                  <th className="px-6 py-4 text-left">Reason / Remark</th>
                </tr>
              </thead>
             <tbody className="divide-y divide-slate-100 italic">
                    {logs.map((log) => (
                        <tr key={log.logId} className="hover:bg-blue-50/20 transition-colors">
                        {/* Date ကို split လုပ်ပြီး အချိန်ဖြုတ်ထားပါသည် */}
                        <td className="px-6 py-5 font-mono text-[11px] text-blue-600 font-bold">
                            {log.changeDate ? log.changeDate.split('T')[0].split(' ')[0] : '---'}
                        </td>
                        
                        <td className="px-6 py-5">
                            <div className="font-black text-slate-800 text-sm">{log.customer?.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{log.customer?.customerId}</div>
                        </td>

                        <td className="px-6 py-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                            <span className="text-[9px] font-black text-slate-300 uppercase">{log.oldStatus}</span>
                            <span className="text-slate-300">→</span>
                            <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                                log.newStatus === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                                {log.newStatus}
                            </span>
                            </div>
                        </td>

                        <td className="px-6 py-5 text-slate-600 font-bold text-xs leading-relaxed max-w-md">
                            {log.remark || '---'}
                        </td>
                        </tr>
                    ))}
                    </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusHistory;