import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import { supabase } from '../../lib/supabase';

export default function SignInPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const canSignIn = !!(form.email && form.password);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSignIn) return;
    setLoading(true);
    setError('');
    const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    // Require email verification
    if (!signInData.user.email_confirmed_at) {
      await supabase.auth.signOut();
      setError('Please verify your email before signing in. Check your inbox for a confirmation link.');
      setLoading(false);
      return;
    }
    const { data: userData } = await supabase
      .from('users')
      .select('account_type, name, phone, county, role')
      .eq('id', signInData.user.id)
      .single();
    if (userData) {
      localStorage.setItem('accountType', userData.account_type ?? '');
      localStorage.setItem('userName', userData.name ?? '');
      localStorage.setItem('userPhone', userData.phone ?? '');
      localStorage.setItem('userCounty', userData.county ?? '');
      localStorage.setItem('userRole', userData.role ?? '');
      localStorage.setItem('userEmail', signInData.user.email ?? '');
    }
    navigate('/');
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16 px-4 py-12 pb-24 md:pb-12">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-600 rounded-2xl mx-auto mb-3">
              <i className="ri-shield-check-fill text-white text-2xl"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Welcome Back to Nyumbani Hub</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            {/* Google OAuth */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <i className="ri-google-fill text-xl text-rose-500"></i>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400">or sign in with email</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email Address *</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-emerald-400 transition-colors">
                  <span className="w-4 h-4 flex items-center justify-center flex-shrink-0"><i className="ri-mail-line text-gray-400 text-sm"></i></span>
                  <input
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Password *</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-emerald-400 transition-colors">
                  <span className="w-4 h-4 flex items-center justify-center flex-shrink-0"><i className="ri-lock-line text-gray-400 text-sm"></i></span>
                  <input
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter password"
                    required
                    className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="w-4 h-4 flex items-center justify-center cursor-pointer">
                    <i className={`${showPw ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 text-sm`}></i>
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={!canSignIn || loading}
                className={`w-full font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${canSignIn && !loading ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <p className="text-center text-xs text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-emerald-600 font-semibold hover:underline">Sign Up</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
