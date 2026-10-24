import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Building, 
  User, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAsDemo, register, isLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [email, setEmail] = useState('elena.rostova@nexus-ai.internal');
  const [password, setPassword] = useState('nexusSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWorkspace, setRegWorkspace] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!email.includes('@')) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    const res = await login(email, password, remember);
    if (res.success) {
      success('Authenticated successfully', 'Welcome back to NEXUS AI Command Center.');
      navigate('/dashboard');
    } else {
      toastError('Login Failed', res.error);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!regName.trim()) errs.regName = 'Full name is required.';
    if (!regEmail.trim()) errs.regEmail = 'Email is required.';
    else if (!regEmail.includes('@')) errs.regEmail = 'Valid email required.';
    if (!regWorkspace.trim()) errs.regWorkspace = 'Workspace name is required.';
    if (!regPassword || regPassword.length < 6) errs.regPassword = 'Password must be at least 6 characters.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    const res = await register(regName, regEmail, regWorkspace, regPassword);
    if (res.success) {
      success('Workspace Created', `Welcome to NEXUS, ${regName}!`);
      navigate('/dashboard');
    } else {
      toastError('Registration Failed', res.error);
    }
  };

  const handleQuickDemoAccess = async () => {
    await loginAsDemo();
    success('Demo Session Active', 'Logged in as Lead Architect with complete deterministic test dataset.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-nexus-base flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-0.5 shadow-nexus-glow mb-4">
          <div className="w-full h-full bg-nexus-base rounded-[14px] flex items-center justify-center">
            <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">
          NEXUS — AI Command Center
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-nexus-text-muted">
          "One command center. Every workflow in motion."
        </p>

        {/* Demo Fast Access Banner */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs font-semibold text-indigo-300">Quick Review Access</span>
            </div>
            <button
              onClick={handleQuickDemoAccess}
              disabled={isLoading}
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition-colors shadow-sm flex items-center gap-1"
            >
              <span>Instant Demo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-nexus-text-dim mt-1">
            Pre-loaded with 8 projects, 12 workflows, telemetry charts, and task management.
          </p>
        </div>
      </div>

      {/* Form Surface */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-nexus-surface border border-nexus-border-bright py-8 px-6 sm:px-10 rounded-2xl shadow-nexus-elevated">
          {/* Tabs */}
          <div className="flex rounded-xl bg-nexus-base p-1 border border-nexus-border mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrors({}); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-nexus-surface text-nexus-text shadow-sm'
                  : 'text-nexus-text-muted hover:text-nexus-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrors({}); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-nexus-surface text-nexus-text shadow-sm'
                  : 'text-nexus-text-muted hover:text-nexus-text'
              }`}
            >
              Create Workspace
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-nexus-text-dim">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="elena.rostova@nexus-ai.internal"
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl bg-nexus-base border text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      errors.email ? 'border-rose-500' : 'border-nexus-border'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-nexus-text-dim">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full pl-9 pr-10 py-2 rounded-xl bg-nexus-base border text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      errors.password ? 'border-rose-500' : 'border-nexus-border'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-nexus-text-dim hover:text-nexus-text"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-nexus-text-muted hover:text-nexus-text">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="rounded bg-nexus-base border-nexus-border text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember this session</span>
                </label>
                <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  Forgot credentials?
                </span>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enter Command Center
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-nexus-text-dim">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {errors.regName && <p className="text-xs text-rose-400 mt-1">{errors.regName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Work Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-nexus-text-dim">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="marcus@company.internal"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {errors.regEmail && <p className="text-xs text-rose-400 mt-1">{errors.regEmail}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Organization / Workspace</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-nexus-text-dim">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regWorkspace}
                    onChange={e => setRegWorkspace(e.target.value)}
                    placeholder="Autonomous Intelligence Core"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {errors.regWorkspace && <p className="text-xs text-rose-400 mt-1">{errors.regWorkspace}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Master Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-nexus-text-dim">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {errors.regPassword && <p className="text-xs text-rose-400 mt-1">{errors.regPassword}</p>}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Organization Workspace
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-nexus-border text-center">
            <span className="text-[11px] text-nexus-text-dim flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Local demo authentication · Zero secrets sent externally
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
