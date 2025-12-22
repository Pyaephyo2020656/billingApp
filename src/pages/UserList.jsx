import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { UserPlus, ShieldCheck, User } from 'lucide-react';

const UserList = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users'); // Backend မှာ /api/users endpoint ရှိရပါမယ်
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 text-left">User Management</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all">
          <UserPlus size={20} /> Create New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <div key={u.userId} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              {u.role === 'ADMIN' ? <ShieldCheck size={24} /> : <User size={24} />}
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800">{u.username}</h3>
              <p className="text-sm text-slate-500 capitalize">{u.role.toLowerCase()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;