import HouseManagement from './HouseManagement'; // Fixed path based on your VS Code screen
import RoomStatus from './RoomStatus';
import PaymentHistory from './PaymentHistory';
import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, addDoc, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

export default function App() {
  // 1. Updated 'view' state to handle more pages
  const [view, setView] = useState('dashboard'); 
  const [tenants, setTenants] = useState([]);
  const [activeTenant, setActiveTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showReg, setShowReg] = useState(false);
  
  const [loginId, setLoginId] = useState("");
  const [portalUser, setPortalUser] = useState(null);

  const [adminPass, setAdminPass] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleAdminAuth = () => {
    if (adminPass === "1234") {
      setIsAdminLoggedIn(true);
    } else {
      alert("Password Siyo Sahihi! Jaribu tena.");
    }
  };

  const [reg, setReg] = useState({ name: "", loc: "Dar es Salaam", house: "", room: "", rent: 0 });

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
      
      {/* SIDEBAR - Updated with new links */}
      <div className="w-72 bg-[#1e293b] text-slate-300 hidden lg:block shadow-2xl print:hidden">
        <div className="p-6 bg-[#0f172a] flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">B</div>
          <h1 className="text-lg font-bold text-white tracking-widest">BIBIANA RENT</h1>
        </div>
        <nav className="p-4 space-y-2 mt-4">
          <button onClick={() => {setView('dashboard'); setShowReg(false)}} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>📊 Dashboard</button>
  
          <button onClick={() => {setView('add-tenant'); setShowReg(true)}} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'add-tenant' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>➕ Add Tenant</button>
  
           {/* NEW BUTTONS START HERE */}
          <button onClick={() => setView('houses')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'houses' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>🏠 House Management</button>
  
          <button onClick={() => setView('rooms')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'rooms' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>🔑 Room Status</button>
  
          <button onClick={() => setView('payments')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'payments' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>💰 Payment History</button>
  
          <button onClick={() => {setView('portal'); setIsAdminLoggedIn(false)}} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'portal' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>👤 Tenant Portal</button>
  
          <button onClick={() => setView('settings')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>⚙️ Admin Settings</button>
        </nav>
      </div>

      <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* VIEW 1: ADMIN PROTECTION */}
        {(view !== 'portal' && !isAdminLoggedIn) ? (
            <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl shadow-xl border text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-xl font-black mb-2 uppercase">Admin Access</h2>
              <p className="text-slate-400 text-sm mb-6">Ingiza password kuendelea</p>
              <input type="password" border className="w-full p-4 bg-slate-100 rounded-2xl mb-4 text-center text-2xl tracking-[10px]" placeholder="****" onChange={(e) => setAdminPass(e.target.value)} />
              <button onClick={handleAdminAuth} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-lg">INGIA ADMIN</button>
            </div>
        ) : (
          /* MAIN CONTENT AREA - Switching based on "view" state */
          <>
            {view === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  <Tile bg="bg-blue-500" icon="🏢" label="Total Houses" val={tenants.length} />
                  <Tile bg="bg-emerald-500" icon="👥" label="Active Tenants" val={tenants.length} />
                  <Tile bg="bg-amber-500" icon="💵" label="Payments Made" val={payments.length} />
                  <Tile bg="bg-slate-700" icon="💼" label="Rent Collected" val={totalCollected.toLocaleString()} prefix="TZS " />
                </div>
                {/* Master Tenant Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-6 border-b flex justify-between items-center">
                     <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Master Tenant Registry</h4>
                     <button onClick={() => setIsAdminLoggedIn(false)} className="text-xs font-bold text-rose-500">Log Out</button>
                   </div>
                   {/* ... (Table code remains same as your original) ... */}
                </div>
              </>
            )}

            {view === 'add-tenant' && (
              <div className="bg-white p-8 rounded-2xl shadow-xl border animate-in fade-in duration-300">
                <h3 className="text-sm font-black text-blue-600 uppercase mb-6">Add New Tenant</h3>
                {/* ... (Your existing Registration Form) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input label="Tenant Name" onChange={v => setReg({...reg, name: v})} />
                   <Input label="Monthly Rent" type="number" onChange={v => setReg({...reg, rent: v})} />
                   <button onClick={async () => {
                      const tid = Math.floor(1000 + Math.random() * 9000).toString();
                      await addDoc(collection(db, "tenants"), { ...reg, tenantId: tid, monthlyRent: Number(reg.rent), status: "On" });
                      setView('dashboard');
                   }} className="bg-blue-600 text-white p-4 rounded-xl font-bold">Save Tenant</button>
                </div>
              </div>
            )}

            {view === 'houses' && <HouseManagement />}
            {view === 'rooms' && <RoomStatus />}
            {view === 'payments' && <PaymentHistory />}
            {view === 'settings' && (
              <div className="p-10 bg-white rounded-2xl border">
                <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
                <p>Hapa unaweza kubadilisha password yako ya "1234".</p>
                <button className="mt-4 bg-slate-800 text-white px-6 py-2 rounded-lg">Update Password</button>
              </div>
            )}
          </>
        )}

        {view === 'portal' && <Portal loginId={loginId} setLoginId={setLoginId} portalUser={portalUser} setPortalUser={setPortalUser} tenants={tenants} getProgress={getProgress} />}
      </div>
    </div>
  );
}

// Tile and Input functions remain the same as your original code...