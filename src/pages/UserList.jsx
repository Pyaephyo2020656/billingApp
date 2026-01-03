import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { UserPlus, ShieldCheck, User, Trash2, Power, Briefcase, Eye, X } from 'lucide-react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'STAFF' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data);
    } catch (err) { console.error("Error fetching users", err); }
  };

  // ၁။ Role ပြောင်းလဲခြင်း (Text Plain Format ဖြင့် ပို့ပါသည်)
  const handleRoleChange = async (id, newRole) => {
    try {
      await API.patch(`/users/${id}/role`, newRole, {
        headers: { 'Content-Type': 'text/plain' }
      });
      fetchUsers();
    } catch (err) { alert("Role update failed!"); }
  };

  // ၂။ အကောင့် ပိတ်/ဖွင့် လုပ်ခြင်း
  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/users/${id}/toggle-status`);
      fetchUsers();
    } catch (err) { alert("Error updating status"); }
  };

  // ၃။ User အသစ်ဆောက်ခြင်း
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users', formData);
      setShowForm(false); // Modal ပိတ်ရန်
      setFormData({ username: '', password: '', role: 'STAFF' }); // Form ရှင်းရန်
      fetchUsers();
      alert("User created successfully!");
    } catch (err) { 
      alert("Error: Username might already exist!"); 
    }
  };

  // ၄။ User ဖျက်ခြင်း
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) { alert("Delete failed!"); }
    }
  };

  const inputStyle = "w-full px-4 py-2 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none font-bold text-sm";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">System Users</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Staff Access & Permissions</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-600 transition-all font-black text-xs uppercase shadow-lg"
        >
          <UserPlus size={18} /> Add New Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <div key={u.userId} className={`bg-white p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden ${u.enabled ? 'border-slate-50 shadow-sm' : 'border-red-100 bg-red-50/30'}`}>
            <div className="flex items-center space-x-4 mb-6">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${
                u.role === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 
                u.role === 'BOSS' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {u.role === 'ADMIN' ? <ShieldCheck size={28} /> : 
                 u.role === 'BOSS' ? <Briefcase size={28} /> : 
                 u.role === 'VIEWER' ? <Eye size={28} /> : <User size={28} />}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 text-lg leading-none">{u.username}</h3>
                <div className="mt-2">
                  <select 
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-blue-600 outline-none cursor-pointer border-b border-blue-100 hover:border-blue-600 transition-all"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                    <option value="BOSS">BOSS</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <button 
                onClick={() => handleToggleStatus(u.userId)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${
                  u.enabled ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-600 text-white shadow-md'
                }`}
              >
                <Power size={14} /> {u.enabled ? 'Disable' : 'Enable'}
              </button>
              
              <button onClick={() => handleDelete(u.userId)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ၅။ Modal Form (ပြန်ထည့်ပေးထားပါသည်) */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-black uppercase text-sm tracking-widest">Register New User</h3>
              <button onClick={() => setShowForm(false)} className="hover:rotate-90 transition-transform"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Username</label>
                <input type="text" className={inputStyle} required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Password</label>
                <input type="password" className={inputStyle} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Assign Role</label>
                <select className={inputStyle} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="STAFF">STAFF (Operations)</option>
                  <option value="BOSS">BOSS (Dashboard & History)</option>
                  <option value="VIEWER">VIEWER (Read-Only)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-slate-900 transition-all mt-4">
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;