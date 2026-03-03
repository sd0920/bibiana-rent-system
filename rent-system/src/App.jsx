import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, addDoc, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [view, setView] = useState('admin'); 
  const [tenants, setTenants] = useState([]);
  const [activeTenant, setActiveTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showReg, setShowReg] = useState(false);
  
  const [loginId, setLoginId] = useState("");
  const [portalUser, setPortalUser] = useState(null);

  // --- SEHEMU YA ULINZI (ADMIN SECURITY) ---
  const [adminPass, setAdminPass] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleAdminAuth = () => {
    if (adminPass === "1234") { // BADILISHA HAPA KUWEKA PASSWORD UNAYOTAKA
      setIsAdminLoggedIn(true);
    } else {
      alert("Password Siyo Sahihi! Jaribu tena.");
    }
  };
  // ------------------------------------------

  // Form States
  const [reg, setReg] = useState({ name: "", loc: "Dar es Salaam", house: "", room: "", rent: 0 });
  const [payAmt, setPayAmt] = useState("");

  useEffect(() => {
    onSnapshot(collection(db, "tenants"), (s) => {
      setTenants(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    onSnapshot(query(collection(db, "payments"), orderBy("date", "desc")), (s) => 
      setPayments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const totalCollected = payments.reduce((s, p) => s + Number(p.amount), 0);
  
  const getProgress = (t) => {
    const paid = payments.filter(p => p.tenantId === t.id).reduce((s, p) => s + Number(p.amount), 0);
    const percent = (paid / Number(t.monthlyRent)) * 100;
    return Math.min(percent, 100).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 font-sans">
      
      {/* SIDEBAR */}
      <div className="w-72 bg-[#1e293b] text-slate-300 hidden lg:block shadow-2xl print:hidden">
        <div className="p-6 bg-[#0f172a] flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">B</div>
          <h1 className="text-lg font-bold text-white tracking-widest">BIBIANA RENT</h1>
        </div>
        <nav className="p-4 space-y-2 mt-4">
          <button onClick={() => {setView('admin'); setShowReg(false)}} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'admin' && !showReg ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>📊 Dashboard</button>
          <button onClick={() => {setView('admin'); setShowReg(true)}} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${showReg ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>➕ Add Tenant</button>
          <button onClick={() => {setView('portal'); setIsAdminLoggedIn(false)}} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'portal' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>👤 Tenant Portal</button>
        </nav>
      </div>

      <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* VIEW 1: ADMIN - LOCK SCREEN OR DASHBOARD */}
        {view === 'admin' && (
          !isAdminLoggedIn ? (
            /* LOCK SCREEN */
            <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl shadow-xl border text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-xl font-black mb-2 uppercase">Admin Access</h2>
              <p className="text-slate-400 text-sm mb-6">Ingiza password kuona ripoti za fedha</p>
              <input 
                type="password" 
                className="w-full p-4 bg-slate-100 rounded-2xl mb-4 text-center text-2xl tracking-[10px]" 
                placeholder="****"
                onChange={(e) => setAdminPass(e.target.value)}
              />
              <button onClick={handleAdminAuth} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-lg">INGIA ADMIN</button>
            </div>
          ) : (
            /* REAL ADMIN CONTENT */
            <>
              {!showReg && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  <Tile bg="bg-blue-500" icon="🏢" label="Total Houses" val={tenants.length} />
                  <Tile bg="bg-emerald-500" icon="👥" label="Active Tenants" val={tenants.length} />
                  <Tile bg="bg-amber-500" icon="💵" label="Payments Made" val={payments.length} />
                  <Tile bg="bg-rose-500" icon="📊" label="Invoices" val={tenants.length} />
                  <Tile bg="bg-slate-700" icon="💼" label="Rent Collected" val={totalCollected.toLocaleString()} prefix="TZS " />
                  <Tile bg="bg-orange-500" icon="❓" label="Warnings" val="0" />
                  <Tile bg="bg-teal-500" icon="🏠" label="Vacant" val="5" />
                  <Tile bg="bg-indigo-600" icon="📅" label="Month" val="March" />
                </div>
              )}

              {showReg && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mb-10 animate-in fade-in zoom-in duration-300">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6">Register New Property & Tenant</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input label="Tenant Name" onChange={v => setReg({...reg, name: v})} />
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
                      <select className="w-full p-3 bg-slate-50 border rounded-xl" onChange={e => setReg({...reg, loc: e.target.value})}>
                        <option>Dar es Salaam</option><option>Arusha</option><option>Mwanza</option>
                      </select>
                    </div>
                    <Input label="House No" onChange={v => setReg({...reg, house: v})} />
                    <Input label="Room No" onChange={v => setReg({...reg, room: v})} />
                    <div className="md:col-span-3">
                      <Input label="Monthly Rent (TZS)" type="number" onChange={v => setReg({...reg, rent: v})} />
                    </div>
                    <div className="flex items-end">
                      <button onClick={async () => {
                        const tid = Math.floor(1000 + Math.random() * 9000).toString();
                        await addDoc(collection(db, "tenants"), { ...reg, tenantId: tid, monthlyRent: Number(reg.rent), status: "On" });
                        setShowReg(false);
                      }} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700">SAVE TENANT</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Master Tenant Registry</h4>
                  <button onClick={() => setIsAdminLoggedIn(false)} className="text-[10px] font-bold text-rose-500 border border-rose-200 px-3 py-1 rounded-md hover:bg-rose-50">Log Out Admin</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b">
                      <tr>
                        <th className="p-4">S/N</th>
                        <th className="p-4">Full Name & ID</th>
                        <th className="p-4">Location / Unit</th>
                        <th className="p-4 w-48">Payment Progress</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tenants.map((t, i) => (
                        <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="p-4 text-xs font-bold text-slate-400">#0{i + 1}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                            <p className="text-[10px] font-mono text-blue-500 font-bold">ID: {t.tenantId}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-xs font-bold text-slate-600">{t.loc}</p>
                            <p className="text-[10px] text-slate-400 uppercase">Hse: {t.house} | Rm: {t.room}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${getProgress(t)}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-slate-500">{getProgress(t)}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">On</span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => setActiveTenant(t)} className="bg-white border px-3 py-1 rounded-md text-[10px] font-bold shadow-sm">Manage</button>
                               <button onClick={() => deleteDoc(doc(db, "tenants", t.id))} className="text-rose-500 font-bold text-[10px]">Free</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        )}
        
        {/* VIEW 2: TENANT PORTAL */}
        {view === 'portal' && <Portal loginId={loginId} setLoginId={setLoginId} portalUser={portalUser} setPortalUser={setPortalUser} tenants={tenants} getProgress={getProgress} />}
      </div>
    </div>
  );
}

// STYLED COMPONENTS (Keep existing)
function Tile({bg, icon, label, val, prefix=""}) {
  return (
    <div className={`${bg} p-5 rounded-xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden h-28`}>
      <div className="z-10"><p className="text-2xl font-black leading-none">{prefix}{val}</p><p className="text-[10px] font-bold opacity-80 uppercase mt-1">{label}</p></div>
      <div className="absolute right-[-5px] bottom-[-5px] text-5xl opacity-20">{icon}</div>
    </div>
  );
}

function Input({label, onChange, type="text"}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase">{label}</label>
      <input type={type} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20" onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function Portal({loginId, setLoginId, portalUser, setPortalUser, tenants, getProgress}) {
    const handleLogin = () => {
        const found = tenants.find(t => t.tenantId === loginId);
        if (found) setPortalUser(found); else alert("ID haipo! Angalia namba yako vizuri.");
    };
    return (
        <div className="max-w-md mx-auto mt-20">
            {!portalUser ? (
                <div className="bg-white p-10 rounded-3xl shadow-2xl text-center border">
                    <h2 className="text-2xl font-black mb-8 uppercase italic">Tenant Portal</h2>
                    <input className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-center text-2xl font-black mb-6" placeholder="ENTER ID" onChange={e => setLoginId(e.target.value)} />
                    <button onClick={handleLogin} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl">ACCESS MY DATA</button>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-blue-600">
                    <div className="flex justify-between items-start mb-6">
                        <div><h3 className="text-2xl font-black uppercase leading-none">{portalUser.name}</h3><p className="text-xs font-bold text-slate-400 mt-2">UNIT {portalUser.house} | ROOM {portalUser.room}</p></div>
                        <button onClick={() => setPortalUser(null)} className="text-[10px] font-bold border-b text-rose-500">Log Out</button>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border mb-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Payment Progress</p>
                        <div className="h-3 bg-white border rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-blue-600" style={{width: `${getProgress(portalUser)}%`}}></div>
                        </div>
                        <p className="text-right text-xs font-black text-blue-600">{getProgress(portalUser)}% Paid</p>
                    </div>
                    <button className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold">REPORT AN ISSUE</button>
                </div>
            )}
        </div>
    );
}