import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Eye, EyeOff, Building2, Server, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('officer');
  const [password, setPassword] = useState('karnataka2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col font-sans overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] text-[#081A3A]">
      
      {/* Background Effects Container */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        
        {/* 6. Background Texture (Noise + Paper finish) */}
        <div className="absolute inset-0 opacity-[0.25]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', mixBlendMode: 'multiply' }}></div>
        
        {/* 7. Subtle Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(8,26,58,0.06)_100%)]"></div>

        {/* 4. Ultra-light government security pattern (Dotted Mesh) */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#081A3A 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>

        {/* 5. Faint blueprint-style circuit lines near edges */}
        <div className="absolute top-10 left-10 w-[300px] h-[300px] border-t-[0.5px] border-l-[0.5px] border-blue-400 opacity-[0.02]">
          <div className="absolute top-4 left-4 w-full h-full border-t-[0.5px] border-l-[0.5px] border-blue-400"></div>
        </div>
        <div className="absolute top-10 right-10 w-[300px] h-[300px] border-t-[0.5px] border-r-[0.5px] border-blue-400 opacity-[0.02]">
          <div className="absolute top-4 right-4 w-full h-full border-t-[0.5px] border-r-[0.5px] border-blue-400"></div>
        </div>
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] border-b-[0.5px] border-l-[0.5px] border-blue-400 opacity-[0.02]">
          <div className="absolute bottom-4 left-4 w-full h-full border-b-[0.5px] border-l-[0.5px] border-blue-400"></div>
        </div>
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] border-b-[0.5px] border-r-[0.5px] border-blue-400 opacity-[0.02]">
          <div className="absolute bottom-4 right-4 w-full h-full border-b-[0.5px] border-r-[0.5px] border-blue-400"></div>
        </div>
        
        {/* 2. Subtle government watermark typography */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] text-center flex flex-col items-center justify-center opacity-[0.025] blur-[10px] select-none text-[#AEBBD1] font-extrabold leading-[1.1] tracking-[22px] whitespace-nowrap">
          <div className="text-[220px]">KARNATAKA POLICE</div>
          <div className="text-[200px]">AI CRIME DETECTION SYSTEM</div>
          <div className="text-[160px] mt-12 tracking-[26px]">GOVERNMENT OF KARNATAKA</div>
        </div>

        {/* 1. Large Karnataka State Emblem Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[85vh] flex items-center justify-center opacity-[0.05] blur-[30px]">
          <img src="/karnataka_emblem.png" alt="Emblem Watermark" className="h-full w-auto object-contain grayscale" />
        </div>

        {/* 3. Soft radial white glow behind login card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(219,234,254,0.6)_50%,transparent_100%)] opacity-[0.20] blur-[40px]"></div>
      </div>

      {/* Top Government Header */}
      <header className="relative z-10 w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/karnataka_emblem.png" alt="Karnataka Emblem" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#081A3A] uppercase tracking-wide">Government of Karnataka</h1>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-widest">Karnataka State Police</h2>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
            <div className="text-sm font-bold text-[#081A3A]">
              {time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="text-xs font-semibold text-slate-500 font-mono mt-0.5">
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
            </div>
          </div>
        </div>
        {/* Thin gold divider */}
        <div className="w-full h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
      </header>

      {/* Main Content - Login Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[460px] bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_32px_rgba(8,26,58,0.08)] rounded-[24px] overflow-hidden">
          
          <div className="p-8 sm:p-10">
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-[#081A3A]/5 rounded-full text-[#081A3A] text-[10px] font-bold uppercase tracking-widest mb-3">
                KA-AI Crime Portal
              </div>
              <h2 className="text-3xl font-black text-[#081A3A] tracking-tight mb-1">
                OFFICER LOGIN
              </h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Secure Government Authentication Portal
              </p>
            </div>

            {/* Gold divider line */}
            <div className="w-16 h-[3px] bg-amber-400 mx-auto rounded-full mb-8" />

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#081A3A] uppercase tracking-wider mb-1.5">
                  Officer ID
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Officer ID"
                    className="w-full bg-white border border-slate-200 text-[#081A3A] text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#081A3A] focus:ring-1 focus:ring-[#081A3A] transition-all font-medium placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#081A3A] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full bg-white border border-slate-200 text-[#081A3A] text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-[#081A3A] focus:ring-1 focus:ring-[#081A3A] transition-all font-medium placeholder:text-slate-400 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-[#081A3A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#081A3A] focus:ring-[#081A3A]"
                  />
                  Remember Me
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact Karnataka State Police System Admin to reset password."); }} className="text-[#081A3A] hover:text-blue-700 font-bold transition-colors">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#081A3A] hover:bg-[#0a234f] text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_rgba(8,26,58,0.25)] hover:shadow-[0_0_20px_rgba(251,191,36,0.35)] flex items-center justify-center gap-2 text-sm uppercase tracking-widest transition-all duration-300 border border-transparent hover:border-amber-400/50 active:scale-[0.98]"
              >
                {loading ? 'Authenticating...' : 'LOGIN'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Authorized Personnel Only
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 4 Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#081A3A] shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#081A3A] uppercase tracking-wider">National Informatics Centre</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">Technical Infrastructure Partner</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#081A3A] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#081A3A] uppercase tracking-wider">Karnataka State Police</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">Law Enforcement Command</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#081A3A] shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#081A3A] uppercase tracking-wider">Secure Government Network</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">Encrypted Intranet Gateway</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#081A3A] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#081A3A] uppercase tracking-wider">AI Crime Detection Platform</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">Predictive Analytics Engine</p>
              </div>
            </div>
            
          </div>

          {/* Bottom Footer Links */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-500">
              © {new Date().getFullYear()} Government of Karnataka
            </div>
            <div className="flex items-center gap-6 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-wrap justify-center">
              <a href="#terms" onClick={e=>e.preventDefault()} className="hover:text-[#081A3A] transition-colors">Terms of Use</a>
              <a href="#privacy" onClick={e=>e.preventDefault()} className="hover:text-[#081A3A] transition-colors">Privacy Policy</a>
              <a href="#accessibility" onClick={e=>e.preventDefault()} className="hover:text-[#081A3A] transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
