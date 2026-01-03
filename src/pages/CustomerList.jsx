import React, { useState, useEffect } from 'react';
import { FileSpreadsheet } from 'lucide-react'; 
import { exportToExcel } from '../utils/excelExport';
import API from '../api/axios';
import { 
  Plus, Edit, Trash2, Search, X, MapPin, Database, Phone, 
  CalendarDays, Filter, RefreshCcw, Wifi, Globe 
} from 'lucide-react';

const CustomerList = ({ userRole }) => { // App.jsx မှ userRole ကို လက်ခံပါသည်
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Role အလိုက် လုပ်ပိုင်ခွင့် စစ်ဆေးခြင်း
  const canEdit = userRole === 'ADMIN' || userRole === 'STAFF'; // ADMIN နှင့် STAFF သာ ပြင်ဆင်ခွင့်ရှိသည်
  const isAdmin = userRole === 'ADMIN'; // ADMIN သာ ဖျက်ပိုင်ခွင့်ရှိသည်

  // Date Search States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  const [formData, setFormData] = useState({
    id: null, customerId: '', name: '', primaryPhone: '', secondaryPhone: '',
    address: '', dnsn: '', onuSerial: '', gpsCoords: '', status: 'ACTIVE',
    installDate: '', expiryDate: '', 
    quarter: { qtrId: '' },      
    packagePlan: { planId: '' }  
  });


  const handleExport = () => {
  const excelData = customers.map(c => ({
    'Customer ID': c.customerId,
    'Name': c.name,
    'Primary Phone': c.primaryPhone,
    'Secondary Phone': c.secondaryPhone || '---', // ကျန်ခဲ့လို့မဖြစ်သော Field
    'Plan': c.packagePlan?.planName,
    'Bandwidth': c.packagePlan?.bandwidth,
    'Quarter': c.quarter?.qtrName,
    'Address': c.address,
    'ONU Serial (SN)': c.onuSerial || '---',   // ပါရမည့် Tech Spec
    'DNSN': c.dnsn || '---',                    // ပါရမည့် Tech Spec
    'GPS Location': c.gpsCoords || '---',        // ပါရမည့် Tech Spec
    'Install Date': c.installDate,
    'Expiry Date': c.expiryDate,
    'Status': c.status
  }));
  exportToExcel(excelData, 'TJD_Customer_Full_Report', 'Customers');
};

  // Status Change Modal အတွက် States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCustomerForStatus, setSelectedCustomerForStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusRemark, setStatusRemark] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setIsFiltering(false);
      const url = searchTerm ? `/customers?search=${searchTerm}` : '/customers';
      const res = await API.get(url);
      setCustomers(res.data);
      const [pRes, qRes] = await Promise.all([API.get('/plans'), API.get('/quarters')]);
      setPlans(pRes.data);
      setQuarters(qRes.data);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/customers/${selectedCustomerForStatus.id}/status`, null, {
        params: { 
          newStatus: newStatus,
          remark: statusRemark 
        }
      });
      alert("Status Updated & Logged Successfully!");
      setShowStatusModal(false);
      setStatusRemark('');
      fetchData();
    } catch (err) {
      alert("Error updating status: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const handleDateFilter = async () => {
    if (!startDate || !endDate) {
      alert("Please select both dates");
      return;
    }
    try {
      setIsFiltering(true);
      const res = await API.get(`/customers/search-dates`, {
        params: { start: startDate, end: endDate }
      });
      setCustomers(res.data);
    } catch (err) {
      console.error("Filter error:", err);
      alert("Data search failed. Check date formats.");
    }
  };

  const resetFilters = () => {
    setStartDate(''); setEndDate(''); setSearchTerm('');
    fetchData();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quarter.qtrId || !formData.packagePlan.planId) {
      alert("Please select Quarter and Plan!");
      return;
    }
    try {
      const payload = {
        ...formData,
        quarter: { qtrId: parseInt(formData.quarter.qtrId) },
        packagePlan: { planId: parseInt(formData.packagePlan.planId) } 
      };
      await API.post('/customers', payload);
      setShowForm(false);
      fetchData();
      alert("Saved Successfully!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Check data format"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await API.delete(`/customers/${id}`);
      fetchData();
    }
  };

  const inputStyle = "w-full h-11 px-4 text-sm font-bold border-2 border-slate-200 rounded-xl bg-white focus:border-blue-600 outline-none transition-all block text-slate-800";

  return (
    <div className="p-4 text-left font-sans max-w-[1600px] mx-auto">
      {!showForm ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><Database size={24}/></div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Customer Records</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <CalendarDays size={16} className="ml-2 text-slate-400"/>
                <input type="date" className="bg-transparent border-none outline-none font-bold text-[11px]" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span className="text-slate-300 text-[10px] font-bold">TO</span>
                <input type="date" className="bg-transparent border-none outline-none font-bold text-[11px]" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <button onClick={handleDateFilter} className="bg-slate-900 text-white p-2 rounded-xl hover:bg-blue-600 transition-all"><Filter size={14}/></button>
              </div>
              <button onClick={resetFilters} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200"><RefreshCcw size={18}/></button>
              
              {/* ADMIN နှင့် STAFF သာ Add New ခလုတ်ကို မြင်ရမည် */}
              {canEdit && (
                <button onClick={() => handleOpenForm()} className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-700 shadow-lg font-black uppercase text-xs tracking-widest transition-all">
                  <Plus size={18} /> Add New
                </button>
              )}
              <button 
                  onClick={handleExport}
                  className="bg-emerald-600 text-white px-4 py-3 rounded-2xl flex items-center gap-2 hover:bg-emerald-700 shadow-lg font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  <FileSpreadsheet size={18} /> Export Excel
                </button>

            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-slate-50/50">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search ID, Name or Phone..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b">
                  <tr>
                    <th className="px-6 py-4 text-left">Customer / Plan</th>
                    <th className="px-6 py-4 text-left">Contact</th>
                    <th className="px-6 py-4 text-left">Hardware (SN/DN)</th>
                    <th className="px-6 py-4 text-left">Location</th>
                    <th className="px-6 py-4 text-left">Date Details</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic">
                  {customers.map((c) => {
                    const getPlanColor = (planName) => {
                      const name = planName?.toUpperCase() || '';
                      if (name.includes('VIP')) return 'bg-purple-600';
                      if (name.includes('B2B')) return 'bg-blue-700';
                      if (name.includes('HOME')) return 'bg-blue-500 text-white';
                      return 'bg-slate-500';
                    };

                    return (
                      <tr key={c.id} className="hover:bg-blue-50/30 group transition-colors border-b border-slate-50">
                        <td className="px-6 py-5">
                          <div className="font-black text-slate-800 text-base leading-tight">{c.name}</div>
                          <div className="text-[10px] text-blue-600 font-mono font-bold uppercase">{c.customerId}</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className={`px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-tighter text-white ${getPlanColor(c.packagePlan?.planName)}`}>
                              {c.packagePlan?.planName} ({c.packagePlan?.bandwidth || 'N/A'})
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                            <Phone size={13} className="text-blue-500"/> {c.primaryPhone}
                          </div>
                          {c.secondaryPhone && (
                            <div className="text-slate-500 font-black ml-5 text-[10px] mt-1 flex items-center gap-1">
                              <span className="opacity-50 font-bold uppercase text-[8px]">Sec:</span> {c.secondaryPhone}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5 text-[11px] font-mono">
                          <div className="text-slate-400">SN: <span className="text-slate-700 font-bold">{c.onuSerial || '---'}</span></div>
                          <div className="text-slate-400">DN: <span className="text-slate-700 font-bold">{c.dnsn || '---'}</span></div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="text-xs font-black text-slate-800 flex items-center gap-1">
                            <MapPin size={12} className="text-red-500"/> {c.quarter?.qtrName}
                          </div>
                          <div className="text-[10px] text-slate-400 mb-2 leading-relaxed max-w-[200px]">{c.address}</div>
                          {c.gpsCoords && (
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.gpsCoords)}`} 
                              target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            >
                              <Globe size={11}/> GOOGLE EARTH VIEW
                            </a>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Inst:</span>
                              <span className="text-[11px] font-black text-slate-700">{c.installDate || '---'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Expr:</span>
                              <span className="text-[11px] font-black text-rose-600 italic">{c.expiryDate || '---'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <button 
                            disabled={!canEdit} // BOSS နှင့် VIEWER အတွက် Status ပြောင်းခြင်းကို ပိတ်ထားပါသည်
                            onClick={() => {
                              setSelectedCustomerForStatus(c);
                              setNewStatus(c.status);
                              setShowStatusModal(true);
                            }}
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border transition-all ${
                              canEdit ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-80'
                            } ${
                              c.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 
                              c.status === 'DISABLE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {c.status}
                          </button>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            {/* ADMIN နှင့် STAFF သာ ပြင်ခွင့်ရှိသည် */}
                            {canEdit && (
                              <button onClick={() => handleOpenForm(c)} className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <Edit size={16}/>
                              </button>
                            )}
                            {/* ADMIN တစ်ဦးတည်းသာ ဖျက်ခွင့်ရှိသည် */}
                            {isAdmin && (
                              <button onClick={() => handleDelete(c.id)} className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <Trash2 size={16}/>
                              </button>
                            )}
                            {/* View Only Role ဖြစ်ပါက ဘာမှ မပြပါ */}
                            {!canEdit && <span className="text-[9px] font-black text-slate-300 uppercase italic">View Only</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                {isEditing ? 'Update Records' : 'Register New Client'}
              </h2>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mt-1 italic">
                TJD ISP Billing Management
              </p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-3 bg-white/10 hover:bg-red-500 rounded-2xl transition-all">
              <X size={20}/>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest border-b border-slate-100 pb-2">
                <Database size={14}/> 1. Identity & Hardware Specs
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Customer ID</label>
                  <input type="text" className={inputStyle} value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} required />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Full Name / Display Name</label>
                  <input type="text" className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="flex flex-col gap-1.5 font-mono">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest font-sans">ONU Serial (SN)</label>
                  <input type="text" className={`${inputStyle} bg-blue-50/30`} placeholder="48575443..." value={formData.onuSerial} onChange={e => setFormData({...formData, onuSerial: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5 font-mono">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest font-sans">DNSN Number (DN)</label>
                  <input type="text" className={`${inputStyle} bg-indigo-50/30`} placeholder="DN01SN01" value={formData.dnsn} onChange={e => setFormData({...formData, dnsn: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Account Status</label>
                  <select className={inputStyle} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLE">DISABLE</option>
                    <option value="TERMINATION">TERMINATION</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest border-b border-slate-100 pb-2">
                <MapPin size={14}/> 2. Location & Contact Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Primary Phone</label>
                  <input type="text" className={inputStyle} value={formData.primaryPhone} onChange={e => setFormData({...formData, primaryPhone: e.target.value})} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Secondary Phone</label>
                  <input type="text" className={inputStyle} value={formData.secondaryPhone} onChange={e => setFormData({...formData, secondaryPhone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Quarter (ရပ်ကွက်)</label>
                  <select className={inputStyle} value={formData.quarter.qtrId} onChange={e => setFormData({...formData, quarter: { qtrId: e.target.value }})} required>
                    <option value="">-- Choose Quarter --</option>
                    {quarters.map(q => <option key={q.qtrId} value={q.qtrId}>{q.qtrName}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Service Plan</label>
                  <select className={inputStyle} value={formData.packagePlan.planId} onChange={e => setFormData({...formData, packagePlan: { planId: e.target.value }})} required>
                    <option value="">-- Select Plan --</option>
                    {plans.map(p => (
                      <option key={p.planId} value={p.planId}>
                        {p.planName} ({p.bandwidth})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">GPS Coordinates (e.g., 16.82, 96.15)</label>
                   <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                      <input type="text" className={`${inputStyle} pl-10`} placeholder="Latitude, Longitude" value={formData.gpsCoords} onChange={e => setFormData({...formData, gpsCoords: e.target.value})} />
                   </div>
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Full Home Address</label>
                  <textarea className="w-full h-20 p-3 text-sm font-bold border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 transition-all resize-none shadow-inner" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-orange-600 font-black uppercase text-[10px] tracking-widest border-b border-slate-100 pb-2">
                <CalendarDays size={14}/> 3. Billing & Install Dates
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Installation Date</label>
                  <input type="date" className={inputStyle} value={formData.installDate} onChange={e => setFormData({...formData, installDate: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-red-600 uppercase ml-2 tracking-widest">Billing Expiry Date</label>
                  <input type="date" className={`${inputStyle} border-red-100 text-red-600`} value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-6 pt-10 border-t border-slate-100">
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 font-black text-slate-400 hover:text-red-500 uppercase text-[10px] tracking-widest transition-all">Discard</button>
              <button type="submit" className="px-16 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-slate-900 shadow-2xl transition-all uppercase text-[10px] tracking-widest active:scale-95">
                {isEditing ? 'Confirm Update' : 'Register Customer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-black uppercase text-sm tracking-widest">Update Service Status</h3>
              <button onClick={() => setShowStatusModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleStatusUpdate} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Status</label>
                <select 
                  className={inputStyle} 
                  value={newStatus} 
                  onChange={e => setNewStatus(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISABLE">DISABLE</option>
                  <option value="TERMINATION">TERMINATION</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason / Remark</label>
                <textarea 
                  className="w-full h-24 p-4 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600 font-bold text-sm resize-none"
                  placeholder="e.g., Customer traveling for 1 month..."
                  value={statusRemark}
                  onChange={e => setStatusRemark(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-slate-900 transition-all">
                Confirm Change
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;