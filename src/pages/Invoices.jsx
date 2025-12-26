import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Search, FileText, Trash2, Edit3, X, Calendar, Tag, Save, Printer } from 'lucide-react';

const Invoices = () => {
  // ၁။ States သတ်မှတ်ခြင်း
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [selectedCust, setSelectedCust] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [remark, setRemark] = useState('');
  const [status, setStatus] = useState('UNPAID');
  const [invoiceItems, setInvoiceItems] = useState([{ 
    description: 'Monthly Internet Fee', periodStart: '', periodEnd: '', qty: 1, unitPrice: 0, itemDiscount: 0 
  }]);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  // ၂။ API Functions
  const fetchCustomers = async () => {
    try {
      const res = await API.get('/customers');
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Fetch Customers Error:", err); }
  };

  const fetchInvoices = async () => {
    try {
      const url = searchTerm ? `/invoices?search=${searchTerm}` : '/invoices';
      const res = await API.get(url);
      
      // Infinite loop crash ကာကွယ်ရန် data format စစ်ဆေးခြင်း
      if (res.data) {
        if (Array.isArray(res.data)) {
          setInvoices(res.data);
        } else if (typeof res.data === 'object') {
          setInvoices([res.data]); 
        }
      } else {
        setInvoices([]);
      }
    } catch (err) { 
      console.error("Fetch Error:", err);
      setInvoices([]); 
    }
  };

  // ၃။ CRUD Operations (Update & Delete)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await API.delete(`/invoices/${id}`);
        alert("Deleted successfully!");
        fetchInvoices();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const handleEdit = (inv) => {
    setEditingId(inv.invoiceId);
    setSelectedCust(inv.customer);
    setInvoiceDate(inv.invoiceDate);
    setDiscountAmount(inv.discountAmount || 0);
    setRemark(inv.remark || '');
    setStatus(inv.status || 'UNPAID');
    // Line items များကို form ထဲ ပြန်ဖြည့်ပေးခြင်း
    setInvoiceItems(inv.items || []);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedCust(null);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDiscountAmount(0);
    setRemark('');
    setStatus('UNPAID');
    setInvoiceItems([{ description: 'Monthly Internet Fee', periodStart: '', periodEnd: '', qty: 1, unitPrice: 0, itemDiscount: 0 }]);
  };

  const removeItem = (index) => {
  // item တစ်ခုပဲ ကျန်တော့ရင် ဖျက်ခွင့်မပေးဘဲ အနည်းဆုံး တစ်ခုတော့ ချန်ထားပါမယ်
  if (invoiceItems.length > 1) {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updatedItems);
  } else {
    alert("အနည်းဆုံး Item တစ်ခုတော့ ရှိရပါမယ်ဗျာ။");
  }
};

  // ၄။ Calculations
  const calculateItemAmount = (item) => (parseFloat(item.qty || 0) * parseFloat(item.unitPrice || 0)) - parseFloat(item.itemDiscount || 0);
  const calculateSubTotal = () => invoiceItems.reduce((sum, item) => sum + calculateItemAmount(item), 0);
  const calculateGrandTotal = () => calculateSubTotal() - (parseFloat(discountAmount) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCust) return alert("Please select a customer");

    const payload = {
      customer: selectedCust,
      invoiceDate,
      subTotal: calculateSubTotal(),
      discountAmount: parseFloat(discountAmount),
      totalAmount: calculateGrandTotal(),
      status,
      remark,
      items: invoiceItems.map(it => ({ ...it, amount: calculateItemAmount(it) }))
    };

    try {
      if (editingId) {
        await API.put(`/invoices/${editingId}`, payload); // Update logic
      } else {
        await API.post('/invoices', payload); // Create logic
      }
      setShowForm(false);
      resetForm();
      fetchInvoices();
    } catch (err) { alert("Error saving invoice"); }
  };

  const canAddItem = () => {
  const lastItem = invoiceItems[invoiceItems.length - 1];
  // နောက်ဆုံး item ရဲ့ description နဲ့ unitPrice ရှိမှ နောက်တစ်ခု ထပ်တိုးခွင့်ပေးမယ်
  return lastItem.description.trim() !== "" && lastItem.unitPrice > 0;
};

  return (
    <div className="p-4 text-left font-sans">
      {!showForm ? (
        /* --- LIST VIEW --- */
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h1 className="text-2xl font-black text-slate-800 uppercase flex items-center gap-2 italic tracking-tighter">
              <FileText size={28} className="text-blue-600"/> Invoices
            </h1>
            <div className="flex gap-3">
              <input type="text" placeholder="Search..." className="px-4 py-2 border-2 rounded-xl font-bold outline-none focus:border-blue-600" onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchInvoices()}/>
              <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-xs shadow-lg hover:bg-blue-700 transition-all">CREATE NEW</button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-black border-b">
              <tr>
                <th className="px-6 py-4 text-left">Inv No.</th>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th> {/* Action Column */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.isArray(invoices) && invoices.length > 0 ? invoices.map((inv) => (
                <tr key={inv.invoiceId} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-black text-blue-600">{inv.invoiceNo}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{inv.customer?.name}</td>
                  <td className="px-6 py-4 font-black text-right">{inv.totalAmount?.toLocaleString()} Ks</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{inv.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(inv)} className="p-2 text-slate-400 hover:text-amber-500 transition-colors" title="Edit"><Edit3 size={18}/></button>
                      <button onClick={() => handleDelete(inv.invoiceId)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={18}/></button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Print"><Printer size={18}/></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest italic">No invoices found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* --- CREATE / EDIT FORM --- */
//         <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border overflow-hidden">
//           <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
//              <h2 className="text-xl font-black uppercase">{editingId ? 'Edit Invoice' : 'New Invoice'}</h2>
//              <X size={24} className="cursor-pointer" onClick={() => { setShowForm(false); resetForm(); }}/>
//           </div>
//           <form onSubmit={handleSubmit} className="p-8 space-y-6">
//             <div className="grid grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black text-blue-600 uppercase">1. Customer</label>
//                 <select className="w-full h-11 px-4 border-2 rounded-xl font-bold bg-white outline-none focus:border-blue-600" onChange={(e) => setSelectedCust(customers.find(c => c.id === parseInt(e.target.value)))} value={selectedCust?.id || ""} required>
//                   <option value="" disabled>-- Select Customer --</option>
//                   {customers.map(c => <option key={c.id} value={c.id}>{c.customerId} - {c.name}</option>)}
//                 </select>
//               </div>
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black text-slate-400 uppercase">Date</label>
//                 <input type="date" className="w-full h-11 px-4 border-2 rounded-xl font-bold outline-none focus:border-blue-600" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}/>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div className="flex justify-between border-b pb-2">
//                 <label className="text-[10px] font-black text-emerald-600 uppercase italic">2. Line Items</label>
//                 {/* <button type="button" onClick={() => setInvoiceItems([...invoiceItems, { description: '', periodStart: '', periodEnd: '', qty: 1, unitPrice: 0, itemDiscount: 0 }])} className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded">+ ADD ITEM</button> */}
//                          <button 
//                         type="button" 
//                         onClick={() => setInvoiceItems([...invoiceItems, { description: '', periodStart: '', periodEnd: '', qty: 1, unitPrice: 0, itemDiscount: 0 }])}
//                         disabled={!canAddItem()} // data မပြည့်စုံရင် နှိပ်မရအောင် တားထားခြင်း
//                         className={`text-[9px] font-black px-3 py-1 rounded transition-all ${
//                             canAddItem() 
//                             ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
//                             : "bg-slate-100 text-slate-400 cursor-not-allowed" // မရရင် အရောင်ဖျော့ထားမယ်
//                         }`}
//                         >
//                         + ADD ITEM
//                         </button>
//               </div>
              

//                 <div className="max-h-60 overflow-y-auto space-y-3">
//   {invoiceItems.map((item, idx) => (
//     /* Line Item Row တစ်ခုချင်းစီ */
//     <div key={idx} className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100 relative group">
      
//       {/* ၁။ ဖျက်ရန်ခလုတ် (Trash Icon) - Item တစ်ခုထက်ပိုမှ ပြမည် */}
//       {invoiceItems.length > 1 && (
//         <button
//           type="button"
//           onClick={() => removeItem(idx)}
//           className="absolute -right-2 -top-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
//           title="Remove Item"
//         >
//           <X size={14} />
//         </button>
//       )}

//       <div className="flex gap-2">
//         <input 
//           type="text" 
//           placeholder="Description" 
//           className="flex-1 h-10 px-3 border rounded-lg text-sm" 
//           value={item.description} 
//           onChange={(e) => { const n = [...invoiceItems]; n[idx].description = e.target.value; setInvoiceItems(n); }} 
//           required
//         />
//         <input type="date" className="w-36 h-10 px-2 border rounded-lg text-xs" value={item.periodStart || ''} onChange={(e) => { const n = [...invoiceItems]; n[idx].periodStart = e.target.value; setInvoiceItems(n); }}/>
//         <input type="date" className="w-36 h-10 px-2 border rounded-lg text-xs" value={item.periodEnd || ''} onChange={(e) => { const n = [...invoiceItems]; n[idx].periodEnd = e.target.value; setInvoiceItems(n); }}/>
//       </div>

//       <div className="grid grid-cols-4 gap-3 items-center">
//         <input type="number" placeholder="Qty" className="h-10 px-3 border rounded-lg text-sm font-bold" value={item.qty} onChange={(e) => { const n = [...invoiceItems]; n[idx].qty = e.target.value; setInvoiceItems(n); }} required/>
//         <input type="number" placeholder="Price" className="h-10 px-3 border rounded-lg text-sm font-bold" value={item.unitPrice} onChange={(e) => { const n = [...invoiceItems]; n[idx].unitPrice = e.target.value; setInvoiceItems(n); }} required/>
//         <input type="number" placeholder="Item Disc" className="h-10 px-3 border rounded-lg text-sm font-bold text-orange-500" value={item.itemDiscount} onChange={(e) => { const n = [...invoiceItems]; n[idx].itemDiscount = e.target.value; setInvoiceItems(n); }}/>
        
//         {/* စုစုပေါင်း Amount ပြတဲ့နေရာ */}
//         <div className="h-10 px-3 bg-white border flex items-center justify-end font-black text-blue-600 rounded-lg">
//           {calculateItemAmount(item).toLocaleString()} Ks
//         </div>
//       </div>
//     </div>
//   ))}
// </div>


//             </div>

//             <div className="flex justify-between items-end pt-6 border-t border-dashed">
//               <div className="space-y-4">
//                  <input type="number" placeholder="Grand Discount" className="w-44 h-11 px-4 border-2 border-orange-100 rounded-xl font-black text-orange-600" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)}/>
//                  <div className="flex gap-3">
//                     <select className="px-4 border-2 rounded-xl font-black text-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
//                       <option value="UNPAID">UNPAID</option><option value="PAID">PAID</option>
//                     </select>
//                     <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs shadow-xl"><Save size={18} className="inline mr-2"/> {editingId ? 'Update' : 'Save'}</button>
//                  </div>
//               </div>
//               <div className="text-right pb-1">
//                  <div className="text-xs font-bold text-slate-400">Total: {calculateSubTotal().toLocaleString()} Ks</div>
//                  <div className="text-4xl font-black text-slate-900">{calculateGrandTotal().toLocaleString()} Ks</div>
//               </div>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>

        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
              {editingId ? 'Edit Invoice' : 'Create New Invoice'}
            </h2>
            <p className="text-slate-500 font-medium">Fill in the details to generate a billing statement.</p>
          </div>
          <button 
            onClick={() => { setShowForm(false); resetForm(); }}
            className="p-3 bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Main Content */}
          <div className="flex-1 space-y-8">
            
            {/* 1. Customer & Date Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={14}/> Customer Information
                </label>
                <select 
                  className="w-full h-14 px-5 border-2 border-slate-100 rounded-2xl font-bold bg-slate-50 focus:border-blue-600 outline-none transition-all appearance-none" 
                  onChange={(e) => setSelectedCust(customers.find(c => c.id === parseInt(e.target.value)))} 
                  value={selectedCust?.id || ""} 
                  required
                >
                  <option value="" disabled>Choose a customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.customerId} - {c.name}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14}/> Invoice Date
                </label>
                <input 
                  type="date" 
                  className="w-full h-14 px-5 border-2 border-slate-100 rounded-2xl font-bold bg-slate-50 focus:border-blue-600 outline-none transition-all" 
                  value={invoiceDate} 
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <h3 className="text-lg font-black text-slate-800 uppercase italic">Service Items</h3>
                <button 
                  type="button" 
                  onClick={() => setInvoiceItems([...invoiceItems, { description: '', periodStart: '', periodEnd: '', qty: 1, unitPrice: 0, itemDiscount: 0 }])}
                  disabled={!canAddItem()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-sm ${
                    canAddItem() ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Plus size={16}/> ADD NEW LINE
                </button>
              </div>

              <div className="space-y-6">
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-200 transition-all relative group">
                    {/* Remove Button */}
                    {invoiceItems.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeItem(idx)}
                        className="absolute -right-3 -top-3 w-8 h-8 bg-white border-2 border-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-md"
                      >
                        <Trash2 size={14}/>
                      </button>
                    )}

                    <div className="grid grid-cols-12 gap-6">
                      {/* Description */}
                      <div className="col-span-12 md:col-span-6 space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Service Description</span>
                        <input 
                          type="text" 
                          placeholder="e.g. Monthly Internet Subscription" 
                          className="w-full h-12 px-4 border-2 border-slate-50 rounded-xl font-medium bg-slate-50 focus:bg-white focus:border-blue-400 outline-none"
                          value={item.description} 
                          onChange={(e) => { const n = [...invoiceItems]; n[idx].description = e.target.value; setInvoiceItems(n); }} 
                          required
                        />
                      </div>
                      {/* Periods */}
                      <div className="col-span-6 md:col-span-3 space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase ml-1">From</span>
                        <input type="date" className="w-full h-12 px-3 border-2 border-slate-50 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white" value={item.periodStart || ''} onChange={(e) => { const n = [...invoiceItems]; n[idx].periodStart = e.target.value; setInvoiceItems(n); }}/>
                      </div>
                      <div className="col-span-6 md:col-span-3 space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase ml-1">To</span>
                        <input type="date" className="w-full h-12 px-3 border-2 border-slate-50 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white" value={item.periodEnd || ''} onChange={(e) => { const n = [...invoiceItems]; n[idx].periodEnd = e.target.value; setInvoiceItems(n); }}/>
                      </div>

                      {/* Pricing Row */}
                      <div className="col-span-12 grid grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Qty</span>
                          <input type="number" className="w-full h-12 px-4 border-2 border-slate-50 rounded-xl font-black bg-slate-50 focus:bg-white focus:border-blue-400 outline-none" value={item.qty} onChange={(e) => { const n = [...invoiceItems]; n[idx].qty = e.target.value; setInvoiceItems(n); }} required/>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Price (Ks)</span>
                          <input type="number" className="w-full h-12 px-4 border-2 border-slate-50 rounded-xl font-black bg-slate-50 focus:bg-white focus:border-blue-400 outline-none" value={item.unitPrice} onChange={(e) => { const n = [...invoiceItems]; n[idx].unitPrice = e.target.value; setInvoiceItems(n); }} required/>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-orange-400 uppercase ml-1">Item Disc</span>
                          <input type="number" className="w-full h-12 px-4 border-2 border-slate-50 rounded-xl font-black text-orange-600 bg-slate-50 focus:bg-white focus:border-orange-400 outline-none" value={item.itemDiscount} onChange={(e) => { const n = [...invoiceItems]; n[idx].itemDiscount = e.target.value; setInvoiceItems(n); }}/>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-[9px] font-black text-blue-400 uppercase mr-1">Row Total</span>
                          <div className="h-12 flex items-center justify-end text-xl font-black text-blue-600 pr-2">
                            {calculateItemAmount(item).toLocaleString()} <span className="text-[10px] ml-1">Ks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Summary Sidebar */}
          <div className="lg:w-96 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl sticky top-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                <FileText size={14}/> Payment Summary
              </h3>

              <div className="space-y-6">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-sm font-bold uppercase">Sub Total</span>
                  <span className="font-black text-white">{calculateSubTotal().toLocaleString()} Ks</span>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Additional Discount</label>
                  <input 
                    type="number" 
                    className="w-full h-14 px-5 bg-slate-800 border-2 border-slate-700 rounded-2xl font-black text-orange-500 focus:border-orange-500 outline-none transition-all" 
                    value={discountAmount} 
                    onChange={(e) => setDiscountAmount(e.target.value)}
                  />
                </div>

                <div className="pt-6 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                  <div className="text-4xl font-black text-white tracking-tighter">
                    {calculateGrandTotal().toLocaleString()} <span className="text-lg text-blue-500 font-bold">Ks</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Status</label>
                  <div className="flex gap-2">
                    {['UNPAID', 'PAID'].map(s => (
                      <button 
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${
                          status === s ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-900/50 flex items-center justify-center gap-3 mt-4 transition-transform active:scale-95"
                >
                  <Save size={20}/> {editingId ? 'Update Invoice' : 'Issue Invoice'}
                </button>
              </div>
            </div>

            {/* Remark Section */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Remarks</label>
              <textarea 
                className="w-full h-24 p-4 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-400 outline-none transition-all resize-none"
                placeholder="Add notes for this invoice..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          </div>
        </form>
      </div>
    )}
  </div>



  );
};

export default Invoices;