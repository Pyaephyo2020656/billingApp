import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Search, FileText, Trash2, Edit3, X, Calendar, Tag, Save, Printer } from 'lucide-react';
import Voucher from '../components/Voucher';

const Invoices = () => {
  // ၁။ States သတ်မှတ်ခြင်း
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedPrintInv, setSelectedPrintInv] = useState(null);

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
      if (res.data) {
        setInvoices(Array.isArray(res.data) ? res.data : [res.data]);
      } else {
        setInvoices([]);
      }
    } catch (err) { 
      console.error("Fetch Error:", err);
      setInvoices([]); 
    }
  };

  // ၃။ CRUD Operations
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await API.delete(`/invoices/${id}`);
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

  // Item ပြောင်းလဲမှုများကို Handle လုပ်ခြင်း (ရိုက်လို့ရအောင် ဤနေရာတွင် ပြင်ထားသည်)
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInvoiceItems(updatedItems);
  };

  const removeItem = (index) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const canAddItem = () => {
    const lastItem = invoiceItems[invoiceItems.length - 1];
    return lastItem.description.trim() !== "" && lastItem.unitPrice > 0;
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
        await API.put(`/invoices/${editingId}`, payload);
      } else {
        await API.post('/invoices', payload);
      }
      setShowForm(false);
      resetForm();
      fetchInvoices();
    } catch (err) { alert("Error saving invoice"); }
  };

  return (
    <div className="p-4 text-left font-sans bg-slate-50 min-h-screen">
      {!showForm ? (
        /* --- LIST VIEW --- */
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Invoices</h1>
            <div className="flex gap-3">
              <input type="text" placeholder="Search..." className="px-4 py-2 border rounded-xl outline-none focus:border-blue-600" onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchInvoices()}/>
              <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-xs shadow-lg">CREATE NEW</button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-black">
              <tr>
                <th className="px-6 py-4 text-left">Inv No.</th>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.invoiceId} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-black text-blue-600">{inv.invoiceNo}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{inv.customer?.name}</td>
                  <td className="px-6 py-4 font-black text-right">{inv.totalAmount?.toLocaleString()} Ks</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{inv.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(inv)} className="p-2 text-slate-400 hover:text-amber-500"><Edit3 size={18}/></button>
                      <button onClick={() => handleDelete(inv.invoiceId)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                      <button onClick={() => setSelectedPrintInv(inv)} className="p-2 text-slate-400 hover:text-blue-600"><Printer size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* --- CREATE / EDIT FORM --- */
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{editingId ? 'Edit Invoice' : 'New Invoice'}</h2>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="p-3 bg-white border border-slate-200 rounded-2xl"><X size={24}/></button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-blue-600 uppercase">Customer</label>
                  <select className="w-full h-14 px-5 border-2 border-slate-100 rounded-2xl font-bold bg-slate-50 focus:border-blue-600 outline-none" onChange={(e) => setSelectedCust(customers.find(c => c.id === parseInt(e.target.value)))} value={selectedCust?.id || ""} required>
                    <option value="" disabled>Choose a customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.customerId} - {c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase">Invoice Date</label>
                  <input type="date" className="w-full h-14 px-5 border-2 border-slate-100 rounded-2xl font-bold bg-slate-50 focus:border-blue-600 outline-none" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}/>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                  <h3 className="text-lg font-black text-slate-800 uppercase italic">Service Items</h3>
                  <button type="button" onClick={() => setInvoiceItems([...invoiceItems, { description: '', periodStart: '', periodEnd: '', qty: 1, unitPrice: 0, itemDiscount: 0 }])} disabled={!canAddItem()} className={`px-6 py-3 rounded-2xl font-black text-xs ${canAddItem() ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>+ ADD LINE</button>
                </div>

                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-200 relative group">
                    {invoiceItems.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="absolute -right-3 -top-3 w-8 h-8 bg-white border-2 border-red-100 text-red-500 rounded-full flex items-center justify-center shadow-md"><Trash2 size={14}/></button>
                    )}
                    <div className="grid grid-cols-12 gap-6">
                      <div className="col-span-12 md:col-span-6 space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Description</span>
                        <input type="text" className="w-full h-12 px-4 border-2 border-slate-50 rounded-xl font-medium bg-slate-50 focus:bg-white focus:border-blue-400 outline-none" value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} required/>
                      </div>
                      <div className="col-span-6 md:col-span-3 space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">From</span>
                        <input type="date" className="w-full h-12 px-3 border-2 border-slate-50 rounded-xl text-xs font-bold bg-slate-50" value={item.periodStart || ''} onChange={(e) => handleItemChange(idx, 'periodStart', e.target.value)}/>
                      </div>
                      <div className="col-span-6 md:col-span-3 space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">To</span>
                        <input type="date" className="w-full h-12 px-3 border-2 border-slate-50 rounded-xl text-xs font-bold bg-slate-50" value={item.periodEnd || ''} onChange={(e) => handleItemChange(idx, 'periodEnd', e.target.value)}/>
                      </div>
                      {/* <div className="col-span-12 grid grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                        <input type="number" className="h-12 px-4 border-2 border-slate-50 rounded-xl font-black bg-slate-50 focus:bg-white" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(idx, 'qty', e.target.value)} required/>
                        <input type="number" className="h-12 px-4 border-2 border-slate-50 rounded-xl font-black bg-slate-50 focus:bg-white" placeholder="Price" value={item.unitPrice} onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)} required/>
                        <input type="number" className="h-12 px-4 border-2 border-slate-50 rounded-xl font-black text-orange-600 bg-slate-50 focus:bg-white" placeholder="Item Disc" value={item.itemDiscount} onChange={(e) => handleItemChange(idx, 'itemDiscount', e.target.value)}/>
                        <div className="h-12 flex items-center justify-end text-xl font-black text-blue-600 pr-2">{calculateItemAmount(item).toLocaleString()} Ks</div>
                      </div> */}

                        <div className="col-span-12 grid grid-cols-4 gap-4 pt-4 border-t border-slate-50">
  {/* Qty Input */}
  <input 
    type="text" 
    inputMode="decimal"
    className="h-12 px-4 border-2 border-slate-50 rounded-xl font-black bg-slate-50 focus:bg-white outline-none" 
    placeholder="Qty" 
    value={item.qty} 
    onChange={(e) => {
      const val = e.target.value.replace(/[^0-9.]/g, ''); // ဂဏန်းနှင့် decimal point သာ ခွင့်ပြုခြင်း
      handleItemChange(idx, 'qty', val);
    }} 
    required
  />

  {/* Price Input */}
  <input 
    type="text" 
    inputMode="decimal"
    className="h-12 px-4 border-2 border-slate-50 rounded-xl font-black bg-slate-50 focus:bg-white outline-none" 
    placeholder="Price" 
    value={item.unitPrice} 
    onChange={(e) => {
      const val = e.target.value.replace(/[^0-9.]/g, '');
      handleItemChange(idx, 'unitPrice', val);
    }} 
    required
  />

  {/* Item Discount Input */}
  <input 
    type="text" 
    inputMode="decimal"
    className="h-12 px-4 border-2 border-slate-50 rounded-xl font-black text-orange-600 bg-slate-50 focus:bg-white outline-none" 
    placeholder="Item Disc" 
    value={item.itemDiscount} 
    onChange={(e) => {
      const val = e.target.value.replace(/[^0-9.]/g, '');
      handleItemChange(idx, 'itemDiscount', val);
    }}
  />

  {/* Row Total Display */}
  <div className="h-12 flex items-center justify-end text-xl font-black text-blue-600 pr-2">
    {calculateItemAmount(item).toLocaleString()} Ks
  </div>
</div>


                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-96 space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-6">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-8">Payment Summary</h3>
                <div className="space-y-6">
                  <div className="flex justify-between text-slate-400"><span>Sub Total</span><span className="text-white font-black">{calculateSubTotal().toLocaleString()} Ks</span></div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-orange-400 uppercase">Additional Discount</label>
                    <input type="number" className="w-full h-14 px-5 bg-slate-800 border-2 border-slate-700 rounded-2xl font-black text-orange-500 outline-none" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)}/>
                  </div>
                  <div className="pt-6 border-t border-slate-800">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Grand Total</span>
                    <div className="text-4xl font-black text-white">{calculateGrandTotal().toLocaleString()} Ks</div>
                  </div>
                  <div className="flex gap-2">
                    {['UNPAID', 'PAID'].map(s => (
                      <button key={s} type="button" onClick={() => setStatus(s)} className={`flex-1 py-3 rounded-xl text-[10px] font-black ${status === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"}`}>{s}</button>
                    ))}
                  </div>
                  <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase shadow-2xl">SAVE INVOICE</button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase">Remarks</label>
                <textarea className="w-full h-24 p-4 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm focus:border-blue-400 outline-none resize-none" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Add discount remark here..."/>
              </div>
            </div>
          </form>
        </div>
      )}

      {selectedPrintInv && <Voucher data={selectedPrintInv} onClose={() => setSelectedPrintInv(null)} />}
    </div>
  );
};

export default Invoices;