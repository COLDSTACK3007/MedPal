import { useState } from 'react';
import { Shield, Eye, EyeOff, Activity, Bot, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!login(username, password)) {
        setError('Invalid username or password');
      }
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!signup(username, password)) {
        setError('Username already exists');
      }
    }
  };

  const scrollToAuth = () => {
    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-base text-txt overflow-x-hidden">
      {/* Hero Section */}
      <div 
        className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(15,23,42,1)), url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 mb-4">
            <Shield className="text-teal" size={18} />
            <span className="text-white text-sm font-bold tracking-wide uppercase">Enterprise Health Intelligence</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-teal">Medical Care</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium">
            A unified ecosystem connecting patients and administrators through secure health vaults, AI companions, and nationwide appointment scheduling.
          </p>
          <button 
            onClick={scrollToAuth}
            className="mt-8 px-8 py-4 rounded-full bg-brand text-white font-bold text-lg hover:scale-105 hover:bg-brand-hover transition-all shadow-[0_0_20px_var(--color-brand)]"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">Comprehensive Healthcare Tools</h2>
          <p className="text-txt-muted max-w-2xl mx-auto">Everything you need to manage your health securely in one place.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <FileText size={32} />, title: "Digital Health Vault", desc: "Securely store, manage, and share your Lab Reports and Prescriptions." },
            { icon: <Activity size={32} />, title: "Vital Signs Monitor", desc: "Interactive charts to track your Blood Pressure and Glucose levels over time." },
            { icon: <Calendar size={32} />, title: "Smart Appointments", desc: "Advanced nationwide filtering to book top-tier hospitals across India." },
            { icon: <Bot size={32} />, title: "AI Companion", desc: "24/7 intelligent symptom checker and medical guidance." }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface border border-border hover:border-brand/50 transition-colors shadow-sm">
              <div className="w-16 h-16 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-txt-secondary text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Section */}
      <div id="auth-section" className="py-20 px-4 flex justify-center items-center bg-surface border-t border-border">
        <div className="w-full max-w-md bg-base rounded-3xl p-8 shadow-2xl border border-border-dark">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-txt-muted text-sm">
              {isLogin ? "Sign in to access your dashboard" : "Join us to manage your health securely"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-muted ml-1 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-surface border border-border-dark rounded-xl px-4 py-3 text-txt focus:border-brand outline-none transition-colors"
                placeholder="Enter username"
                required
              />
            </div>
            
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-txt-muted ml-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface border border-border-dark rounded-xl px-4 py-3 pr-12 text-txt focus:border-brand outline-none transition-colors"
                  placeholder="Enter password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-brand transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-txt-muted ml-1 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-surface border border-border-dark rounded-xl px-4 py-3 pr-12 text-txt focus:border-brand outline-none transition-colors"
                    placeholder="Confirm password"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-brand transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-brand text-white font-bold py-3.5 rounded-xl hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 mt-4"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-txt-secondary font-medium">
            {isLogin ? "Don't you have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-brand font-bold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
