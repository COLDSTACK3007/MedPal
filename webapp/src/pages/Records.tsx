import { useState } from 'react';
import { Search, User, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Records = () => {
  const { allUsers } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out admins and find matching users
  const patients = allUsers.filter(u => u.role === 'user');
  const filtered = patients.filter(p =>
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.contact && p.contact.includes(searchQuery))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-txt">Patient Records</h2>
          <p className="text-sm text-txt-muted">Securely view and manage onboarded patients</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" />
        <input 
          type="text" 
          placeholder="Search by username or contact number..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border rounded-xl text-sm text-txt placeholder:text-txt-muted outline-none focus:border-brand transition-all shadow-sm" 
        />
      </div>

      {/* Patient List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-2xl">
            <User size={48} className="text-txt-muted/40 mx-auto mb-4" />
            <p className="font-bold text-txt">No patients found</p>
            <p className="text-sm text-txt-muted mt-1">Try adjusting your search query.</p>
          </div>
        ) : filtered.map((p, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6 hover:border-brand/50 transition-all shadow-sm group cursor-pointer">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white font-black text-xl shadow-md">
                  {p.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-txt">{p.fullName || p.username}</h3>
                    {p.hasOnboarded && <span title="Onboarded"><CheckCircle2 size={16} className="text-teal" /></span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-txt-secondary">
                    {p.age && <span>{p.age} yrs • {p.gender}</span>}
                    {p.contact && <span>📞 {p.contact}</span>}
                    {p.email && <span>✉️ {p.email}</span>}
                    {p.address && <span className="truncate max-w-[200px]" title={p.address}>📍 {p.address}</span>}
                  </div>
                  {p.guardians && p.guardians.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="font-bold text-txt-muted uppercase tracking-wider">Guardians: </span>
                      {p.guardians.map((g, gi) => (
                        <span key={gi} className="text-brand font-medium mr-3">
                          {g.name} (✉️ {g.email}{g.phone ? `, 📞 ${g.phone}` : ''})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-xs text-txt-muted font-bold uppercase tracking-wider mb-0.5">Height</p>
                  <p className="font-bold text-txt">{p.height ? `${p.height} cm` : '--'}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-txt-muted font-bold uppercase tracking-wider mb-0.5">Weight</p>
                  <p className="font-bold text-txt">{p.weight ? `${p.weight} kg` : '--'}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-lg font-bold hover:bg-brand hover:text-white transition-colors">
                  <FileText size={16} /> View Vault
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Records;
