import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Dumbbell, Bot, Video,
  MapPin, FileText, Activity, Calendar, Settings,
  LogOut, User, Globe, Key, Phone, Mail, Microscope, Bell, Users,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { getMedications } from './utils/healthStore';
import MeshBackground from './components/MeshBackground';
import GlassSidebar, { type SidebarGroup } from './components/GlassSidebar';
import TopBar from './components/TopBar';
import CommandPalette from './components/CommandPalette';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import Fitness from './pages/Fitness';
import AICompanion from './pages/AICompanion';
import Records from './pages/Records';
import Telemedicine from './pages/Telemedicine';
import Hospitals from './pages/Hospitals';
import Tracker from './pages/Tracker';
import Vault from './pages/Vault';
import Vitals from './pages/Vitals';
import Appointments from './pages/Appointments';
import MedTrace from './pages/MedTrace';

const SIDEBAR_COLLAPSE_KEY = 'medpal_sidebar_collapsed';

function App() {
  const { currentUser, logout, updateProfile, changePassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === 'true'; } catch { return false; }
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Modals & Popups
  const [showSettings, setShowSettings] = useState(false);

  // Onboarding Form State
  const [onboardData, setOnboardData] = useState({ fullName: '', address: '', email: '', age: '', gender: 'Male', contact: '', height: '', weight: '', guardianName: '', guardianPhone: '', guardianEmail: '' });
  const [onboardError, setOnboardError] = useState('');

  // Settings Profile State — re-seeded from currentUser each time the Settings
  // panel is opened (a key reset on the form, not an effect-driven setState).
  const [profileData, setProfileData] = useState({ contact: currentUser?.contact || '', email: currentUser?.email || '' });
  const openSettings = () => {
    setProfileData({ contact: currentUser?.contact || '', email: currentUser?.email || '' });
    setShowSettings(true);
  };

  // Change Password State
  const [pwState, setPwState] = useState({ old: '', new: '', confirm: '', error: '', success: false });

  // Settings Guardian State
  const [showAddGuardian, setShowAddGuardian] = useState(false);
  const [newGuardian, setNewGuardian] = useState({ name: '', phone: '', email: '' });
  const [guardianError, setGuardianError] = useState('');

  // Auto-collapse / mobile breakpoint detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (window.innerWidth < 1280 && !mobile) {
        setCollapsed(true);
      }
      if (mobile) setIsMobileSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // Lightweight, data-grounded notifications (no fabricated alerts).
  // Declared before the early return below so hooks run unconditionally.
  const notifications = useMemo(() => {
    const groupsOut: { label: string; items: { text: string; tone: 'info' | 'warning' | 'danger' | 'success' }[] }[] = [];
    if (currentUser?.role === 'user') {
      const meds = getMedications(currentUser.username) || [];
      const low = meds.filter(m => m.count <= 5);
      if (low.length) {
        groupsOut.push({ label: 'Medications', items: low.map(m => ({ text: `${m.name} — only ${m.count} left, refill soon`, tone: 'warning' as const })) });
      }
    }
    groupsOut.push({ label: 'System', items: [{ text: 'Welcome to MedPal Health Suite', tone: 'info' as const }] });
    return groupsOut;
  }, [currentUser]);

  // Protect Routes
  if (!currentUser) {
    return <LandingPage />;
  }

  // Handle Onboarding Submission
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onboardData.contact && onboardData.guardianPhone && onboardData.contact === onboardData.guardianPhone) {
      setOnboardError("Guardian's phone number cannot be the same as your contact number. Please enter a different number.");
      return;
    }
    if (onboardData.email && onboardData.guardianEmail && onboardData.email.toLowerCase() === onboardData.guardianEmail.toLowerCase()) {
      setOnboardError("Guardian's email cannot be the same as your email address. Please enter a different email.");
      return;
    }
    setOnboardError('');
    const { guardianName, guardianPhone, guardianEmail, ...rest } = onboardData;
    updateProfile({
      ...rest,
      guardians: [{ name: guardianName, phone: guardianPhone, email: guardianEmail }]
    });
  };

  const handleAddGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGuardian.phone && currentUser?.contact && newGuardian.phone === currentUser.contact) {
      setGuardianError("Guardian's phone number cannot be the same as your contact number.");
      return;
    }
    if (newGuardian.email && currentUser?.email && newGuardian.email.toLowerCase() === currentUser.email.toLowerCase()) {
      setGuardianError("Guardian's email cannot be the same as your email address.");
      return;
    }
    setGuardianError('');
    if (newGuardian.name && newGuardian.email) {
      const updatedGuardians = [...(currentUser.guardians || []), newGuardian];
      updateProfile({ guardians: updatedGuardians });
      setShowAddGuardian(false);
      setNewGuardian({ name: '', phone: '', email: '' });
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwState.new !== pwState.confirm) {
      setPwState({ ...pwState, error: 'Passwords do not match', success: false });
      return;
    }
    if (changePassword(pwState.old, pwState.new)) {
      setPwState({ old: '', new: '', confirm: '', error: '', success: true });
    } else {
      setPwState({ ...pwState, error: 'Incorrect current password', success: false });
    }
  };

  const doLogout = () => {
    logout();
    navigate('/');
  };

  // Nav items grouped for the redesigned sidebar / command palette.
  // (Same routes/roles as before — only the grouping labels changed.)
  const allGroups: { title: string; roles: ('admin' | 'user')[]; items: SidebarGroup['items'] }[] = [
    { title: 'Home', roles: ['admin', 'user'], items: [
      { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
    ]},
    { title: 'Health', roles: ['admin', 'user'], items: [
      { to: '/vitals', icon: <Activity size={20} />, label: 'Vital Signs' },
      { to: '/tracker', icon: <Bell size={20} />, label: 'Medical Tracker' },
      { to: '/vault', icon: <FileText size={20} />, label: 'Health Vault' },
    ]},
    { title: 'Care', roles: ['admin', 'user'], items: [
      { to: '/appointments', icon: <Calendar size={20} />, label: 'Appointments' },
      { to: '/telemedicine', icon: <Video size={20} />, label: 'Telemedicine' },
      { to: '/hospitals', icon: <MapPin size={20} />, label: 'Find Hospital' },
    ]},
    { title: 'Wellness', roles: ['admin', 'user'], items: [
      { to: '/fitness', icon: <Dumbbell size={20} />, label: 'Fitness & Wellness' },
      { to: '/companion', icon: <Bot size={20} />, label: 'AI Companion', aiBadge: true },
    ]},
    { title: 'Admin', roles: ['admin'], items: [
      { to: '/medtrace', icon: <Microscope size={20} />, label: 'MedTrace', aiBadge: true },
      { to: '/records', icon: <Users size={20} />, label: 'Patient Records' },
    ]},
  ];

  const groups: SidebarGroup[] = allGroups
    .filter(g => g.roles.includes(currentUser.role))
    .map(g => ({ title: g.title, items: g.items }));

  const allowedNavItems = groups.flatMap(g => g.items);
  const getPageTitle = () => allowedNavItems.find(n => n.to === location.pathname)?.label || 'MedPal';
  const isDashboard = location.pathname === '/';

  return (
    <div className="h-screen w-screen p-3 sm:p-4 flex gap-3 sm:gap-4 overflow-hidden relative">
      <MeshBackground />

      {/* Onboarding Modal Overlay */}
      {currentUser.role === 'user' && !currentUser.hasOnboarded && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 border border-gray-200" style={{ opacity: 1 }}>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome to MedPal!</h2>
            <p className="text-gray-600 text-sm mb-6">Let's set up your health profile. This information is securely stored in your Patient Records.</p>
            {onboardError && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-xl font-bold">{onboardError}</div>}
            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Full Name *</label>
                <input type="text" required value={onboardData.fullName} onChange={e => setOnboardData({...onboardData, fullName: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Address *</label>
                <input type="text" required value={onboardData.address} onChange={e => setOnboardData({...onboardData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Age</label>
                  <input type="number" required value={onboardData.age} onChange={e => setOnboardData({...onboardData, age: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Gender</label>
                  <select value={onboardData.gender} onChange={e => setOnboardData({...onboardData, gender: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Contact No *</label>
                  <input type="tel" required value={onboardData.contact} onChange={e => setOnboardData({...onboardData, contact: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Email Address *</label>
                  <input type="email" required value={onboardData.email} onChange={e => setOnboardData({...onboardData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Guardian Name *</label>
                  <input type="text" required value={onboardData.guardianName} onChange={e => setOnboardData({...onboardData, guardianName: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Guardian Phone (Optional)</label>
                  <input type="tel" value={onboardData.guardianPhone} onChange={e => setOnboardData({...onboardData, guardianPhone: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-bold text-gray-500">Guardian Email *</label>
                  <input type="email" required value={onboardData.guardianEmail} onChange={e => setOnboardData({...onboardData, guardianEmail: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Height (cm) - Optional</label>
                  <input type="number" value={onboardData.height} onChange={e => setOnboardData({...onboardData, height: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Weight (kg) - Optional</label>
                  <input type="number" value={onboardData.weight} onChange={e => setOnboardData({...onboardData, weight: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-gray-900 outline-none focus:border-brand" />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-hover shadow-lg mt-4">Save Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal (Right Sidebar) */}
      {showSettings && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-surface shadow-2xl z-50 border-l border-border transform transition-transform overflow-y-auto custom-scrollbar">
            <div className="p-6 border-b border-border flex justify-between items-center bg-base">
              <h2 className="text-xl font-bold text-txt flex items-center gap-2"><Settings size={20} className="text-brand" /> Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-txt-muted hover:text-txt">✕</button>
            </div>
            <div className="p-6 space-y-8">

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-txt-muted uppercase tracking-wider">Preferences</h3>
                <div className="flex items-center justify-between p-3 bg-base border border-border rounded-xl">
                  <div className="flex items-center gap-3 text-txt"><Globe size={18} className="text-brand"/> Language</div>
                  <select className="bg-transparent text-sm font-bold text-txt outline-none cursor-pointer"><option>English</option><option>Hindi</option></select>
                </div>
                <p className="text-xs text-txt-muted px-1">Theme is now controlled from your profile menu in the sidebar.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-txt-muted uppercase tracking-wider">Account Settings</h3>
                <div className="p-3 bg-base border border-border rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-brand"/>
                    <div className="w-full">
                      <p className="text-xs text-txt-muted">Username (Non-editable)</p>
                      <p className="text-sm font-bold text-txt">{currentUser.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-t border-border pt-2">
                    <Phone size={18} className="text-teal"/>
                    <div className="w-full">
                      <p className="text-xs text-txt-muted">Contact Number</p>
                      <input
                        type="tel"
                        value={profileData.contact}
                        onChange={e => setProfileData({...profileData, contact: e.target.value})}
                        onBlur={() => updateProfile({ contact: profileData.contact })}
                        className="w-full bg-transparent text-sm font-bold text-txt outline-none border-b border-transparent focus:border-brand transition-colors"
                        placeholder="Add contact number"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-t border-border pt-2">
                    <Mail size={18} className="text-blue-500"/>
                    <div className="w-full">
                      <p className="text-xs text-txt-muted">Email Address</p>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={e => setProfileData({...profileData, email: e.target.value})}
                        onBlur={() => updateProfile({ email: profileData.email })}
                        className="w-full bg-transparent text-sm font-bold text-txt outline-none border-b border-transparent focus:border-brand transition-colors"
                        placeholder="Add email address"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-base border border-border rounded-xl space-y-3">
                  <p className="text-sm font-bold text-txt">Guardians</p>
                  {currentUser.guardians && currentUser.guardians.length > 0 ? (
                    <ul className="space-y-2">
                      {currentUser.guardians.map((g, i) => (
                        <li key={i} className="flex flex-col text-sm bg-surface p-2 rounded-lg border border-border">
                          <span className="font-bold text-txt">{g.name}</span>
                          <span className="text-xs text-txt-muted">📞 {g.phone}</span>
                          <span className="text-xs text-txt-muted">✉️ {g.email}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-txt-muted">No guardians added yet.</p>
                  )}

                  {showAddGuardian ? (
                    <form onSubmit={handleAddGuardian} className="space-y-2 pt-2 border-t border-border mt-2">
                      {guardianError && <p className="text-xs text-danger font-bold">{guardianError}</p>}
                      <input type="text" placeholder="Guardian Name" required value={newGuardian.name} onChange={e=>setNewGuardian({...newGuardian, name: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-brand" />
                      <input type="tel" placeholder="Guardian Phone (Optional)" value={newGuardian.phone} onChange={e=>setNewGuardian({...newGuardian, phone: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-brand" />
                      <input type="email" placeholder="Guardian Email" required value={newGuardian.email} onChange={e=>setNewGuardian({...newGuardian, email: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-brand" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowAddGuardian(false)} className="flex-1 text-xs py-2 bg-surface text-txt border border-border rounded-lg font-bold">Cancel</button>
                        <button type="submit" className="flex-1 text-xs py-2 bg-brand text-white rounded-lg font-bold hover:bg-brand-hover">Save</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setShowAddGuardian(true)} className="text-xs text-brand font-bold hover:underline">
                      + Add Another Guardian
                    </button>
                  )}
                </div>

                <form onSubmit={handlePasswordChange} className="p-4 bg-base border border-border rounded-xl space-y-3">
                  <p className="text-sm font-bold text-txt flex items-center gap-2"><Key size={16} className="text-orange-500" /> Change Password</p>
                  {pwState.error && <p className="text-xs text-danger font-bold">{pwState.error}</p>}
                  {pwState.success && <p className="text-xs text-teal font-bold">Password updated successfully!</p>}
                  <input type="password" placeholder="Current Password" required value={pwState.old} onChange={e=>setPwState({...pwState, old: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-brand" />
                  <input type="password" placeholder="New Password" required value={pwState.new} onChange={e=>setPwState({...pwState, new: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-brand" />
                  <input type="password" placeholder="Confirm New Password" required value={pwState.confirm} onChange={e=>setPwState({...pwState, confirm: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-brand" />
                  <button type="submit" className="w-full bg-brand/10 text-brand font-bold py-2 rounded-lg hover:bg-brand hover:text-white transition-colors">Update Password</button>
                </form>
              </div>

              <div className="pt-4 border-t border-border">
                <button onClick={doLogout} className="w-full flex items-center justify-center gap-2 bg-danger/10 text-danger font-bold py-3 rounded-xl hover:bg-danger hover:text-white transition-colors">
                  <LogOut size={18} /> Sign Out Completely
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      <GlassSidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        isMobile={isMobile}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        groups={groups}
        currentUser={currentUser}
        onOpenSettings={openSettings}
        onLogout={doLogout}
      />

      {isMobile && isMobileSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />}

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-400 relative">
        <TopBar
          pageTitle={getPageTitle()}
          isDashboard={isDashboard}
          isMobile={isMobile}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setShowCommandPalette(true)}
          currentUser={currentUser}
          onOpenSettings={openSettings}
          onLogout={doLogout}
          notifications={notifications}
        />

        <main className="flex-1 overflow-y-auto rounded-2xl pb-20 sm:pb-4 custom-scrollbar relative z-0">
          <Routes>
            <Route path="/" element={currentUser.role === 'admin' ? <Dashboard /> : <UserDashboard onOpenSettings={openSettings} />} />
            <Route path="/fitness" element={<Fitness />} />
            <Route path="/companion" element={<AICompanion />} />
            <Route path="/medtrace" element={<MedTrace />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/vitals" element={<Vitals />} />
            <Route path="/records" element={<Records />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/telemedicine" element={<Telemedicine />} />
          </Routes>
        </main>
      </div>

      <CommandPalette groups={groups} open={showCommandPalette} onOpenChange={setShowCommandPalette} />
    </div>
  );
}

export default App;
