import React, { useState, useEffect } from 'react';
import { exportToExcel } from '../utils/excelExport'; // import အရင်လုပ်ပါ
import { FileSpreadsheet } from 'lucide-react'; // icon လေးသုံးဖို့ပါ
import API from '../api/axios';
import { Plus, Search, MapPin, History, X, ArrowRight, Trash2 } from 'lucide-react';

const RelocationPage = ({ userRole }) => { // App.jsx မှ userRole ကို လက်ခံပါသည်
  const [historyList, setHistoryList] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCust, setSelectedCust] = useState(null);

  // Role အလိုက် လုပ်ပိုင်ခွင့် စစ်ဆေးခြင်း
  const canModify = userRole === 'ADMIN' || userRole === 'STAFF'; // ADMIN နှင့် STAFF သာ ရွှေ့ပြောင်းခွင့်ရှိသည်
  const isAdmin = userRole === 'ADMIN'; // ADMIN တစ်ဦးတည်းသာ History ဖျက်ပိုင်ခွင့်ရှိသည်

  const [formData, setFormData] = useState({
    newAddress: '', newGps: '', newDnsn: '', newQtrId: '', remark: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await loadQuarters();
    await fetchData();
  };

  const loadQuarters = async () => {
    try {
      const res = await API.get('/quarters');
      setQuarters(res.data);
    } catch (err) { console.error("Quarters Load Error:", err); }
  };

  const fetchData = async () => {
    try {
      const res = await API.get('/relocations/history/all'); 
      setHistoryList(res.data);
    } catch (err) { console.error("Fetch History Error:", err); }
  };

  const findCustomer = async () => {
    if (!searchTerm) return;
    try {
      const res = await API.get(`/customers?search=${searchTerm}`);
      if (res.data.length > 0) {
        setSelectedCust(res.data[0]);
        const hRes = await API.get(`/relocations/history/${res.data[0].customerId}`);
        setHistoryList(hRes.data);
      } else {
        alert("Customer ရှာမတွေ့ပါ။");
        setSelectedCust(null);
      }
    } catch (err) { console.error("Search Error:", err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCust) return;
    try {
      const payload = {
        newAddress: formData.newAddress,
        newGps: formData.newGps,
        newDnsn: formData.newDnsn,
        remark: formData.remark,
        newQtr: { qtrId: parseInt(formData.newQtrId) }
      };
      await API.post(`/relocations/${selectedCust.id}`, payload);
      alert("Relocation အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။");
      setShowForm(false);
      setSearchTerm('');
      setFormData({ newAddress: '', newGps: '', newDnsn: '', newQtrId: '', remark: '' });
      fetchData();
    } catch (err) { alert("သိမ်းဆည်း၍မရပါ။ Backend logic ကို စစ်ဆေးပါ။"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("ဒီ History record ကို ဖျက်မှာ သေချာပါသလား?")) {
      try {
        await API.delete(`/relocations/history/${id}`);
        alert("ဖျက်သိမ်းပြီးပါပြီ။");
        fetchData();
      } catch (err) {
        alert("ဖျက်၍မရပါ။ Backend မှာ DeleteMapping ရှိမရှိ စစ်ဆေးပါ။");
      }
    }
  };

  const handleExport = () => {
  const excelData = historyList.map(h => ({
    'Date': h.relocationDate,
    'Customer ID': h.customer?.customerId,
    'Customer Name': h.customer?.name,
    'Old Quarter': h.oldQuarter?.qtrName,
    'Old Address': h.oldAddress,
    'Old DNSN': h.oldDnsn,
    'Old GPS': h.oldGps,
    'New Quarter': h.newQuarter?.qtrName,
    'New Address': h.newAddress,
    'New DNSN': h.newDnsn,
    'New GPS': h.newGps,
    'Remark': h.remark
  }));
  exportToExcel(excelData, 'Relocation_History_Report', 'Relocations');
};



  const inputStyle = "w-full h-12 px-4 text-base font-bold border-2 border-slate-300 rounded-xl bg-white focus:border-blue-600 outline-none transition-all shadow-sm block text-slate-800";

  return (
    <div className="p-4 text-left font-sans max-w-[1600px] mx-auto">
      {!showForm ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
               <History size={28} className="text-blue-600"/> Relocation History
            </h1>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Enter ID to see history..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && findCustomer()}
                />
              </div>
              {/* ADMIN နှင့် STAFF သာ အသစ်ထည့်ခွင့်ရှိသည် */}
              {canModify && (
                <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg font-bold transition-all uppercase text-xs tracking-widest">
                  <Plus size={20} /> ADD RELOCATION
                </button>
              )}
                <button onClick={handleExport} className="bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-700 shadow-lg font-bold transition-all uppercase text-[10px] tracking-widest">
                <FileSpreadsheet size={18} /> Export Excel
              </button>

            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-black border-b">
                <tr>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Moved From (Old)</th>
                  <th className="px-6 py-4 text-left">GPS (Old)</th>
                   <th className="px-6 py-4 text-left">DNSN (Old)</th>
                  <th className="px-6 py-4 text-left">Remark</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {historyList.length > 0 ? historyList.map((h) => (
                  <tr key={h.relocationId} className="hover:bg-blue-50/30">
                    <td className="px-6 py-4 font-black text-blue-600 text-[11px]">{h.relocationDate}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{h.customer?.name} ({h.customer?.customerId})</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-bold">{h.oldQuarter?.qtrName}</div>
                      <div className="text-[11px] italic line-clamp-1">{h.oldAddress}</div>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-mono text-slate-500">{h.oldGps || '---'}</td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {h.oldDnsn || '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{h.remark || '---'}</td>
                    <td className="px-6 py-4 text-center">
                      {/* ADMIN တစ်ဦးတည်းသာ ဖျက်ခွင့်ရှိသည် */}
                      {isAdmin ? (
                        <button onClick={() => handleDelete(h.relocationId)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                          <Trash2 size={18}/>
                        </button>
                      ) : (
                        <span className="text-[9px] font-black text-slate-200 uppercase">View Only</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="py-10 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No history records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden font-sans">
          <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
             <h2 className="text-2xl font-black uppercase tracking-tight">New Relocation</h2>
             <button onClick={() => setShowForm(false)} className="p-3 hover:bg-red-500 rounded-xl transition-all shadow-lg"><X size={24}/></button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white text-left">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest border-b pb-2">
                <Search size={16}/> 1. Identify Customer
              </div>
              <div className="flex gap-4">
                <input type="text" className={inputStyle} placeholder="Enter Customer ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button type="button" onClick={findCustomer} className="px-8 bg-slate-800 text-white font-black rounded-xl hover:bg-blue-600 transition-all uppercase text-xs tracking-widest">FIND</button>
              </div>

              {selectedCust && (
                <div className="animate-in fade-in duration-300 space-y-8">
                  <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-dashed border-blue-200 flex justify-between items-center">
                    <div>
                       <div className="text-[10px] font-black text-blue-400 uppercase">Current Info (Will be stored as history)</div>
                       <div className="text-xl font-black text-slate-800">{selectedCust.name}</div>
                       <div className="text-sm font-bold text-slate-500">{selectedCust.quarter?.qtrName} — {selectedCust.address}</div>
                    </div>
                    <ArrowRight size={32} className="text-blue-200" />
                  </div>

                  <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest border-b pb-2">
                    <MapPin size={16}/> 2. New Location Details
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">New Quarter</label>
                      <select className={inputStyle} onChange={e => setFormData({...formData, newQtrId: e.target.value})} required>
                        <option value="">-- Choose New Quarter --</option>
                        {quarters.map(q => <option key={q.qtrId} value={q.qtrId}>{q.qtrName}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">New DNSN</label>
                      <input type="text" className={inputStyle} onChange={e => setFormData({...formData, newDnsn: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">New GPS Coordinates</label>
                      <input type="text" className={inputStyle} placeholder="16.82, 96.15" onChange={e => setFormData({...formData, newGps: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">Complete New Address</label>
                      <textarea className="w-full p-4 border-2 border-slate-300 rounded-2xl font-bold h-24 focus:border-blue-600 outline-none transition-all" onChange={e => setFormData({...formData, newAddress: e.target.value})} required></textarea>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">Remark (Reason for Relocation)</label>
                      <input type="text" className={inputStyle} placeholder="Reason..." onChange={e => setFormData({...formData, remark: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-6 pt-8 border-t-2 border-slate-50">
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 font-black text-slate-400 hover:text-red-500 uppercase text-[10px] tracking-widest transition-all">Discard</button>
              <button type="submit" disabled={!selectedCust} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-slate-900 shadow-2xl transition-all uppercase text-[10px] tracking-widest active:scale-95 disabled:bg-slate-200">
                Confirm & Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RelocationPage;