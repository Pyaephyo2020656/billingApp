import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Edit, Trash2, Search, X, MapPin, Database, Wifi, Phone, CalendarDays, ExternalLink, Map } from 'lucide-react';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Backend Entity field names အတိုင်း အတိအကျဖြစ်ရမည်
  const [formData, setFormData] = useState({
    id: null, customerId: '', name: '', primaryPhone: '', secondaryPhone: '',
    address: '', dnsn: '', onuSerial: '', gpsCoords: '', status: 'ACTIVE',
    installDate: '', expiryDate: '', 
    quarter: { qtrId: '' },      
    packagePlan: { planId: '' }  
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const url = searchTerm ? `/customers?search=${searchTerm}` : '/customers';
      const res = await API.get(url);
      setCustomers(res.data);
      const [pRes, qRes] = await Promise.all([API.get('/plans'), API.get('/quarters')]);
      setPlans(pRes.data);
      setQuarters(qRes.data);
    } catch (err) { console.error("Error:", err); }
  };

  const handleOpenForm = (cust = null) => {
    if (cust) {
      setIsEditing(true);
      setFormData({ 
        ...cust, 
        quarter: { qtrId: cust.quarter?.qtrId || '' }, 
        packagePlan: { planId: cust.packagePlan?.planId || '' } 
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, customerId: '', name: '', primaryPhone: '', secondaryPhone: '', address: '', dnsn: '', onuSerial: '', gpsCoords: '', status: 'ACTIVE', installDate: '', expiryDate: '', quarter: { qtrId: '' }, packagePlan: { planId: '' } });
    }
    setShowForm(true);
  };

  // Logic အမှန်ဖြင့် ပြင်ဆင်ထားသော handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation စစ်ဆေးခြင်း
    const qtrIdValue = formData.quarter.qtrId;
    const planIdValue = formData.packagePlan.planId;

    if (!qtrIdValue || qtrIdValue === "") {
      alert("ကျေးဇူးပြု၍ ရပ်ကွက် ကို ရွေးချယ်ပေးပါ");
      return;
    }

    if (!planIdValue || planIdValue === "") {
      alert("Package Plan ကို ရွေးချယ်ပေးရန် လိုအပ်ပါသည်။");
      return;
    }

    try {
      // Postman Style Payload
      const payload = {
        ...formData,
        quarter: { qtrId: parseInt(qtrIdValue) },
        packagePlan: { planId: parseInt(planIdValue) } 
      };

      console.log("Submitting Payload:", payload);

      const response = await API.post('/customers', payload);
      if (response.status === 200 || response.status === 201) {
        setShowForm(false);
        fetchData();
        alert("အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။");
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data);
      alert("သိမ်းဆည်း၍မရပါ။ " + (err.response?.data?.message || "Data format လွဲနေပါသည်။"));
    }
  };

  const inputStyle = "w-full h-12 px-4 text-base font-bold border-2 border-slate-400 rounded-xl bg-white focus:border-blue-600 outline-none transition-all shadow-sm block text-slate-800";

  return (
    <div className="p-4 text-left">
      {!showForm ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden font-sans">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Customer Records</h1>
            <button onClick={() => handleOpenForm()} className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg font-bold transition-all active:scale-95">
              <Plus size={20} /> ADD NEW
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-black border-b">
                <tr>
                  <th className="px-6 py-4 text-left">Customer & Plan</th>
                  <th className="px-6 py-4 text-left">Phones</th>
                  <th className="px-6 py-4 text-left">Tech (SN/DN/GPS)</th>
                  <th className="px-6 py-4 text-left">Location / Address</th>
                  <th className="px-6 py-4 text-center">In/Exp Dates</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/30">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 leading-tight">{c.name}</div>
                      <div className="text-[10px] text-blue-600 font-mono font-bold uppercase">{c.customerId}</div>
                      <div className="mt-1 flex gap-1 text-[9px] font-black uppercase">
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded">{c.packagePlan?.planName} ({c.packagePlan?.bandwidth})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      <div className="flex items-center gap-1.5"><Phone size={13} className="text-blue-500"/> {c.primaryPhone}</div>
                      {c.secondaryPhone && <div className="text-slate-400 text-[11px] ml-5">{c.secondaryPhone}</div>}
                    </td>
                    <td className="px-6 py-4 space-y-1 text-[11px]">
                      <div className="font-mono">SN: <span className="text-indigo-600 font-bold">{c.onuSerial || '---'}</span></div>
                      <div className="font-mono">DN: {c.dnsn || '---'}</div>
                      {c.gpsCoords && (
                        <a href={`https://www.google.com/maps?q=${c.gpsCoords}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-600 font-black text-[9px] mt-1 bg-emerald-50 px-2 py-0.5 rounded w-fit">
                           <MapPin size={10}/> VIEW ON MAP
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-800">
                      <div className="font-bold">{c.quarter?.qtrName || 'No Qtr'}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 italic" title={c.address}>{c.address || 'No Address'}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-[10px] font-black space-y-1">
                      <div className="text-slate-400 font-medium">IN: {c.installDate || '---'}</div>
                      <div className="text-red-500 uppercase">EXP: {c.expiryDate || '---'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenForm(c)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit size={16} /></button>
                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-300 font-sans">
          <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
             <h2 className="text-2xl font-black uppercase tracking-tight">{isEditing ? 'Update Records' : 'New Registration'}</h2>
             <button onClick={() => setShowForm(false)} className="p-3 bg-white/10 hover:bg-red-500 rounded-xl transition-all shadow-lg"><X size={24}/></button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white text-left">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest border-b pb-2">
                <Database size={16}/> 1. Identity & Hardware Specs
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">Manual ID</label>
                  <input type="text" className={inputStyle} value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} required />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">Full Name</label>
                  <input type="text" className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">Status</label>
                  <select className={inputStyle} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLE">DISABLE</option>
                    <option value="TERMINATION">TERMINATION</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 font-mono">
                  <label className="text-xs font-black text-slate-700 font-sans">ONU Serial (SN)</label>
                  <input type="text" className={`${inputStyle} bg-indigo-50/20`} value={formData.onuSerial} onChange={e => setFormData({...formData, onuSerial: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5 font-mono">
                  <label className="text-xs font-black text-slate-700 font-sans">DNSN Number (DN)</label>
                  <input type="text" className={`${inputStyle} bg-blue-50/20`} value={formData.dnsn} onChange={e => setFormData({...formData, dnsn: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">GPS Coordinates</label>
                  <input type="text" className={inputStyle} placeholder="16.82, 96.15" value={formData.gpsCoords} onChange={e => setFormData({...formData, gpsCoords: e.target.value})} />
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest border-b pb-2 mt-8">
                <Phone size={16}/> 2. Contact & Address Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">Primary Phone</label>
                  <input type="text" className={inputStyle} value={formData.primaryPhone} onChange={e => setFormData({...formData, primaryPhone: e.target.value})} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">Secondary Phone</label>
                  <input type="text" className={inputStyle} value={formData.secondaryPhone} onChange={e => setFormData({...formData, secondaryPhone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">Quarter (ရပ်ကွက်)</label>
                  <select className={inputStyle} value={formData.quarter.qtrId} onChange={e => setFormData({...formData, quarter: { qtrId: e.target.value }})} required>
                    <option value="">-- Choose Qtr --</option>
                    {quarters.map(q => <option key={q.qtrId} value={q.qtrId}>{q.qtrName}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">Package Plan</label>
                  <select 
                    className={inputStyle} 
                    value={formData.packagePlan.planId} 
                    onChange={e => setFormData({...formData, packagePlan: { planId: e.target.value }})}
                    required
                  >
                    <option value="">-- Select Plan --</option>
                    {plans.map(p => (
                      <option key={p.planId} value={p.planId}>
                        {p.planName} ({p.bandwidth})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">Complete Home Address</label>
                  <textarea className="w-full p-4 text-base font-bold border-2 border-slate-400 rounded-2xl bg-white outline-none focus:border-blue-600 transition-all h-24 shadow-inner" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                </div>
              </div>

              <div className="flex items-center gap-2 text-orange-600 font-black uppercase text-[10px] tracking-widest border-b pb-2 mt-8">
                <CalendarDays size={16}/> 3. Service Timelines
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">Install Date</label>
                  <input type="date" className={inputStyle} value={formData.installDate} onChange={e => setFormData({...formData, installDate: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 text-red-600">Expiry Date</label>
                  <input type="date" className={`${inputStyle} border-red-200 text-red-600`} value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-6 mt-12 pt-8 border-t-2 border-slate-50">
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 font-black text-slate-400 hover:text-red-500 uppercase text-[10px] tracking-widest transition-all">Discard Changes</button>
              <button type="submit" className="px-16 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 shadow-2xl transition-all uppercase text-[10px] tracking-widest active:scale-95">
                {isEditing ? 'Confirm Update' : 'Save To Database'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerList;