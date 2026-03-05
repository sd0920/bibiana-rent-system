import { FaWhatsapp, FaFacebook, FaYoutube, FaTiktok, FaInstagram, FaTwitter } from 'react-icons/fa';
import HouseManagement from './HouseManagement';
import RoomStatus from './RoomStatus';
import PaymentHistory from './PaymentHistory';
import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, addDoc, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [view, setView] = useState('home'); 
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
    <div className="min-h-screen flex flex-col font-sans bg-[#f8fafc]">
      
      {/* --- HEADER --- */}
      <header className="bg-[#0f172a] text-white p-5 shadow-lg flex justify-between items-center px-10 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">B</div>
          <h1 className="text-xl font-black tracking-tighter uppercase">BIBIANA HOUSE RENT</h1>
        </div>
        <button onClick={() => setView('home')} className="text-sm font-bold opacity-70 hover:opacity-100 border border-white/20 px-4 py-1 rounded-full transition-all">HOME</button>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR: Visible in all views except 'home' */}
        {view !== 'home' && (
          <div className="w-72 bg-[#1e293b] text-slate-300 hidden lg:block shadow-2xl overflow-y-auto">
            <nav className="p-4 space-y-2 mt-4">
              <button onClick={() => {setView('dashboard'); setShowReg(false)}} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>📊 Dashboard</button>
              <button onClick={() => {setView('add-tenant'); setShowReg(true)}} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'add-tenant' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>➕ Add Tenant</button>
              <button onClick={() => setView('houses')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'houses' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>🏠 House Management</button>
              <button onClick={() => setView('rooms')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'rooms' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>🔑 Room Status</button>
              <button onClick={() => setView('payments')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'payments' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>💰 Payment History</button>
              <button onClick={() => {setView('portal'); setIsAdminLoggedIn(false)}} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'portal' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>👤 Tenant Portal</button>
              <button onClick={() => setView('settings')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>⚙️ Admin Settings</button>
            </nav>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
          {view === 'home' ? (
            /* --- LANDING PAGE --- */
            <div className="h-full bg-black relative flex items-center justify-center text-center">
              <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1568605114967-8130f3a36994')] bg-cover bg-center"></div>
              <div className="relative z-10 p-10">
                <h2 className="text-5xl font-black text-white mb-4">Welcome to Bibiana House</h2>
                <p className="text-slate-300 mb-10 text-lg max-w-lg mx-auto">Modern management for modern living. Track your payments and status in real-time.</p>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => setView('dashboard')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all">ADMIN LOGIN</button>
                  <button onClick={() => setView('portal')} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-slate-100 transition-all">TENANT PORTAL</button>
                </div>
              </div>
            </div>
          ) : (
            /* --- FUNCTIONAL VIEWS --- */
            <div className="p-6 lg:p-10">
              
              {/* ADMIN LOCK SCREEN */}
              {(view !== 'portal' && !isAdminLoggedIn) ? (
                <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl shadow-xl border text-center">
                  <div className="text-4xl mb-4">🔐</div>
                  <h2 className="text-xl font-black mb-2 uppercase">Admin Access</h2>
                  <p className="text-slate-400 text-sm mb-6">Ingiza password kuendelea</p>
                  <input type="password" className="w-full p-4 bg-slate-100 rounded-2xl mb-4 text-center text-2xl tracking-[10px] outline-none focus:ring-2 ring-blue-500" placeholder="****" onChange={(e) => setAdminPass(e.target.value)} />
                  <button onClick={handleAdminAuth} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-lg">INGIA ADMIN</button>
                </div>
              ) : (
                <>
                  {view === 'dashboard' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        <Tile bg="bg-blue-500" icon="🏢" label="Total Houses" val={tenants.length} />
                        <Tile bg="bg-emerald-500" icon="👥" label="Active Tenants" val={tenants.length} />
                        <Tile bg="bg-amber-500" icon="💵" label="Payments Made" val={payments.length} />
                        <Tile bg="bg-slate-700" icon="💼" label="Rent Collected" val={totalCollected.toLocaleString()} prefix="TZS " />
                      </div>
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                          <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Master Tenant Registry</h4>
                          <button onClick={() => setIsAdminLoggedIn(false)} className="text-xs font-bold text-rose-500 hover:underline">Log Out Admin</button>
                        </div>
                        {/* Table would go here */}
                      </div>
                    </>
                  )}

                  {view === 'add-tenant' && (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border animate-in fade-in zoom-in duration-300 max-w-3xl mx-auto">
                      <h3 className="text-sm font-black text-blue-600 uppercase mb-6 tracking-widest">Register New Tenant</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Tenant Name" onChange={v => setReg({...reg, name: v})} />
                        <Input label="Monthly Rent" type="number" onChange={v => setReg({...reg, rent: v})} />
                        <div className="md:col-span-2">
                           <button onClick={async () => {
                             const tid = Math.floor(1000 + Math.random() * 9000).toString();
                             await addDoc(collection(db, "tenants"), { ...reg, tenantId: tid, monthlyRent: Number(reg.rent), status: "On" });
                             setView('dashboard');
                           }} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-200">SAVE TENANT</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {view === 'houses' && <HouseManagement />}
                  {view === 'rooms' && <RoomStatus />}
                  {view === 'payments' && <PaymentHistory />}
                  {view === 'settings' && (
                    <div className="p-10 bg-white rounded-2xl border text-center max-w-md mx-auto">
                      <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
                      <p className="text-slate-500 mb-6">Security and Profile adjustments.</p>
                      <button className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold">Change Password</button>
                    </div>
                  )}
                </>
              )}

              {view === 'portal' && <Portal loginId={loginId} setLoginId={setLoginId} portalUser={portalUser} setPortalUser={setPortalUser} tenants={tenants} getProgress={getProgress} />}
            </div>
          )}
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0f172a] text-slate-400 p-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center px-10">
        <p className="text-[10px] font-bold uppercase tracking-widest">© 2026 BIBIANA HOUSE RENT SYSTEM. All Rights Reserved.</p>
        <div className="flex gap-6 text-xl mt-4 md:mt-0">
          <a href="#" className="hover:text-green-500 transition-colors"><FaWhatsapp /></a>
          <a href="#" className="hover:text-blue-500 transition-colors"><FaFacebook /></a>
          <a href="#" className="hover:text-rose-500 transition-colors"><FaInstagram /></a>
          <a href="#" className="hover:text-red-600 transition-colors"><FaYoutube /></a>
          <a href="#" className="hover:text-white transition-colors"><FaTiktok /></a>
          <a href="#" className="hover:text-sky-400 transition-colors"><FaTwitter /></a>
        </div>
      </footer>
    </div>
  );
}

// Keep Tile, Input, and Portal functions below this...