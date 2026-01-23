import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Trash2, Wifi, Edit } from 'lucide-react';

const PackagePlan = () => {
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({ planName: '', bandwidth: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // 1. Plan အားလုံးကို ယူရန် (Backend: GET /api/plans)
  const fetchPlans = async () => {
    try {
      const res = await API.get('/plans');
      setPlans(res.data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // 2. Plan အသစ်သိမ်းရန် သို့မဟုတ် ပြင်ရန် (Backend: POST /api/plans သို့မဟုတ် PUT /api/plans/{id})
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (isEditing) {
  //       await API.put(`/plans/${editId}`, formData);
  //       alert("Plan updated successfully!");
  //     } else {
  //       await API.post('/plans', formData);
  //       alert("Plan created successfully!");
  //     }
  //     setFormData({ planName: '', bandwidth: '' });
  //     setIsEditing(false);
  //     setEditId(null);
  //     fetchPlans();
  //   } catch (err) {
  //     alert("Error saving plan. Please check backend connection.");
  //   }
  // };

    const handleSubmit = async (e) => {
  e.preventDefault();

  // ၁။ Edit Mode ဖြစ်နေပြီး editId မရှိရင် ရှေ့မဆက်ခိုင်းပါနဲ့ (undefined error ကို တားဆီးရန်)
  if (isEditing && !editId) {
    console.error("Missing ID for update");
    alert("Error: Plan ID is missing. Please try clicking Edit again.");
    return;
  }

  try {
    if (isEditing) {
      // ၂။ PUT Request: Edit ID ပါမပါ console မှာ အရင်ပြပေးမည်
      console.log(`Sending PUT request to: /plans/${editId}`);
      await API.put(`/plans/${editId}`, formData);
      alert("Plan updated successfully!");
    } else {
      // ၃။ POST Request: Plan အသစ်ဆောက်ခြင်း
      await API.post('/plans', formData);
      alert("Plan created successfully!");
    }

    // ၄။ အောင်မြင်ရင် Form ကို Reset လုပ်ပြီး ဒေတာပြန်ဆွဲမည်
    setFormData({ planName: '', bandwidth: '' });
    setIsEditing(false);
    setEditId(null);
    fetchPlans();

  } catch (err) {
    // ၅။ Error တက်လာရင် console မှာ အပြည့်အစုံ ပြပေးမည်
    console.error("Save Error Details:", err.response || err);
    
    const errorMsg = err.response?.data?.message || "Error saving plan. Please check backend connection.";
    alert(errorMsg);
  }
};

// ၆။ handleEdit ကိုလည်း id မှားမဖမ်းမိအောင် ဒီလိုလေး ပြင်ထားပါ
const handleEdit = (plan) => {
  // Backend Model ပေါ်မူတည်ပြီး id သို့မဟုတ် planId ကို ယူပေးပါမယ်
  const currentId = plan.id || plan.planId;
  
  if (!currentId) {
    console.error("The selected plan object does not have an ID:", plan);
    alert("Error: Could not retrieve Plan ID.");
    return;
  }

  setFormData({ 
    planName: plan.planName, 
    bandwidth: plan.bandwidth 
  });
  setIsEditing(true);
  setEditId(currentId);
  
  // စာမျက်နှာအပေါ်ဆုံးသို့ ပြန်တင်ပေးခြင်း (Optional)
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  

  // 3. Edit mode သို့ ပြောင်းရန်
//   const handleEdit = (plan) => {
//   // Console မှာ ကြည့်ပါ - id လား၊ planId လား၊ ဒါမှမဟုတ် တခြားလား
//   console.log("Full plan object:", plan); 

//   // Backend က ID ကို ဘယ်လိုနာမည်ပေးပေး အလုပ်လုပ်အောင် စစ်ပါမယ်
//   const currentId = plan.id || plan.planId || plan.id; 
  
//   setFormData({ 
//     planName: plan.planName, 
//     bandwidth: plan.bandwidth 
//   });
//   setIsEditing(true);
//   setEditId(currentId); // ဒီမှာ undefined ဖြစ်နေလို့ error တက်တာပါ
// };

  // 4. Plan ဖျက်ရန် (Backend: DELETE /api/plans/{id})
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await API.delete(`/plans/${id}`);
        fetchPlans();
      } catch (err) {
        alert("Cannot delete plan. It might be linked to existing customers.");
      }
    }
  };

  return (
    <div className="space-y-6 text-left">
      <h1 className="text-2xl font-bold text-slate-800">Internet Package Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              {isEditing ? <Edit size={20} /> : <Plus size={20} />}
              {isEditing ? "Update Plan" : "Add New Plan"}
            </h2>
            
            <div>
              <label className="block text-sm font-semibold text-slate-600">Plan Name</label>
              <input 
                type="text" 
                className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. HOME, B2B"
                value={formData.planName}
                onChange={(e) => setFormData({...formData, planName: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600">Bandwidth</label>
              <input 
                type="text" 
                className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 50Mbps"
                value={formData.bandwidth}
                onChange={(e) => setFormData({...formData, bandwidth: e.target.value})}
                required
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                {isEditing ? "Update" : "Save"}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setFormData({planName:'', bandwidth:''}); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List View Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr className="text-slate-600 text-sm">
                  <th className="px-6 py-4 text-left font-bold">Plan Name</th>
                  <th className="px-6 py-4 text-left font-bold">Bandwidth</th>
                  <th className="px-6 py-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wifi size={18} /></div>
                        <span className="font-bold text-slate-800">{plan.planName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{plan.bandwidth}</td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button onClick={() => handleEdit(plan)} className="text-blue-500 hover:text-blue-700">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(plan.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-400 italic">No plans created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagePlan;