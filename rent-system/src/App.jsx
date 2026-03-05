import { FaWhatsapp, FaFacebook, FaYoutube, FaTiktok, FaInstagram, FaTwitter } from 'react-icons/fa';
import HouseManagement from './HouseManagement';
import RoomStatus from './RoomStatus';
import PaymentHistory from './PaymentHistory';
import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';

// --- Helper Components ---
const Tile = ({ bg, icon, label, val, prefix = "" }) => (
  <div className={`${bg} p-6 rounded-2xl text-white shadow-lg`}>
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-xs opacity-80 uppercase font-bold tracking-wider">{label}</div>
    <div className="text-2xl font-black">{prefix}{val}</div>
  </div>
);

const Input = ({ label, type = "text", onChange }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <input 
      type={type} 
      className="p-3 bg-slate-100 rounded-xl border-none outline-none focus:ring-2 ring-blue-500 transition-all" 
      onChange={(e) => onChange(e.target.value)} 
    />
  </div>
);

export default function App() {
  const [view, setView] = useState('home'); 
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [adminPass, setAdminPass] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [reg, setReg] = useState({ name: "", loc: "Dar es Salaam", house: "", room: "", rent: 0 });
  const [loginId, setLoginId] = useState("");
  const [portalUser, setPortalUser] = useState(null);

  useEffect(() => {
    onSnapshot(collection(db, "tenants"), (s) => {
      setTenants(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    onSnapshot(query(collection(db, "payments"), orderBy("date", "desc")), (s) => 
      setPayments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const handleAdminAuth = () => {
    if (adminPass === "1234") {
      setIsAdminLoggedIn(true);
    } else {
      alert("Password Siyo Sahihi!");
    }
  };

  const totalCollected = payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f8fafc]">
      
      {/* --- HEADER --- */}
      <header className="bg-[#0f172a] text-white p-5 shadow-lg flex justify-between items-center px-10 z-50">
        <h1 className="text-xl font-black tracking-tighter">BIBIANA HOUSE RENT SYSTEM</h1>
        <button onClick={() => setView('home')} className="text-sm font-bold bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all">HOME</button>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR (Hidden on Home) */}
        {view !== 'home' && (
          <aside className="w-72 bg-[#1e293b] text-slate-300 hidden lg:block overflow-y-auto shadow-2xl">
            <nav className="p-4 space-y-2 mt-4">
              <button onClick={() => setView('dashboard')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>📊 Dashboard</button>
              <button onClick={() => setView('add-tenant')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'add-tenant' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>➕ Add Tenant</button>
              <button onClick={() => setView('houses')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'houses' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>🏠 House Management</button>
              <button onClick={() => setView('rooms')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'rooms' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>🔑 Room Status</button>
              <button onClick={() => setView('payments')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'payments' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>💰 Payment History</button>
              <button onClick={() => {setView('portal'); setIsAdminLoggedIn(false)}} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'portal' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>👤 Tenant Portal</button>
              <button onClick={() => setView('settings')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${view === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}>⚙️ Admin Settings</button>
            </nav>
          </aside>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {view === 'home' ? (
            /* --- LANDING PAGE --- */
            <div className="h-full bg-black relative flex items-center justify-center text-center">
              <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1568605114967-8130f3a36994')] bg-cover bg-center"></div>
              <div className="relative z-10 p-10">
                <h2 className="text-5xl font-black text-white mb-6">Welcome to Bibiana House</h2>
                <p className="text-slate-300 mb-10 text-lg">Efficient Rental Management at your fingertips.</p>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => setView('dashboard')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform">ADMIN LOGIN</button>
                  <button onClick={() => setView('portal')} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform">TENANT PORTAL</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 lg:p-10">
              {/* ADMIN AUTH CHECK */}
              {(view !== 'portal' && !isAdminLoggedIn) ? (
                <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl shadow-xl border text-center">
                  <div className="text-4xl mb-4">🔐</div>
                  <h2 className="text-xl font-black mb-2 uppercase">Admin Access</h2>
                  <input type="password" className="w-full p-4 bg-slate-100 rounded-2xl mb-4 text-center text-2xl tracking-[10px]" placeholder="****" onChange={(e) => setAdminPass(e.target.value)} />
                  <button onClick={handleAdminAuth} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold">INGIA ADMIN</button>
                </div>
              ) : (
                <>
                  {view === 'dashboard' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                      <Tile bg="bg-blue-500" icon="🏢" label="Total Houses" val={tenants.length} />
                      <Tile bg="bg-emerald-500" icon="👥" label="Active Tenants" val={tenants.length} />
                      <Tile bg="bg-amber-500" icon="💵" label="Payments Made" val={payments.length} />
                      <Tile bg="bg-slate-700" icon="💼" label="Rent Collected" val={totalCollected.toLocaleString()} prefix="TZS " />
                    </div>
                  )}
                  {view === 'add-tenant' && (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border max-w-2xl mx-auto">
                      <h3 className="text-sm font-black text-blue-600 uppercase mb-6">Register New Tenant</h3>
                      <div className="grid gap-4">
                        <Input label="Name" onChange={v => setReg({...reg, name: v})} />
                        <Input label="Monthly Rent" type="number" onChange={v => setReg({...reg, rent: v})} />
                        <button onClick={async () => {
                          await addDoc(collection(db, "tenants"), { ...reg, status: "Active" });
                          setView('dashboard');
                        }} className="bg-blue-600 text-white p-4 rounded-xl font-bold">SAVE TENANT</button>
                      </div>
                    </div>
                  )}
                  {view === 'houses' && <HouseManagement />}
                  {view === 'rooms' && <RoomStatus />}
                  {view === 'payments' && <PaymentHistory />}
                  {view === 'settings' && <div className="p-10 bg-white rounded-xl border font-bold text-center">Admin Settings Module Coming Soon</div>}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0f172a] text-slate-400 p-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center px-10">
        <p className="text-[10px] font-bold uppercase tracking-widest">© 2026 BIBIANA HOUSE RENT SYSTEM. All Rights Reserved.</p>
        <div className="flex gap-6 text-xl mt-4 md:mt-0">
          <a href="#" className="hover:text-green-500"><FaWhatsapp /></a>
          <a href="#" className="hover:text-blue-500"><FaFacebook /></a>
          <a href="#" className="hover:text-rose-500"><FaInstagram /></a>
          <a href="#" className="hover:text-red-600"><FaYoutube /></a>
          <a href="#" className="hover:text-white"><FaTiktok /></a>
          <a href="#" className="hover:text-sky-400"><FaTwitter /></a>
        </div>
      </footer>
    </div>
  );
}