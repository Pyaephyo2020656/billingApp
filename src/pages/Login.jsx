import React, { useState } from 'react';
import API from '../api/axios';
import { Lock, User, LogIn } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Backend က /api/users/login ဆီ ပို့မည် (Logic ကို အောက်မှာ ပြပေးထားပါတယ်)
      const res = await API.post('/users/login', credentials);
      if (res.data) {
        onLoginSuccess();
      }
    } catch (err) {
      setError('Invalid username or password!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">TJD Billing</h2>
          <p className="mt-2 text-sm text-slate-600">Please sign in to your account</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          
          <div className="space-y-4 text-left">
            <div className="relative">
              <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Enter your username"
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            <LogIn className="mr-2" size={18} /> Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;