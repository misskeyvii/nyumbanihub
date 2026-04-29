import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const processSession = async (session: any) => {
      if (!session?.user) {
        setStatus('Session not found. Redirecting...');
        navigate('/signin');
        return;
      }

      const user = session.user;
      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const avatar = user.user_metadata?.avatar_url || null;

      setStatus('Setting up your account...');

      const { data: existing } = await supabase
        .from('users')
        .select('id, role, account_type, phone')
        .eq('id', user.id)
        .single();

      if (!existing) {
        await supabase.from('users').insert({
          id: user.id, name, email: user.email,
          avatar_url: avatar, role: 'user', is_active: true,
        });
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', user.email ?? '');
        localStorage.setItem('userRole', 'user');
        if (avatar) localStorage.setItem('userAvatar', avatar);
        navigate('/profile?new=true');
      } else {
        await supabase.from('users').update({ avatar_url: avatar }).eq('id', user.id);
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', user.email ?? '');
        localStorage.setItem('userRole', existing.role || 'user');
        localStorage.setItem('accountType', existing.account_type || '');
        if (existing.phone) localStorage.setItem('userPhone', existing.phone);
        if (avatar) localStorage.setItem('userAvatar', avatar);
        navigate('/profile');
      }
    };

    const init = async () => {
      // First try: get session directly
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await processSession(session);
        return;
      }

      // Second try: parse tokens from URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        setStatus('Verifying your account...');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error && data.session) {
          await processSession(data.session);
          return;
        }
      }

      // Third try: wait for auth state change
      setStatus('Waiting for authentication...');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe();
          clearTimeout(timeout);
          await processSession(session);
        }
      });

      // Timeout after 15 seconds
      timeout = setTimeout(() => {
        subscription.unsubscribe();
        setStatus('Taking too long. Please try again.');
        setTimeout(() => navigate('/signin'), 2000);
      }, 15000);
    };

    init();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="text-center px-6">
        <div className="w-12 h-12 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-500">{status}</p>
      </div>
    </div>
  );
}
