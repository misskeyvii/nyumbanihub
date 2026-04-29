import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const navItems = [
  { label: 'Home', icon: 'ri-home-5-line', activeIcon: 'ri-home-5-fill', path: '/' },
  { label: 'Explore', icon: 'ri-compass-3-line', activeIcon: 'ri-compass-3-fill', path: '/explore' },
  { label: 'Services', icon: 'ri-customer-service-2-line', activeIcon: 'ri-customer-service-2-fill', path: '/services' },
  { label: 'Post', icon: 'ri-add-circle-line', activeIcon: 'ri-add-circle-fill', path: '/post-listing', locked: true },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unread, setUnread] = useState(false);
  const [isServiceOnly, setIsServiceOnly] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      if (data.session) checkUnread(data.session.user.id);
      const at = localStorage.getItem('accountType') || '';
      setIsServiceOnly(['service', 'entertainment'].includes(at));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
      if (session) checkUnread(session.user.id);
      const at = localStorage.getItem('accountType') || '';
      setIsServiceOnly(['service', 'entertainment'].includes(at));
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUnread = async (uid: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id')
      .eq('to_user_id', uid)
      .eq('read', false)
      .limit(1);
    setUnread(!!(data && data.length > 0));
  };

  // Realtime: listen for new incoming messages
  useEffect(() => {
    if (!isLoggedIn) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const uid = data.session.user.id;
      channel = supabase
        .channel(`unread-badge-${uid}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `to_user_id=eq.${uid}`,
        }, () => setUnread(true))
        .subscribe();
    });
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [isLoggedIn]);

  // Clear badge when user opens chat
  useEffect(() => {
    if (location.pathname === '/chat') setUnread(false);
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden">
      <div className="flex items-stretch">
        {navItems.filter(item => !(item.locked && isServiceOnly)).map((item) => {
          const isActive = location.pathname === item.path;
          const isPost = item.locked;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors cursor-pointer ${
                isPost ? 'text-emerald-600' : isActive ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              {isPost ? (
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-600 rounded-full -mt-4 shadow-lg shadow-emerald-200">
                  <i className={`${item.activeIcon} text-xl text-white`}></i>
                </div>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`${isActive ? item.activeIcon : item.icon} text-xl`}></i>
                </div>
              )}
              <span className={`text-[10px] font-medium ${isPost ? 'mt-1' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
        {/* Auth button */}
        {isLoggedIn ? (
          <>
            <Link
              to="/chat"
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors cursor-pointer ${
                location.pathname === '/chat' ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <i className={`${location.pathname === '/chat' ? 'ri-chat-3-fill' : 'ri-chat-3-line'} text-xl`}></i>
                {unread && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>}
              </div>
              <span className="text-[10px] font-medium">Messages</span>
            </Link>
            <Link
              to="/profile"
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors cursor-pointer ${
                location.pathname === '/profile' ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <i className={`${location.pathname === '/profile' ? 'ri-user-3-fill' : 'ri-user-3-line'} text-xl`}></i>
              </div>
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
          </>
        ) : (
          <Link
            to="/signin"
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors cursor-pointer ${
              location.pathname === '/signin' ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className={`${location.pathname === '/signin' ? 'ri-user-3-fill' : 'ri-user-3-line'} text-xl`}></i>
            </div>
            <span className="text-[10px] font-medium">Sign In</span>
          </Link>
        )}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-safe-area-inset-bottom bg-white"></div>
    </nav>
  );
}
