import React, { useState } from 'react';
import API from '../api/axios';

const UserCreate = ({ onCreated }) => {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'STAFF' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users', formData);
      alert("User created successfully!");
      setFormData({ username: '', password: '', role: 'STAFF' });
      if (onCreated) onCreated(); // List ကို Update ပြန်လုပ်ရန်
    } catch (err) {
      alert("Error creating user");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 max-w-md mx-auto text-left">
      <h2 className="text-xl font-bold mb-4">Add New User</h2>
      <div>
        <label className="block text-sm font-medium text-slate-700">Username</label>
        <input 
          type="text" 
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input 
          type="password" 
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Role</label>
        <select 
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
        >
          <option value="STAFF">STAFF</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">
        Save User
      </button>
    </form>
  );
};

export default UserCreate;