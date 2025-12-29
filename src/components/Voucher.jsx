import React from 'react';

const Voucher = ({ data, onClose }) => {
  if (!data) return null;

  // Date format ကို ခုနှစ်ပါအောင် ပြုပြင်ခြင်း
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY format ထွက်လာပါမည်
  };

  return (
    <div className="fixed inset-0 bg-slate-500/50 z-[999] overflow-y-auto p-2 font-sans text-slate-900 print:p-0 print:bg-white">
      {/* Action Buttons */}
      <div className="max-w-[148mm] mx-auto mb-4 flex justify-between items-center print:hidden">
        <button onClick={onClose} className="px-4 py-2 bg-white rounded-lg font-bold shadow hover:bg-slate-50 transition-all">← Back</button>
        <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-black shadow flex items-center gap-2 hover:bg-blue-700 transition-all">
          PRINT A5 VOUCHER
        </button>
      </div>

      {/* A5 Voucher Sheet */}
      <div className="print-container max-w-[148mm] mx-auto bg-white p-6 shadow-2xl border print:shadow-none print:border-none print:w-[148mm] print:h-[210mm] print:m-0">
        
        {/* Header Section */}
     
            <div className="flex justify-between items-start border-b-2 border-blue-600 pb-3 mb-4">
  <div className="flex flex-col items-center -mt-4"> {/* -mt-4 က Logo ကို အပေါ်သို့ တိုးပေးပါသည် */}
    <img 
      src="/Logo.png" 
      alt="Logo" 
      className="w-28 h-28 object-contain" // w-20 မှ w-28 သို့ တိုးမြှင့်ပြီး Logo ကို ကြီးစေပါသည်
      onError={(e) => { e.target.src = "https://via.placeholder.com/120?text=TJD+LOGO"; }}
    />
    
    {/* Logo အောက်က ကုမ္ပဏီနာမည် */}
    <div className="text-center -mt-2"> {/* -mt-2 က စာသားနှင့် Logo ကြား အကွာအဝေးကို ကျုံ့ပေးပါသည် */}
      <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter leading-none">
        Tachileik Jade Dragon Company Limited
      </p>
      <p className="text-[7px] font-bold text-slate-500 uppercase mt-1 italic tracking-[0.2em]">
        စိတ်ချ ယုံကြည်၊ အင်တာနက် ဆို TJD
      </p>
    </div>
  </div>

  {/* ညာဘက်ခြမ်းက လိပ်စာနှင့် ဖုန်းနံပါတ် */}
  <div className="text-right text-[8px] font-bold text-slate-600 uppercase pt-2 space-y-1"> 
  {/* space-y-1 က စာကြောင်းတစ်ခုချင်းစီကြားကို အချိုးကျ ခြားပေးပါသည် */}
  <p className="leading-normal">ဝလ (၄၃၉)၊ ဆေခမ်းရပ်ကွက်၊ ဟောင်လိတ်၊ တာချီလိတ်မြို့။</p>
  <p className="leading-normal">Ph: 09-677771020, 09-677774441</p>
  <p className="leading-normal">VIBER: 09-677771020 | LINE: @TJDNET</p>
</div>
</div>

        {/* Info Section: Customer & Invoice Meta */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
          {/* Customer Side */}
          <div className="space-y-1 border-l-2 border-blue-500 pl-3">
             <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Customer Information</p>
             {/* <p className="font-bold text-slate-500 leading-none">ID: {data.customer?.customerId}</p> */}
             <h2 className="text-sm font-black text-slate-800 uppercase leading-tight">{data.customer?.customerId}</h2>
             <p className="font-bold text-slate-500 leading-none"> {data.customer?.name}</p>
             
             {/* Phone, Address, GPS aligned under Name & ID */}
             <div className="pt-1 space-y-0.5 text-slate-600 font-bold">
                <p>Phone: {data.customer?.primaryPhone} {data.customer?.secondaryPhone && `/ ${data.customer?.secondaryPhone}`}</p>
                <p>Address: {data.customer?.address} ({data.customer?.quarter?.qtrName})</p>
                <p>GPS: {data.customer?.gpsCoords}</p>
             </div>
          </div>

          {/* Invoice Meta Side */}
          <div className="text-right flex flex-col justify-between">
             <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 inline-block self-end min-w-[130px]">
                <p className="text-[8px] font-black text-slate-400 uppercase">Inv No: <span className="text-slate-900 ml-1 font-black">{data.invoiceNo}</span></p>
                <p className="text-[8px] font-black text-slate-400 uppercase">installation Date: <span className="text-slate-900 ml-1 font-black">{formatDate(data.invoiceDate)}</span></p>
             </div>
             <div className="text-slate-600 font-bold uppercase text-[9px] pr-1">
                <p>Package: <span className="text-blue-600 font-black">{data.customer?.packagePlan?.planName} ({data.customer?.packagePlan?.bandwidth})</span></p>
                {/* <p>ONU SN: <span className="text-slate-900">{data.customer?.onuSerial}</span> | 
                DNSN: <span className="text-slate-900">{data.customer?.dnsn}</span></p> */}
                <p>DNSN: <span className="text-slate-900">{data.customer?.dnsn}</span></p>
             </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-4">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50">
                <th className="px-2 py-2 font-black text-slate-500 uppercase text-left">Description</th>
                <th className="px-2 py-2 font-black text-slate-500 uppercase text-center">Period</th>
                <th className="px-2 py-2 font-black text-slate-500 uppercase text-center">Qty</th>
                <th className="px-2 py-2 font-black text-slate-500 uppercase text-right">Price</th>
                <th className="px-2 py-2 font-black text-slate-500 uppercase text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items?.map((item, idx) => (
                <tr key={idx} className="font-bold">
                  <td className="px-2 py-2 text-slate-800 uppercase text-[9px]">{item.description}</td>
                  <td className="px-2 py-2 text-slate-500 text-center text-[8px]">
                    {item.periodStart ? `${formatDate(item.periodStart)} To ${formatDate(item.periodEnd)}` : '-'}
                  </td>
                  <td className="px-2 py-2 text-slate-800 text-center">{item.qty}</td>
                  <td className="px-2 py-2 text-slate-800 text-right">{item.unitPrice?.toLocaleString()}</td>
                  <td className="px-2 py-2 font-black text-slate-900 text-right">{item.amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="border-t pt-3 space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 px-1">
            <span>Sub Total:</span>
            <span>{data.subTotal?.toLocaleString()} Ks</span>
          </div>
          {data.discountAmount > 0 && (
            <div className="flex justify-between text-[10px] font-bold text-orange-600 px-1 italic">
              <span>Extra Discount {data.remark && `(${data.remark})`}:</span>
              <span>- {data.discountAmount?.toLocaleString()} Ks</span>
            </div>
          )}
          <div className="flex justify-between items-center bg-blue-400 p-3 rounded-xl text-white shadow-lg print:shadow-none">
            <span className="text-[9px] font-black uppercase tracking-widest">Net Total Payable</span>
            <span className="text-2xl font-black">{data.totalAmount?.toLocaleString()} <span className="text-[10px]">Bahts</span></span>
          </div>
        </div>

        {/* Important Notice Box */}
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
           <p className="text-[9px] font-bold text-red-700 leading-relaxed tracking-tight">
              TJD NET အင်တာနက် ဝန်‌ဆောင်မှု အသုံးပြုနေသော customer သို့ ပန်ကြားချက်။ ဝန်ဆောင်မှုသက်တမ်းရက် မကုန်ဆုံးမှီ ဘေလ်ပေးဆောင်ရပါမည်၊ ဘေလ်ပေးဆောင်ရန် ၂၄ နာရီ ထက် ကျော်လွန်သွားပါက အလိုအလျောက် အင်တာနက်လိုင်း ပြတ်တောက်နိုင်ပါကြောင်း ကြိုတင်အသိပေးအပ်ပါသည်။
           </p>
        </div>

        {/* Footer & Signature */}
        <div className="mt-8 flex justify-between items-end">
           <div className="text-[7px] font-black text-slate-300 uppercase tracking-widest">
              စိတ်ချ ယုံကြည်၊ အင်တာနက် ဆို TJD
           </div>
           <div className="w-32 text-center border-t border-slate-300 pt-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">customer Signature</p>
           </div>
        </div>
      </div>

     <style dangerouslySetInnerHTML={{ __html: `
  @media print {
    /* ၁။ Browser ကို A5 size အား ကိန်းဂဏန်းဖြင့် အသေသတ်မှတ်ခြင်း */
    @page {
      size: 148mm 210mm; 
      margin: 0;
    }

    /* ၂။ Page အပြင်ဘက်က background တွေကို ဖျောက်ပြီး စာရွက်ဆိုဒ်ကို အသေသတ်မှတ်ခြင်း */
    html, body {
      width: 148mm;
      height: 210mm;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden;
      background-color: white;
    }

    /* ၃။ Voucher Container ကို စာရွက်အပြည့်ဖြစ်အောင် Force လုပ်ခြင်း */
    .print-container {
      width: 148mm !important;
      height: 210mm !important;
      margin: 0 !important;
      padding: 10mm !important; /* အတွင်းသား margin သာ ထားရှိခြင်း */
      position: absolute;
      top: 0;
      left: 0;
      border: none !important;
      box-shadow: none !important;
      display: block !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Print ထုတ်ရင် မပါစေချင်တဲ့ ခလုတ်များကို ဖျောက်ရန် */
    .print\\:hidden {
      display: none !important;
    }
  }
`}} />
    </div>
  );
};

export default Voucher;