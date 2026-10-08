import { Activity, Users, AlertTriangle, Dumbbell, Bot, TrendingUp, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Patients', value: '124', change: '+12%', icon: <Users size={20} />, textCol: 'text-teal', bg: 'bg-card-dark', borderTop: 'border-t-4 border-teal' },
    { label: 'Active Cases', value: '8', change: '+3', icon: <Activity size={20} />, textCol: 'text-info', bg: 'bg-card-dark', borderTop: 'border-t-4 border-info' },
    { label: 'AI Consultations', value: '36', change: '+8 this week', icon: <Bot size={20} />, textCol: 'text-success', bg: 'bg-card-dark', borderTop: 'border-t-4 border-success' },
    { label: 'Fitness Plans', value: '15', change: '5 in progress', icon: <Dumbbell size={20} />, textCol: 'text-warning', bg: 'bg-card-dark', borderTop: 'border-t-4 border-warning' },
  ];

  const recentActivity = [
    { name: 'Ramesh Kumar', action: 'High Fever — Triage Completed', time: '2 hours ago', status: 'pending', severity: 'High' },
    { name: 'Sita Devi', action: 'Routine Wellness Checkup', time: '5 hours ago', status: 'synced', severity: 'Low' },
    { name: 'AI Fitness Consult', action: 'BMI Assessment — Plan Generated', time: 'Today', status: 'synced', severity: 'Info' },
    { name: 'Arjun Singh', action: 'Follow-up Scheduled', time: 'Yesterday', status: 'pending', severity: 'Medium' },
  ];

  const severityColor: Record<string, string> = {
    High: 'bg-danger-bg text-danger border border-danger/20',
    Medium: 'bg-warning-bg text-warning border border-warning/20',
    Low: 'bg-success-bg text-success border border-success/20',
    Info: 'bg-info-bg text-info border border-info/20',
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">

      {/* Emergency Banner */}
      <button
        onClick={() => alert('🚨 Emergency Alert Broadcast Sent!')}
        className="w-full bg-gradient-to-r from-danger to-red-500 rounded-2xl p-5 flex items-center gap-4 text-left hover:shadow-[0_8px_20px_rgba(239,68,68,0.25)] hover:-translate-y-0.5 transition-all duration-300 group"
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
          <AlertTriangle size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm tracking-wide uppercase">Emergency Alert System</h3>
          <p className="text-white/90 text-sm mt-0.5 font-medium">Broadcast your location and emergency need to the nearest health center</p>
        </div>
        <ArrowUpRight size={20} className="text-white/70 group-hover:text-white transition-colors" />
      </button>

      {/* Stats Grid (Dark Cards like ERP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className={`${stat.bg} ${stat.borderTop} rounded-xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[0.7rem] font-bold text-success flex items-center gap-1 bg-success-bg px-2 py-0.5 rounded-full`}>
                <TrendingUp size={12} /> {stat.change}
              </span>
            </div>
            <h4 className={`text-4xl font-extrabold ${stat.textCol} mb-1 drop-shadow-sm`}>{stat.value}</h4>
            <span className="text-xs font-semibold text-txt-secondary-inverse">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions (White Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-txt">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Fitness & BMI Calculator', desc: 'Assess body metrics and get routines', icon: <Dumbbell size={22} />, color: 'text-teal', bg: 'bg-teal-glow', path: '/fitness' },
            { label: 'AI Health Companion', desc: 'Chat with Gemini-powered assistant', icon: <Bot size={22} />, color: 'text-brand', bg: 'bg-brand-glow', path: '/companion' },
            { label: 'Patient Records', desc: 'Offline-first health record database', icon: <Users size={22} />, color: 'text-info', bg: 'bg-info-bg', path: '/records' },
          ].map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-3 hover:border-brand/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-glow transition-all duration-300 group text-center"
            >
              <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <div>
                <span className="text-sm font-bold text-txt block">{action.label}</span>
                <span className="text-xs text-txt-secondary mt-1 block font-medium">{action.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity (White Card) */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-txt">Recent Activity</h3>
          <span className="text-[0.65rem] text-txt-secondary font-bold uppercase tracking-wider bg-elevated px-3 py-1 rounded-full">{recentActivity.length} items</span>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-base rounded-xl border border-border-subtle hover:border-border transition-colors">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.status === 'synced' ? 'bg-success shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-warning shadow-[0_0_6px_rgba(245,158,11,0.4)]'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-bold text-txt truncate">{item.name}</h4>
                  <span className={`text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded-full ${severityColor[item.severity]}`}>
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-txt-secondary font-medium">{item.action}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-txt-muted flex-shrink-0">
                <Clock size={12} />
                {item.time}
              </div>
              {item.status === 'synced' && <CheckCircle2 size={16} className="text-success flex-shrink-0 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
