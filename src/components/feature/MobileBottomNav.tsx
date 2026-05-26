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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden">
      <div className="flex items-stretch">
        {navItems.map((item) => {
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
