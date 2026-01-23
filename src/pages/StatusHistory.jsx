import React, { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, History, Search, RefreshCcw, Calendar, Clock, CheckCircle, Edit, Trash2, X } from 'lucide-react'; // Edit, Trash2, X တို့ ထပ်တိုးထားသည်
import { exportToExcel } from '../utils/excelExport';
import API from '../api/axios';

const StatusHistory = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usageStats, setUsageStats] = useState(null);

  // Edit States
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [editRemark, setEditRemark] = useState('');
  const [editDate, setEditDate] = useState('');

  // ၁။ Log အားလုံးကို ဆွဲထုတ်ရန်
  const fetchData = useCallback(async () => {
    try {
      const url = searchTerm ? `/status-logs/all?search=${searchTerm}` : '/status-logs/all';
      const res = await API.get(url);
      setLogs(res.data);
      
      if (searchTerm && res.data.length > 0) {
        calculateUsage(res.data);
      } else {
        setUsageStats(null);
      }
    } catch (err) { console.error("Fetch error:", err); }
  }, [searchTerm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Edit logic
  const handleEditClick = (log) => {
    setSelectedLog(log);
    setEditRemark(log.remark || '');
    setEditDate(log.changeDate?.split('T')[0] || '');
    setShowEditModal(true);
  };

  const handleUpdateLog = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/status-logs/${selectedLog.logId}`, {
        remark: editRemark,
        changeDate: editDate
      });
      alert("Log updated successfully!");
      setShowEditModal(false);
      fetchData();
    } catch (err) { alert("Error updating log"); }
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm("Are you sure you want to delete this log record?")) {
      try {
        await API.delete(`/status-logs/${id}`);
        fetchData();
      } catch (err) { alert("Error deleting log"); }
    }
  };

  // Usage Calculation logic
  const calculateUsage = (customerLogs) => {
    const customer = customerLogs[0].customer;
    if (!customer?.installDate) return;

    const installDate = new Date(customer.installDate);
    const today = new Date();
    const totalDays = Math.floor((today - installDate) / (1000 * 60 * 60 * 24));

    let disabledDays = 0;
    customerLogs.forEach((log, index) => {
      if (log.newStatus === 'DISABLE') {
        const startDate = new Date(log.changeDate);
        const endDate = customerLogs[index - 1] ? new Date(customerLogs[index - 1].changeDate) : today;
        const diff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (diff > 0) disabledDays += diff;
      }
    });

    setUsageStats({
      total: totalDays,
      active: Math.max(0, totalDays - disabledDays),
      inactive: disabledDays
    });
  };

  const handleExport = () => {
    const excelData = logs.map(log => ({
      'Date': log.changeDate?.split('T')[0],
      'Customer ID': log.customer?.customerId,
      'Name': log.customer?.name,
      'Phone': log.customer?.primaryPhone,
      'Old Status': log.oldStatus,
      'New Status': log.newStatus,
      'Remark': log.remark,
      'Address': log.customer?.address
    }));
    exportToExcel(excelData, 'Status_Change_Logs', 'Logs');
  };

  return (
    <div className="p-4 text-left font-sans max-w-[1600px] mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg"><History size={24}/></div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Status History Logs</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search ID or Name..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={fetchData} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-slate-900"><RefreshCcw size={18}/></button>
            <button onClick={handleExport} className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 font-bold text-[10px] uppercase flex items-center gap-2">
              <FileSpreadsheet size={18}/> Export Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {usageStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top duration-500">
            <div className="bg-white p-6 rounded-[2rem] border-l-8 border-blue-500 shadow-sm flex items-center justify-between">
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Total Service Days</p><h4 className="text-2xl font-black text-slate-800">{usageStats.total} Days</h4></div>
              <Calendar className="text-blue-100" size={40}/>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border-l-8 border-emerald-500 shadow-sm flex items-center justify-between">
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Actual Active Usage</p><h4 className="text-2xl font-black text-emerald-600">{usageStats.active} Days</h4></div>
              <CheckCircle className="text-emerald-100" size={40}/>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border-l-8 border-rose-500 shadow-sm flex items-center justify-between">
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Suspended (Disabled)</p><h4 className="text-2xl font-black text-rose-600">{usageStats.inactive} Days</h4></div>
              <Clock className="text-rose-100" size={40}/>
            </div>
          </div>
        )}

        {/* Table Area */}
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b">
              <tr>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-center">Status Change</th>
                <th className="px-6 py-4 text-left">Remark</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {logs.map((log) => (
                <tr key={log.logId} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-5 font-mono text-[11px] text-blue-600 font-bold">{log.changeDate?.split('T')[0]}</td>
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-800 text-sm">{log.customer?.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{log.customer?.customerId}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[9px] text-slate-300 font-black uppercase">{log.oldStatus}</span>
                      <span className="text-slate-300">→</span>
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${log.newStatus === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{log.newStatus}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-600 font-bold text-xs">{log.remark || '---'}</td>
                  <td className="px-6 py-5 text-right space-x-2">
                    <button onClick={() => handleEditClick(log)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit size={14}/></button>
                    <button onClick={() => handleDeleteLog(log.logId)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-black uppercase text-sm tracking-widest">Edit Log Entry</h3>
              <button onClick={() => setShowEditModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleUpdateLog} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Change Date</label>
                <input type="date" className="w-full h-11 px-4 text-sm font-bold border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600" value={editDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason / Remark</label>
                <textarea className="w-full h-24 p-4 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600 font-bold text-sm resize-none" value={editRemark} onChange={e => setEditRemark(e.target.value)} required />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-slate-900 transition-all">Update Log</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusHistory;