import { useState, FormEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type AuthStage = 'signin' | 'signup' | 'verify_otp' | 'forgot_password' | 'verify_reset_otp' | 'set_new_password';

interface LoginProps {
  onLogin: (email: string, password: string, isSignUp: boolean) => Promise<string | null>;
  onVerifyOtp: (email: string, token: string) => Promise<string | null>;
  onResendOtp: (email: string) => Promise<string | null>;
  onRequestPasswordReset?: (email: string) => Promise<string | null>;
  onVerifyResetOtp?: (email: string, token: string) => Promise<string | null>;
  onUpdatePassword?: (password: string) => Promise<string | null>;
}

// ── Left Hero Section ────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <div className="hidden lg:block w-[48%] p-5 h-screen relative z-20 flex-shrink-0">
      <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl">
        <img
          src="/login-hero.jpg"
          alt="Professional with laptop"
          className="w-full h-full object-cover object-center"
        />
        {/* Strong green gradient at bottom to match reference */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#16a34a] via-[#16a34a]/30 to-transparent" />

        {/* Hero Text */}
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <p className="text-sm font-semibold mb-2 opacity-80 tracking-wide">You can easily</p>
          <h2 className="text-3xl font-black leading-snug tracking-tight">
            Manage order and tracking sales easily and building brand identity
          </h2>
        </div>
      </div>
    </div>
  );
}

// ── Auth Form ──────────────────────────────────────────────────────────────
function AuthForm({ stage, onStageChange, onSubmit }: {
  stage: 'signin' | 'signup';
  onStageChange: (s: 'signin' | 'signup' | 'forgot_password') => void;
  onSubmit: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await onSubmit(email.trim(), password);
      if (stage === 'signup') {
        setSuccess('Account created! Please check your email for a verification code.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isSignUp = stage === 'signup';

  return (
    <div className="w-full max-w-[390px] mx-auto">
      {/* Brand Icon */}
      <div className="w-12 h-12 bg-[#21A354] rounded-xl flex items-center justify-center shadow-md mb-7">
        <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
      </div>

      <h1 className="text-[2.6rem] font-black tracking-tighter text-gray-900 mb-1 lowercase leading-none">
        {isSignUp ? 'create an account' : 'sign in'}
      </h1>
      <p className="text-[#21A354] font-bold text-sm mb-9">
        The utilized mobile sales book
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm font-medium">
            {success}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-900">Your email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] transition-all focus:border-[#21A354] focus:ring-2 focus:ring-[#21A354]/10 outline-none"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-900">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] transition-all focus:border-[#21A354] focus:ring-2 focus:ring-[#21A354]/10 outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility' : 'visibility_off'}</span>
            </button>
          </div>
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => onStageChange('forgot_password')}
              className="text-xs text-gray-500 hover:text-[#21A354] transition-colors"
            >
              Forget your password
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#21A354] hover:bg-[#1d9049] active:bg-[#197a3e] text-white font-bold text-[15px] rounded-xl transition-all shadow-md active:scale-[0.98] mt-1"
        >
          {loading ? 'Processing...' : (isSignUp ? 'Get started' : 'Sign in')}
        </button>
      </form>

      {/* Footer Link */}
      <div className="mt-10">
        <p className="text-sm text-gray-600">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => { onStageChange(isSignUp ? 'signin' : 'signup'); setError(''); setSuccess(''); }}
            className="text-[#21A354] font-bold hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ── Shared Verification UI ───────────────────────────────────────────────────
function OtpVerify({ email, initialWarning, onVerify, onResend, onBack, title, subtitle }: {
  email: string;
  initialWarning?: boolean;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  title: string;
  subtitle: string;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialWarning ? 'Problem sending code.' : '');
  const [resendCooldown, setResendCooldown] = useState(60);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleChange = (i: number, val: string) => {
    const ch = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
    if (ch && next.every(d => d !== '')) handleVerify(next.join(''));
  };

  const handleVerify = async (code: string) => {
    setLoading(true); setError('');
    try { await onVerify(code); } catch (e: any) { setError(e.message); setDigits(Array(6).fill('')); refs.current[0]?.focus(); } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto">
      <h2 className="text-4xl font-black text-gray-900 mb-2 lowercase">{title}</h2>
      <p className="text-gray-500 mb-10 font-medium">{subtitle} <span className="text-[#21A354]">{email}</span></p>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold mb-6">{error}</div>}

      <div className="flex justify-between gap-2 mb-10">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold focus:border-[#21A354] outline-none"
          />
        ))}
      </div>

      <button onClick={() => handleVerify(digits.join(''))} disabled={loading} className="w-full py-4 bg-[#21A354] text-white font-bold rounded-xl shadow-lg">
        {loading ? 'Verifying...' : 'Verify Code'}
      </button>

      <div className="mt-8 text-center space-y-4">
        {resendCooldown > 0 ? (
          <p className="text-sm text-gray-400">Resend in <span className="text-[#21A354] font-bold">{resendCooldown}s</span></p>
        ) : (
          <button onClick={async () => { await onResend(); setResendCooldown(60); }} className="text-[#21A354] font-bold hover:underline">Resend code</button>
        )}
        <button onClick={onBack} className="block w-full text-gray-400 font-bold hover:text-gray-900">Back</button>
      </div>
    </div>
  );
}

// ── Password Reset Forms ───────────────────────────────────────────────────
function ForgotPasswordForm({ onSubmit, onBack }: { onSubmit: (email: string) => Promise<void>; onBack: () => void; }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="w-full max-w-[390px] mx-auto">
      <h2 className="text-4xl font-black text-gray-900 mb-2 lowercase">reset password</h2>
      <p className="text-gray-500 mb-10 font-medium">We'll send a code to your email.</p>
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-bold">{error}</div>}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">Your email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" className="w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-[#21A354]" />
        </div>
        <button onClick={async () => { if (!email) return setError('Email is required.'); setLoading(true); try { await onSubmit(email); } catch(e: any) { setError(e.message); } finally { setLoading(false); } }} disabled={loading} className="w-full py-4 bg-[#21A354] text-white font-bold rounded-xl shadow-lg">
          {loading ? 'Sending...' : 'Send reset code'}
        </button>
        <button onClick={onBack} className="w-full text-gray-400 font-bold hover:text-gray-900">Back to sign in</button>
      </div>
    </div>
  );
}

function NewPasswordForm({ onSubmit }: { onSubmit: (pass: string) => Promise<void>; }) {
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="w-full max-w-[390px] mx-auto">
      <h2 className="text-4xl font-black text-gray-900 mb-10 lowercase">new password</h2>
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-bold">{error}</div>}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">New Password</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} required minLength={6} placeholder="Min. 6 characters" className="w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-[#21A354]" />
        </div>
        <button onClick={async () => { if (pass.length < 6) return setError('At least 6 characters.'); setLoading(true); try { await onSubmit(pass); } catch(e: any) { setError(e.message); } finally { setLoading(false); } }} disabled={loading} className="w-full py-4 bg-[#21A354] text-white font-bold rounded-xl shadow-lg">
          {loading ? 'Saving...' : 'Update password'}
        </button>
      </div>
    </div>
  );
}

// ── Main Login Component ──────────────────────────────────────────────────────
export function Login({ onLogin, onVerifyOtp, onResendOtp, onRequestPasswordReset, onVerifyResetOtp, onUpdatePassword }: LoginProps) {
  const [stage, setStage] = useState<AuthStage>('signin');
  const [pendingEmail, setPendingEmail] = useState('');

  const handleAuthSubmit = async (email: string, password: string) => {
    const isSignUp = stage === 'signup';
    const err = await onLogin(email, password, isSignUp);
    
    if (err === '__REQUIRE_OTP__') {
      setPendingEmail(email);
      setStage('verify_otp');
      return;
    }
    
    if (err) {
      if (isSignUp && err.startsWith('__SMTP_WARN__')) {
        setPendingEmail(email);
        setStage('verify_otp');
        return;
      }
      throw new Error(err);
    }

    // If we reach here, there was no error. 
    // If it was a signup, and we didn't receive __REQUIRE_OTP__, 
    // it means auto-login succeeded (email confirmations are disabled in Supabase).
    // The App.tsx level will automatically detect the active session and hide the Login screen.
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row relative overflow-hidden">
      {/* Right panel subtle top-left to bottom-right gradient */}
      <div
        className="absolute right-0 top-0 w-full lg:w-[52%] h-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 100% 100%, rgba(34,197,94,0.22) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      <HeroSection />

      {/* Right: Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 px-6 py-12 lg:py-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <div className="w-full max-w-[390px]">
              {stage === 'forgot_password' && (
                <ForgotPasswordForm onBack={() => setStage('signin')} onSubmit={async (e) => { if (onRequestPasswordReset) { await onRequestPasswordReset(e); setPendingEmail(e); setStage('verify_reset_otp'); } }} />
              )}
              {stage === 'verify_otp' && (
                <OtpVerify title="Verify email" subtitle="We've sent a code to" email={pendingEmail} onVerify={async (code) => { await onVerifyOtp(pendingEmail, code); }} onResend={async () => { await onResendOtp(pendingEmail); }} onBack={() => setStage('signup')} />
              )}
              {stage === 'verify_reset_otp' && (
                <OtpVerify title="Check your email" subtitle="We've sent a reset code to" email={pendingEmail} onVerify={async (code) => { if (onVerifyResetOtp) { await onVerifyResetOtp(pendingEmail, code); setStage('set_new_password'); } }} onResend={async () => { if (onRequestPasswordReset) await onRequestPasswordReset(pendingEmail); }} onBack={() => setStage('forgot_password')} />
              )}
              {stage === 'set_new_password' && (
                <NewPasswordForm onSubmit={async (pass) => { if (onUpdatePassword) await onUpdatePassword(pass); }} />
              )}
              {(stage === 'signin' || stage === 'signup') && (
                <AuthForm stage={stage} onStageChange={setStage} onSubmit={handleAuthSubmit} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile background blob */}
      <div className="lg:hidden absolute bottom-0 right-0 w-72 h-72 rounded-full bg-green-400/20 blur-3xl pointer-events-none -z-10" />
    </div>
  );
}
