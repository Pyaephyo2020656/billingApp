import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Trash2, MapPin, Edit } from 'lucide-react';

const Quarter = () => {
  const [quarters, setQuarters] = useState([]);
  // Backend Model အတိုင်း qtrName ဟု ပြောင်းလဲခြင်း
  const [formData, setFormData] = useState({ qtrName: '' }); 
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchQuarters = async () => {
    try {
      const res = await API.get('/quarters');
      setQuarters(res.data);
    } catch (err) {
      console.error("Error fetching quarters:", err);
    }
  };

  useEffect(() => {
    fetchQuarters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Edit လုပ်လျှင် qtrId ပါ ပို့ပေးရပါမည်
        await API.put(`/quarters/${editId}`, { qtrId: editId, qtrName: formData.qtrName });
      } else {
        await API.post('/quarters', formData);
      }
      setFormData({ qtrName: '' });
      setIsEditing(false);
      setEditId(null);
      fetchQuarters();
      alert("Saved successfully!");
    } catch (err) {
      alert("Error saving quarter. Please check console.");
      console.error(err.response?.data);
    }
  };

  const handleEdit = (q) => {
    // q.qtrName ဟု အသုံးပြုရပါမည်
    setFormData({ qtrName: q.qtrName }); 
    setIsEditing(true);
    setEditId(q.qtrId); // q.qtrId ဖြစ်ရပါမည်
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await API.delete(`/quarters/${id}`);
        fetchQuarters();
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  return (
    <div className="space-y-6 text-left">
      <h1 className="text-2xl font-bold text-slate-800">Quarter Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              {isEditing ? <Edit size={20} /> : <Plus size={20} />}
              {isEditing ? "Update Quarter" : "Add New Quarter"}
            </h2>
            <div>
              <label className="block text-sm font-semibold text-slate-600">Quarter Name</label>
              <input 
                type="text" 
                className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Ward (10)"
                value={formData.qtrName}
                onChange={(e) => setFormData({ qtrName: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              {isEditing ? "Update" : "Save"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr className="text-slate-600 text-sm">
                  <th className="px-6 py-4 text-left font-bold">Quarter Name</th>
                  <th className="px-6 py-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quarters.map((q) => (
                  <tr key={q.qtrId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><MapPin size={18} /></div>
                      <span className="font-semibold text-slate-800">{q.qtrName}</span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button onClick={() => handleEdit(q)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(q.qtrId)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
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

export default Quarter;