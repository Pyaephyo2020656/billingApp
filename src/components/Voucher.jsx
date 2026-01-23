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
  {/* ဒီနေရာမှာ items-center ကို items-start ပြောင်းလိုက်ရင် Logo ဘယ်ဘက် ကပ်သွားပါပြီ */}
  <div className="flex flex-col items-start -mt-2 ml-2"> 
    <img 
      src="/Logo.png" 
      alt="Logo" 
      className="w-32 h-auto object-contain -mr-8" 
      onError={(e) => { e.target.src = "https://via.placeholder.com/120?text=TJD+LOGO"; }}
    />
    
   
    <div className="text-center -mt-0">
      <p className="text-[10px] font-black text-black-500 uppercase tracking-tighter leading-none">
        Tachileik Jade Dragon Company Limited
      </p>
    </div>
  </div>

  <div className="text-right text-[8px] font-bold text-slate-600 uppercase pt-2 space-y-1"> 
    
    <p className="leading-normal">ဝလ (၄၃၉)၊ ဝမ်လုံ၊ ဆေခမ်းရပ်ကွက်၊ ဟောင်လိတ်၊ တာချီလိတ်မြို့။</p>
    <p className="leading-normal">Ph: 09-677771020, 09-677774441, 09-677774449</p>
    <p className="leading-normal text-slate-600"> စိတ်ချ ယုံကြည်၊ အင်တာနက် ဆို TJD</p>
  </div>
</div>

        {/* Info Section: Customer & Invoice Meta */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
          {/* Customer Side */}
          <div className="space-y-1 border-l-2 border-blue-500 pl-3">
             <p className="text-[8px] font-black text-black-600 uppercase tracking-widest">Customer Information</p>
             {/* <p className="font-bold text-slate-500 leading-none">ID: {data.customer?.customerId}</p> */}
             <h2 className="text-sm font-black text-slate-800 uppercase leading-tight">ID {data.customer?.customerId} </h2>
             <p className="font-bold text-black-800 leading-none"> {data.customer?.name}</p>
             
             {/* Phone, Address, GPS aligned under Name & ID */}
             <div className="pt-1 space-y-0.5 text-slate-600 font-bold">
                <p>Phone: {data.customer?.primaryPhone} {data.customer?.secondaryPhone && `/ ${data.customer?.secondaryPhone}`}</p>
                <p>Address: {data.customer?.address} </p>
                <p>Qtr:  {data.customer?.quarter?.qtrName}</p>
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
                <p>Package: <span className="text-slate-900 ml-1 font-black">{data.customer?.packagePlan?.planName} ({data.customer?.packagePlan?.bandwidth})</span></p>
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
                  {/* <td className="px-2 py-2 text-red-500 text-center text-[8px]">
                    {item.periodStart ? `${formatDate(item.periodStart)} To ${formatDate(item.periodEnd)}` : '-'}
                  </td> */}

                   {/* <td className="px-2 py-2 text-red-500 text-center text-[8px]">
                    <span></span>
                    {item.periodStart ? `${formatDate(item.periodStart)} To ${formatDate(item.periodEnd)}` : '-'}
                  </td> */}
                    <td className="px-2 py-2 text-center text-[8px]">
                      {item.periodStart ? (
                        <div className="flex items-center justify-center gap-1 font-bold">
                        
                          <span className="text-slate-900">{formatDate(item.periodStart)}</span>
                          
                         
                          <span className="text-slate-400 font-normal">To</span>
                          
                          
                          <span className="text-red-500">{formatDate(item.periodEnd)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
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
          {/* Sub Total */}
          <div className="flex justify-between text-[10px] font-bold text-slate-500 px-1">
            <span>Sub Total:</span>
            <span>{Number(data.subTotal || 0).toLocaleString()} Baht</span>
          </div>

          {/* Extra Discount (အမြဲပြမည် - မရှိလျှင် 0) */}
          <div className="flex justify-between text-[10px] font-bold text-orange-600 px-1 italic">
            <span> Discount: {data.remark && `(${data.remark})`}:</span>
            <span>- {Number(data.discountAmount || 0).toLocaleString()} Baht</span>
          </div>

          {/* Total Amount Card */}
          <div className="flex justify-between items-center bg-green-400 p-3 rounded-xl text-green-900 shadow-lg print:shadow-none">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest">Total Cash Received:</span>
              <span className="text-[7px] font-bold opacity-70">(CT 15% Included)</span>
            </div>
            <span className="text-2xl font-black">
              {Number(data.totalAmount || 0).toLocaleString()} <span className="text-[10px]">Bahts</span>
            </span>
          </div>
        </div>

        {/* Important Notice Box */}
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
          
           <p className="text-[9px] font-bold text-red-700 leading-relaxed tracking-tight">
              TJD NET အင်တာနက် ဝန်‌ဆောင်မှု အသုံးပြုနေသော customer သို့ ပန်ကြားချက်။ 
           </p>
            <p className="text-[9px] font-bold text-red-700 leading-relaxed tracking-tight">
              ဝန်ဆောင်မှုသက်တမ်းရက် မကုန်ဆုံးမှီ ဘေလ်ပေးဆောင်ရပါမည်၊ ဘေလ်ပေးဆောင်ရန် ၂၄ နာရီ ထက် ကျော်လွန်သွားပါက အလိုအလျောက် အင်တာနက်လိုင်း ပြတ်တောက်နိုင်ပါကြောင်း ကြိုတင်အသိပေးအပ်ပါသည်။
           </p>
        </div>

        {/* Footer & Signature */}
        <div className="mt-8 flex justify-between items-end">
          
           <div className="w-32 text-center border-t border-slate-300 pt-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Collector Signature</p>
           </div>
           <div className="w-32 text-center border-t border-slate-300 pt-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">customer Signature</p>
           </div>
        </div>
      </div>

     <style dangerouslySetInnerHTML={{ __html: `
  @media print {
    
    @page {
      size: 148mm 210mm; 
      margin: 0;
    }

   
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